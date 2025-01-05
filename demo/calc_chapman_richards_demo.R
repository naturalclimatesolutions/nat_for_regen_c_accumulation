# -------------------------------------------------------------------------
#
# Script: GROA - CR_Calc
#
# Purpose of script: Calculate Pixel Level Chapman Richard's Curve Parameters
# Author: Nathaniel Robinson
#
# Copyright (c) Nathaniel Robinson, 2025
# Email: n.robinson@cifor-icraf.org
#
# -------------------------------------------------------------------------

# -------------------------------------------------------------------------
# Package Management
# -------------------------------------------------------------------------

# List of Packages Used - named packages automatically installed (if not) and
# loaded.
list.of.packages <- c(
  "terra",
  "tidyverse",
  "parallel",
  "doParallel",
  "foreach",
  "tictoc"
)

# Check if any packages need installing
new.packages <-
  list.of.packages[!(list.of.packages %in% installed.packages()[, "Package"])]

# Install new packages and dependencies
if (length(new.packages) > 0) {
  install.packages(new.packages, dep = TRUE)
}

# Load required packages
for (package.i in list.of.packages) {
  suppressPackageStartupMessages(library(package.i,
    character.only = TRUE
  ))
}

# -------------------------------------------------------------------------
# Input and Output Directory and Resource Management
# -------------------------------------------------------------------------

# Get directory of source file location and set to workind directory
setwd(dirname(rstudioapi::getActiveDocumentContext()$path))

# Get path of working directory
working_dir <- getwd()

# Create a log file for tracking progress of parallel tasks
log_file <- file.path(working_dir, "progress_log.txt")
file.create(log_file)

# Names of input and output sub-directories
inputs <- "agc_5_deg"
outputs <- "cr_pars_5_deg"

# Name of id prefix (changes for test inputs)
id_prefix <- "grd_"

# Set data input and output directories
input_dir <-
  paste(dirname(working_dir), "inputs/", inputs, sep = "")
output_dir <-
  paste(dirname(working_dir), "outputs/", outputs, sep = "")


# ------------------------------------------------------------------------------
# Defined Functions
# ------------------------------------------------------------------------------

# Chapman Richard's Function
chapman_richards <- function(t, A, K, B, m) {
  return(A * (1 - (B * exp(-K * t)))^(1 / (1 - m)))
}

# Function to load necessary input files for the calculation
# agc - is the results from the random forest generation
# max_pot - is the maximum potential (starting point for A)
# valid_pixels - is a binary raster of valid pixels
# enables skipping grids with no valid data and efficient skipping of
# pixels
get_input_files <- function(id, t) {
  agc_name <-
    paste(input_dir, "/agc/agc_", id_prefix, id, "_age_", sep = "")
  maximum_potential_name <-
    paste(input_dir, "/max_pot/agc_pot_", id_prefix, id, ".tif", sep = "")
  valid_pixels_name <-
    paste(input_dir,
      "/agc_valid/valid_agc_",
      id_prefix,
      id,
      ".tif",
      sep = ""
    )
  filename_vector <- character(20)
  for (i in t) {
    filename_vector[i] <- paste(agc_name, i, ".tif", sep = "")
  }

  output <- list()
  output$agc_files <- filename_vector
  output$max_pot_file <- maximum_potential_name
  output$valid_pixels_file <- valid_pixels_name
  return(output)
}

# Function to fit the CR retrieve parameters using NLS
# y = agc input
# x = age vector
# start_vals = dictionary of starting values for key parameters
# lower_bounds = dictionary of lower bounds for key parameters
# upper_bounds = dictionary of upper bounds of key parameters
# iteration = integer of iteration number
# returns - dictionary of output parameters, parameter std error, and
# iteration value
fit_nls <-
  function(y,
           x,
           start_vals,
           lower_bounds,
           upper_bounds,
           iteration) {
    fit <- try(
      nls(
        y ~ chapman_richards(x, a, k, b, 2 / 3),
        algorithm = "port",
        start = start_vals,
        lower = lower_bounds,
        upper = upper_bounds,
        control = nls.control(warnOnly = TRUE, maxiter = 5000)
      ),
      silent = TRUE
    )

    coef <- coef(fit)
    error <- summary(fit)$coefficients[, "Std. Error"]

    output <- list()
    output$convergence <- fit$convergence
    output$A <- coef[1]
    output$K <- coef[2]
    output$B <- coef[3]
    output$Aerr <- error[1]
    output$Kerr <- error[2]
    output$Berr <- error[3]
    output$cnv <- iteration
    return(output)
  }

# Function to calculate cr curve for each pixel within a set grid denoted by ID
calc_cr <- function(id) {
  # Sets up progress logging
  log_freq <- 5
  last_logged_perc <- 0

  # Vector of ages
  ages <- seq(5, 100, by = 5)
  age_ch <- as.character(ages)


  # Runs input file function based on ID
  input_files <- get_input_files(id, age_ch)

  # Loads agc input files as raster objects
  agc_data <- rast(input_files$agc_files)
  max_pot <- rast(input_files$max_pot_file)
  valid_pixels <- rast(input_files$valid_pixels_file)

  # Converts raster objects to vectors
  agc_vals <- values(agc_data)
  max_pot_vals <- values(max_pot)
  valid_vals <- values(valid_pixels)
  # Vector of ages to align with vector of values
  age_vector <- rep(ages, each = 100)

  # Gets the number of pixels in the raster grid
  n_pixels <- ncell(agc_data)

  # Gets the number of values from agc dataset
  # = n_cells * 20 age bins * 100 bands
  n_values <- length(agc_vals)

  # Create empty raster - extent, resolution, and CRS of inupt raster
  temp_rast <- rast(ext(max_pot), resolution = res(max_pot))
  crs(temp_rast) <- crs(max_pot)

  # Creates placeholder rasters for output values
  a_rast <- temp_rast
  a_error_rast <- temp_rast
  b_rast <- temp_rast
  b_error_rast <- temp_rast
  k_rast <- temp_rast
  k_error_rast <- temp_rast
  cnv_rast <- temp_rast

  # Progress bar - not used when task is parallelized
  pb <- txtProgressBar(
    min = 0,
    max = n_pixels,
    initial = 0
  )

  # Loop over all values
  for (j in 1:n_pixels) {
    # get max value
    max <- max_pot_vals[j]
    # get test value for pixel
    test <- valid_vals[j]
    # if either max or test are 0 - skip pixel
    if (max == 0 | test == 0) {
      next
    }

    # Get vector of vector positions of j pixel values
    pix_seq <- seq(j, n_values, n_pixels)

    # Subset vector by pixel positions
    agc <- agc_vals[pix_seq]

    # Test for no data
    na_test <- any(is.na(agc))

    # Sets placeholder variable for output.
    A_val <- 0
    A_error <- 0
    K_val <- 0
    K_error <- 0
    B_val <- 0
    B_error <- 0
    cnv_val <- 0

    # Set values to NA if test for NA = true
    if (na_test) {
      A_val <- NA
      A_error <- NA
      K_val <- NA
      K_error <- NA
      B_val <- NA
      B_error <- NA
      cnv_val <- NA

      # Run first CR Iteration
    } else {
      s1 <- list(a = max, k = 0.05, b = 0.75)
      l1 <- list(
        a = max - (max * 0.1),
        k = 0.01,
        b = 0.2
      )
      u1 <- list(
        a = max + (max * 0.1),
        k = 0.1,
        b = 1
      )
      fit1 <- fit_nls(agc, age_vector, s1, l1, u1, 1)

      A_val <- fit1$A
      K_val <- fit1$K
      B_val <- fit1$B

      A_error <- fit1$Aerr
      K_error <- fit1$Kerr
      B_error <- fit1$Berr
      cnv_val <- fit1$cnv

      # If first iteration fails, run second iteration
      # Update starting values with results from iteration 1
      if (fit1$convergence == 1) {
        s2 <- list(a = A_val, k = K_val, b = B_val)
        l2 <- list(
          a = A_val - (A_val * 0.1),
          k = 0.01,
          b = 0.2
        )
        u2 <- list(
          a = A_val + (A_val * 0.1),
          k = 0.1,
          b = 1
        )
        fit2 <- fit_nls(agc, age_vector, s2, l2, u2, 2)

        A_val <- fit2$A
        K_val <- fit2$K
        B_val <- fit2$B

        A_error <- fit2$Aerr
        K_error <- fit2$Kerr
        B_error <- fit2$Berr
        cnv_val <- fit2$cnv

        # If second iteration fails, run third iteration
        # Update starting values with results from iteration 2
        if (fit2$convergence == 1) {
          s3 <- list(a = A_val, k = K_val, b = B_val)
          l3 <- list(
            a = A_val - (A_val * 0.1),
            k = 0.01,
            b = 0.2
          )
          u3 <- list(
            a = A_val + (A_val * 0.1),
            k = 0.1,
            b = 1
          )
          fit3 <- fit_nls(agc, age_vector, s3, l3, u3, 3)

          A_val <- fit3$A
          K_val <- fit3$K
          B_val <- fit3$B

          A_error <- fit3$Aerr
          K_error <- fit3$Kerr
          B_error <- fit3$Berr
          cnv_val <- fit3$cnv

          # If third iteration fails use results from 3rd iteration
          # Flag pixel with convergence failur value(4)
          if (fit3$convergence == 1) {
            cnv_val <- 4
          }
        }
      }
    }

    # Fill placeholder rasters with results
    a_rast[j] <- A_val
    k_rast[j] <- K_val
    b_rast[j] <- B_val
    a_error_rast[j] <- A_error
    k_error_rast[j] <- K_error
    b_error_rast[j] <- B_error
    cnv_rast[j] <- cnv_val

    # Log progress in progress file
    current_perc <- (j / n_pixels) * 100
    if (current_perc - last_logged_perc >= log_freq) {
      cat(
        sprintf("Grid ID %s: %d%% Complete\n", id, round(current_perc)),
        file = log_file,
        append = TRUE
      )
      last_logged_perc <-
        current_perc # Update the last logged percentage
    }

    # Progress text bar - not used in parallelization
    # setTxtProgressBar(pb, j)
  }

  # Set result file names and paths
  a_name <- paste("A_grd_", id, ".tif", sep = "")
  k_name <- paste("K_grd_", id, ".tif", sep = "")
  b_name <- paste("B_grd_", id, ".tif", sep = "")
  a_e_name <- paste("A_error_grd_", id, ".tif", sep = "")
  k_e_name <- paste("K_error_grd_", id, ".tif", sep = "")
  b_e_name <- paste("B_error_grd_", id, ".tif", sep = "")
  cnv_name <- paste("convergence_grd_", id, ".tif", sep = "")

  a_name <- file.path(output_dir, "A", a_name, fsep = "/")
  k_name <- file.path(output_dir, "K", k_name, fsep = "/")
  b_name <- file.path(output_dir, "B", b_name, fsep = "/")
  a_e_name <- file.path(output_dir, "A_error", a_e_name, fsep = "/")
  k_e_name <- file.path(output_dir, "K_error", k_e_name, fsep = "/")
  b_e_name <- file.path(output_dir, "B_error", b_e_name, fsep = "/")
  cnv_name <- file.path(output_dir, "convergence", cnv_name, fsep = "/")

  # Write results to file
  writeRaster(a_rast, a_name, gdal = c("COMPRESS=DEFLATE"))
  writeRaster(k_rast, k_name, gdal = c("COMPRESS=DEFLATE"))
  writeRaster(b_rast, b_name, gdal = c("COMPRESS=DEFLATE"))
  writeRaster(a_error_rast, a_e_name, gdal = c("COMPRESS=DEFLATE"))
  writeRaster(k_error_rast, k_e_name, gdal = c("COMPRESS=DEFLATE"))
  writeRaster(b_error_rast, b_e_name, gdal = c("COMPRESS=DEFLATE"))
  writeRaster(cnv_rast, cnv_name, gdal = c("COMPRESS=DEFLATE"))

  # Update progress file with completed message for a grid
  log_entry <- sprintf("Grid ID %s: Processing Complete\n", id)
  write(log_entry, file = log_file, append = TRUE)
}


# -------------------------------------------------------------------------
# Running calculations
# -------------------------------------------------------------------------

# Get's list of input IDs
inputs <- list.files(paste(input_dir, "/agc_valid", sep = ""))
grid_ids <- regmatches(inputs, regexpr("\\d+", inputs))

# Get's list of completed IDs
completed <- list.files(paste(output_dir, "/A", sep = ""))
completed_grids <-
  unique(regmatches(completed, regexpr("\\d+", completed)))

# Returns list of un-run IDs
to_do <- setdiff(grid_ids, completed_grids)
length(to_do)

to_do_valid <- vector()

# Test for any valid pixels in inputs
for (i in 1:length(to_do)) {
  id <- to_do[i]
  valid_pixels_name <-
    paste(input_dir,
      "/agc_valid/valid_agc_",
      id_prefix,
      id,
      ".tif",
      sep = ""
    )
  rast <- rast(valid_pixels_name)
  setMinMax(rast)
  test <- minmax(rast, compute = FALSE)[2, 1]
  if (test == 1) {
    to_do_valid[i] <- id
  }
}

# Returns lists of valid un-run IDs
to_do_valid <- to_do_valid[!is.na(to_do_valid)]
length(to_do_valid)
to_do_valid

# Subset IDs to run
start_grid <- 1
end_grid <- 177
g_ids <- to_do_valid[start_grid:end_grid]

# Add running IDs to Log File
grid_log <- sprintf("Grids: %s", g_ids)
write(grid_log, file = log_file, append = TRUE)

# Register cores for Parallelization
cl <- makeCluster(22)
registerDoParallel(cl)

# Export functions to each cluster
clusterExport(
  cl,
  list(
    "calc_cr",
    "inputs",
    "outputs",
    "id_prefix",
    "input_dir",
    "output_dir",
    "chapman_richards",
    "get_input_files",
    "fit_nls",
    "log_file"
  )
)
clusterEvalQ(cl, library("terra"))

# Run CR function over each grid - distributing to job to an available core
# tic() and toc() registers time elapsed between the two calls
tic()
foreach(id = g_ids, .packages = c("terra")) %dopar% {
  calc_cr(id)
}
toc()

# Close cluster, remove session variables, and run garbage collector
parallel::stopCluster(cl = cl)
rm(list = ls(all.names = TRUE))
gc()

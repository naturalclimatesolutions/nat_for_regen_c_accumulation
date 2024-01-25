# -------------------------------------------------------------------------
#
# Script: GROA - CR_Calc
#
# Purpose of script: Calculate Pixel Level Chapman Richard's Curve Parmeters
# Author: Nathaniel Robinson
#
# Copyright (c) Nathaniel Robinson, 2022
# Email: n.robinson@tnc.org
#
# -------------------------------------------------------------------------
#
# Notes:
#
# -------------------------------------------------------------------------


# -------------------------------------------------------------------------
# Package Management
# -------------------------------------------------------------------------
# List of Packages Used
list.of.packages <- c(
  "terra",
  "tidyverse",
  "parallel",
  "doParallel"  # for parallelization
)

# Check If Any Packages Neeed Installing
new.packages <- list.of.packages[!(list.of.packages %in% installed.packages()[,"Package"])]

# Install New Packages adn Dependencies
if(length(new.packages) > 0){
  install.packages(new.packages, dep=TRUE)
}

# Load Required Packages
for(package.i in list.of.packages){
  suppressPackageStartupMessages(
    library(
      package.i, 
      character.only = TRUE
    )
  )
}


# -------------------------------------------------------------------------
# Input and Output Directory Management
# -------------------------------------------------------------------------

# Get Directory of Source File Location - File Must be Saved.
setwd(dirname(rstudioapi::getActiveDocumentContext()$path))

# Set Source File Directory as Working Directory
working_dir <- getwd()

inputs <- "/agc_test"
outputs <- "/cr_pars_pnw"

input_dir <- paste(dirname(working_dir), "/data/inputs", inputs, sep = "")
output_dir <- paste(dirname(working_dir), "data/outputs", outputs, sep = "")


# ------------------------------------------------------------------------------
# Define Functions
# ------------------------------------------------------------------------------

# Defines the Chapman Richards Function
chapman_richards <- function(t, A, K, B, m) {
  return(A * (1 - (B * exp(-K * t)))^(1/(1-m)))
}


calc_cr <- function(id){

  file_name = paste("agc_", id,"_age_", sep="")
  max_file_name <- paste("agc_pot_", id, ".tif", sep="")
  max_pot_path <- paste(input_dir, max_file_name, sep="")
  max_pot <- rast(max_pot_path)
  ages = seq(5, 100, by = 5)
  age_ch = as.character(ages)
  
  filename_vector <-character(20)
  for (i in age_ch){
    filename_vector[i] <- paste(input_dir, file_name, i,".tif", sep="")
  }

  agc_data <- rast(filename_vector)
  max_pot_data <- rast(max_pot_path)
  agc_values <- values(agc_data)
  max_pot_values <- values(max_pot_data)
  n_pixels <- ncell(agc_data)
  n_values <- length(agc_values)

  temp_raster <- rast(ext(max_pot_data), resolution=res(max_pot_data))
  crs(temp_raster) <- crs(max_pot_data)
  a_rast <- temp_raster
  b_rast <- temp_raster
  k_rast <- temp_raster
  temp <- temp_raster 
  
  values(temp) <- sample(0:1, size=nrow(temp) * ncol(temp), replace=TRUE)
  temp_values <- values(temp)
  
  age_vector <- rep(ages, each = 100)
  pb = txtProgressBar(min = 0, max = n_pixels, initial = 0)
  
for (j in 1:n_pixels){
  max <- max_pot_values[j]
  test <- temp_values[j]
  if (max == 0 | test == 0) {next}
  pix_seq <- seq(j, n_values, n_pixels)
  agc <- agc_values[pix_seq]
  na_test <- any(is.na(agc))
  A_val <- 0
  K_val <- 0
  B_val <- 0
  if (na_test) {
    A_val <- NA
    K_val <- NA
    B_val <- NA
  } else{
    fit <- try(nls(agc ~ chapman_richards(age_vector, a, k, b, 2/3),
                   algorithm="port",
                   start = list(a = max, k = 0.05, b=0.75),
                   lower = list(a = max - (max*0.1), k = 0.01, b=0.2),
                   upper = list(a = max + (max*0.1), k = 0.1, b=1),
                   control = nls.control(warnOnly = TRUE, maxiter = 5000)),
               silent = TRUE)

    if (fit$convergence == 1) {
      fit2 <- try(nls(agc ~ chapman_richards(age_vector, a, k, b, 2/3),
                      algorithm="port",
                      start = list(a = coef(fit)[1], k = coef(fit)[2], b=coef(fit)[3]),
                      lower = list(a = max - (max*0.1), k = 0.01, b=0.2),
                      upper = list(a = max + (max*0.1), k = 0.1, b=1),
                      control = nls.control(warnOnly = TRUE, maxiter = 5000)),
                  silent = FALSE)
      A_val <- coef(fit2)[1]
      K_val <- coef(fit2)[2]
      B_val <- coef(fit2)[3]
    } else {
      A_val <- coef(fit)[1]
      K_val <- coef(fit)[2]
      B_val <- coef(fit)[3]
    }
  }
  a_rast[j] <- A_val
  k_rast[j] <- K_val
  b_rast[j] <- B_val
  setTxtProgressBar(pb,j)
}

  a_name = paste(id, '_A.tif', sep="")
  k_name = paste(id, '_K.tif', sep="")
  b_name = paste(id, '_B.tif', sep="")
  a_name = file.path(output_dir, a_name)
  k_name = file.path(output_dir, k_name)
  b_name = file.path(output_dir, b_name)

  writeRaster(a_rast, a_name,  gdal=c("COMPRESS=DEFLATE"))
  writeRaster(k_rast, k_name,  gdal=c("COMPRESS=DEFLATE"))
  writeRaster(b_rast, b_name,  gdal=c("COMPRESS=DEFLATE"))
}


system.time(
  calc_cr('pnw')
)


 
# inputs <- list.files(paste(dirname(working_dir), "/data/", 'agc_5_deg', sep = ""), pattern="agc_pot_grd")
# grid_ids <- regmatches(inputs, regexpr( "\\d+", inputs))
# 
# completed <- list.files(paste(dirname(working_dir), "/outputs/to_upload/uploaded/A", sep = ""))
# completed_grids <- unique(regmatches(completed, regexpr( "\\d+", completed)))
# completed_grids
# length(completed_grids)
# to_do <- setdiff(grid_ids, completed_grids)
# length(to_do)
# to_do
# start_grid <- 1
# end_grid <- 24
# g_ids <- to_do[start_grid:end_grid]
# length(g_ids)
# sort(g_ids)
# cl <- makeCluster(12)
# registerDoParallel(cl)
# clusterExport(cl,list('calc_cr'))
# clusterEvalQ(cl, library("terra"))
# system.time(
#   parLapply(cl, g_ids, fun=calc_cr)
# )
# 
# parallel::stopCluster(cl = cl)
# rm(list=ls(all.names=TRUE))
# gc()



# -------------------------------------------------------------------------
# Package Management
# -------------------------------------------------------------------------
list.of.packages <- c("ggplot2")

# Check If Any Packages Neeed Installing
new.packages <-
  list.of.packages[!(list.of.packages %in% installed.packages()[, "Package"])]

# Install New Packages adn Dependencies
if (length(new.packages) > 0) {
  install.packages(new.packages, dep = TRUE)
}

# Load Required Packages
for (package.i in list.of.packages) {
  suppressPackageStartupMessages(library(package.i,
                                         character.only = TRUE))
}

# -------------------------------------------------------------------------
# Input and Output Directory Management
# -------------------------------------------------------------------------

# Get Directory of Source File Location - File Must be Saved.
setwd(dirname(rstudioapi::getActiveDocumentContext()$path))

# Set Source File Directory as Working Directory
working_dir <- getwd()

data_dir = paste(dirname(working_dir), 'data/validation/ee', sep = "/")

congo <- read.csv(paste(data_dir, 'congo_cr_pars.csv', sep = "/"))
congo_pars <- list(A = 116.6176, K = 0.022315, C = 0.767582)
amazon <- read.csv(paste(data_dir, 'amazon_cr_pars.csv', sep = "/"))
amazon_pars <- list(A = 121.0104, K = 0.01297, C = 0.671297)
borneo <- read.csv(paste(data_dir, 'borneo_cr_pars.csv', sep = "/"))
borneo_pars <- list(A = 121.1739, K = 0.026406, C = 0.95896)




crResults <- function(ee_points, heinrich_pars, location) {
  ages <- seq(1, 100, 1)
  chapman_richards_ee <- function(t, A, K, B, m) {
    return(A * (1 - (B * exp(-K * t))) ^ (1 / (1 - m)))
  }
  chapman_richards_heinrich <- function(t, A, K, C) {
    return(A * (1 -  exp(-K * t)) ^ (C))
  }
  
  estimates <- list()
  errors <- list()
  for (i in ages) {
    agc_ee <-
      chapman_richards_ee(i, ee_points$A, ee_points$K, ee_points$B, 2 / 3)
    agc_heinrich <-
      chapman_richards_heinrich(i, heinrich_pars$A, heinrich_pars$K, heinrich_pars$C)
    error <- agc_ee - agc_heinrich
    error = error[!is.na(error)]
    error <- sqrt(mean((error) ^ 2))
    error <- as.data.frame(error)
    colnames(error) <- c('rmse')
    error$age <- i
    error$id <- 'error'
    result <- as.data.frame(agc_ee)
    
    colnames(result) <- c('agc')
    
    result$age <- i
    result$id <- as.character(amazon$system.index)
    result_heinrich <- as.data.frame(agc_heinrich)
    colnames(result_heinrich) <- c('agc')
    result_heinrich$age <- i
    result_heinrich$id <- 'val'
    
    
    result <- rbind(result, result_heinrich)
    estimates[[i]] <- result
    errors[[i]] <- error
  }
  output <- do.call(rbind, estimates)
  rmse <- do.call(rbind, errors)
  
  heinrich_est <- output[output$id == 'val',]
  ee_est <- output[output$id != 'val',]
  ee_est <- ee_est[complete.cases(ee_est), ]
  
  mean_agc_data <- ee_est %>%
    group_by(age) %>%
    summarise(mean_agc = mean(agc), .groups = 'drop')
  mean_agc_data$id = 'Mean'
  print(head(mean_agc_data))
  # mean_agc_data <- mutate(mean_agc_data, line_type = "Mean")
  
  p <- ggplot(ee_est, aes(x = age, y = agc, group = id)) +
    geom_line(aes(color = "Pixel Estimates"),
              alpha = 0.05,
              linewidth = 0.5) +  # Adjust alpha for better visibility if necessary
    geom_line(data = mean_agc_data,
              aes(x = age, y = mean_agc, color = "Region Means"),
              linewidth = 1) +
    geom_line(data = heinrich_est,
              aes(x = age, y = agc, color = "Heinrich et al."),
              linewidth = 1) +
    geom_line(data = rmse,
              aes(x = age, y = rmse, color = "RMSE"),
              linewidth = 1) +
    theme_minimal() +
    theme(
      legend.title = element_blank(),
      legend.position = c(0.05, 0.95),
      legend.justification = c(0, 1),
      legend.background = element_blank(),
      legend.box.background = element_blank(),
      legend.box.margin = margin(0, 0, 0, 0)
    ) +
    guides(color = guide_legend(title = NULL)) +
    scale_color_manual(
      values = c(
        "Pixel Estimates" = "darkolivegreen4",
        "Region Means" = "black",
        "Heinrich et al." = "darkorange3",
        "RMSE" = "firebrick"
      )
    ) +
    labs(
      x = "Age",
      y = "Carbon Accumulation (mgC/ha)",
      title = paste("Comparison of Growth Curves for ", location, sep = "")
    )
  
  p
  
}

congoResults <-
  crResults(congo, congo_pars, "Central Africa Forests")
congoResults
amazonResults <- crResults(amazon, amazon_pars, "Amazon Forests")
amazonResults
borneoResults <- crResults(borneo, borneo_pars, "Borneo Forests")
borneoResults


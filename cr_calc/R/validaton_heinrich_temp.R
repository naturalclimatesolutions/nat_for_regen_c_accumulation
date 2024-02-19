# -------------------------------------------------------------------------
# Package Management
# -------------------------------------------------------------------------
list.of.packages <- c("ggplot2", "dplyr")

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

congo <-
  read.csv(paste(data_dir, 'congo_temp_cr_pars_100.csv', sep = "/")) %>%
  select(1:5)

congo_pars <-
  list(
    all = list(A = 116.6176, K = 0.022315, C = 0.767582),
    low = list(A = 123.12, K = 0.019956, C = 0.770382),
    med = list(A = 113.316, K = 0.02035, C = 0.706204),
    high = list(A = 114, K = 0.021736, C = 0.520325)
  )

amazon <-
  read.csv(paste(data_dir, 'amazon_temp_cr_pars_100.csv', sep = "/"))
amazon_pars <-
  list(
    all = list(A = 121.0104, K = 0.01297, C = 0.671297),
    low = list(A = 112.176, K = 0.019407, C = 0.688714),
    med = list(A = 117.192, K = 0.013516, C = 0.665505),
    high = list(A = 100.776, K = 0.011296, C = 0.595465)
  )

borneo <-
  read.csv(paste(data_dir, 'borneo_temp_cr_pars_100.csv', sep = "/"))
borneo_pars <-
  list(
    all = list(A = 121.1739, K = 0.026406, C = 0.95896),
    low = list(A = 120.156, K = 0.045843, C = 1.06312),
    med = list(A = 111.72, K = 0.037629, C = 1.2058262),
    high = list(A = 71.592, K = 0.051542, C = 1.34188)
  )

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
    agc_heinrich_low <-
      chapman_richards_heinrich(i,
                                heinrich_pars$low$A,
                                heinrich_pars$low$K,
                                heinrich_pars$low$C)
    agc_heinrich_med <-
      chapman_richards_heinrich(i,
                                heinrich_pars$med$A,
                                heinrich_pars$med$K,
                                heinrich_pars$med$C)
    agc_heinrich_high <-
      chapman_richards_heinrich(i,
                                heinrich_pars$high$A,
                                heinrich_pars$high$K,
                                heinrich_pars$high$C)
    
    result <- as.data.frame(agc_ee)
    
    colnames(result) <- c('agc')
    
    result$age <- i
    result$id <- as.character(ee_points$system.index)
    result$temp <- as.factor(ee_points$temp)
    result_heinrich_low <- as.data.frame(agc_heinrich_low)
    result_heinrich_med <- as.data.frame(agc_heinrich_med)
    result_heinrich_high <- as.data.frame(agc_heinrich_high)
    colnames(result_heinrich_low) <- c('agc')
    colnames(result_heinrich_med) <- c('agc')
    colnames(result_heinrich_high) <- c('agc')
    result_heinrich_low$temp <- 1
    result_heinrich_med$temp <- 2
    result_heinrich_high$temp <- 3
    
    result_heinrich_low$age <- i
    result_heinrich_med$age <- i
    result_heinrich_high$age <- i
    result_heinrich_low$id <- 'val'
    result_heinrich_med$id <- 'val'
    result_heinrich_high$id <- 'val'
    
    
    result <-
      do.call(
        rbind,
        list(
          result,
          result_heinrich_low,
          result_heinrich_med,
          result_heinrich_high
        )
      )
    estimates[[i]] <- result
    
  }
  output <- do.call(rbind, estimates)
  return(output)
  
}
# range_data <- ee_est %>%
#   group_by(age, temp) %>%
#   summarise(ymin = min(agc), ymax = max(agc), .groups = 'drop')
# error <- agc_ee - agc_heinrich
# error = error[!is.na(error)]
# error <- sqrt(mean((error) ^ 2))
# error <- as.data.frame(error)
# colnames(error) <- c('rmse')
# error$age <- i
# error$id <- 'error'

congoResults <-
  crResults(congo, congo_pars, "Central Africa Forests")


amazonResults <- crResults(amazon, amazon_pars, "Amazon Forests")
borneoResults <- crResults(borneo, borneo_pars, "Borneo Forests")


plot <- function(df, location) {
  ee_df <- df[which(df$id != 'val'), ]
  viola_df <- df[which(df$id == 'val'), ]
  mean_agc_data <- ee_df %>%
    group_by(age, temp) %>%
    summarise(mean_agc = mean(agc), .groups = 'drop')
  mean_agc_data <- mutate(mean_agc_data, line_type = "Mean")
  viola_df <- mutate(viola_df, line_type = "Heinrich")
  custom_labels <- c("1.Mean" = "Low Temp", 
                     "2.Mean" = "Mid Temp", 
                     "3.Mean" = "High Temp",
                     "1.Heinrich" = "Temp 1 - Heinrich", 
                     "2.Heinrich" = "Temp 2 - Heinrich", 
                     "3.Heinrich" = "Temp 3 - Heinrich")
  
  # Define colors and linetypes for the legend

  p <- ggplot() +
    geom_line(data = ee_df, aes(x = age, y = agc, group = id), color='darkolivegreen', alpha = 0.05) + # Individual lines
    geom_line(data = mean_agc_data, aes(x = age, y = mean_agc, group = temp, color = interaction(temp, line_type)), size = 1.5) + # Mean lines
    geom_line(data = viola_df, aes(x = age, y = agc, group = temp, color = interaction(temp, line_type)),linetype="dashed", size = 1) + # Mean lines
    scale_color_manual(values = c(
                                  "1.Mean" = "#ffcc33", "2.Mean" = "#ee6600", "3.Mean" = "#990000",
                                  "1.Heinrich" = "#ffcc33", "2.Heinrich"="#ee6600", "3.Heinrich"="#990000"), labels = custom_labels) +
    labs(
      x = "Age",
      y = "Carbon Accumulation (mgC/ha)",
      title = paste("Comparison of Growth Curves for ", location, sep = "")
    ) +
    theme_minimal() +
    theme(legend.title = element_blank(),
          legend.position = c(0.3, 0.975), # Top right inside plot area
          legend.justification = c("right", "top"), # Anchor point
          legend.box.just = "right",
          legend.margin = margin(6, 6, 6, 6)) # Adjust spacing around legend
  
  print(p)
}

plot(congoResults, "Central Africa")
plot(amazonResults, "Amazon")
plot(borneoResults, "Borneo")



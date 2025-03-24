# ------------------------------------------------------------------------------
# Package Management
# ------------------------------------------------------------------------------
list.of.packages <- c(
  "ggplot2",
  "dplyr",
  "tidyr",
  'corrplot',
  'caret',
  'Metrics'
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


# ------------------------------------------------------------------------------
# Input and Output Directory Management
# ------------------------------------------------------------------------------

# Get Directory of Source File Location - File Must be Saved.
setwd(dirname(rstudioapi::getActiveDocumentContext()$path))

# Set Source File Directory as Working Directory
working_dir <- getwd()

data_dir = paste(dirname(working_dir), 'data', sep = "/")


df <- read.csv(paste(data_dir, 'ED_Fig4.csv', sep='/'))


df$rate1 <- df$agc_mgha / df$age
df$rate2 <- df$mean / df$age

young <- df[(df$age <= 30),]
rmse(young$rate1, young$rate2)
cor(young$rate1, young$rate2)^2
error_summary <- df %>%
  group_by(age) %>%
  summarize(
    rmse = rmse(rate1,rate2),
    r2 = cor(rate1,rate2)^2
  ) 

plot(error_summary$age, error_summary$rmse, type = "b", col = "red", ylab = "RMSE", xlab = "Age",
     ylim = range(error_summary$rmse))
par(new = TRUE)
plot(error_summary$age, error_summary$r2, type = "b", col = "blue", axes = FALSE, xlab = "", ylab = "",
     ylim = range(error_summary$r2))
axis(side = 4, at = pretty(range(error_summary$r2)))
mtext("R2", side = 4, line = 3)


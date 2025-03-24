# ------------------------------------------------------------------------------
# Package Management
# ------------------------------------------------------------------------------
list.of.packages <- c(
  "tidyverse"
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
# Get Directory of Source File Location - File Must be Saved.
setwd(dirname(rstudioapi::getActiveDocumentContext()$path))

# Set Source File Directory as Working Directory
working_dir <- getwd()

data_dir = paste(dirname(working_dir), 'data', sep = "/")

data <- read.csv(paste(data_dir, "ED_Fig6.csv", sep="/"))



breaks <-seq(2.5,102.5,5)
with(data, hist(age, breaks=breaks, xlim=range(breaks), xlab="AGE", main="Distribution Plot Data by Age Class", col='darkolivegreen4'))

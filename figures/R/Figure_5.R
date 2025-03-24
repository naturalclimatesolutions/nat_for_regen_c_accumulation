# -------------------------------------------------------------------------
# Package Management
# -------------------------------------------------------------------------
list_of_packages <- c(
  "ggplot2",
  "dplyr",
  "tidyr",
  "magrittr"
)

# Check If Any Packages Neeed Installing
new_packages <-
  list_of_packages[!(list_of_packages %in% installed.packages()[, "Package"])]

# Install New Packages adn Dependencies
if (length(new_packages) > 0) {
  install.packages(new_packages, dep = TRUE)
}

# Load Required Packages
for (package.i in list_of_packages) {
  suppressPackageStartupMessages(library(package.i,
    character.only = TRUE
  ))
}

# -------------------------------------------------------------------------
# Input and Output Directory Management
# -------------------------------------------------------------------------

# Get Directory of Source File Location - File Must be Saved.
setwd(dirname(rstudioapi::getActiveDocumentContext()$path))

# Set Source File Directory as Working Directory
working_dir <- getwd()

data_dir <- paste(dirname(working_dir), "data/", sep = "/")

ipcc_rates <- read.csv(paste(data_dir, "Fig4_IPCC_rates.csv", sep = "/"))

cr_rates <- read.csv(paste(data_dir, "Fig4_CR_rates.csv", sep = "/")) %>%
  mutate(ecozone_continent = paste(continent, ez, sep = " "))
cr_rates$ecozone_continent <- gsub(" forest", "", cr_rates$ecozone_continent)
cr_rates$ecozone_continent <- gsub("North America", "NA", cr_rates$ecozone_continent)
cr_rates$ecozone_continent <- gsub("South America", "SA", cr_rates$ecozone_continent)

summary_stats <- cr_rates %>%
  group_by(ecozone_continent) %>%
  summarize(
    Mean_OS_new = mean(gt_20_new),
    Min_OS_new = quantile(gt_20_new, probs = 0.05),
    Max_OS_new = quantile(gt_20_new, probs = 0.95),
    Mean_YS_new = mean(lte_20_new),
    Min_YS_new = quantile(lte_20_new, probs = 0.05),
    Max_YS_new = quantile(lte_20_new, probs = 0.95),
    .groups = "drop" # This option cleans up the grouping structure after summarization
  )

df <- merge(ipcc_rates, summary_stats)


# convert IPCC aboveground biomass to carbon
df$IPCC_OS <- 0.46 * df$growth_secondary_greater_20
# convert IPCC aboveground biomass to carbon
df$IPCC_YS <- 0.46 * df$growth_secondary_less_20

rates <- read.csv(paste(data_dir, "Fig5.csv", sep="/")) %>%
  mutate(ecozone_continent = paste(continent, ez, sep = " "))
rates$ecozone_continent <- gsub(" forest", "", rates$ecozone_continent)
rates$ecozone_continent <- gsub("North America", "NA", rates$ecozone_continent)
rates$ecozone_continent <- gsub("South America", "SA", rates$ecozone_continent) 

Fig5_a <- 'SA Tropical rainforest'
Fig5_b <- 'Asia Tropical rainforest'
Fig5_c <- 'Africa Tropical dry'
Fig5_d <- 'NA Temperate mountain system'

head(df)
ez_plots <- function(ez_name) {
  ez_rates <- rates %>%
    filter(ecozone_continent == ez_name)

  ipcc_defaults <- df %>%
    filter(ecozone_continent == ez_name)  
  ipcc_ys <- ipcc_defaults$IPCC_YS
  ipcc_os <- ipcc_defaults$IPCC_OS

  p <- ggplot(ez_rates, aes(x = age)) +
    ylim(0,3)+
    geom_ribbon(aes(ymin = AGC_p5, ymax = AGC_p95), fill = "lightblue", alpha = 0.5) +
    geom_line(aes(y = AGC_mean), color = "blue") +
    geom_segment(aes(x = 1, xend = 20, y = ipcc_ys, yend = ipcc_ys), color = "black", linetype = "dashed") +
    geom_segment(aes(x = 21, xend = 100, y = ipcc_os, yend = ipcc_os), color = "black", linetype = "dashed") +
    labs(
      title = ez_name,
      x = "Age",
      y = bquote('carbon accumulation rate ('*MgC~ ha^-1~ yr^-1*')')
    ) +
    theme_minimal()
  print(p)
}

ez_plots(Fig5_a)
ez_plots(Fig5_b)
ez_plots(Fig5_c)
ez_plots(Fig5_d)


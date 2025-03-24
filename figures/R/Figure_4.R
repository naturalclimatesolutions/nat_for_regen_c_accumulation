# -------------------------------------------------------------------------
# Package Management
# -------------------------------------------------------------------------
list_of_packages <- c(
  "ggplot2",
  "dplyr",
  "tidyr",
  "Matrix",
  "svglite",
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

Fig_4_panel_b <- ggplot(data = df) +
  theme_classic() +
  ylim(0, 5) +
  theme(
    legend.position = "none",
    axis.title.x = element_blank(),
    axis.text.x = element_text(size = 8, angle = 90, hjust = 0.95, vjust = 0.5)
  ) +
  geom_segment(aes(
    x = reorder(label, forest), xend = reorder(label, forest), y = Min_YS_new, yend = Max_YS_new,
    color = biome
  ), linewidth = 1.5, lineend = "round") +
  theme(axis.text.x = element_text(angle = 90, vjust = .5)) +
  scale_color_manual(values = c("#873e35", "#8eb1c4", "#c35b26", "#809778")) +
  geom_segment(aes(x = forest, xend = forest, y = IPCC_YS, yend = IPCC_YS), lineend = "round", size = 2) +
  geom_point(aes(x = forest, y = Mean_YS_new), shape = 21, fill = "white", size = 1.5) +
  ylab(bquote("aboveground rate (" * MgC ~ ha^-1 ~ yr^-1 * ")"))

Fig_4_panel_a <- ggplot(data = df) +
  theme_classic() +
  ylim(0, 5) +
  theme(
    legend.position = "none",
    axis.title.x = element_blank(),
    axis.text.x = element_text(size = 8, angle = 90, hjust = 0.95, vjust = 0.5)
  ) +
  geom_segment(aes(
    x = reorder(label, forest), xend = reorder(label, forest), y = Min_OS_new, yend = Max_OS_new,
    color = biome
  ), linewidth = 1.5, lineend = "round") +
  theme(axis.text.x = element_text(angle = 90, vjust = .5)) +
  scale_color_manual(values = c("#873e35", "#8eb1c4", "#c35b26", "#809778")) +
  geom_segment(aes(x = forest, xend = forest, y = IPCC_OS, yend = IPCC_OS), lineend = "round", size = 2) +
  geom_point(aes(x = forest, y = Mean_OS_new), shape = 21, fill = "white", size = 1.5) +
  ylab(bquote("aboveground rate (" * MgC ~ ha^-1 ~ yr^-1 * ")"))


Fig_4_panel_b
Fig_4_panel_a


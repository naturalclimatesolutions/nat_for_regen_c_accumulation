# -------------------------------------------------------------------------
# Package Management
# -------------------------------------------------------------------------
list.of.packages <- c("ggplot2", "tidyr", "dplyr")

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

data_dir = paste(dirname(working_dir), 'data', sep = "/")

age_max <- read.csv(paste(data_dir, 'ED_Fig3.csv', sep='/'))


head(age_max)


biome_names <- c(
  '1'= 'Tropical & Subtropical Moist Broadleaf Forests',
  '2'= 'Tropical & Subtropical Dry Broadleaf Forests',
  '3'= 'Tropical & Subtropical Coniferous Forests',
  '4'= 'Temperate Broadleaf & Mixed Forests',
  '5'= 'Temperate Conifer Forests',
  '6'= 'Boreal Forests/Taiga',
  '7'= 'Tropical & Subtropical Grasslands, Savannas & Shrublands',
  '8'= 'Temperate Grasslands, Savannas & Shrublands',
  '12' = 'Mediterranean Forests, Woodlands & Scrub'
)
age_max <- age_max[!(age_max$eco_id == 0),]
age_max <- age_max[!(age_max$eco_id == 435),]


mean_age <- age_max %>%
  group_by(biome_id) %>%
  summarize(mean_age = median(mean_age, na.rm = TRUE)) %>%
  arrange(mean_age)

age_levels <- mean_age$biome_id
age_max$biome <- factor(age_max$biome, levels = age_levels)

b<- ggplot(age_max, aes(x = biome, y = mean_age)) +
  geom_boxplot(position = position_dodge(0.75), fill ='#1b9e77') +  # Adjust dodge width as necessary
  # scale_fill_manual(color = "blue") +  # Choose a color scheme
  labs(title = "Age at Maximum Rate by Biome",
       x = "Biome",
       y = "Age",
       fill = "Source") +
  theme_minimal() +
  theme(axis.text.x = element_text(angle = 90, hjust = 1)) 
  
b
ggsave("max_rate_age.svg",width=200,height=200,units="mm")

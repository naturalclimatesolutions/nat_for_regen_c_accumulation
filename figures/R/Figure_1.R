# ------------------------------------------------------------------------------
# Package Management
# ------------------------------------------------------------------------------
list.of.packages <- c(
  "ggplot2",
  "dplyr",
  "tidyr",
  'corrplot',
  'caret',
  "magrittr"
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

data_dir = paste(dirname(working_dir), 'data/', sep = "/")

er <- read.csv(paste(data_dir, 'Fig1_panel_a_data.csv', sep = "/")) %>%
   select(3:6)

colnames(er) <- c( 'Age', 'Biome', 'Ecoregion', 'Rate')
er$Biome <- round(er$Biome)
unique(er$Biome)
er$Ecoregion <- as.factor(er$Ecoregion)
er$Biome <- as.factor(er$Biome)
er <- na.omit(er)

biome_names <- c(
  '1'= 'Tropical & Subtropical Moist Broadleaf Forests',
  '2'= 'Tropical & Subtropical Dry Broadleaf Forests',
  '3'= 'Tropical & Subtropical Coniferous Forests',
  '4'= 'Temperate Broadleaf & Mixed Forests',
  '5'= 'Temperate Conifer Forests',
  '6'= 'Boreal Forests/Taiga',
  '7'= 'Tropical & Subtropical Grasslands, Savannas & Shrublands',
  '8'= 'Temperate Grasslands, Savannas & Shrublands',
  '12'= 'Mediterranean Forests, Woodlands & Scrub'
)

type <- c(
  '1'= 'Forest',
  '2'= 'Forest',
  '3'= 'Forest',
  '4'= 'Forest',
  '5'= 'Forest',
  '6'= 'Forest',
  '7'= 'Savanna',
  '8'= 'Savanna',
  '12'= 'Forest'
)

realm <- c(
  '1'= 'Tropical',
  '2'= 'Tropical',
  '3'= 'Tropical',
  '4'= 'Temperate',
  '5'= 'Temperate',
  '6'= 'Boreal',
  '7'= 'Tropical',
  '8'= 'Temperate',
  '12'= 'Mediterranean'
)


er <- er %>%
  mutate(Biome_Name = biome_names[as.character(Biome)]) %>%
  mutate(Ecosystem = type[as.character(Biome)]) %>%
  mutate(Realm = realm[as.character(Biome)])

er$Biome_Name <- as.factor(er$Biome_Name)
er$Ecosystem <- as.factor(er$Ecosystem)
er$Realm <- as.factor(er$Realm)

manual_colors <- c(
  "1" = "darkolivegreen", 
  "2" = "khaki3", 
  "3" = "lightgoldenrod4", 
  "4" = "darkolivegreen",
  "5" = "lightgoldenrod4", 
  "6" = "cadetblue3", 
  "7" = "darkgoldenrod1", 
  "8" = "darkgoldenrod1", 
  "12" = "lightsalmon3"
)

manual_shapes <- c("1" = 21, "2" = 21, "3" = 21, "4" = 22,
                   "5" = 22, "6" = 23, "7" = 24, "8" = 25, "12" = 8)
age_v_rate <- ggplot(er, aes(x=Age, y=Rate, shape = as.factor(Biome))) +
  scale_fill_manual(values = manual_colors) +
  scale_shape_manual(values = manual_shapes) +
  
  geom_point(size=2,stroke = 0.15, color='black', alpha = 0.75, aes(fill=Biome)) +
               scale_fill_manual(values = manual_colors) +
  scale_x_continuous(limits=c(0, 100), expand = c(0, 0)) +
  scale_y_continuous(limits=c(0, 4), expand = c(0, 0)) +
  theme_minimal() +
  theme(#legend.position = "none",
        panel.background = element_rect(fill = "transparent"), # Transparent background
        plot.background = element_rect(fill = "transparent", color = NA),
        plot.title =  element_text(size = 9),  # Adjust title size
        axis.title =  element_text(size = 7),   # Adjust axis titles size
        axis.text =  element_text(size = 6),
        panel.grid.major = element_line(size=0.15),
        panel.grid.minor = element_blank())

age_v_rate

# ggsave("age_v_rate.png", plot = age_v_rate, width = 6, height = 4, dpi = 600, bg = "transparent")

df_bm <- read.csv(paste(data_dir, 'biome_median_rates.csv', sep = "/")) %>%
  select(2:4)

df_bm <- df_bm %>%
  mutate(Biome_Name = biome_names[as.character(id)]) 

df_bm$Biome_Name <- as.factor(df_bm$Biome_Name)

manual_colors <- c(
  "Tropical & Subtropical Moist Broadleaf Forests" = "darkolivegreen",
  "Tropical & Subtropical Dry Broadleaf Forests" = "khaki3",
  "Tropical & Subtropical Coniferous Forests" = "lightgoldenrod4",
  "Temperate Broadleaf & Mixed Forests" = "darkolivegreen3",
  "Temperate Conifer Forests" = "lightgoldenrod1",
  "Boreal Forests/Taiga" = "cadetblue3",
  "Tropical & Subtropical Grasslands, Savannas & Shrublands" = "darkgoldenrod1",
  "Temperate Grasslands, Savannas & Shrublands" = "darkgoldenrod4",
  "Mediterranean Forests, Woodlands & Scrub" = "lightsalmon3"
)

p <- ggplot(df_bm, aes(x = age, y = median_rate, group = Biome_Name, color = Biome_Name)) +
  geom_smooth(method = "loess", se = FALSE)+
  labs(x = "Age", y = "Rate") +
  theme_minimal() +
  scale_color_manual(values = manual_colors)  # Adds a color palette for clarity

p

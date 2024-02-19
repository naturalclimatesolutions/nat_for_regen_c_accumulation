# -------------------------------------------------------------------------
# Package Management
# -------------------------------------------------------------------------
list.of.packages <- c("ggplot2", "dplyr", 'tidyr')

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

data_dir <- paste(dirname(working_dir), 'data/validation/IPCC', sep = "/")
data_dir

df1 <- read.csv(paste(data_dir, "agc_validation_ipcc_cp.csv", sep="/"))
df2 <- read.csv(paste(data_dir, "IPCC_EZ_Defaults.csv", sep="/"))


# Comdf2# Combine 'continent' and 'ez' into a single categorical variable
df1 <- df1 %>%
  mutate(ecozone_continent = paste(continent, ez, sep = " "))
df1$ecozone_continent <- gsub(" forest", "", df1$ecozone_continent)
df1$ecozone_continent <- gsub("North America", "NA", df1$ecozone_continent)
df1$ecozone_continent <- gsub("South America", "SA", df1$ecozone_continent)


df2 <- df2 %>%
  mutate(ecozone_continent = paste(continent, ecozone, sep = " "))
df2$ecozone_continent <- gsub(" forest", "", df2$ecozone_continent)
df2$ecozone_continent <- gsub("North America", "NA", df2$ecozone_continent)
df2$ecozone_continent <- gsub("South America", "SA", df2$ecozone_continent)

head(df2)

# Reshape the dataframe to a long format
df1_long <- df1 %>%
  gather(key = "source", value = "rate", cp, gt_20, lte_20, lte_30)
ipcc_defaults <- df2 %>%
  gather(key = "source", value = "rate", growth_secondary_greater_20, growth_secondary_less_20)



cp_stats = df1_long[which(df1_long$source=='cp'|df1_long$source=='lte_30'),]
cp_stats <- cp_stats[order(cp_stats$ez, cp_stats$continent), ]


ipcc_stats = df1_long[which(df1_long$source=='gt_20'|df1_long$source=='lte_20'),]
ipcc_stats <- ipcc_stats[order(ipcc_stats$ez, ipcc_stats$continent), ]

ipcc_stats$source <- gsub("gt_20", "OS", ipcc_stats$source)
ipcc_stats$source <- gsub("lte_20", "YS", ipcc_stats$source)

ipcc_defaults$source <- gsub("growth_secondary_less_20", "IPCC_YS", ipcc_defaults$source)
ipcc_defaults$source <- gsub("growth_secondary_greater_20", "IPCC_OS", ipcc_defaults$source)

factor_order <- unique(cp_stats$ecozone_continent)

cp_stats$ecozone_continent <- factor(cp_stats$ecozone_continent,
                                     levels = factor_order)

ipcc_stats$ecozone_continent <- factor(ipcc_stats$ecozone_continent,
                                       levels = factor_order)
ipcc_stats <- select(ipcc_stats, ecozone_continent, source, rate)
ipcc_defaults$ecozone_continent <- factor(ipcc_defaults$ecozone_continent,
                                       levels = factor_order)
ipcc_defaults <- select(ipcc_defaults, ecozone_continent, source, rate)

head(ipcc_stats)

common_ez_continents <- intersect(ipcc_stats$ecozone_continent, ipcc_defaults$ecozone_continent)
ipcc_stats <- filter(ipcc_stats, ecozone_continent %in% common_ez_continents)
ipcc_defaults <- filter(ipcc_defaults, ecozone_continent %in% common_ez_continents)
ipcc_defaults$rate <- ipcc_defaults$rate * 0.46


ipcc_stats$ecozone_continent <- factor(ipcc_stats$ecozone_continent,
                                     levels = factor_order)
ipcc_defaults$ecozone_continent <- factor(ipcc_defaults$ecozone_continent,
                                       levels = factor_order)
ipcc_defaults$source <- gsub("IPCC_", "", ipcc_defaults$source)


ggplot(data = ipcc_stats, aes(x = ecozone_continent, y = rate, fill = source)) +
  geom_boxplot(aes(group = interaction(ecozone_continent, source)), position = position_dodge(width = 0.8)) +
  geom_point(data = ipcc_defaults, aes(x = ecozone_continent, y = rate, color = source), 
             position = position_dodge(width = 0.8), size = 3) +
  scale_fill_manual(values = c("OS" = "blue", "YS" = "green")) +
  scale_color_manual(values = c("OS" = "red", "YS" = "red")) +
  labs(x = "Ecozone Continent", y = "Rate", title = "OS and YS Rates with IPCC Defaults") +
  theme_minimal() +
  theme(axis.text.x = element_text(angle = 45, hjust = 1))

ggplot(cp_stats, aes(x = ecozone_continent, y = rate, fill = source)) +
  geom_violin(position = position_dodge(width = 0.75), color = NA, trim = FALSE) +
  theme_light() +
  labs(x = "Ecozone Continent", y = "Rate", title = "Distribution of Rates by Source and Ecozone Continent") +
  scale_fill_brewer(palette = "Set2") + 
  theme(axis.text.x = element_text(angle = 45, hjust = 1))



cp_stats = df1_stats[which(df1_stats$source=='cp'|df1_stats$source=='lte_30'),]
ipcc_stats = df1_stats[which(df1_stats$source=='gt_20'|df1_stats$source=='lte_30'),]



ggplot(cp_stats, aes(x = interaction(ecozone_continent, source), group = source)) +
  geom_col(aes(y = min_rate, fill = "Min Rate"), position = position_dodge(width = 0.8)) +
  geom_col(aes(y = max_rate, fill = "Max Rate"), position = position_dodge(width = 0.8)) +
  geom_point(aes(y = mean_rate, group = source), color = "black", shape = 1, size = 3, position = position_dodge(width = 0.8)) +
  labs(x = "Ecozone and Source", y = "Rate", fill = "Rate Type") +
  theme_light() +
  scale_fill_manual(values = c("Min Rate" = "skyblue", "Max Rate" = "orange")) +
  theme(axis.text.x = element_text(angle = 45, hjust = 1))


# Create the base plot
p <- ggplot(df1_stats, aes(x = ecozone_continent, y = mean_rate, group = forest_type)) +
  geom_errorbar(aes(ymin = min_rate, ymax = max_rate, colour = forest_type), 
                width = 0.25, position = position_dodge(width = 0.75), size = 1, alpha = 0.7) +
  geom_point(aes(colour = forest_type), 
             size = 4, shape = 21, fill = "white", position = position_dodge(width = 0.75)) +
  scale_color_manual(values = c("gt_20" = "blue", "lte_20" = "purple", "lte_30" = "green")) +
  theme_minimal() +
  theme(axis.text.x = element_text(angle = 45, hjust = 1, vjust = 1),
        axis.title = element_text(size = 14),
        legend.position = "none") +  # Hide legend if not needed
  labs(y = "Aboveground rate (Mg C ha-1 yr-1)", x = "")

# Add the IPCC default rates as points from df2
# Assuming df2 already has 'ecozone_continent' combined field
df2 <- df2 %>%
  mutate(ecozone_continent = paste(continent, ecozone, sep = " "))
head(df2)
p <- p + geom_point(data = df2, 
                    aes(x = ecozone_continent, y = growth_secondary_greater_20, group = 1),
                    color = "red", shape = 4, size = 3, position = position_dodge(width = 0.75)) +
  geom_point(data = df2, 
             aes(x = ecozone_continent, y = growth_secondary_less_20, group = 2),
             color = "red", shape = 4, size = 3, position = position_dodge(width = 0.75))

# Print the plot
print(p)


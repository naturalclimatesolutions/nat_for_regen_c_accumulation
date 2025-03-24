# ------------------------------------------------------------------------------
# Package Management
# ------------------------------------------------------------------------------
list.of.packages <- c(
  "ggplot2"
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

data_dir = paste(dirname(working_dir),"/Data", sep = "")

df <- read.csv(paste(data_dir, 'ED_Fig7.csv', sep = "/"))


pixels<-ggplot(data=df)+
  theme_classic()+
  # ylim(0,5)+
  theme(legend.position = "none",
        axis.text.x=element_text(size=8,angle=0))+
  geom_segment(aes(x=age, xend=age,y=RF.Min, yend=RF.Max, alpha=0.7),colour="#c35b26", size=2, lineend="round")+

  geom_line(aes(x=age,y=CR..Prediction),  linewidth=1.75, colour="#8eb1c4")+
  ylab(bquote('Aboveground accumulation ('*MgC~ ha^-1*')')) +
  xlab(bquote('Age')) 

pixels
ggsave("example_pixel_v2.png", plot = pixels, width = 6, height = 4, dpi = 600, bg = "transparent")

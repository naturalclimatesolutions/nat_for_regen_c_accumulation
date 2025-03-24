# Carbon Accumulation Curves from Natural Forest Regneration 
[![DOI](https://zenodo.org/badge/748392120.svg)](https://doi.org/10.5281/zenodo.15078012)
- [Carbon Accumulation Curves from Natural Forest Regneration](#carbon-accumulation-curves-from-natural-forest-regneration)
  - [Overview](#overview)
  - [System Requirements](#system-requirements)
    - [Hardware](#hardware)
    - [Operating System](#operating-system)
    - [Google Earth Engine (GEE)](#google-earth-engine-gee)
    - [R](#r)
  - [Installation](#installation)
  - [Usage](#usage)
    - [CR Calculation and Demo](#cr-calculation-and-demo)
      - [Google Earth Engine](#google-earth-engine)
      - [R Scripts](#r-scripts)
        - [Overview](#overview-1)
        - [Required Inputs](#required-inputs)
        - [Required Packages](#required-packages)
        - [Running the Script](#running-the-script)
    - [Figures](#figures)
      - [R](#r-1)
      - [Data](#data)
      - [GEE](#gee)
  - [License](#license)

---

## Overview
This repository contains code used to derive Chapman-Richards (CR) growth curve parameters for the manuscript *Protect young secondary forests for optimum carbon removal* (in review at *Nature Climate Change*). A link and DOI will be provided upon publication.

**Key Highlights:**
- Derivation of global CR growth parameters from large-scale forest inventory data.
- Multi-core parallelized processing of 5°x5° tiles, requiring significant computational resources.
- Demonstration code and partial data for reproducible workflows.

---

## System Requirements

### Hardware
- A standard computer or server with sufficient RAM for in-memory processing (at least 16 GB recommended).  
- Parallel processing (e.g., multiple cores) is beneficial for the full version.

### Operating System
- Tested on macOS (Intel and ARM) >= 10.14, but should work on any system capable of running R.

### Google Earth Engine (GEE)
- Access to the GEE JavaScript Code Editor.
- Proper authentication via a Google Cloud Project.
  
> **Note**: Much of the forest plot data used in this project is restricted. Without access to these data, you cannot fully reproduce the GEE workflow.

### R
- Tested on R >= 4.4.
- Required packages for the demo include: `terra`, `tidyverse`, `parallel`, `doParallel`, `foreach`, `tictoc`.
- Additional packages may be listed at the top of each script.

---

## Installation

1. **Clone this repository:**
   ```bash
   git clone https://github.com/naturalclimatesolutions/nat_for_regen_c_accumulation.git

2. **Google Earth Engine Code:** Copy the relevant scripts from the GEE/ directory into your GEE JavaScript workspace, if needed.

## Usage

### CR Calculation and Demo

#### Google Earth Engine
+ Code is available under cr_calc/GEE/
+ **Important:** The GEE code is not fully functional due to restricted data-sharing permissions for forest plot data and covariate input stacks. The code is provided for review purposes only. For questions or concerns, please contact [Nathaniel Robinson](n.robinson@cifor-icraf.org)

#### R Scripts

##### Overview
+ ```cr_calc/R/calc_chapman_richards.R``` – Main script for generating global CR parameters.
+ ```demo/calc_chapman_richards_demo.R``` – Demonstration script using a single 5°x5° tile to illustrate the workflow.
  
**Performance Note:** The full version leverages multi-core machines for parallel processing. The outputs from Google Earth Engine are exported as 5°x5° tiles and processed in parallel. The full script requires substantial computational resources. On a 128 GB RAM, 24-core machine, processing all tiles took over two weeks.

The demo version uses one 5°x5° tile (from the Pacific Northwest region of the United States). If you would like to test other tiles, please contact[Nathaniel Robinson](n.robinson@cifor-icraf.org).

##### Required Inputs

> (Available in the `Inputs` directory)

1. **Above Ground Carbon (AGC) Estimates** 
+ TIF files uner `inputs/agc_5_deg/agc/*.tif`
+  20 images, each containing 100 bands of AGC estimates.

2. **Valid Pixels:**
   + Binary raster in `agc_5_deg/agc_valid/` (e.g. `valid_agc_grd_79.tif`).

3. **Maximu Potential**
+ Raster of maximum potential AGC in `agc_5_deg/max_pot/` (e.g. `agc_pot_grd_79.tif`).

##### Required Packages
The full script requires packages for parallelization. The exact setup may vary depending on your processor and operating system.

The demo version does not require parallelization. For specific package requirements by script, see the [R](#r) section above.

When running the script, any missing packages should be detected and installed automatically. If automatic installation fails, you may need to install them manually.

*Note: The `terra` package has system dependencies (e.g., GDAL). Please ensure these are installed.*

##### Running the Script
If the repository’s directory structure is preserved, the script will set the working directory automatically, as well as the input and output directories.

- **Run time (Demo):** Approximately 1–2 hours (depending on system specs)
- **Outputs:**  
  1. `A_grd_79.tif`: Chapman-Richards A parameter  
  2. `B_grd_79.tif`: Chapman-Richards B parameter  
  3. `K_grd_79.tif`: Chapman-Richards K parameter  
  4. `A_error_grd_79.tif`: Standard error of A  
  5. `B_error_grd_79.tif`: Standard error of B  
  6. `K_error_grd_79.tif`: Standard error of K  
  7. `convergence_grd_79.tif`: Number of iterations used to reach convergence for each pixel


### Figures
#### R
This folder contains R code to create the figures in the manuscript. The code is located in the `R/figures` directory. Each R script, contains code to autmatically detect, install, and load required packages. The figures produced in these scripts are 'base figures' which were exported as SVG graphic files and styled in Adobe Illustrator. The final figures in the manuscript were created in Adobe Illustrator using these base figures.

#### Data
The data used to create the figures in the manuscript are located in the `Data` directory. The data are organized by figure number, and the required data is autmotacially loaded in the R scripts, using relative path directories.

#### GEE
Figure 2, and Extended Data Figure 2, are maps, created with geoTiffs exported from Google Earth Engine. There were styled in QGIS, and thus no code for these figures is availble in this repository. The GEE code used to create and export the geoTiffs is in figures/GEE.

---

## License
This project is licensed under the **Apache License 2.0**. Please see the [LICENSE](LICENSE) file for details.


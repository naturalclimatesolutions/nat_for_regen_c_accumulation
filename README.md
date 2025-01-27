# Carbon Accumulation Curves from Natural Forest Regneration 

- [Carbon Accumulation Curves from Natural Forest Regneration](#carbon-accumulation-curves-from-natural-forest-regneration)
  - [Overview](#overview)
  - [System Requirements](#system-requirements)
    - [Hardware requirements](#hardware-requirements)
    - [Software Requirements](#software-requirements)
      - [OS Requirements](#os-requirements)
      - [Google Earth Engine](#google-earth-engine)
      - [R](#r)
  - [Installation Guide](#installation-guide)
  - [Use Guide](#use-guide)
    - [Google Earth Engine](#google-earth-engine-1)
    - [R](#r-1)
      - [Overview](#overview-1)
      - [Required Inputs](#required-inputs)
      - [Required Packages](#required-packages)
      - [Running the Script](#running-the-script)
  - [License](#license)

---

## Overview
This repository contains code used to derive the Chapman-Richards (CR) growth curve parameters for the manuscript ***Protect young secondary forests for optimum carbon removal***, currently in review at *Nature Climate Change*. The article link and DOI will be provided upon publication.

---

## System Requirements
### Hardware requirements
Running the R code requires a standard computer with sufficient RAM to accommodate in-memory processing.

### Software Requirements
#### OS Requirements
This source code should work on any system capable of running R. The code has been tested on:

+ macOS running on either Intel and ARM processers: 
  + Sequoia (10.15 +)
  + Mojave (10.14 +)

#### Google Earth Engine
Running the Google Earth Engine code requires:
+ Access to the Google Earth Engine Java Script Code Editor
+ Proper authentification via a Google Cloud Project

*Note: Much of the inventory data used in this project is restricted and cannot be shared. Therefore, without access to these data, reproducing a fully functional version of the GEE workflow is not possible.*

#### R
The R code was tested on R version 4.4+

Each script has several required packages listed below:
+ R/file_management.R: none
+ R/ipcc_cp.R: 
  + ggplot2
  + dplyr
  + tidyr
+ R/validation_heinrich_temp.R:
  + ggplot2
  + dplyr
+ R/validation_heinric.R:
  + ggplot2
+ R/calc_chapman_richards.R:
  + terra
  + tidyverse
  + parallel
  + doParallel
  + foreach
  + tictoc
+ Demo/calc_chapman_richards_demo.R:
  + terra
  + tidyverse

## Installation Guide
To clone this repository:
```bash
 git clone https://github.com/naturalclimatesolutions/nat_for_regen_c_accumulation.git
```

The GEE code can be copied into your GEE JavaScript workspace as needed from this repo.

## Use Guide
### Google Earth Engine 
The GEE code is provided for review purposes only. Due to restricted data-sharing permissions (for forest plot data and covariate input stacks), a fully functional demonstration is not possible. For questions or concerns, please contact [Nathaniel Robinson](n.robinson@cifor-icraf.org).

### R

#### Overview
The primary R script to create the global Chapman-Richards curve parameters is **R/calc_chapman_richards.R**. However, because of the large amount of input data required and the lengthy processing time, a functional demo version is provided in **Demo/calc_chapman_richards_demo.R** to illustrate the process and workflow.

The full version leverages multi-core machines for parallel processing. The outputs from Google Earth Engine are exported as 5°x5° tiles and processed in parallel. On a machine with 128 GB RAM and 24 cores, processing all tiles required more than two weeks.

The demo version uses one 5°x5° tile (from the Pacific Northwest region of the United States). If you would like to test other tiles, please contact[Nathaniel Robinson](n.robinson@cifor-icraf.org).

#### Required Inputs

> (Available in the `Inputs` directory)

1. **Above Ground Carbon (AGC) Estimates for Each Age Class**  
   Located in `inputs/agc_5_deg/agc/*.tif`. There are 20 images, each containing 100 bands of AGC estimates.

   - Each image represents a different age class.  
   - Each band represents an independent model simulation based on a random subset of inventory data.

2. **Valid Pixels**  
   Located in `inputs/agc_5_deg/agc_valid/valid_agc_grd_79.tif`.

   - A binary raster indicating valid pixels, which helps improve efficiency by skipping areas with many NAs.

3. **Maximum Potential**  
   Located in `inputs/agc_5_deg/max_pot/agc_pot_grd_79.tif`.

   - A raster of maximum potential AGC from an existing dataset, used as the initial value for the asymptote.


#### Required Packages
The full script requires packages for parallelization. The exact setup may vary depending on your processor and operating system.

The demo version does not require parallelization. For specific package requirements by script, see the [R](#r) section above.

When running the script, any missing packages should be detected and installed automatically. If automatic installation fails, you may need to install them manually.

*Note: The `terra` package has system dependencies (e.g., GDAL). Please ensure these are installed.*

#### Running the Script
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

---

## License
This project is licensed under the **Apache License 2.0**. Please see the [LICENSE](LICENSE) file for details.


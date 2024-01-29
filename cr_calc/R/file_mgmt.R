# -------------------------------------------------------------------------
# Input and Output Direcorty Management
# -------------------------------------------------------------------------

# Get Directory of Source File Location - File Must be Saved.
setwd(dirname(rstudioapi::getActiveDocumentContext()$path))

# Set Source File Directory as Working Directory
working_dir <- getwd()

inputs <- "agc_5_deg"
id_prefix <- "grd_"


input_dir <-
  paste(dirname(working_dir), "/data/inputs/", inputs, sep = "")

completed_dir <- paste(dirname(working_dir), "/data/outputs/cr_pars_5_deg/A", sep = "")
completed <- list.files(completed_dir)
completed_grids <- unique(regmatches(completed, regexpr( "\\d+", completed)))
completed_grids

input_files <- list.files(paste(input_dir, '/agc_valid', sep=""))
input_grids <- unique(regmatches(input_files, regexpr( "\\d+", input_files)))
to_do <- setdiff(input_grids, completed_grids)

ids_toMBP1 <- to_do[1:200]
ids_toMBP2 <- to_do[201:400]

agc_dir <- paste(input_dir, 'agc', sep="/")
max_dir <- paste(input_dir, 'max_pot', sep="/")
valid_dir <- paste(input_dir, 'agc_valid', sep="/")


for (j in ids_toMBP2) {
  g_id <- j
  pattern_age=glob2rx(paste("*agc_*grd_", g_id,"_*", sep=""))
  pattern_max=glob2rx(paste("*agc_*grd_", g_id, ".tif*", sep=""))
  pattern_valid=glob2rx(paste("valid_agc_grd_", g_id, ".tif*", sep=""))
  files_agc <- list.files(agc_dir, pattern=pattern_age)
  file_max <- list.files(max_dir, pattern=pattern_max)
  file_valid <- list.files(valid_dir, pattern=pattern_valid)
  remote_dir <- "/Volumes/G_Drive"

  
  agc_remote <- paste(remote_dir, "/MBP2/data/inputs/agc_5_deg/agc", sep="")
  max_remote <- paste(remote_dir, "/MBP2/data/inputs/agc_5_deg/max_pot", sep="")
  valid_remote <- paste(remote_dir, "/MBP2/data/inputs/agc_5_deg/agc_valid", sep="")
  
  from_max <- paste(max_dir, file_max, sep="/")
  to_max <- paste(max_remote, file_max, sep="/")
  file.copy(from_max, to_max)
  file.remove(from_max)
  
  from_valid <- paste(valid_dir, file_valid, sep="/")
  to_valid <- paste(valid_remote, file_valid, sep="/")
  file.copy(from_valid, to_valid)
  file.remove(from_valid)

  for (i in files_agc){
    from <- paste(agc_dir, i, sep="/")
    to <- paste(agc_remote, i, sep="/")
    file.copy(from, to)
    file.remove(from)
  }
}

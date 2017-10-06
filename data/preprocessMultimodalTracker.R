library(jsonlite)
library(plyr)
# 
preprocessMultimodalTracker <- function(rawdatafilename){

  #For tests only
  #rawdatafilename <- "C:\\Users\\lprisan\\workspace\\multimodal-tracker\\data\\multimodal-tracker-1507051956530.txt"
  
  # Read the file  
  lines <- paste(readLines(rawdatafilename),collapse="")
  # Retouch it a bit so that it is proper json
  lines <- gsub("[]", "", lines, fixed=T)
  lines <- gsub("][", ",", lines, fixed=T)
  # We parse the json
  json_data <- fromJSON(lines)
  #This gets us a sparse dataframe
  #TODO: expand the beacon rows into multiple ones with beacon id and its data

  
  
}
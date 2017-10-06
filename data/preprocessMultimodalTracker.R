library(jsonlite)
library(plyr)

# Reads a raw text file with the data from a multimodal tracker, 
# and spits a list with dataframes with the different timestamped 
# data streams
preprocessMultimodalTracker <- function(rawdatafilename){

  #For tests only
  #rawdatafilename <- "C:\\Users\\lprisan\\workspace\\multimodal-tracker\\data\\multimodal-tracker-1507051956530.txt"
  
  #TODO: extract the device ID from the filename, and add it as a column
  
  # Read the file  
  lines <- paste(readLines(rawdatafilename),collapse="")
  # Retouch it a bit so that it is proper json
  lines <- gsub("[]", "", lines, fixed=T)
  lines <- gsub("][", ",", lines, fixed=T)
  # We parse the json
  json_data <- fromJSON(lines)
  #This gets us a sparse dataframe
  #TODO: expand the beacon rows into multiple ones with beacon id and its data

  #TODO: divide the whole dataframe in separate sources for different data streams
  
  #TODO: return a list with the whole and separate dataframes
  
}
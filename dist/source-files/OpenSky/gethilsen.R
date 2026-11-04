library(stringr)

  
gethilsen <- function(navn) {
  retval <- str_c("Hej"," ",navn)
  return(retval)
}

gethilsen("hej")

gethilsen2 <- function(navn,efternavn) {
  retval <- str_c("Hej"," ",navn," ",efternavn)
  return(retval)
}

install.packages("eurostat")
install.packages("restatapi")
install.packages("stringr")

library(eurostat)
library(restatapi)
library(dplyr)
library(stringr)

alltabs <- get_eurostat_toc()

#filtrer efter emne

gastabs <- alltabs |> filter(str_detect(title,("Gas|gas"))) |> 
  filter(str_detect(code,"nrg"))

#hente  metadata
gasMeta <- get_eurostat_dsd("nrg_pc_202")

unique(gasMeta$concept)

gasMeta |> filter(concept=="freq")
gasMeta |> filter(concept=="siec")
gasMeta |> filter(concept=="currency")
gasMeta |> filter(concept=="nrg_cons")

# lav filter



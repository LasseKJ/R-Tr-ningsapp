library(readxl)
library(ggplot2)
Forbrugerindikator <- read.csv("C:/Users/Lasse/Downloads/20269119158657943046FORV133321389736.csv", sep = ";")

Forbrugerindikator$tid <- rownames(Forbrugerindikator)
Forbrugerindikator$indikator <- Forbrugerindikator[[1]]

Forbrugerindikator <- Forbrugerindikator[-1, ]
Forbrugerindikator <- Forbrugerindikator[, c("indikator", "tid")]

View(Forbrugerindikator)

qplot(Forbrugerindikator$tid,
      Forbrugerindikator$Forbrugerforventninger..nettotal..efter.tid.og.indikator,
      geom = "col")

household_expectations <- read.csv("C:/Users/Lasse/Downloads/Sammenlignet2.csv", sep = ";", header = FALSE)

print(household_expectations)

qplot(household_expectations$V1,
      household_expectations$V2,
      geom = "col")

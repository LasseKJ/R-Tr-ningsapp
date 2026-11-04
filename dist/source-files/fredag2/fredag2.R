library(ggplot2)

#Læs CSV og vis dataen i et sheet

ALT <- read.csv("C:/Users/Lasse/Downloads/ALT.csv", 
                sep = ";", 
                header = TRUE, 
                skip = 1, 
                fileEncoding = "latin1")
View(ALT)

#Opret plot mellem måned og forbrugertillidsindikatoren.

qplot(ALT$X., ALT$Forbrugertillidsindikatoren, 
      geom = "col")

#Opret ny kolonne i datafil, som er kvartal. hvor at M1-3 bliver Q1 ...

ALT$kvartal <- paste0(
  substr(as.character(ALT$X.), 1, 4),
  "Q",
  ceiling(as.numeric(sub(".*M", "", as.character(ALT$X.))) / 3)
)

#Opret en samlet gennemsnitlig værdi for forbrug, ud fra oprettede kvartal i datasættet

ALT_kvartal <- aggregate(ALT$Anskaffelse.af.større.forbrugsgoder..fordelagtigt.for.øjeblikket ~ kvartal, data = ALT, FUN = mean)
print(ALT_kvartal)

#Opret en qplot mellem kvartal og forbrug 

qplot(
  x = ALT_kvartal$kvartal,
  y = ALT_kvartal[[2]],
  geom = "col"
)

# ========================================================================
# 4.1 | STABILITETSTEST
# ========================================================================

####stabilitetstest med fem perioder (CHOPCHOP af fem perioder på ca. 5år og 3måneder)

#sorterer data efter kvartal
stabilitetsdata <- regressionsdata[
  order(regressionsdata$Tidsinterval), 
]

#fordeler 106 kvartaler på fem perioder
periode <- rep(1:5, c(21,21,21,21,22))

#kontrollerer datagrundlaget
stopifnot(nrow(stabilitetsdata) == 106)

#opretter en tabel til resultaterne
stabilitet <- data.frame(
  indikator = indikatorer,
  P1 = NA_real_,
  P2 = NA_real_,
  P3 = NA_real_,
  P4 = NA_real_,
  P5 = NA_real_
)
#tilføjer spørgsmålene til stabilitetsmatrixen
stabilitet$Spoergsmaal <- resultater$Spoergsmaal[
  match(stabilitet$indikator, resultater$indikator)
]
#beregner r2 for alle indikatorer i hver periode
for(p in 1:5) {
  
  data_periode <- stabilitetsdata[periode == p, ]
  
  for(i in 1:length(indikatorer)) {
    
    x <- data_periode[[indikatorer[i]]]
    
    model <- lm(data_periode$Realvaekst ~ x)
    
    stabilitet[i,p+1] <- summary(model)$r.squared
  }
}

#beregner gennemsnitlig r2
stabilitet$Gennemsnit_R2 <- rowMeans(stabilitet[,2:6])

#beregner den laveste r2
stabilitet$Laveste_R2 <- apply(stabilitet[,2:6],1,min)

#beregner standardafvigelsen
stabilitet$SD_R2 <- apply(stabilitet[,2:6],1,sd)

#sorterer efter højeste gennemsnitlige r2
stabilitet <- stabilitet[order(-stabilitet$Gennemsnit_R2), ]

#viser de 10 bedste indikatorer
print(head(stabilitet,10))

#viser hele tabellen
View(stabilitet)





#finder de tre oprindelige spørgsmål
spg <- grep("^F(6|7|8) ", names(forv1))

#beregner de oprindelige kvartalsgennemsnit
sp <- aggregate(
  forv1[,spg],
  by = list(TID = kvartal),
  FUN = mean
)

#samler spørgsmålene med realvæksten
kontrol <- merge(
  sp,
  privatforbrug,
  by.x = "TID",
  by.y = "Tidsinterval"
)

#viser korrelationen med forbruget
round(cor(kontrol[,2:4], kontrol$Realvaekst), 3)



# ========================================================================
# EKSTRA ANALYSE | TOP 10, 50 OG 100
# ========================================================================

#### TOP 10, TOP 50 OG TOP 100

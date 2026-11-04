# ========================================================================
# OPGAVE 1.3 | SPØRGSMÅL BAG INDIKATORER
# ========================================================================

#### FINDER SPØRGSMÅLENE BAG INDIKATORERNE

#finder spørgsmålene bag et x-nummer
find_spg <- function(n) {
  
  antal <- choose(11, 1:11)
  
  k <- which(n <= cumsum(antal))[1]
  
  placering <- n - sum(antal[1:11 < k])
  
  paste(
    sub(" .*", "", combn(names(forv1_kvt)[-1], k)[, placering]),
    collapse = ", "
  )
}

#tilføjer spørgsmålene til regressionsresultaterne
resultater$Spoergsmaal <- sapply(
  as.numeric(sub("X", "", resultater$indikator)),
  find_spg
)

#viser hvilken indikator der er bedst
cat("Bedste indikator:", bedste_navn, "\n")

#viser spørgsmålene i den bedste indikator
cat(
  "Spørgsmål:",
  resultater$Spoergsmaal[1],
  "\n"
)



# ========================================================================
# OPGAVE 1.3 | RANGERING AF INDIKATORER
# ========================================================================

#### TOP 10, TOP 50 OG TOP 100

#opretter tabellerne
top10 <- head(resultater, 10)
top50 <- head(resultater, 50)
top100 <- head(resultater, 100)

#viser top 10
print(top10)

View(top10)
View(top50)
View(top100)



# ========================================================================
# OPGAVE 1.3 | HYPPIGHED I TOP 100
# ========================================================================

#### SPØRGSMÅLSHYPPIGHED I TOP 100

#tæller hvor ofte hvert spørgsmål optræder
hyppighed100 <- sort(
  table(
    unlist(strsplit(top100$Spoergsmaal, ", "))
  ),
  decreasing = TRUE
)

#opretter en tabel med antal
hyppighed100 <- data.frame(
  Spoergsmaal = names(hyppighed100),
  Antal = as.vector(hyppighed100)
)

#viser hyppigheden
print(hyppighed100)

View(hyppighed100)


#### SIDSTE KONTROL

#kontrollerer at de rigtige spørgsmål er vendt
print(names(forv1_kvt)[vend_spg])

#kontrollerer at vi har 2047 indikatorer
print(length(indikatorer))

#kontrollerer at ingen regressioner mangler r2
print(sum(is.na(resultater$R2)))

#kontrollerer at regressionsdata bruger de nye værdier
print(all.equal(
  as.numeric(regressionsdata$X1806),
  as.numeric(zALLE$X1806[
    match(regressionsdata$Tidsinterval, zALLE$TID)
  ])
))

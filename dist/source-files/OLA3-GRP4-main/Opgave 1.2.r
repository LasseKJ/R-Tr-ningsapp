# ========================================================================
# OPGAVE 1.2 | BEDSTE MODEL
# ========================================================================

#### FINDER DEN BEDSTE MODEL

#finder automatisk indikatoren med højeste r2
bedste_navn <- resultater$indikator[1]

#beregner den bedste regression
bedste_model <- lm(
  reformulate(bedste_navn, response = "Realvaekst"),
  data = regressionsdata
)

#viser regressionsresultatet
print(summary(bedste_model))

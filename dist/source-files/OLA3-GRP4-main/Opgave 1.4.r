# ========================================================================
# OPGAVE 1.4 | FORUDSIG K3 OG K4
# ========================================================================

#henter de nyeste forbrugerdata
forv1_ny <- dst_get_data(
  table = "FORV1",
  query = list(
    INDIKATOR = spoergsmaal,
    Tid = "*"
  ),
  meta_data = forv1_meta,
  lang = "da",
  parse_dst_tid = FALSE
)

#beholder juli til oktober 2026
forv1_ny <- forv1_ny[
  forv1_ny$TID %in% c(
    "2026M07", "2026M08",
    "2026M09", "2026M10"
  ),
]

#laver spørgsmålene til kolonner
forv1_ny <- pivot_wider(
  forv1_ny,
  id_cols = TID,
  names_from = INDIKATOR,
  values_from = value
)

#sorterer månederne
forv1_ny <- as.data.frame(forv1_ny)
forv1_ny <- forv1_ny[order(forv1_ny$TID), ]

#kontrollerer at tredje kvartal er komplet
stopifnot(all(
  c("2026M07", "2026M08", "2026M09") %in% forv1_ny$TID
))

#laver måneder til kvartaler
maaned_ny <- as.numeric(substr(forv1_ny$TID, 6, 7))

kvartal_ny <- paste0(
  substr(forv1_ny$TID, 1, 4),
  "K",
  ceiling(maaned_ny / 3)
)

#beregner kvartalsgennemsnit
forv1_ny_kvt <- aggregate(
  forv1_ny[, -1],
  by = list(TID = kvartal_ny),
  FUN = mean
)

#vender fortegnene på F6 og F8
vend_spg_ny <- grep("^F(6|8) ", names(forv1_ny_kvt))

forv1_ny_kvt[, vend_spg_ny] <-
  -forv1_ny_kvt[, vend_spg_ny]

#finder spørgsmålene i X1450
spg1450 <- strsplit(
  find_spg(1450), ", "
)[[1]]

#finder de tilsvarende kolonner
kolonner1450 <- match(
  spg1450,
  sub(" .*", "", names(forv1_ny_kvt))
)

stopifnot(!anyNA(kolonner1450))

#beregner X1450 for de nye kvartaler
forv1_ny_kvt$X1450 <- rowMeans(
  forv1_ny_kvt[, kolonner1450, drop = FALSE]
)

#bruger den oprindelige regressionsmodel
model1450 <- lm(
  Realvaekst ~ X1450,
  data = regressionsdata[
    regressionsdata$Tidsinterval <= "2026K2",
  ]
)

#beregner forudsigelser med 95 procent prædiktionsinterval
forudsigelse <- predict(
  model1450,
  newdata = forv1_ny_kvt,
  interval = "prediction",
  level = 0.95
)

#samler resultaterne
prognose <- data.frame(
  Kvartal = forv1_ny_kvt$TID,
  X1450 = forv1_ny_kvt$X1450,
  Realvaekst = forudsigelse[, "fit"],
  Nedre95 = forudsigelse[, "lwr"],
  Oevre95 = forudsigelse[, "upr"]
)

#viser prognosen
print(round(prognose[, -1], 2))
View(prognose)


#### OMREGNER REALVÆKST TIL FORBRUGSUDGIFTER

#finder forbruget i samme kvartaler i 2025
forbrug2025 <- privatforbrug[
  privatforbrug$Tidsinterval %in%
    c("2025K3", "2025K4"),
  c("Tidsinterval", "Privatforbrug")
]

#sorterer kvartalerne
forbrug2025 <- forbrug2025[
  order(forbrug2025$Tidsinterval),
]

stopifnot(nrow(forbrug2025) == nrow(prognose))

#beregner forventede forbrugsudgifter
prognose$Forbrugsudgift <- forbrug2025$Privatforbrug *
  (1 + prognose$Realvaekst / 100)

#beregner nedre og øvre grænse
prognose$Forbrug_Nedre95 <- forbrug2025$Privatforbrug *
  (1 + prognose$Nedre95 / 100)

prognose$Forbrug_Oevre95 <- forbrug2025$Privatforbrug *
  (1 + prognose$Oevre95 / 100)

#viser den samlede prognose
print(prognose)
View(prognose)


#### GRAF OVER HISTORISK REALVÆKST OG PROGNOSE

#vælger historiske observationer
historisk <- regressionsdata[
  regressionsdata$Tidsinterval >= "2020K1" &
    regressionsdata$Tidsinterval <= "2026K2",
  c("Tidsinterval", "Realvaekst")
]

#samler historiske værdier og prognoser
grafdata <- data.frame(
  Kvartal = c(historisk$Tidsinterval, prognose$Kvartal),
  Realvaekst = c(historisk$Realvaekst, prognose$Realvaekst),
  Type = c(
    rep("Historisk", nrow(historisk)),
    rep("Prognose", nrow(prognose))
  )
)

#laver grafen
ggplot(grafdata, aes(x = Kvartal, y = Realvaekst)) +
  geom_line(aes(group = 1), color = "steelblue") +
  geom_point(aes(color = Type), size = 2) +
  scale_x_discrete(breaks = grafdata$Kvartal[
    seq(1, nrow(grafdata), by = 4)
  ]) +
  labs(
    title = "Husholdningernes årlige realvækst",
    subtitle = "Prognose for 2026K3 og 2026K4 med X1450",
    x = "Kvartal",
    y = "Realvækst i procent",
    caption = "Kilde: DST, Egne Beregninger",
    color = "Observation"
  ) +
  theme_minimal()

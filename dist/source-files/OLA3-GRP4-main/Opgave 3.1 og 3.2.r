library(dkstat)
library(dplyr)
library(tidyr)

# Forbrug

forbrug_raw <- dst_get_data(
  table = "NKN1",
  query = list(
    TRANSAKT = "P.31 Husholdningernes forbrugsudgifter",
    PRISENHED = "2020-priser, kædede værdier, (mia. kr.)",
    SÆSON = "Ikke sæsonkorrigeret",
    Tid = "*"
  ),
  meta_data = dst_meta(table = "NKN1", lang = "da"),
  lang = "da",
  parse_dst_tid = FALSE
)

forbrug_aar <- forbrug_raw %>%
  filter(TID >= "1999K1", TID <= "2026K2") %>%
  transmute(
    Aar = as.numeric(substr(TID, 1, 4)),
    Kvartal = as.numeric(substr(TID, 6, 6)),
    Forbrug = as.numeric(value)
  ) %>%
  pivot_wider(
    names_from = Kvartal,
    values_from = Forbrug,
    names_prefix = "K"
  ) %>%
  arrange(Aar) %>%
  mutate(
    Foerste_halvaar = K1 + K2,
    Vaekst_halvaar = (Foerste_halvaar / lag(Foerste_halvaar) - 1) * 100,
    Vaekst_K4 = (K4 / lag(K4) - 1) * 100
  )

traening <- forbrug_aar %>%
  filter(Aar >= 2000, Aar <= 2025)

gennemsnit_K4 <- mean(traening$Vaekst_K4)

# Forbrugertillid i oktober

tillid_raw <- dst_get_data(
  table = "FORV1",
  query = list(
    INDIKATOR = "Forbrugertillidsindikatoren",
    Tid = "*"
  ),
  meta_data = dst_meta(table = "FORV1", lang = "da"),
  lang = "da",
  parse_dst_tid = FALSE
)

tillid <- tillid_raw %>%
  transmute(
    Aar = as.numeric(substr(TID, 1, 4)),
    Maaned = as.numeric(substr(TID, 6, 7)),
    Forbrugertillid = as.numeric(value)
  ) %>%
  filter(Aar >= 2000, Aar <= 2026, Maaned == 10)

traening <- traening %>%
  inner_join(tillid, by = "Aar") %>%
  mutate(
    Over_gennemsnit = as.integer(Vaekst_K4 > gennemsnit_K4)
  )

# Lineær model

model <- lm(Vaekst_K4 ~ Vaekst_halvaar, data = traening)

prognose <- as.numeric(
  predict(model, newdata = filter(forbrug_aar, Aar == 2026))
)

# Logistisk model

model_logistisk <- glm(
  Over_gennemsnit ~ Forbrugertillid,
  data = traening,
  family = binomial
)

sandsynlighed <- as.numeric(
  predict(
    model_logistisk,
    newdata = filter(tillid, Aar == 2026),
    type = "response"
  )
)

svar <- ifelse(sandsynlighed >= 0.5, "Ja", "Nej")

# Historisk test: bruger kun årene før teståret

test <- data.frame()

for (aar in 2010:2025) {
  
  traening_test <- traening %>% filter(Aar < aar)
  gennemsnit_test <- mean(traening_test$Vaekst_K4)
  
  traening_test <- traening_test %>%
    mutate(
      Over_gennemsnit = as.integer(Vaekst_K4 > gennemsnit_test)
    )
  
  model_test <- glm(
    Over_gennemsnit ~ Forbrugertillid,
    data = traening_test,
    family = binomial
  )
  
  testaar <- traening %>% filter(Aar == aar)
  
  sandsynlighed_test <- predict(
    model_test,
    newdata = testaar,
    type = "response"
  )
  
  test <- bind_rows(
    test,
    data.frame(
      Aar = aar,
      Faktisk = as.integer(testaar$Vaekst_K4 > gennemsnit_test),
      Forudsagt = as.integer(sandsynlighed_test >= 0.5),
      Flertalsgaet = as.integer(
        mean(traening_test$Over_gennemsnit) >= 0.5
      )
    )
  )
}

validering <- data.frame(
  Model = c("Logistisk regression", "Historisk flertalsgæt"),
  Korrekte_pct = round(
    c(
      mean(test$Forudsagt == test$Faktisk),
      mean(test$Flertalsgaet == test$Faktisk)
    ) * 100,
    2
  )
)

validering

# Resultattabel

tal <- formatC(
  c(
    gennemsnit_K4,
    prognose,
    prognose - gennemsnit_K4,
    sandsynlighed * 100
  ),
  format = "f",
  digits = 2,
  decimal.mark = ","
)

resultat <- data.frame(
  Maal = c(
    "Gennemsnitlig K4-vækst, 2000–2025",
    "Forventet K4-vækst i 2026 – lineær model",
    "Forskel fra gennemsnittet",
    "Sandsynlighed for vækst over gennemsnittet",
    "Over gennemsnittet? – logistisk model"
  ),
  Resultat = c(
    paste(tal, c("%", "%", "procentpoint", "%")),
    svar
  )
)


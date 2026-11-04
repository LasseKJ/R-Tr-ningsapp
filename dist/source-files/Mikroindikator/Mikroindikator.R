#Opgave 2

# Kør hele filen fra toppen med Source i RStudio.
# Ingen Excel-filer eller objekter fra tidligere kørsler er nødvendige.

# PAKKER
library(dkstat)
library(tidyr)
library(ggplot2)

# --------------------------------------------------
# PRIVATFORBRUG
# --------------------------------------------------

# Hent metadata og find tabellens variabelnavne
privatforbrug_meta <- dst_meta("NKN1", lang = "da")
variable <- privatforbrug_meta$variables
ids <- variable$id[match(
  c("transaktion", "prisenhed", "sæsonkorrigering", "tid"),
  tolower(trimws(variable$text))
)]
stopifnot(!anyNA(ids))

# Hent sæsonkorrigeret privatforbrug i kædede 2020-priser
privatforbrug_filters <- setNames(
  list(
    "P.31 Privatforbrug",
    "2020-priser, kædede værdier, (mia. kr.)",
    "Sæsonkorrigeret",
    "*"
  ),
  ids
)

privatforbrug_raw <- dst_get_data(
  table = "NKN1",
  query = privatforbrug_filters,
  meta_data = privatforbrug_meta,
  lang = "da",
  parse_dst_tid = FALSE
)

# Vælg perioden og sortér kvartalerne
privatforbrug_raw <- privatforbrug_raw[
  privatforbrug_raw$TID >= "1999K1",
]

privatforbrug_raw <- privatforbrug_raw[order(privatforbrug_raw$TID), ]

# Nyt rent dataframe
privatforbrug <- data.frame(
  Tidsinterval = as.character(privatforbrug_raw$TID),
  Privatforbrug = privatforbrug_raw$value
)

# Kontrollér, at der er én observation pr. kvartal uden huller
kvartalsnummer <- as.integer(substr(privatforbrug$Tidsinterval, 1, 4)) * 4 +
  as.integer(substr(privatforbrug$Tidsinterval, 6, 6))
stopifnot(nrow(privatforbrug) > 4, all(diff(kvartalsnummer) == 1))

# Årlig realvækst: samme kvartal sammenlignet med året før
privatforbrug$Realvaekst <- c(
  rep(NA, 4),
  (
    privatforbrug$Privatforbrug[5:nrow(privatforbrug)] /
      privatforbrug$Privatforbrug[1:(nrow(privatforbrug) - 4)] - 1
  ) * 100
)

# --------------------------------------------------
# HENT FORBRUGERTILLID
# --------------------------------------------------

meta <- dst_meta("FORV1", lang = "da")
navne <- meta$values$INDIKATOR$text

# Find de præcise navne i metadata
# De første seks serier er DST's indikator og fem spørgsmål.
# Den sidste serie bruges til DI's fjerde spørgsmål.
# Normalisér mellemrum til søgningen; behold originalnavnene til API-kaldet.
soegenavne <- tolower(navne)
soegenavne <- gsub("[[:space:]\u00a0]+", " ", soegenavne, perl = TRUE)

moenstre <- c(
  "forbrugertillidsindikator",
  "familiens.*i dag.*siden",
  "familiens.* om .*sammenlignet",
  "danmarks.*i dag.*siden",
  "danmarks.* om .*sammenlignet",
  "anskaffelse.*fordelagtigt",
  "anskaffelse.*12"
)

spoergsmaal <- character(7)
for (i in 1:7) {
  fundet <- navne[grepl(moenstre[i], soegenavne)]
  
  if (length(fundet) != 1) {
    stop(paste0(
      "Spørgsmål ", i, " gav ", length(fundet), " match.\n",
      "Indikatornavne fra DST:\n", paste(navne, collapse = "\n")
    ))
  }
  
  spoergsmaal[i] <- fundet
}

forventninger <- dst_get_data(
  table = "FORV1",
  query = list(INDIKATOR = spoergsmaal, Tid = "*"),
  meta_data = meta,
  lang = "da",
  parse_dst_tid = FALSE
)

forventninger <- forventninger[
  forventninger$TID >= "1999M01",
]
# Fjern eventuelle koder foran indikatornavnene
for (i in 1:7) {
  valgt <- endsWith(as.character(forventninger$INDIKATOR), spoergsmaal[i])
  forventninger$INDIKATOR[valgt] <- spoergsmaal[i]
}
stopifnot(
  all(forventninger$INDIKATOR %in% spoergsmaal),
  !anyDuplicated(forventninger[c("TID", "INDIKATOR")])
)

# Én række pr. måned og spørgsmålene som kolonner
forventninger <- pivot_wider(
  forventninger,
  id_cols = TID,
  names_from = INDIKATOR,
  values_from = value
)
forventninger <- as.data.frame(forventninger)
forventninger <- forventninger[
  order(forventninger$TID),
  c("TID", spoergsmaal)
]

# DST: seks serier frem til september 2026
ftillid <- forventninger[, c("TID", spoergsmaal[1:6])]

#de fire spørgsmål der bruges til di-fti
DIFTI_raw <- forventninger[
  ,
  c("TID", spoergsmaal[c(2, 4, 6, 7)])
]

DIFTI <- DIFTI_raw

# --------------------------------------------------
# FORBRUGERTILLID FRA MÅNEDER TIL KVARTALER
# --------------------------------------------------

# Find kvartalet for hver måned
maaned <- as.integer(substr(forventninger$TID, 6, 7))
tidsinterval <- paste0(
  substr(forventninger$TID, 1, 4),
  "K",
  (maaned - 1) %/% 3 + 1
)
kvartaler <- sort(unique(tidsinterval))

# Opret én række pr. kvartal og én kolonne pr. indikator
forventninger_kvt <- data.frame(Tidsinterval = kvartaler)
for (j in 1:7) {
  forventninger_kvt[[spoergsmaal[j]]] <- NA_real_
}

# Beregn gennemsnit af de tre måneder i hvert kvartal
for (i in seq_along(kvartaler)) {
  raekker <- which(tidsinterval == kvartaler[i])
  
  for (j in 1:7) {
    vaerdier <- forventninger[[spoergsmaal[j]]][raekker]
    
    # Behold NA, hvis kvartalet mangler gyldige månedstal
    if (length(vaerdier) == 3 && all(is.finite(vaerdier))) {
      forventninger_kvt[i, j + 1] <- mean(vaerdier)
    }
  }
}

ftillid_kvt <- forventninger_kvt[, c("Tidsinterval", spoergsmaal[1:6])]

# DST's offentliggjorte indikator, som kvartalsgennemsnit
DST_FTI <- data.frame(
  Tidsinterval = ftillid_kvt$Tidsinterval,
  DST_FTI = ftillid_kvt[[spoergsmaal[1]]]
)

#di's fire spørgsmål pr. kvartal
DIFTI_kvt <- forventninger_kvt[
  ,
  c("Tidsinterval", spoergsmaal[c(2, 4, 6, 7)])
]
names(DIFTI_kvt) <- c(
  "Tidsinterval", "fm_nu", "dk_nu",
  "forbrugsgoder_nu", "forbrugsgoder_frem"
)

# Samme beregning som i din oprindelige kode: lige vægt til de fire spørgsmål
DIFTI_kvt$DI_FTI <- (
  DIFTI_kvt$fm_nu +
    DIFTI_kvt$dk_nu +
    DIFTI_kvt$forbrugsgoder_nu +
    DIFTI_kvt$forbrugsgoder_frem
) / 4

# --------------------------------------------------
# SAMMENKOBLING OG SIMPLE REGRESSIONER
# --------------------------------------------------

forbrug_DI <- merge(DIFTI_kvt, privatforbrug, by = "Tidsinterval", sort = TRUE)
forbrug_DST <- merge(DST_FTI, privatforbrug, by = "Tidsinterval", sort = TRUE)

# Fjern observationer uden gyldige værdier fra analysedatasættene
forbrug_DI <- forbrug_DI[
  is.finite(forbrug_DI$Realvaekst) & is.finite(forbrug_DI$DI_FTI),
]
forbrug_DST <- forbrug_DST[
  is.finite(forbrug_DST$Realvaekst) & is.finite(forbrug_DST$DST_FTI),
]
stopifnot(nrow(forbrug_DI) > 2, nrow(forbrug_DST) > 2)

model_DI <- lm(Realvaekst ~ DI_FTI, data = forbrug_DI)
model_DST <- lm(Realvaekst ~ DST_FTI, data = forbrug_DST)
print(summary(model_DI))
print(summary(model_DST))

# --------------------------------------------------
# MULTIPLE REGRESSIONER
# --------------------------------------------------

ftillidSPG <- ftillid_kvt[, c("Tidsinterval", spoergsmaal[2:6])]
names(ftillidSPG) <- c(
  "Tidsinterval", "fm_nu", "fm_frem", "dk_nu", "dk_frem", "forbrugsgoder"
)

forbrug_regression <- merge(
  ftillidSPG, privatforbrug,
  by = "Tidsinterval", sort = TRUE
)
forbrug_regression <- forbrug_regression[
  complete.cases(forbrug_regression),
]
stopifnot(nrow(forbrug_regression) > 6)

model_forbrug <- lm(
  Realvaekst ~ fm_nu + fm_frem + dk_nu + dk_frem + forbrugsgoder,
  data = forbrug_regression
)
print(summary(model_forbrug))

# Begræns perioden til 2000K1-2021K2
regressionRIGTIG <- forbrug_regression[
  forbrug_regression$Tidsinterval >= "2000K1" &
    forbrug_regression$Tidsinterval <= "2021K2",
]
stopifnot(nrow(regressionRIGTIG) > 6)

modelRIGTIG <- lm(
  Realvaekst ~ fm_nu + fm_frem + dk_nu + dk_frem + forbrugsgoder,
  data = regressionRIGTIG
)
print(summary(modelRIGTIG))

# --------------------------------------------------
# FÆLLES STIL TIL GRAFERNE
# --------------------------------------------------

farve_realvaekst <- "#1595D3"
farve_fti <- "#666666"
farve_grid <- "#D9D9D9"
skalering <- 25 / 8

# --------------------------------------------------
# GRAF: DI-FTI OG PRIVATFORBRUGETS REALVÆKST
# --------------------------------------------------

graf_DI <- ggplot(forbrug_DI, aes(x = Tidsinterval)) +
  
  # Realvækst som blå søjler
  geom_col(
    aes(y = Realvaekst * skalering),
    fill = farve_realvaekst,
    width = 0.8
  ) +
  
  # Forbrugertillid som grå linje
  geom_line(
    aes(y = DI_FTI, group = 1),
    colour = farve_fti,
    linewidth = 1
  ) +
  
  # Venstre og højre y-akse
  scale_y_continuous(
    name = "Nettotal",
    sec.axis = sec_axis(~ . / skalering, name = "Pct.")
  ) +
  
  # Vis årstal ved første kvartal
  scale_x_discrete(
    breaks = forbrug_DI$Tidsinterval[grepl("K1$", forbrug_DI$Tidsinterval)],
    labels = substr(
      forbrug_DI$Tidsinterval[grepl("K1$", forbrug_DI$Tidsinterval)], 1, 4
    )
  ) +
  
  labs(
    title = "DI-forbrugertillid og privatforbrugets realvækst",
    subtitle = "Grå linje: DI-FTI · Blå søjler: årlig realvækst",
    x = NULL,
    caption = "Kilde: Danmarks Statistik. Egne beregninger.\nDI-FTI: simpelt gennemsnit af de fire udvalgte spørgsmål."
  ) +
  
  theme_minimal() +
  theme(
    plot.title = element_text(face = "bold", size = 14),
    plot.subtitle = element_text(size = 10),
    axis.title = element_text(size = 10),
    axis.text = element_text(size = 8),
    axis.text.x = element_text(angle = 90, hjust = 1, vjust = 0.5),
    panel.grid.major.y = element_line(colour = farve_grid, linewidth = 0.5),
    panel.grid.major.x = element_blank(),
    panel.grid.minor = element_blank(),
    plot.caption = element_text(size = 8, hjust = 0)
  )

print(graf_DI)

# --------------------------------------------------
# GRAF: DST-FTI OG PRIVATFORBRUGETS REALVÆKST
# --------------------------------------------------

graf_DST <- ggplot(forbrug_DST, aes(x = Tidsinterval)) +
  
  # Realvækst som blå søjler
  geom_col(
    aes(y = Realvaekst * skalering),
    fill = farve_realvaekst,
    width = 0.8
  ) +
  
  # Forbrugertillid som grå linje
  geom_line(
    aes(y = DST_FTI, group = 1),
    colour = farve_fti,
    linewidth = 1
  ) +
  
  # Venstre og højre y-akse
  scale_y_continuous(
    name = "Nettotal",
    sec.axis = sec_axis(~ . / skalering, name = "Pct.")
  ) +
  
  # Vis årstal ved første kvartal
  scale_x_discrete(
    breaks = forbrug_DST$Tidsinterval[grepl("K1$", forbrug_DST$Tidsinterval)],
    labels = substr(
      forbrug_DST$Tidsinterval[grepl("K1$", forbrug_DST$Tidsinterval)], 1, 4
    )
  ) +
  
  labs(
    title = "DST-forbrugertillid og privatforbrugets realvækst",
    subtitle = "Grå linje: DST-FTI · Blå søjler: årlig realvækst",
    x = NULL,
    caption = "Kilde: Danmarks Statistik. Egne beregninger.\nDST-FTI: kvartalsgennemsnit af den offentliggjorte indikator."
  ) +
  
  theme_minimal() +
  theme(
    plot.title = element_text(face = "bold", size = 14),
    plot.subtitle = element_text(size = 10),
    axis.title = element_text(size = 10),
    axis.text = element_text(size = 8),
    axis.text.x = element_text(angle = 90, hjust = 1, vjust = 0.5),
    panel.grid.major.y = element_line(colour = farve_grid, linewidth = 0.5),
    panel.grid.major.x = element_blank(),
    panel.grid.minor = element_blank(),
    plot.caption = element_text(size = 8, hjust = 0)
  )

print(graf_DST)
#Producer grafer. starter med en koefficientgraf
#først hent koefficienter fra modelRIGTIG

koefRIGTIG <- data.frame(
  Variabel = c("fm_nu", "fm_frem", "dk_nu", "dk_frem", "forbrugsgoder"),
  Koefficient = coef(modelRIGTIG)[-1]
)

#Variabelnavne ændres

koefRIGTIG$Variabel <- c(
  "Familiens økonomi nu",
  "Familiens økonomi frem",
  "Danmarks økonomi nu",
  "Danmarks økonomi frem",
  "Forbrugsgoder nu"
)

#Selve grafen m. ggplot2

# Graf over koefficienterne i den multiple lineære regression
# Hver søjle viser koefficienten for én af de 5 X-variable

# Søjler over 0 = positiv sammenhæng med realvæksten
# Søjler under 0 = negativ sammenhæng med realvæksten

# Højden på søjlen viser størrelsen på koefficienten
# Koefficienterne skal forstås "alt andet lige",
# altså når de andre X-variable holdes konstante

# Grafen viser også:
# - perioden 2000K1-2021K2
# - modellens justerede R²
# - kilde: Danmarks Statistik
# - at grafen er lavet i R
# - dato for udarbejdelse

graf_koefficienter <- ggplot(
  koefRIGTIG,
  aes(
    x = Variabel,
    y = Koefficient,
    fill = Koefficient >= 0
  )
) +
  
  geom_col(
    width = 0.55
  ) +
  
  geom_hline(
    yintercept = 0
  ) +
  
  geom_text(
    aes(
      label = round(Koefficient, 3),
      vjust = ifelse(Koefficient >= 0, -0.5, 1.5)
    )
  ) +
  
  scale_fill_manual(
    values = c(
      "TRUE" = "forestgreen",
      "FALSE" = "red3"
    ),
    guide = "none"
  ) +
  
  labs(
    title = "Koefficienter i multipel lineær regression",
    
    subtitle = paste(
      "Årlig realvækst i privatforbruget, 2000K1-2021K2 | Justeret R² =",
      round(summary(modelRIGTIG)$adj.r.squared, 3)
    ),
    
    x = "Forklarende variable",
    
    y = "Koefficient",
    
    caption = paste(
      "Kilde: Danmarks Statistik.",
      "Forbrugertillid og privatforbrug i kædede værdier.",
      "Udarbejdet i R.",
      "Dato:", format(Sys.Date(), "%d-%m-%Y")
    )
  ) +
  
  theme_minimal() +
  
  theme(
    axis.text.x = element_text(
      angle = 25,
      hjust = 1
    ),
    
    plot.title = element_text(
      face = "bold"
    ),
    
    plot.subtitle = element_text(
      size = 10
    ),
    
    plot.caption = element_text(
      size = 8
    )
  )


#Næste graf som påviser faktisk vs. forudsagt realvækst (i privatøkonomien)
#Hent Y-værdier fra modelRIGTIG og forudsigende værdier fra X-variable også modelRIGTIG

forudsagtRIGTIG <- data.frame(
  faktisk = modelRIGTIG$model$Realvaekst,
  forudsagt = fitted(modelRIGTIG)
)

graf_forudsagt <- ggplot(
  forudsagtRIGTIG,
  aes(x = faktisk, y = forudsagt)
) +
  
  geom_point(
    size = 2.5,
    alpha = 0.7
  ) +
  
  geom_abline(
    intercept = 0,
    slope = 1,
    linetype = "dashed"
  ) +
  
  scale_x_continuous(
    expand = expansion(mult = c(0.05, 0.25))
  ) +
  
  scale_y_continuous(
    expand = expansion(mult = c(0.05, 0.05))
  ) +
  
  annotate(
    "text",
    x = Inf,
    y = Inf,
    hjust = 1.05,
    vjust = 1.1,
    label = paste(
      "Sådan læses grafen:",
      "På linjen = modellen rammer præcist",
      "Tæt på linjen = modellen rammer relativt godt",
      "Langt fra linjen = modellen rammer dårligere",
      sep = "\n"
    ),
    size = 3.2
  ) +
  
  labs(
    title = "Faktisk og modeltilpasset realvækst i privatforbruget",
    
    subtitle = paste(
      "Multipel lineær regression, 2000K1-2021K2 | Justeret R² =",
      round(summary(modelRIGTIG)$adj.r.squared, 3)
    ),
    
    x = "Faktisk årlig realvækst (%)",
    
    y = "Modellens forudsagte årlige realvækst (%)",
    
    caption = paste(
      "Kilde: Danmarks Statistik.",
      "Forbrugertillid og privatforbrug i kædede værdier.",
      "Udarbejdet i R.",
      "Dato:", format(Sys.Date(), "%d-%m-%Y")
    )
  ) +
  
  theme_minimal() +
  
  theme(
    plot.title = element_text(face = "bold"),
    plot.subtitle = element_text(size = 10),
    plot.caption = element_text(size = 8)
  )

# Viser graferne også ved kørsel med Source
print(graf_koefficienter)
print(graf_forudsagt)

# Forudsagte værdier ovenfor er tilpasning på estimationsdata, ikke en prognosetest.
# Se datasæt i RStudio med fx View(ftillid_kvt) eller View(DIFTI_raw).


#OPG2.2

#henter automatisk dst-fti for 2026K3
ny_DST <- DST_FTI[
  DST_FTI$Tidsinterval == "2026K3",
  "DST_FTI",
  drop = FALSE
]

#Forudsig den årlige realvækst
forudsig_DST_2026K3 <- predict(
  model_DST,
  newdata = ny_DST
)

forudsig_DST_2026K3


#henter automatisk di-fti for 2026K3
ny_DI <- DIFTI_kvt[
  DIFTI_kvt$Tidsinterval == "2026K3",
  "DI_FTI",
  drop = FALSE
]

#forudsig den årlige realvækst
forudsig_DI_2026K3 <- predict(
  model_DI,
  newdata = ny_DI
)

forudsig_DI_2026K3

################################# NYE SVAR
summary(model_DI)
summary(model_DST)
forudsig_DI_2026K3
forudsig_DST_2026K3

###GRAF

#samler de to forudsigelser i et lille datasæt
prognose_2026K3 <- data.frame(
  Model = c(
    "DI's Forbrugertillidsindikator",
    "Danmarks Statistiks Forbrugertillidsindikator"
  ),
  Realvaekst = c(
    as.numeric(forudsig_DI_2026K3),
    as.numeric(forudsig_DST_2026K3)
  )
)

#farver
farve_realvaekst <- "#1595D3"
farve_grid <- "#D9D9D9"

#laver grafen
ggplot(
  prognose_2026K3,
  aes(x = Model, y = Realvaekst)
) +
  
  #slanke blå søjler
  geom_col(
    fill = farve_realvaekst,
    width = 0.38
  ) +
  
  #nul-linje
  geom_hline(
    yintercept = 0,
    colour = "#666666",
    linewidth = 0.8
  ) +
  
  #større procenttal på søjlerne
  geom_text(
    aes(
      label = paste0(
        format(
          round(Realvaekst, 2),
          nsmall = 2,
          decimal.mark = ","
        ),
        " %"
      )
    ),
    vjust = 1.4,
    colour = "white",
    size = 6,
    fontface = "bold"
  ) +
  
  #giver lidt ekstra luft i grafen
  scale_y_continuous(
    limits = c(-0.9, 0.15),
    breaks = seq(-0.8, 0, 0.2),
    labels = function(x) paste0(
      format(
        x,
        decimal.mark = ",",
        nsmall = 1
      ),
      " %"
    )
  ) +
  
  #titel, undertitel og kilde
  labs(
    title = "Forudsagt årlig realvækst i privatforbruget, 3. kvartal 2026",
    subtitle = "Baseret på DI's Forbrugertillidsindikator og Danmarks Statistiks Forbrugertillidsindikator",
    x = NULL,
    y = "Årlig realvækst",
    caption = paste0(
      "Kilde: Danmarks Statistik, Statistikbanken, NKN1: P.31 Privatforbrug,\n",
      "sæsonkorrigeret, 2020-priser, kædede værdier, mia. kr.\n",
      "DI-FTI er beregnet som gennemsnittet af fire udvalgte spørgsmål fra forbrugerforventningsundersøgelsen.\n",
      "DST-FTI er Danmarks Statistiks Forbrugertillidsindikator. Egne beregninger og databehandling i R/RStudio."
    )
  ) +
  
  #rent tema
  theme_minimal() +
  
  theme(
    plot.title = element_text(
      face = "bold",
      size = 17,
      colour = "#222222",
      margin = margin(b = 7)
    ),
    
    plot.subtitle = element_text(
      size = 12,
      colour = "#444444",
      margin = margin(b = 18)
    ),
    
    axis.title.y = element_text(
      size = 12,
      colour = "#444444",
      margin = margin(r = 10)
    ),
    
    axis.text.y = element_text(
      size = 11,
      colour = "#444444"
    ),
    
    axis.text.x = element_text(
      size = 11,
      colour = "#333333",
      face = "bold",
      margin = margin(t = 8)
    ),
    
    panel.grid.major.y = element_line(
      colour = farve_grid,
      linewidth = 0.5
    ),
    
    panel.grid.major.x = element_blank(),
    panel.grid.minor = element_blank(),
    
    plot.caption = element_text(
      size = 9,
      hjust = 0,
      colour = "#555555",
      lineheight = 1.15,
      margin = margin(t = 15)
    ),
    
    plot.margin = margin(
      t = 20,
      r = 25,
      b = 25,
      l = 20
    )
  )


#---------


#Laver nye modeller. Y er fortsat den årlige realvækst i privatforbruget. 
#Nye modeller er 7mfti, som bruger de syv mikroøkonomiske spg. 
# 4mfti som bruger de fire mikroøkonomiske spg. som fungerer i EU-regi
# fti_optimal som artiklen "the quest for the best cci" referer til.

#henter k3
DI_K3 <- DIFTI_kvt[
  grepl("K3$", DIFTI_kvt$Tidsinterval),
]

#henter k4
DI_K4 <- DIFTI_kvt[
  grepl("K4$", DIFTI_kvt$Tidsinterval),
]

#laver år
DI_K3$Aar <- substr(DI_K3$Tidsinterval, 1, 4)
DI_K4$Aar <- substr(DI_K4$Tidsinterval, 1, 4)

#samler k3 og k4 for samme år
DI_sammenligning <- merge(
  DI_K3[, c("Aar", "DI_FTI")],
  DI_K4[, c("Aar", "DI_FTI")],
  by = "Aar",
  suffixes = c("_K3", "_K4")
)

#er k4 højere end k3?
DI_sammenligning$K4_hoejere <- (
  DI_sammenligning$DI_FTI_K4 >
    DI_sammenligning$DI_FTI_K3
)

#antal år hvor k4 er højere
sum(DI_sammenligning$K4_hoejere)

#antal år i alt
nrow(DI_sammenligning)

#andel i procent
mean(DI_sammenligning$K4_hoejere) * 100

#antal år hvor k4 er højere end k3
sum(DI_sammenligning$DI_FTI_K4 > DI_sammenligning$DI_FTI_K3)

#antal år hvor k4 er lig med k3
sum(DI_sammenligning$DI_FTI_K4 == DI_sammenligning$DI_FTI_K3)

#antal år hvor k4 er lavere end k3
sum(DI_sammenligning$DI_FTI_K4 < DI_sammenligning$DI_FTI_K3)

#procent højere
mean(DI_sammenligning$DI_FTI_K4 > DI_sammenligning$DI_FTI_K3) * 100
#procent det samme
mean(DI_sammenligning$DI_FTI_K4 == DI_sammenligning$DI_FTI_K3) * 100
#procent lavere
mean(DI_sammenligning$DI_FTI_K4 < DI_sammenligning$DI_FTI_K3) * 100


#gns. for di-fti i k3
mean(DI_sammenligning$DI_FTI_K3, na.rm = TRUE)

#gns. for di-fti i k4
mean(DI_sammenligning$DI_FTI_K4, na.rm = TRUE)


#--------------------------------------------------
#7MFTI
#--------------------------------------------------

#finder navnene på indikatorerne i FORV1
navne_7m <- meta$values$INDIKATOR$text
soegenavne_7m <- tolower(navne_7m)
soegenavne_7m <- gsub(
  "[[:space:]\u00a0]+",
  " ",
  soegenavne_7m,
  perl = TRUE
)

#de 7 mikrospørgsmål
spoergsmaal_7m <- c(
  "Familiens økonomiske situation i dag, sammenlignet med for et år siden",
  "Familiens økonomiske  situation om et år, sammenlignet med i dag",
  "Anskaffelse af større forbrugsgoder, fordelagtigt for øjeblikket",
  "Anskaffelse af større forbrugsgoder, inden for de næste 12 mdr.",
  "Anser det som fornuftigt at spare op i den nuværende økonomiske situation",
  "Regner med at kunne spare op i de kommende 12 måneder",
  "Familiens økonomiske situation lige nu: kan spare/penge slår til/ bruger mere end man tjener"
)

#tjekker at alle 7 findes i FORV1
stopifnot(
  all(spoergsmaal_7m %in% navne_7m)
)

spoergsmaal_7m

#viser hvilke 7 spørgsmål der er fundet
spoergsmaal_7m

navne_7m[
  
  
  grepl(
    "Familiens|Anskaffelse|spare|Spare",
    navne_7m
  )
]

#henter de 7 mikrospørgsmål
mikro_7m_raw <- dst_get_data(
  table = "FORV1",
  query = list(
    INDIKATOR = spoergsmaal_7m,
    Tid = "*"
  ),
  meta_data = meta,
  lang = "da",
  parse_dst_tid = FALSE
)

#beholder perioden fra 1999
mikro_7m_raw <- mikro_7m_raw[
  mikro_7m_raw$TID >= "1999M01",
]

#sikrer de rigtige indikatornavne
for (i in 1:7) {
  valgt <- endsWith(
    as.character(mikro_7m_raw$INDIKATOR),
    spoergsmaal_7m[i]
  )
  
  mikro_7m_raw$INDIKATOR[valgt] <-
    spoergsmaal_7m[i]
}

#laver data bredt
mikro_7m <- pivot_wider(
  mikro_7m_raw,
  id_cols = TID,
  names_from = INDIKATOR,
  values_from = value
)

mikro_7m <- as.data.frame(mikro_7m)

#finder kvartalet for hver måned
maaned_7m <- as.integer(
  substr(mikro_7m$TID, 6, 7)
)

mikro_7m$Tidsinterval <- paste0(
  substr(mikro_7m$TID, 1, 4),
  "K",
  (maaned_7m - 1) %/% 3 + 1
)

#finder alle kvartaler
kvartaler_7m <- sort(
  unique(mikro_7m$Tidsinterval)
)

#opretter dataframe til kvartalsdata
FTI_7m <- data.frame(
  Tidsinterval = kvartaler_7m,
  FTI_7m = NA_real_
)

#beregner gennemsnittet af de 7 mikrospørgsmål
#for hver måned og derefter kvartalet
mikro_7m$maaneds_FTI_7m <- rowMeans(
  mikro_7m[, spoergsmaal_7m],
  na.rm = FALSE
)

for (i in seq_along(kvartaler_7m)) {
  
  vaerdier <- mikro_7m$maaneds_FTI_7m[
    mikro_7m$Tidsinterval ==
      kvartaler_7m[i]
  ]
  
  if (
    length(vaerdier) == 3 &&
    all(is.finite(vaerdier))
  ) {
    FTI_7m$FTI_7m[i] <- mean(vaerdier)
  }
}

#samler 7mfti og privatforbruget
forbrug_7mfti <- merge(
  FTI_7m,
  privatforbrug,
  by = "Tidsinterval",
  sort = TRUE
)

#fjerner manglende værdier
forbrug_7mfti <- forbrug_7mfti[
  is.finite(forbrug_7mfti$Realvaekst) &
    is.finite(forbrug_7mfti$FTI_7m),
]

#laver den simple lineære regression
model_7mfti <- lm(
  Realvaekst ~ FTI_7m,
  data = forbrug_7mfti
)

summary(model_7mfti)

#DENNE MODEL HAR KUN 101 OBSERVATIONER, DE ANDRE HAR 106. det er pga.spg 10 "Anser det som fornuftigt at spare op i den nuværende økonomiske situation". stoppede i 2025m5


#viser manglende værdier for hvert mikrospørgsmål
colSums(
  is.na(
    mikro_7m[, spoergsmaal_7m]
  )
)

#viser måneder hvor mindst ét af de 7 spørgsmål mangler
mikro_7m[
  !complete.cases(
    mikro_7m[, spoergsmaal_7m]
  ),
  c("TID", spoergsmaal_7m)
]

#--------------------------------------------------
#4MFTI
#--------------------------------------------------

#de 4 mikrospørgsmål fra artiklen
spoergsmaal_4m <- c(
  "Familiens økonomiske situation i dag, sammenlignet med for et år siden",
  "Familiens økonomiske  situation om et år, sammenlignet med i dag",
  "Anskaffelse af større forbrugsgoder, fordelagtigt for øjeblikket",
  "Anskaffelse af større forbrugsgoder, inden for de næste 12 mdr."
)

#tjekker at alle 4 findes i FORV1
stopifnot(
  all(spoergsmaal_4m %in% navne_7m)
)

#henter de 4 mikrospørgsmål
mikro_4m_raw <- dst_get_data(
  table = "FORV1",
  query = list(
    INDIKATOR = spoergsmaal_4m,
    Tid = "*"
  ),
  meta_data = meta,
  lang = "da",
  parse_dst_tid = FALSE
)

#beholder perioden fra 1999
mikro_4m_raw <- mikro_4m_raw[
  mikro_4m_raw$TID >= "1999M01",
]

#sikrer de rigtige indikatornavne
for (i in 1:4) {
  valgt <- endsWith(
    as.character(mikro_4m_raw$INDIKATOR),
    spoergsmaal_4m[i]
  )
  
  mikro_4m_raw$INDIKATOR[valgt] <-
    spoergsmaal_4m[i]
}

#laver data bredt
mikro_4m <- pivot_wider(
  mikro_4m_raw,
  id_cols = TID,
  names_from = INDIKATOR,
  values_from = value
)

mikro_4m <- as.data.frame(mikro_4m)

#finder kvartalet for hver måned
maaned_4m <- as.integer(
  substr(mikro_4m$TID, 6, 7)
)

mikro_4m$Tidsinterval <- paste0(
  substr(mikro_4m$TID, 1, 4),
  "K",
  (maaned_4m - 1) %/% 3 + 1
)

#finder alle kvartaler
kvartaler_4m <- sort(
  unique(mikro_4m$Tidsinterval)
)

#opretter dataframe til kvartalsdata
FTI_4m <- data.frame(
  Tidsinterval = kvartaler_4m,
  FTI_4m = NA_real_
)

#beregner gennemsnittet af de 4 mikrospørgsmål
#for hver måned
mikro_4m$maaneds_FTI_4m <- rowMeans(
  mikro_4m[, spoergsmaal_4m],
  na.rm = FALSE
)

#beregner kvartalsgennemsnittet
for (i in seq_along(kvartaler_4m)) {
  
  vaerdier <- mikro_4m$maaneds_FTI_4m[
    mikro_4m$Tidsinterval ==
      kvartaler_4m[i]
  ]
  
  if (
    length(vaerdier) == 3 &&
    all(is.finite(vaerdier))
  ) {
    FTI_4m$FTI_4m[i] <- mean(vaerdier)
  }
}

#samler 4mfti og privatforbruget
forbrug_4mfti <- merge(
  FTI_4m,
  privatforbrug,
  by = "Tidsinterval",
  sort = TRUE
)

#fjerner manglende værdier
forbrug_4mfti <- forbrug_4mfti[
  is.finite(forbrug_4mfti$Realvaekst) &
    is.finite(forbrug_4mfti$FTI_4m),
]

#laver den simple lineære regression
model_4mfti <- lm(
  Realvaekst ~ FTI_4m,
  data = forbrug_4mfti
)

summary(model_4mfti)


#--------------------------------------------------
#optimal fti for danmark
#--------------------------------------------------

#de 4 spørgsmål fra artiklens optimale danske indikator
spoergsmaal_optimal <- c(
  "Familiens økonomiske situation i dag, sammenlignet med for et år siden",
  "Danmarks økonomiske situation i dag, sammenlignet med for et år siden",
  "Danmarks økonomiske situation om et år, sammenlignet med i dag",
  "Anskaffelse af større forbrugsgoder, inden for de næste 12 mdr."
)

#tjekker at alle 4 findes
stopifnot(
  all(spoergsmaal_optimal %in% navne_7m)
)

#henter de 4 spørgsmål
optimal_raw <- dst_get_data(
  table = "FORV1",
  query = list(
    INDIKATOR = spoergsmaal_optimal,
    Tid = "*"
  ),
  meta_data = meta,
  lang = "da",
  parse_dst_tid = FALSE
)

#beholder perioden fra 1999
optimal_raw <- optimal_raw[
  optimal_raw$TID >= "1999M01",
]

#sikrer de rigtige indikatornavne
for (i in 1:4) {
  valgt <- endsWith(
    as.character(optimal_raw$INDIKATOR),
    spoergsmaal_optimal[i]
  )
  
  optimal_raw$INDIKATOR[valgt] <-
    spoergsmaal_optimal[i]
}

#laver data bredt
optimal <- pivot_wider(
  optimal_raw,
  id_cols = TID,
  names_from = INDIKATOR,
  values_from = value
)

optimal <- as.data.frame(optimal)

#finder kvartalet for hver måned
maaned_optimal <- as.integer(
  substr(optimal$TID, 6, 7)
)

optimal$Tidsinterval <- paste0(
  substr(optimal$TID, 1, 4),
  "K",
  (maaned_optimal - 1) %/% 3 + 1
)

#finder alle kvartaler
kvartaler_optimal <- sort(
  unique(optimal$Tidsinterval)
)

#opretter dataframe til kvartalsdata
FTI_optimal <- data.frame(
  Tidsinterval = kvartaler_optimal,
  FTI_optimal = NA_real_
)

#beregner gennemsnittet af de 4 spørgsmål for hver måned
optimal$maaneds_FTI_optimal <- rowMeans(
  optimal[, spoergsmaal_optimal],
  na.rm = FALSE
)

#beregner kvartalsgennemsnittet
for (i in seq_along(kvartaler_optimal)) {
  
  vaerdier <- optimal$maaneds_FTI_optimal[
    optimal$Tidsinterval ==
      kvartaler_optimal[i]
  ]
  
  if (
    length(vaerdier) == 3 &&
    all(is.finite(vaerdier))
  ) {
    FTI_optimal$FTI_optimal[i] <- mean(vaerdier)
  }
}

#samler optimal fti og privatforbruget
forbrug_optimal <- merge(
  FTI_optimal,
  privatforbrug,
  by = "Tidsinterval",
  sort = TRUE
)

#fjerner manglende værdier
forbrug_optimal <- forbrug_optimal[
  is.finite(forbrug_optimal$Realvaekst) &
    is.finite(forbrug_optimal$FTI_optimal),
]

#laver den simple lineære regression
model_optimal <- lm(
  Realvaekst ~ FTI_optimal,
  data = forbrug_optimal
)

summary(model_optimal)


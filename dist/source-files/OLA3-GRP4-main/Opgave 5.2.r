
library(httr)
library(jsonlite)
library(dplyr)
library(ggplot2)
library(grid)
library(gridExtra)

# ==========================================
# 1. GLOBALE VARIABLE
# ==========================================

windirparam = "wind_dir"
windforceparam = "wind_speed"

sid = "06033"
asid = "06180"

baseurl = paste0(
  "https://opendataapi.dmi.dk/v2/metObs/",
  "collections/observation/items?"
)

# Stormen Dave
fd = "2026-04-04T00:00:00Z"
td = "2026-04-07T00:00:00Z"


# ==========================================
# 2. HENT DATA FRA DMI
# ==========================================

getdatafromdmi <- function(param, station, frd, tod) {
  
  varurl = paste0(
    "parameterId=", param,
    "&stationId=", station,
    "&datetime=", frd, "/", tod,
    "&limit=20000"
  )
  
  totalurl = paste0(baseurl, varurl)
  
  res = GET(totalurl)
  
  print(res$status_code)
  stop_for_status(res)
  
  resraw = content(
    res,
    as = "text",
    encoding = "UTF-8"
  )
  
  resdf = fromJSON(resraw)
  
  obsdf = resdf$features$properties
  
  if (is.null(obsdf) || nrow(obsdf) == 0) {
    stop(paste(
      "Ingen data for station",
      station,
      "med parameter",
      param
    ))
  }
  
  winddf = obsdf[, c("observed", "value")]
  
  winddf$observed = as.POSIXct(
    winddf$observed,
    format = "%Y-%m-%dT%H:%M:%S",
    tz = "UTC"
  )
  
  winddf = arrange(winddf, observed)
  
  return(winddf)
}


# ==========================================
# 3. HENT DATA FRA HIRTSHALS
# ==========================================

windforcedf = getdatafromdmi(
  windforceparam, sid, fd, td
)

winddirdf = getdatafromdmi(
  windirparam, sid, fd, td
)

totalwind = inner_join(
  windforcedf,
  winddirdf,
  by = "observed"
)

colnames(totalwind) = c(
  "observed", "force", "dir"
)

totalwind$station = "Hirtshals"


# ==========================================
# 4. HENT DATA FRA KØBENHAVN
# ==========================================

windforcedfa = getdatafromdmi(
  windforceparam, asid, fd, td
)

winddirdfa = getdatafromdmi(
  windirparam, asid, fd, td
)

totalwinda = inner_join(
  windforcedfa,
  winddirdfa,
  by = "observed"
)

colnames(totalwinda) = c(
  "observed", "force", "dir"
)

totalwinda$station = "København Lufthavn"


# ==========================================
# 5. SAML DATA
# ==========================================

begge = rbind(
  totalwind,
  totalwinda
)

begge = arrange(
  begge,
  station,
  observed
)


# ==========================================
# 6. BEREGN VINDSTYRKE
# ==========================================

sammenligning = begge %>%
  group_by(station) %>%
  summarise(
    antal = n(),
    gennemsnit = mean(force, na.rm = TRUE),
    maksimum = max(force, na.rm = TRUE),
    minimum = min(force, na.rm = TRUE),
    .groups = "drop"
  )

print(sammenligning)

hmax = sammenligning$maksimum[
  sammenligning$station == "Hirtshals"
]

kmax = sammenligning$maksimum[
  sammenligning$station == "København Lufthavn"
]

forskel = round(
  abs(hmax - kmax),
  1
)

# Konkluderende overskrift til graf 1

if (hmax > kmax) {
  
  titel1 = paste0(
    "Hirtshals målte ",
    forskel,
    " m/s mere end København"
  )
  
} else if (kmax > hmax) {
  
  titel1 = paste0(
    "København målte ",
    forskel,
    " m/s mere end Hirtshals"
  )
  
} else {
  
  titel1 = "Begge stationer målte samme maksimale vindstyrke"
  
}


# ==========================================
# 7. BEREGN VINDRETNING
# ==========================================

# Vindretning i grader
# 0 = Nord
# 90 = Øst
# 180 = Syd
# 270 = Vest

begge$dir_rad = begge$dir * pi / 180

# Lav pile til grafen

begge$xd = begge$observed -
  sin(begge$dir_rad) * 1800

begge$yd = begge$force -
  cos(begge$dir_rad)


# Find dominerende vindretning
# Brug vektorer så 0 og 360 grader
# behandles som samme retning

retning_data = begge %>%
  filter(!is.na(dir)) %>%
  group_by(station) %>%
  summarise(
    sin_mean = mean(sin(dir * pi / 180)),
    cos_mean = mean(cos(dir * pi / 180)),
    .groups = "drop"
  ) %>%
  mutate(
    grader = (
      atan2(sin_mean, cos_mean) * 180 / pi + 360
    ) %% 360
  )

print(retning_data)


# Funktion til at oversætte grader

vindretning_navn = function(grader) {
  
  retninger = c(
    "nord", "nordøst", "øst", "sydøst",
    "syd", "sydvest", "vest", "nordvest"
  )
  
  nr = floor((grader + 22.5) / 45) %% 8 + 1
  
  return(retninger[nr])
}

retning_data$retning = vindretning_navn(
  retning_data$grader
)

hretning = retning_data$retning[
  retning_data$station == "Hirtshals"
]

kretning = retning_data$retning[
  retning_data$station == "København Lufthavn"
]

titel3 = paste0(
  "Vinden kom primært fra ",
  hretning,
  " i Hirtshals og ",
  kretning,
  " i København"
)


# ==========================================
# 8. GRAF 1, VINDSTYRKE
# ==========================================

p1 = ggplot(
  data = begge,
  aes(
    x = observed,
    y = force,
    color = station
  )
) +
  geom_line(linewidth = 1) +
  scale_color_manual(
    values = c(
      "Hirtshals" = "red",
      "København Lufthavn" = "blue"
    )
  ) +
  labs(
    title = titel1,
    subtitle = "Maksimal målt vindstyrke under Dave",
    x = "Dato",
    y = "Vindstyrke (m/s)",
    color = "Station"
  ) +
  theme_minimal() +
  theme(
    plot.title = element_text(
      face = "bold",
      size = 13
    ),
    axis.text.x = element_text(
      angle = 45,
      hjust = 1
    )
  )

print(p1)


# ==========================================
# 9. GRAF 2, VINDSTYRKE MED PILE
# ==========================================

piledata = begge %>%
  group_by(station) %>%
  filter(row_number() %% 10 == 1) %>%
  ungroup()

p2 = ggplot(
  data = begge,
  aes(
    x = observed,
    y = force,
    color = station
  )
) +
  geom_line(linewidth = 0.7) +
  geom_segment(
    data = piledata,
    aes(
      xend = xd,
      yend = yd
    ),
    arrow = arrow(
      type = "closed",
      length = unit(0.05, "inches")
    ),
    linewidth = 0.4
  ) +
  scale_color_manual(
    values = c(
      "Hirtshals" = "red",
      "København Lufthavn" = "blue"
    )
  ) +
  labs(
    title = "Vindretningen ændrede sig under stormen Dave",
    subtitle = "Pilene viser vindens bevægelsesretning",
    x = "Dato",
    y = "Vindstyrke (m/s)",
    color = "Station"
  ) +
  theme_minimal()

print(p2)


# ==========================================
# 10. GRAF 3, VINDRETNING
# ==========================================

p3 = ggplot(
  data = begge,
  aes(
    x = observed,
    y = dir,
    color = station
  )
) +
  geom_point(size = 0.7) +
  scale_color_manual(
    values = c(
      "Hirtshals" = "red",
      "København Lufthavn" = "blue"
    )
  ) +
  scale_y_continuous(
    breaks = c(0, 90, 180, 270, 360),
    labels = c("N", "Ø", "S", "V", "N"),
    limits = c(0, 360)
  ) +
  labs(
    title = titel3,
    subtitle = "Dominerende vindretning under Dave",
    x = "Dato",
    y = "Vindretning",
    color = "Station"
  ) +
  theme_minimal() +
  theme(
    plot.title = element_text(
      face = "bold",
      size = 12
    ),
    axis.text.x = element_text(
      angle = 45,
      hjust = 1
    )
  )

print(p3)


# ==========================================
# 11. SAMLET GRAF
# ==========================================

gridExtra::grid.arrange(
  p1,
  p3,
  ncol = 1,
  
  top = grid::textGrob(
    "Dave ramte Hirtshals og København forskelligt",
    gp = grid::gpar(
      fontsize = 16,
      fontface = "bold"
    )
  ),
  
  bottom = grid::textGrob(
    "Kilde: DMI, egne beregninger",
    x = 0.98,
    hjust = 1,
    gp = grid::gpar(
      fontsize = 9,
      col = "grey45"
    )
  )
)


# ==========================================
# 12. KONKLUSION I KONSOLLEN
# ==========================================

cat("\nKONKLUSION\n")

cat(titel1, "\n")

cat(titel3, "\n")

cat(
  "Hirtshals maksimum:",
  round(hmax, 1),
  "m/s\n"
)

cat(
  "København maksimum:",
  round(kmax, 1),
  "m/s\n"
)

cat(
  "Forskel:",
  forskel,
  "m/s\n"
)

print(sammenligning)

# Gem den samlede graf

samlet_graf = gridExtra::arrangeGrob(
  p1,
  p3,
  ncol = 1,
  top = grid::textGrob(
    "Dave ramte Hirtshals og København forskelligt",
    gp = grid::gpar(
      fontsize = 16,
      fontface = "bold"
    )
  ),
  bottom = grid::textGrob(
    "Kilde: DMI, egne beregninger",
    x = 0.98,
    hjust = 1,
    gp = grid::gpar(fontsize = 9)
  )
)

ggsave(
  filename = "Stormen_Dave.png",
  plot = samlet_graf,
  width = 14,
  height = 10,
  dpi = 300,
  bg = "white"
)

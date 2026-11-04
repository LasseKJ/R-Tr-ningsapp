library(dkstat)
library(dplyr)
library(ggplot2)

data <- dst_meta(table = "Fod111")

#Undersøg variabler

data$variables

#Undersøg værdier pr variable

data$values$ALDER

#Lav filter

filter <- list(
  OMRÅDE = "*",
  ALDER = "Gennemsnitsalder for førstegangsfødende kvinder",
  TID = "*"
)

fod111 <- dst_get_data(
  table = "FOD111",
  query = filter
)

fod111$OMRÅDE <- gsub("[0-9]+ ","",fod111$OMRÅDE)

unique(fod111$område)

fod111 <- dst_get_data(
  table = "FOD111",
  OMRÅDE = "*",
  ALDER = "*",
  TID = "*",
  parse_dst_tid = FALSE
)

kommuner <- fod111 |> 
  filter(
    OMRÅDE %in% c("Esbjerg", "Frederiksberg", "Hele landet"),
    grepl("førstegangsfød", ALDER)
  )

ggplot(kommuner, aes(x = TID, y = value, colour = OMRÅDE,group = OMRÅDE)) + geom_line()

kommuner |> group_by(OMRÅDE) |>  summarise(spredning = sd(value, na.rm = TRUE))

#ALT 

fod111sd <- fod111 |> group_by(OMRÅDE) |> mutate(SD = sd(value, na.rm = TRUE)) 

fod111 |>
  filter(TID == "2025-01-01") |>
  ggplot(aes(x = OMRÅDE, y = value)) +
  geom_point() +
  labs(x = "Område", y = "Gennemsnitsfødealder") +
  theme(axis.text.x = element_text(angle = 90, hjust = 1))

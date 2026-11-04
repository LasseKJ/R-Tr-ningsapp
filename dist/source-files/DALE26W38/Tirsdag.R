library(dkstat)

# hent via API
# hente metadata mhp filtrering
uheld_meta <- dst_meta(table = "UHELDK1", lang = "da")

# konstruer liste med filtre
uheld_meta_filters <- list(
  OMRÅDE = "*",
  INDBLAND = c("Almindelig personbil","Lastbil over 3.500 kg.","Cykel","Fodgænger"),
  ALDER = "*",
  KØN = c("Mænd","Kvinder"),
  Tid = "*"
) 

# hente data via filtre 
uheldsdata <- dst_get_data(table = "UHELDK1", query = uheld_meta_filters, lang = "da")

ALLTABLE <- dkstat::dst_get_tables()
View(ALLTABLE)

RegMeta <- dst_meta("INDKFPP3")

RegMeta$variables

my_query <- list(
  REGION = c("Hele landet", "København", "Frederiksberg", "Odense"),
  ENHED = "Ugift",
  KOEN = "*"
  INDKINTB = "*"
  TID = "*"
)

dfIndk <- dst_get_data("INDKFPP3", query = myquery)

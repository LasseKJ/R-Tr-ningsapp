source("util.R")
source("GetPlanes.R")

baseurlny <- "https://opensky-network.org/api/states/all"

#Indsæt Koordinater

lomin <- 34.898071
lamin <- 31.344254
lomax <- 35.606689
lamax <- 32.537552

NyUrl <- paste0(
  baseurlny,
  "?lamin=", lamin,
  "&lomin=", lomin,
  "&lamax=", lamax,
  "&lomax=", lomax
)

token <- getToken()

dfkurt <- getRawFromUrl(NyUrl,token)

dfkurt$status_code 
current=content(dfkurt, as="text")
currentJS=fromJSON(current)
currentJS$states
OverOmrådeDF=currentJS$states
OverOmrådeDF=as.data.frame(OverOmrådeDF)

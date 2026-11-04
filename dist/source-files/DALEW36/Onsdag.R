library(skimr)
library(readxl)

# retrieve data
dfbilbase <- read.csv("https://raw.githubusercontent.com/cphstud/RIntroData/refs/heads/master/bilbasen.csv")

# data prep
summary(dfbilbase)
str(dfbilbase)


# samplerow
testrow <- dfbilbase[23,]
skim(dfbilbase)

# extract NA på mpg
mpglv <- is.na(dfbilbase$mpg)
sum(mpglv)
mpglv
mpgNA <- dfbilbase[mpglv,]
saveRDS(mpgNA,"underligeBiler.rds")
write.csv(mpgNA,"underligeBiler.csv")

dfbilbaseSub <- dfbilbase[!mpglv,]

# outliers
# kontinuerte variabler
ggplot(dfbilbaseSub, aes(price))+
  geom_boxplot()
boxplot(dfbilbaseSub$price)
boxplot(dfbilbaseSub2$price)

summary(dfbilbaseSub$price)

# subsette
dfbilbaseSub2 <- dfbilbaseSub[(dfbilbaseSub$price < 250000),]
dfbilbaseSub3 <- dfbilbaseSub2[(dfbilbaseSub2$year > 2000 ),]
dfbilbasePriceOutlier <- dfbilbaseSub[(dfbilbaseSub$price >= 250000),]
dfbilbaseAgeOutlier <- dfbilbaseSub2[(dfbilbaseSub2$year <= 2000),]

library(ggplot2)
ggplot(dfbilbasePriceOutlier, aes(price))+
  geom_histogram()
hist(dfbilbasePriceOutlier$price,breaks = 23)


## data engineering 
# cont: alder
summary(dfbilbaseSub2$year)
boxplot(dfbilbaseSub2$year)
dfbilbaseSub3$age=2023-(dfbilbaseSub3$year)



deltagere <-  list("deltager"="kurt")
v1 <- runif(5,25,40)
v2 <- runif(2,40,60)
v3 <- runif(6,25,40)
v4 <- runif(3,40,60)
deltagere <-  list("deltager"=
                     list("32"=list("navn"="Kurt","alder"=45,
                                    "løb"= list("DHL"=v3,"ERM"=v4)), 
                          "33"=list("navn"="Valde","alder"=12,
                                    "løb"= list("DHL"=v1,"ERM"=v2)),
                          "34"=list("navn"="Anto","alder"=12,
                                    "løb"= list("DHL"=v1,"ERM"=v2)),
                          "35"=list("navn"="Louise","alder"=12,
                                    "løb"= list("DHL"=v1,"ERM"=v2))
                     )
)

dfestonia=read.csv("https://raw.githubusercontent.com/cphstud/RIntroData/refs/heads/master/estonia-passenger-list.csv")

saveRDS(dfestonia,"estonia.rds")

# ny kolonne
dfestonia$AgeCat="A"

# subset alle voksne
newdf=dfestonia$Age > 18
kids=dfestonia$Age <= 18
newdf
newAdults=dfestonia[newdf,]
newKids=dfestonia[kids,]

# compare dk and sweeden
(unique(dfestonia$Country))
unique(dfestonia$Category)
table(dfestonia$Category)/sum(table(dfestonia$Category))
table(dfestonia$Survived)/sum(table(dfestonia$Survived))
table(dfestonia$Survived)
ctrv=dfestonia$Country %in% c("Denmark","Sweden")
dfdkse=dfestonia[ctrv,]

# 
myAgeCat <- function(age) {
  retval=0
  # logik der inddeler i kategorier
  if (age < 5) {
    retval="I"
  } else if (age >= 5 & age < 12) {
    retval="C"
  } else {
    retval="A"
  } 
  return(retval)
}

dfestonia$AgeCat=sapply(dfestonia$Age, FUN=myAgeCat)

table(dfestonia$AgeCat)





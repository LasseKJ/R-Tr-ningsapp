##Terning som viser 2 terning kast

roll <- function () {
  die <- 1:6
  dice <- sample(die, size = 2, replace = TRUE)
  dice
}

##Terning som viser sum af to terning kast

SumRoll <- function () {
  die <- 1:6
  dice <- sample(die, size = 2, replace = TRUE)
  sum(dice)
}

##Terning som viser Qplot ud fra 10000 kast

QplotUV <- function(x) {
  replicate(x, SumRoll)
  qplot(SumRoll, binwith = 10)
}

##Terning som viser Qplot ud fra 10000 vægtede kast

QplotV <- function() {
  replicate(10000, rolls)
  qplot(rolls, binwith = 10)
}


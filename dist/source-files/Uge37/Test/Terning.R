die <- 1:6
dice <- sample(die, size = 2, replace = TRUE)
sumterning <- function() {
  dice <- sample(die, size = 2, replace = TRUE)
  sum(dice)
}

replicate(10000, sumterning())

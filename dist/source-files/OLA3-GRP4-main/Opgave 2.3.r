forudsigelse <- predict(
  pcr.fit11,
  newdata = tail(forv1_kvt, 1),
  ncomp = 2
)

forudsigelse

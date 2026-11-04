#-----------------------------------------------
# Multipel lineær regression med alle 11 spørgsmål
#-----------------------------------------------
model_multipel <- lm(Realvaekst ~ ., data = multipel_data)

summary(model_multipel)

library(pls)

# Brug alle 11 spørgsmål og realvæksten
pca_data <- na.omit(multipel_data)

# PCA-regression
set.seed(123)

pcr.fit11 <- pcr(
  Realvaekst ~ .,
  data = pca_data,
  scale = TRUE,
  validation = "CV"
)

summary(pcr.fit11)

# Loadings på første komponent
loadings1 <- as.matrix(pcr.fit$loadings)[, 1]

# Kvadrerede loadings som procentandele
pca_resultater <- data.frame(
  Spoergsmaal = names(loadings1),
  Loading = loadings1,
  Vaegt_procent = 100 * loadings1^2
)

# Sortér største vægt øverst
pca_resultater <- pca_resultater[
  order(pca_resultater$Vaegt_procent, decreasing = TRUE),
]

View(pca_resultater)

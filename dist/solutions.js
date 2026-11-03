// Curated, runnable alternatives. A package is shown only where it offers a relevant method.
const option=(label,code,note='')=>({label,code,note});
const base=code=>option('Base R',code);
const dplyr=code=>option('dplyr',code);
const alternatives={
 'v-seq':[base('alder <- 15:50')],
 'v-income':[base('indkomst <- 10000 + (seq_len(36) - 1) * 5000')],
 'v-index':[base('x[seq(from = 1, by = 2, length.out = 3)]')],
 'v-matrix':[base('m <- matrix(1:6, 3, 2)')],
 'v-list':[base('profil[["person"]][["alder"]]')],
 'd-head':[base('biler[seq_len(6), ]'),dplyr('dplyr::slice_head(biler, n = 6)')],
 'd-dim':[base('c(nrow(biler), ncol(biler))')],
 'd-column':[base('biler[["mpg"]]'),dplyr('dplyr::pull(biler, mpg)')],
 'd-select':[base('subset(biler, select = c(mpg, hp))'),dplyr('dplyr::select(biler, mpg, hp)')],
 'd-last':[base('tail(biler, 1)'),dplyr('dplyr::slice_tail(biler, n = 1)')],
 'd-kw':[base('biler <- transform(biler, hp_kw = hp * 0.7457)'),dplyr('biler <- dplyr::mutate(biler, hp_kw = hp * 0.7457)')],
 'd-weight':[base('biler <- transform(biler, weight_kg = wt * 1000 * 0.453592)'),dplyr('biler <- dplyr::mutate(biler, weight_kg = wt * 1000 * 0.453592)')],
 'd-drop':[base('subset(biler, select = -c(disp, carb))'),dplyr('dplyr::select(biler, -disp, -carb)'),option('dplyr med pipe','biler |> dplyr::select(-disp, -carb)')],
 'f-sort':[dplyr('dplyr::arrange(biler, mpg)')],
 'f-top':[dplyr('biler |> dplyr::arrange(dplyr::desc(mpg)) |> dplyr::slice_head(n = 5)')],
 'u-temp':[base('c_til_f <- function(x) {\n  return(x * 9 / 5 + 32)\n}')],
 'u-inches':[base('tommer_til_cm <- function(x) {\n  return(x * 2.54)\n}')],
 'u-loop':[base('total <- 0\nfor (i in seq_along(priser)) {\n  total <- total + priser[i]\n}')],
 'u-loop-vector':[base('kategori <- character(length(alder))\ni <- 1\nfor (a in alder) {\n  if (a >= 18) kategori[i] <- "voksen" else kategori[i] <- "barn"\n  i <- i + 1\n}')],
 'u-loop-rows':[base('omsaetning <- salg$pris * 0\nfor (i in seq_along(omsaetning)) omsaetning[i] <- salg$pris[i] * salg$antal[i]')],
 'u-loop-list':[base('gennemsnit <- rep(0, length(loeb))\nnames(gennemsnit) <- names(loeb)\nfor (navn in names(loeb)) gennemsnit[navn] <- mean(loeb[[navn]])')],
 'u-loop-matrix':[base('raekkesum <- rep(0, nrow(m))\nfor (raekke in seq_along(raekkesum)) {\n  for (kolonne in seq_along(m[raekke, ])) raekkesum[raekke] <- raekkesum[raekke] + m[raekke, kolonne]\n}')],
 'u-loop-time':[base('aendring <- rep(NA_real_, length(indeks))\nfor (i in seq_along(indeks)[-1]) aendring[i] <- indeks[i] - indeks[i - 1]')],
 'u-loop-sim':[base('forsogsnumre <- sort(unique(forsog))\nantal_seks <- rep(0L, length(forsogsnumre))\nnames(antal_seks) <- forsogsnumre\nfor (forsog_nr in forsogsnumre) antal_seks[as.character(forsog_nr)] <- sum(kast[forsog == forsog_nr] == 6)')],
 'u-loop-flights':[base('fly <- unique(spor$fly)\nstigning <- rep(0, length(fly))\nnames(stigning) <- fly\nfor (fly_id in fly) {\n  hoejder <- spor$hoejde[spor$fly == fly_id]\n  forskelle <- diff(hoejder)\n  stigning[fly_id] <- sum(forskelle[forskelle > 0])\n}')],
 'u-vector':[base('priser - sum(priser) / length(priser)'),dplyr('data.frame(pris = priser) |> dplyr::mutate(forskel = pris - mean(pris)) |> dplyr::pull(forskel)')],
 'u-ifelse':[dplyr('dplyr::if_else(alder >= 18, "voksen", "barn")'),dplyr('dplyr::case_when(alder >= 18 ~ "voksen", .default = "barn")')],
 'u-apply':[base('vapply(loeb, mean, numeric(1))')],
 's-mean':[dplyr('biler |> dplyr::summarise(resultat = mean(mpg)) |> dplyr::pull(resultat)')],
 's-na':[base('mean(x[!is.na(x)])'),dplyr('data.frame(x = x) |> dplyr::summarise(resultat = mean(x, na.rm = TRUE)) |> dplyr::pull(resultat)')],
 's-count':[base('length(which(is.na(x)))')],
 's-clean':[dplyr('dplyr::filter(biler, !is.na(mpg))'),option('tidyr','tidyr::drop_na(biler, mpg)')],
 's-sd':[base('sqrt(var(priser))')],
 's-group':[dplyr('biler |> dplyr::group_by(cyl) |> dplyr::summarise(mpg = mean(mpg), .groups = "drop")')],
 's-na-debug':[base('na.omit(x) |> as.vector()'),option('tidyr','tidyr::drop_na(data.frame(x = x), x) |> dplyr::pull(x)')],
 'm-dice':[base('kast <- sample(x = seq_len(6), size = 100, replace = TRUE)')],
 'm-prob':[base('sum(kast == 6) / length(kast)')],
 'm-replicate':[base('summer <- replicate(n = 200, expr = sum(sample(x = 1:6, size = 2, replace = TRUE)))')],
 'm-quarter':[base('(maaned - 1) %/% 3 + 1')],
 'm-growth':[base('((nu - foer) / foer) * 100')],
 'm-lm':[base('model <- lm(formula = mpg ~ wt, data = biler)')],
 'm-r2':[base('summary(model)[["r.squared"]]')],
 'm-merge':[dplyr('dplyr::inner_join(forbrug, tillid, by = "kvartal")')],
 'd-first-five':[base('head(biler, 5)'),dplyr('dplyr::slice_head(biler, n = 5)')],
 'd-four-columns':[dplyr('dplyr::select(biler, mpg, hp, wt, cyl)')],
 'f-hp-desc':[dplyr('dplyr::arrange(biler, dplyr::desc(hp))')],
 'd-high-mpg':[base('biler <- transform(biler, high_mpg = mpg > 20)'),dplyr('biler <- dplyr::mutate(biler, high_mpg = mpg > 20)')],
 'd-new-ten':[base('biler[seq_len(10), ]'),dplyr('dplyr::slice_head(biler, n = 10)')],
 'pkg-filter':[base('biler[biler$cyl %in% c(4, 8), ]'),base('subset(biler, cyl %in% c(4, 8))')],
 'pkg-select':[base('biler[, c("mpg", "hp", "wt", "cyl")]')],
 'pkg-arrange':[base('biler[order(biler$hp, decreasing = TRUE), ]')],
 'pkg-mutate':[base('transform(biler, hp_kw = hp * 0.7457)')],
 'pkg-rename':[base('resultat <- fly\nnames(resultat)[names(resultat) == "kode"] <- "operator"\nresultat')],
 'pkg-group':[base('resultat <- aggregate(value ~ OMRÅDE, data = kommuner, FUN = function(x) sd(x, na.rm = TRUE), na.action = na.pass)\nnames(resultat)[names(resultat) == "value"] <- "spredning"\nresultat')],
 'pkg-json':[option('jsonlite med namespace','currentJS <- jsonlite::fromJSON(current)')],
 'pkg-json-flat':[option('jsonlite i to trin','resultat <- jsonlite::fromJSON(tyk2, flatten = TRUE)\nas.data.frame(resultat)')],
 'pkg-str-c':[base('paste("Hej", navn, efternavn)'),option('stringr med sep','stringr::str_c("Hej", navn, efternavn, sep = " ")')],
 'pkg-str-detect':[base('grepl("Gas|gas", title)')],
 'pkg-str-extract':[base('sub("[0-9].*$", "", callsign)')],
 'pkg-combined':[base('currentDF[grepl("Iraq", currentDF$origin_country), ]'),option('dplyr + Base R','dplyr::filter(currentDF, grepl("Iraq", origin_country))')],
 'pkg-wider':[base('bred <- xtabs(value ~ TID + INDIKATOR, data = forventninger)\ndata.frame(TID = rownames(bred), as.data.frame.matrix(bred), row.names = NULL, check.names = FALSE)')]
};
const conditions={'f-hp':'hp > 150','f-cyl':'cyl >= 6','f-and':'cyl == 4 & mpg > 20','f-or':'cyl %in% c(4, 8)','f-debug':'cyl == 6 & hp > 100','f-mpg':'mpg > 20','f-eight':'cyl == 8','f-hp-atleast':'hp >= 150','f-five-and':'cyl == 5 & mpg > 20'};
for(const [id,condition] of Object.entries(conditions))alternatives[id]=[base(`subset(biler, ${condition})`),dplyr(`dplyr::filter(biler, ${condition})`),option('dplyr med pipe',`biler |> dplyr::filter(${condition})`)];
for(const [id,fn,column] of [['s-hp-min','min','hp'],['s-hp-max','max','hp'],['s-mpg-median','median','mpg'],['s-mpg-sd','sd','mpg'],['s-mpg-min','min','mpg'],['s-mpg-max','max','mpg'],['s-mpg-count','length','mpg']])alternatives[id]=[dplyr(`biler |> dplyr::summarise(resultat = ${fn}(${column})) |> dplyr::pull(resultat)`)];
export function solutionOptions(ex){
 if(['choice','output'].includes(ex.kind))return [option('Svar',ex.solution)];
 const primary=option(ex.packages?.length?ex.packages.join(' + '):'Base R',ex.solution);
 let extra=alternatives[ex.id]||[];
 if(ex.id.startsWith('gg-')) {
   const geom=ex.solution.includes('geom_boxplot')?'geom_boxplot':'geom_line';
   const pattern=/ggplot\((\w+), aes\((.*)\)\) \+ geom_\w+\(\)/;
   const match=ex.solution.match(pattern);
   if(match)extra=[option('ggplot2 · aes i laget',`ggplot(${match[1]}) + ${geom}(aes(${match[2]}))`),option('ggplot2 med pipe',`${match[1]} |> ggplot(aes(${match[2]})) + ${geom}()`)];
 }
 if(ex.id.startsWith('variant-')){
  const filter=ex.solution.match(/^biler\[biler\$hp > (\d+), \]$/);
  if(filter)extra=[base(`subset(biler, hp > ${filter[1]})`),dplyr(`dplyr::filter(biler, hp > ${filter[1]})`)];
  else if(ex.solution==='mean(x, na.rm = TRUE)')extra=[base('mean(x[!is.na(x)])')];
  else if(ex.solution.includes('function(x)'))extra=[base(ex.solution.replace('function(x) ','function(x) { return(')+') }')];
  else {const seq=ex.solution.match(/seq\((\d+), by = (\d+), length.out = (\d+)\)/);if(seq)extra=[base(`x <- ${seq[1]} + (seq_len(${seq[3]}) - 1) * ${seq[2]}`)];}
 }
 const seen=new Set();return [primary,...extra].filter(x=>{if(seen.has(x.code))return false;seen.add(x.code);return true;});
}

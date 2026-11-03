import {packageExports} from './package-exports.js';
export const runtimePackages=['jsonlite','stringr','tidyr','ggplot2','dplyr'];
export function requiredPackages(exercise,code,grade=true){
 const source=[exercise.setup||'',code,grade?exercise.solution||'':''].join('\n');
 const selected=new Set(exercise.packages||[]);
 for(const pkg of runtimePackages)if(new RegExp('\\b'+pkg+'\\s*:::?|(?:library|require)\\s*\\(\\s*["\']?'+pkg+'\\b').test(source))selected.add(pkg);
 const clean=source.replace(/#[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g,' ');
 const preferred=['dplyr','tidyr','stringr','jsonlite','ggplot2'];
 for(const match of clean.matchAll(/([A-Za-z.][\w.]*)\s*\(/g)){
  const pkg=preferred.find(p=>packageExports[p]?.includes(match[1]));if(pkg)selected.add(pkg);
 }
 return runtimePackages.filter(p=>selected.has(p));
}
// R is evaluated in a WebAssembly worker. No submitted code is sent to a server.
const CDN='https://webr.r-wasm.org/v0.6.0/';
let instance=null,startingInstance=null,initializing=null,generation=0;const installedPackages=new Set();
export function deadline(promise,ms,message,onTimeout=()=>{}){
 let timer;return Promise.race([promise,new Promise((_,reject)=>timer=setTimeout(()=>{onTimeout();reject(new Error(message));},ms))]).finally(()=>clearTimeout(timer));
}
export async function getEngine(status=()=>{}){
 if(instance)return instance;if(initializing)return initializing;
 const current=generation,started=Date.now();status('Henter R-motor…');
 const ticker=setInterval(()=>status('Henter R-motor… ('+Math.floor((Date.now()-started)/1000)+' sek.). Du kan stoppe indlæsningen.'),1000);
 const pending=(async()=>{
  let r;
  try{
   return await deadline((async()=>{
    const {WebR}=await import(CDN+'webr.mjs');if(current!==generation)throw Error('Indlæsningen blev stoppet.');
    r=new WebR({baseUrl:CDN,channelType:3,interactive:false});startingInstance=r;await r.init();
    if(current!==generation)throw Error('R-motoren blev genstartet.');instance=r;status('R er klar');return r;
   })(),60000,'R-motoren kunne ikke indlæses. Dit svar er gemt. Kontrollér forbindelsen, og prøv igen.',()=>{if(current===generation)generation++;r?.close();});
  }catch(error){r?.close();status('Indlæsning stoppet — prøv igen');throw error;}
  finally{clearInterval(ticker);if(startingInstance===r)startingInstance=null;}
 })();
 initializing=pending;try{return await pending;}finally{if(initializing===pending)initializing=null;}
}
export function resetEngine(){generation++;installedPackages.clear();instance?.close();if(startingInstance&&startingInstance!==instance)startingInstance.close();instance=null;startingInstance=null;initializing=null;}
export function buildProgram(exercise,code,grade=true){
 const packages=requiredPackages(exercise,code,grade);
 const setup=JSON.stringify(exercise.setup||'');const submitted=JSON.stringify(code);const solution=JSON.stringify(exercise.solution||'NULL');
 // New environments on each run prevent state leaking between attempts.
 return `local({
   suppressPackageStartupMessages({ ${packages.map(p=>`library(${p})`).join("; ")} })
   .env <- new.env(parent = globalenv())
   .ref <- new.env(parent = globalenv())
   eval(parse(text = ${setup}), envir = .env)
   eval(parse(text = ${setup}), envir = .ref)
   .expr <- parse(text = ${submitted})
   # Match exercise object names without changing strings, function names or R syntax.
   .canonical <- character()
   .columns <- character()
   .collect <- function(x) {
     if (missing(x)) return(NULL)
     if (is.call(x) && identical(x[[1]], as.name("$")) && is.symbol(x[[3]])) .columns <<- c(.columns, as.character(x[[3]]))
     if (is.call(x) && as.character(x[[1]])[1] %in% c("<-", "=", "<<-")) {
       if (is.symbol(x[[2]])) .canonical <<- c(.canonical, as.character(x[[2]]))
     }
     if (is.call(x) || is.expression(x)) for (i in seq_along(x)) {
       if (!identical(x[[i]], quote(expr = ))) .collect(x[[i]])
     }
   }
   .collect(parse(text = ${setup}))
   .collect(parse(text = ${solution}))
   .canonical <- unique(.canonical)
   .normalize <- function(x) {
     if (missing(x)) return(NULL)
     if (is.symbol(x)) {
       i <- match(tolower(as.character(x)), tolower(.canonical))
       if (!is.na(i)) return(as.name(.canonical[[i]]))
     } else if (is.call(x) || is.expression(x)) {
       for (i in seq_along(x)) {
         if (identical(x[[i]], quote(expr = ))) next
         if (is.call(x) && identical(x[[1]], as.name("$")) && i == 3L) {
           j <- match(tolower(as.character(x[[i]])), tolower(.columns))
           if (!is.na(j)) x[[i]] <- as.name(.columns[[j]])
           next
         }
         if (is.call(x) && identical(x[[1]], as.name("@")) && i == 3L) next
         x[i] <- list(.normalize(x[[i]]))
       }
     }
     x
   }
   .expr <- .normalize(.expr)
   .value <- withVisible(eval(.expr, envir = .env))
   if (.value$visible) print(.value$value)
   # Also accept differently capitalized names created via assign().
   for (.name in .canonical) {
     .matches <- ls(.env, all.names = TRUE)
     .matches <- .matches[tolower(.matches) == tolower(.name)]
     if (!exists(.name, .env, inherits = FALSE) && length(.matches) == 1L) assign(.name, get(.matches, .env), .env)
   }
   for (.name in ls(.env, all.names = TRUE)) {
     .object <- get(.name, .env)
     if (is.data.frame(.object)) {
       .indices <- match(tolower(names(.object)), tolower(.columns))
       .known <- !is.na(.indices)
       names(.object)[.known] <- .columns[.indices[.known]]
       assign(.name, .object, .env)
     }
   }
   .env$.answer <- .value$value
   .env$.user_expr <- .expr
   .env$.plot_matches <- function(actual, expected, geom, columns, separate_colours = FALSE) {
     tryCatch({
       if (!inherits(actual, "ggplot") || !inherits(expected, "ggplot")) return(FALSE)
       layer <- which(vapply(actual$layers, function(x) inherits(x$geom, geom), logical(1)))
       if (length(layer) != 1L || !inherits(actual$coordinates, "CoordCartesian") || inherits(actual$coordinates, "CoordFlip")) return(FALSE)
       a <- ggplot2::ggplot_build(actual)$data[[layer]]
       b <- ggplot2::ggplot_build(expected)$data[[1]]
       if (!all(columns %in% names(a)) || nrow(a) != nrow(b)) return(FALSE)
       if (separate_colours && length(unique(a$colour)) != length(unique(b$colour))) return(FALSE)
       if (geom == "GeomLine") {
         # Compare complete lines, so group IDs and palette choices may differ.
         normalize_groups <- function(data) {
           groups <- lapply(split(data[, c("x", "y"), drop = FALSE], data$group), function(g) {
             g <- g[order(g$x, g$y), , drop = FALSE]; rownames(g) <- NULL; g
           })
           keys <- vapply(groups, function(g) paste(unlist(g), collapse = ","), character(1))
           unname(groups[order(keys)])
         }
         return(isTRUE(all.equal(normalize_groups(a), normalize_groups(b), tolerance = 1e-7)))
       }
       a <- a[, columns, drop = FALSE]; b <- b[, columns, drop = FALSE]
       a <- a[do.call(order, unname(a)), , drop = FALSE]; b <- b[do.call(order, unname(b)), , drop = FALSE]
       rownames(a) <- NULL; rownames(b) <- NULL
       isTRUE(all.equal(a, b, tolerance = 1e-7))
     }, error = function(e) FALSE)
   }
   .equivalent <- function(actual, expected) {
     if (is.data.frame(actual) && is.data.frame(expected)) {
       actual <- as.data.frame(actual); expected <- as.data.frame(expected)
       names(actual) <- tolower(names(actual)); names(expected) <- tolower(names(expected))
       if (!identical(dim(actual), dim(expected))) return(FALSE)
       if (!${exercise.comparison?.columnOrderMatters?'TRUE':'FALSE'}) {
         if (!setequal(names(actual), names(expected)) || anyDuplicated(names(actual))) return(FALSE)
         actual <- actual[, names(expected), drop = FALSE]
       }
       ${exercise.comparison?.sortBy?`if (!(${JSON.stringify(exercise.comparison.sortBy)} %in% names(actual))) return(FALSE)
       .key <- actual[[${JSON.stringify(exercise.comparison.sortBy)}]]
       if (is.unsorted(${exercise.comparison.descending?'rev(.key)':'.key'})) return(FALSE)` : ''}
       if (!${exercise.comparison?.rowOrderMatters?'TRUE':'FALSE'} && nrow(actual) > 0L) {
         actual <- actual[do.call(order, unname(actual)), , drop = FALSE]
         expected <- expected[do.call(order, unname(expected)), , drop = FALSE]
       }
       rownames(actual) <- NULL; rownames(expected) <- NULL
       return(isTRUE(all.equal(actual, expected, tolerance = 1e-7)))
     }
     if (is.atomic(actual) && is.atomic(expected) && is.null(dim(actual)) && is.null(dim(expected)) && !is.null(names(actual)) && !is.null(names(expected))) {
       names(actual) <- tolower(names(actual)); names(expected) <- tolower(names(expected))
       if (!anyDuplicated(names(actual)) && !anyDuplicated(names(expected)) && setequal(names(actual), names(expected))) actual <- actual[names(expected)]
     }
     if (${exercise.comparison?.valueOrderMatters===false?'TRUE':'FALSE'} && is.atomic(actual) && is.atomic(expected) && is.null(dim(actual)) && is.null(dim(expected))) {
       actual <- sort(actual, na.last = TRUE); expected <- sort(expected, na.last = TRUE)
     }
     isTRUE(all.equal(actual, expected, tolerance = 1e-7))
   }
   ${grade?` .expected <- eval(parse(text = ${solution}), envir = .ref)
   .env$.expected <- .expected
   .ok <- tryCatch(isTRUE(${exercise.check?`eval(parse(text = ${JSON.stringify(exercise.check)}), envir = .env)`:'.equivalent(.value$value, .expected)'}), error = function(e) FALSE)
   .ok`:'TRUE'}
 })`;
}
export async function runCode(exercise,code,{grade=true,status=()=>{}}={}){
 const r=await getEngine(status);
 const packages=requiredPackages(exercise,code,grade);
 for(const pkg of packages.filter(p=>!installedPackages.has(p))){
  const started=Date.now();status('Henter '+pkg+'… (0 sek.)');
  const ticker=setInterval(()=>status('Henter '+pkg+'… ('+Math.floor((Date.now()-started)/1000)+' sek.). Du kan stoppe og prøve igen.'),1000);
  let timer;try{
   await Promise.race([r.installPackages([pkg]),new Promise((_,reject)=>timer=setTimeout(()=>{resetEngine();reject(new Error('Hentning af '+pkg+' tog for lang tid. Dit svar er gemt. Prøv igen, eller brug base R uden at hente pakker.'));},45000))]);
   if(instance!==r)throw new Error('Indlæsningen blev stoppet. Dit svar er gemt.');
   installedPackages.add(pkg);
  }finally{clearTimeout(timer);clearInterval(ticker);}
 }
 status(packages.length?'R og de nødvendige pakker er klar':'R er klar');
 const shelter=await new r.Shelter();let timer;
 try{
  const capture=await Promise.race([shelter.captureR(buildProgram(exercise,code,grade),{captureGraphics:{width:620,height:380}}),new Promise((_,reject)=>timer=setTimeout(()=>{resetEngine();reject(new Error('Kørslen blev stoppet efter 15 sekunder. Se efter en uendelig løkke eller en meget stor beregning.'));},15000))]);
  const output=capture.output.filter(x=>x.type==='stdout'||x.type==='stderr').map(x=>x.data).join('\n');
  const errors=capture.output.filter(x=>x.type==='error').map(x=>x.data?.message||x.data||'R-fejl');
  if(errors.length){let message=errors.join('\n');if(/object .+ not found/i.test(message)&&/select\s*\(/.test(code))message+='\nVed select() skal datasættet med: select(biler, -disp) eller biler |> select(-disp). Kolonnenavne som disp skal ikke oprettes som egne objekter.';throw new Error(message);}
  let correct=false;try{correct=await capture.result.toBoolean();}catch{throw new Error(output||'Koden kunne ikke køres.');}
  return {correct,output:output||'Koden blev kørt uden tekstoutput.',images:capture.images};
 }finally{clearTimeout(timer);if(instance===r)await shelter.purge();}
}

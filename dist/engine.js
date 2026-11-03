// R is evaluated in a WebAssembly worker. No submitted code is sent to a server.
const CDN='https://webr.r-wasm.org/v0.6.0/';
let instance=null,initializing=null,generation=0;const installedPackages=new Set();
export async function getEngine(status=()=>{}){
 if(instance)return instance;
 if(initializing)return initializing;
 status('Henter R-motor…');const current=generation;
 initializing=(async()=>{const {WebR}=await import(CDN+'webr.mjs');const r=new WebR({baseUrl:CDN,channelType:3,interactive:false});
 let timer;try{await Promise.race([r.init(),new Promise((_,reject)=>timer=setTimeout(()=>reject(new Error('R-motoren kunne ikke indlæses. Kontrollér internetforbindelsen og prøv igen.')),90000))]);if(current!==generation){r.close();throw new Error('R-motoren blev genstartet.');}instance=r;status('R er klar');return r;}catch(e){r.close();throw e;}finally{clearTimeout(timer);}})();
 try{return await initializing;}finally{initializing=null;}
}
export function resetEngine(){generation++;installedPackages.clear();if(instance){instance.close();instance=null;}initializing=null;}
export function buildProgram(exercise,code,grade=true){
 const setup=JSON.stringify(exercise.setup||'');const submitted=JSON.stringify(code);const solution=JSON.stringify(exercise.solution||'NULL');
 // New environments on each run prevent state leaking between attempts.
 return `local({
   .env <- new.env(parent = globalenv())
   .ref <- new.env(parent = globalenv())
   eval(parse(text = ${setup}), envir = .env)
   eval(parse(text = ${setup}), envir = .ref)
   .expr <- parse(text = ${submitted})
   # Match exercise object names without changing strings, function names or R syntax.
   .canonical <- character()
   .collect <- function(x) {
     if (missing(x)) return(NULL)
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
         # Preserve literal column names after $ and @.
         if (is.call(x) && as.character(x[[1]])[1] %in% c("$", "@") && i == 3L) next
         x[i] <- list(.normalize(x[[i]]))
       }
     }
     x
   }
   .expr <- .normalize(.expr)
   .value <- withVisible(eval(.expr, envir = .env))
   if (.value$visible) print(.value$value)
   .env$.answer <- .value$value
   .env$.user_expr <- .expr
   ${grade?` .expected <- eval(parse(text = ${solution}), envir = .ref)
   .env$.expected <- .expected
   .ok <- tryCatch(isTRUE(${exercise.check?`eval(parse(text = ${JSON.stringify(exercise.check)}), envir = .env)`:'all.equal(.value$value, .expected, tolerance = 1e-7)'}), error = function(e) FALSE)
   .ok`:'TRUE'}
 })`;
}
export async function runCode(exercise,code,{grade=true,status=()=>{}}={}){
 const r=await getEngine(status);
 const missing=(exercise.packages||[]).filter(p=>!installedPackages.has(p));
 if(missing.length){status('Klargør '+exercise.packages.join(', ')+'…');let installTimer;try{await Promise.race([r.installPackages(missing),new Promise((_,reject)=>installTimer=setTimeout(()=>{resetEngine();reject(new Error('Pakkerne kunne ikke hentes. Kontrollér forbindelsen og prøv igen.'));},90000))]);}finally{clearTimeout(installTimer);}missing.forEach(p=>installedPackages.add(p));status('R og pakker er klar');}
 const shelter=await new r.Shelter();let timer;
 try{
  const capture=await Promise.race([shelter.captureR(buildProgram(exercise,code,grade),{captureGraphics:{width:620,height:380}}),new Promise((_,reject)=>timer=setTimeout(()=>{resetEngine();reject(new Error('Kørslen blev stoppet efter 15 sekunder. Se efter en uendelig løkke eller en meget stor beregning.'));},15000))]);
  const output=capture.output.filter(x=>x.type==='stdout'||x.type==='stderr').map(x=>x.data).join('\n');
  const errors=capture.output.filter(x=>x.type==='error').map(x=>x.data?.message||x.data||'R-fejl');
  if(errors.length)throw new Error(errors.join('\n'));
  let correct=false;try{correct=await capture.result.toBoolean();}catch{throw new Error(output||'Koden kunne ikke køres.');}
  return {correct,output:output||'Koden blev kørt uden tekstoutput.',images:capture.images};
 }finally{clearTimeout(timer);if(instance===r)await shelter.purge();}
}

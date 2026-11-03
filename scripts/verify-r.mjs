// WEBR_MODULE may point to a local WebR 0.6.0 webr.mjs for offline/CI verification.
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import {exercises,makeVariant} from '../dist/course.js';
import {buildProgram,runtimePackages} from '../dist/engine.js';
const {WebR}=await import(process.env.WEBR_MODULE?pathToFileURL(process.env.WEBR_MODULE).href:'webr');
const r=new WebR();await r.init();
const check=code=>r.evalRBoolean(code,{captureStreams:true});
let passed=0;
try{
 await r.installPackages(runtimePackages);
 for(const ex of [...exercises,...Array.from({length:16},(_,i)=>makeVariant(i))].filter(e=>!['choice','output'].includes(e.kind))){
  if(ex.packages?.length)await r.installPackages(ex.packages);
  const result=await check(buildProgram(ex,ex.solution));assert.equal(result,true,`Solution rejected: ${ex.id}`);
  const name=ex.solution.match(/^([A-Za-z_][A-Za-z_0-9]*)\s*(?:<-|=)/)?.[1];
  if(name)assert.equal(await check(buildProgram(ex,ex.solution.replace(new RegExp('\\b'+name+'\\b','g'),name.toUpperCase()))),true,`Capitalized object rejected: ${ex.id}`);
  const wrong=await check(buildProgram(ex,'NULL'));assert.equal(wrong,false,`Empty solution accepted: ${ex.id}`);passed++;
 }
 const temp=exercises.find(e=>e.id==='u-temp');assert.equal(await r.evalRBoolean(buildProgram(temp,'c_til_f <- function(x) 32')),false);
 const filter=exercises.find(e=>e.id==='f-and');assert.equal(await r.evalRBoolean(buildProgram(filter,'biler[biler$cyl == 4 | biler$mpg > 20, ]')),false);
 const loop=exercises.find(e=>e.id==='u-loop');assert.equal(await r.evalRBoolean(buildProgram(loop,'total <- sum(priser)')),false);
 assert.equal(await r.evalRBoolean(buildProgram(exercises[0],'alder = 15:50')),true);
 const matrix=exercises.find(e=>e.id==='v-matrix');
 assert.equal(await check(buildProgram(matrix,'M = matrix(1:6, 3, 2); M')),true);
 const income=exercises.find(e=>e.id==='v-income');
 assert.equal(await check(buildProgram(income,'Indkomst = seq(10000, by = 5000, length.out = 36)')),true);
 assert.equal(await check(buildProgram(income,'INDKOMST <- seq(10000, by=5000, length.out=35)')),false);
 assert.equal(await check(buildProgram(temp,'C_TIL_F <- function(x) x * 9/5 + 32')),true);
 assert.equal(await check(buildProgram(exercises[0],'Alder <- 15:50; Alder')),true);
 const equivalentCases=[
 ['d-drop','select(biler, -disp, -carb)',true],
 ['d-drop','biler |> select(-disp, -carb)',true],
 ['f-hp','filter(biler, hp > 150)',true],
 ['d-kw','biler <- mutate(biler, hp_kw = hp * 0.7457)',true],
 ['f-hp','subset(biler, hp > 150)[nrow(subset(biler, hp > 150)):1, ]',true],
 ['f-hp','subset(biler, hp > 150)[, rev(names(biler))]',true],
 ['f-hp','subset(biler, hp > 150)[rep(1, nrow(subset(biler, hp > 150))), ]',false],
 ['d-select','biler[, c("hp", "mpg")]',false],
 ['d-first-five','biler[5:1, ]',false],
 ['f-sort','biler[order(biler$mpg, decreasing=TRUE), ]',false],
 ['f-sort','biler[order(biler$mpg, -biler$hp), ]',true],
 ['v-index','x[c(5, 1, 3)]',true],
 ['v-index','x[c(5, 1, 1)]',false],
 ['d-kw','BILER$HP_KW <- BILER$HP * 0.7457',true],
 ['d-kw','biler[["HP_KW"]] <- biler$hp * 0.7457',true],
 ['v-income','assign("Indkomst", seq(10000, by=5000, length.out=36))',true],
 ['pkg-filter','as.data.frame(filter(biler, cyl %in% c(4,8))) |> as_tibble()',true],
 ['pkg-group','kommuner |> group_by(across(1)) |> summarise(Spredning=sd(value)) |> dplyr::slice(2:1)',true],
 ['pkg-select','select(biler, hp, mpg, wt, cyl)',false]
 ];
 for(const [id,code,expected] of equivalentCases)assert.equal(await check(buildProgram(exercises.find(e=>e.id===id),code)),expected,`Equivalent-answer policy: ${id}: ${code}`);
 console.log(`Verified ${passed} R solutions and negative cases, plus alternate syntax and targeted regressions.`);
}finally{r.close();}

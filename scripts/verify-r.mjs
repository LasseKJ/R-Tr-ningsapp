// WEBR_MODULE may point to a local WebR 0.6.0 webr.mjs for offline/CI verification.
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import {exercises,makeVariant} from '../dist/course.js';
import {buildProgram} from '../dist/engine.js';
const {WebR}=await import(process.env.WEBR_MODULE?pathToFileURL(process.env.WEBR_MODULE).href:'webr');
const r=new WebR();await r.init();
const check=code=>r.evalRBoolean(code,{captureStreams:true});
let passed=0;
try{
 for(const ex of [...exercises,...Array.from({length:16},(_,i)=>makeVariant(i))].filter(e=>!['choice','output'].includes(e.kind))){
  if(ex.packages?.length)await r.installPackages(ex.packages);
  const result=await check(buildProgram(ex,ex.solution));assert.equal(result,true,`Solution rejected: ${ex.id}`);
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
 console.log(`Verified ${passed} R solutions and negative cases, plus alternate syntax and targeted regressions.`);
}finally{r.close();}

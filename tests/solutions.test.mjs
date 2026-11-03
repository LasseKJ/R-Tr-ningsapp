import test from 'node:test';
import assert from 'node:assert/strict';
import {exercises,makeVariant} from '../dist/course.js';
import {solutionOptions} from '../dist/solutions.js';
test('all exercises and generated variants have labelled, nonduplicate solution options',()=>{
 for(const ex of [...exercises,...Array.from({length:16},(_,i)=>makeVariant(i))]){
 const options=solutionOptions(ex);assert.ok(options.length);assert.equal(options[0].code,ex.solution);
 assert.equal(new Set(options.map(s=>s.code)).size,options.length);
 assert.ok(options.every(s=>s.label&&s.code));
 }
});
test('filter and column exercises show Base R and dplyr even with no package tasks enabled',()=>{
 for(const id of ['f-hp','f-cyl','f-and','d-drop','d-select','d-kw','s-clean','m-merge']){
 const options=solutionOptions(exercises.find(e=>e.id===id));assert.ok(options.some(s=>s.label==='Base R'),id);assert.ok(options.some(s=>s.label==='dplyr'),id);
 }
 const options=solutionOptions(makeVariant(0));assert.ok(options.some(s=>s.label==='dplyr'));
});

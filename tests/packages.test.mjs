import test from 'node:test';
import assert from 'node:assert/strict';
import {exercises} from '../dist/course.js';
import {packageOptions,enabledExercises,normalizePackages} from '../dist/packages.js';
import {selectExam} from '../dist/progress.js';
test('base R is default and multiple package selections add only matching exercises',()=>{
 const base=enabledExercises(exercises);assert.equal(base.length,75);
 const selected=enabledExercises(exercises,['dplyr','jsonlite']);
 assert.ok(selected.some(e=>e.id==='pkg-filter'));assert.ok(selected.some(e=>e.id==='pkg-json'));
 assert.ok(!selected.some(e=>e.id==='pkg-str-c'||e.id==='pkg-combined'));
 const both=enabledExercises(exercises,['dplyr','stringr']);assert.ok(both.some(e=>e.id==='pkg-combined'));
 assert.ok(!enabledExercises(exercises,['stringr']).some(e=>e.id==='pkg-combined'));
 assert.deepEqual(normalizePackages(['dplyr','dplyr','bad','jsonlite']),['dplyr','jsonlite']);
 assert.deepEqual(normalizePackages(null),[]);
 const ids=selectExam(base);assert.ok(ids.every(id=>!exercises.find(e=>e.id===id).packages?.length));
});
test('each offered package has exercises and documented dependencies',()=>{
 for(const p of packageOptions)assert.ok(exercises.some(e=>e.packages?.includes(p.id)),p.id);
 for(const e of exercises)for(const p of e.packages||[])assert.ok(packageOptions.some(option=>option.id===p));
});

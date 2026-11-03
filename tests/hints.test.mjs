import test from 'node:test';import assert from 'node:assert/strict';
import {hintsFor} from '../dist/hints.js';import {exercises} from '../dist/course.js';
const task=id=>exercises.find(e=>e.id===id);
test('hints follow dplyr filtering rather than base indexing',()=>{
 const hints=hintsFor(task('f-hp'),'filter(biler, hp > 150)');assert.deepEqual(hints.map(h=>h.label),['dplyr']);assert.match(hints[0].text,/filter\(/);assert.doesNotMatch(hints[0].text,/data\[|biler\[/);
});
test('column removal hints follow select and the pipe in the current answer',()=>{
 const [hint]=hintsFor(task('d-drop'),'biler |> dplyr::select(-disp, -carb)');assert.equal(hint.label,'dplyr');assert.match(hint.text,/minus/);assert.match(hint.text,/Med pipe/);
});
test('typing a new method changes the hint without changing the exercise',()=>{
 const ex=task('d-kw');assert.match(hintsFor(ex,'biler$hp_kw <- biler$hp * 0.7457')[0].text,/biler\$hp/);
 const hints=hintsFor(ex,'biler <- mutate(biler, hp_kw = hp * 0.7457)');assert.equal(hints[0].label,'dplyr');assert.match(hints[0].text,/mutate\(/);
});
test('commented-out previous answers do not force their package on a fresh attempt',()=>{
 const hints=hintsFor(task('d-drop'),'# Tidligere besvarelse\n# dplyr::select(biler, -disp, -carb)');assert.ok(hints.some(h=>h.label==='Base R'));assert.ok(hints.some(h=>h.label==='dplyr'));
});
test('mixed methods receive package-specific hints and ggplot hints stay labelled correctly',()=>{
 const hints=hintsFor(task('pkg-combined'),'currentDF |> filter(str_detect(origin_country, "Iraq"))');assert.deepEqual(new Set(hints.map(h=>h.label)),new Set(['dplyr','stringr']));assert.match(hints.find(h=>h.label==='stringr').text,/str_detect/);assert.match(hints.find(h=>h.label==='dplyr').text,/filter/);
 assert.ok(hintsFor(task('gg-line'),'').every(h=>h.label!=='Base R'));
});

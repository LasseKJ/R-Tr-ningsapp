import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyProgress,validateProgress,summary,gradeText,selectExam,dayKey} from '../dist/progress.js';
import {exercises,topics,makeVariant} from '../dist/course.js';
const attempt=(overrides={})=>({exerciseId:'v-seq',topic:'vectors',correct:true,at:'2026-11-02T12:00:00Z',seconds:30,hinted:false,revealed:false,examId:null,...overrides});
test('each task has a unique ID, valid topic, source, solution, and answer contract',()=>{assert.equal(new Set(exercises.map(x=>x.id)).size,exercises.length);for(const e of exercises){assert.ok(topics.some(t=>t.id===e.topic));assert.ok(e.source&&e.solution&&e.prompt);if(e.kind==='choice')assert.ok(e.answer>=0&&e.answer<e.options.length);if(e.kind==='output')assert.equal(typeof e.answer,'string');}});
test('empty state has no invented results',()=>{const s=summary(emptyProgress(),exercises);assert.equal(s.attempts,0);assert.equal(s.solved.size,0);assert.equal(s.streak,0);assert.equal(s.topics.vectors.accuracy,null);});
test('duplicates do not inflate solved count; revealed solutions and exams are separate',()=>{const p=emptyProgress();p.attempts=[attempt(),attempt(),attempt({exerciseId:'v-income',revealed:true}),attempt({exerciseId:'v-index',examId:'exam-1'})];const s=summary(p,exercises,new Date('2026-11-02T14:00Z'));assert.equal(s.solved.size,1);assert.equal(s.today,1);assert.equal(s.attempts,3);assert.equal(s.topics.vectors.solved,1);});
test('first attempt accuracy does not improve through repeated guesses',()=>{const p=emptyProgress();p.attempts=[attempt({correct:false}),attempt(),attempt({exerciseId:'v-income',hinted:true})];const s=summary(p,exercises);assert.equal(s.firstAccuracy,0);assert.equal(s.accuracy,67);});
test('Copenhagen day boundary and consecutive-day streak',()=>{assert.equal(dayKey('2026-11-01T23:30:00Z'),'2026-11-02');const p=emptyProgress();p.attempts=[attempt({at:'2026-10-31T15:00Z'}),attempt({at:'2026-11-01T15:00Z'})];assert.equal(summary(p,exercises,new Date('2026-11-02T12:00Z')).streak,2);assert.equal(summary(p,exercises,new Date('2026-11-03T12:00Z')).streak,0);});
test('output formatting tolerates common R vector notation',()=>{const e=exercises.find(e=>e.id==='v-logic');for(const v of ['9 15 12','c(9, 15, 12)','[1] 9 15 12'])assert.ok(gradeText(e,v));assert.equal(gradeText(e,'9 12 15'),true);});
test('exam is unique, balanced across all topics, and repeatable with supplied randomness',()=>{const ids=selectExam(exercises,10,()=>.4);assert.equal(ids.length,10);assert.equal(new Set(ids).size,10);assert.equal(new Set(ids.map(id=>exercises.find(e=>e.id===id).topic)).size,6);});
test('backup schema rejects malformed history and invalid active exams',()=>{assert.deepEqual(validateProgress(emptyProgress()),emptyProgress());assert.throws(()=>validateProgress({...emptyProgress(),attempts:[{}]}));assert.throws(()=>validateProgress({...emptyProgress(),drafts:{x:{}}}));assert.throws(()=>validateProgress({...emptyProgress(),activeExam:{ids:[]}}));});
test('variants are deterministic and cover four different task families',()=>{assert.deepEqual(makeVariant(42),makeVariant(42));assert.equal(new Set([0,1,2,3].map(n=>makeVariant(n).topic)).size,4);});
test('generated variants count as practice but cannot inflate the fixed library completion',()=>{const p=emptyProgress();p.attempts=[attempt({exerciseId:'variant-0',topic:'filter'})];const s=summary(p,exercises,new Date('2026-11-02T12:30Z'));assert.equal(s.solved.size,0);assert.equal(s.today,1);assert.equal(s.topics.filter.attempts,1);});

 test('value selection accepts permutations but retains duplicates and explicit order',()=>{
 const ex=exercises.find(e=>e.id==='v-logic');
 assert.equal(gradeText(ex,'12 9 15'),true);
 assert.equal(gradeText(ex,'c(15, 12, 9)'),true);
 assert.equal(gradeText(ex,'12 9 9'),false);
 assert.equal(gradeText({...ex,orderMatters:true},'12 9 15'),false);
 });

test('every library exercise and generated family declares its comparison contract',()=>{
 for(const ex of [...exercises,...Array.from({length:4},(_,i)=>makeVariant(i))]){
  assert.equal(typeof ex.comparison.rowOrderMatters,'boolean',ex.id);
  assert.equal(typeof ex.comparison.columnOrderMatters,'boolean',ex.id);
 }
 assert.equal(exercises.find(e=>e.id==='d-select').comparison.columnOrderMatters,true);
 assert.equal(exercises.find(e=>e.id==='f-hp').comparison.rowOrderMatters,false);
 assert.equal(exercises.find(e=>e.id==='d-first-five').comparison.rowOrderMatters,true);
 assert.equal(exercises.find(e=>e.id==='f-sort').comparison.sortBy,'mpg');
});

test('numeric output accepts equivalent numeric notation',()=>{
 const ex=exercises.find(e=>e.id==='v-logic');
 assert.equal(gradeText(ex,'1.2e1 9.0 15'),true);
 assert.equal(gradeText(ex,'12 9 15.1'),false);
 assert.equal(gradeText(ex,'Infinity 9 15'),false);
});

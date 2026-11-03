import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {exercises,makeVariant} from '../dist/course.js';
const audit=JSON.parse(fs.readFileSync(new URL('../course-audit.json',import.meta.url),'utf8'));
const calls=s=>[...s.replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|#[^\n]*/g,' ').matchAll(/\b([A-Za-z][\w.]*)\s*\(/g)].map(m=>m[1]);
test('all exercises and variant families use functions evidenced outside OLA folders',()=>{
 assert.equal(audit.files.length,28);
 for(const path of audit.files)assert.ok(!path.split('/').some(p=>/^ola/i.test(p)),path);
 for(const ex of [...exercises,...Array.from({length:100},(_,i)=>makeVariant(i))]){
  for(const name of calls([ex.setup,ex.solution,ex.starter].join('\n'))){
   assert.ok(audit.functions[name]?.length,`${ex.id}: undocumented function ${name}`);
   for(const path of audit.functions[name])assert.ok(audit.files.includes(path),path);
  }
  assert.ok(!ex.source.split('/').some(p=>/^ola/i.test(p)),ex.id);
 }
 assert.ok(!exercises.some(e=>['m-cor','m-combn'].includes(e.id)));
});

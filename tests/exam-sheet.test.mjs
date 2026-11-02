import test from 'node:test';
import assert from 'node:assert/strict';
import {examSheet} from '../dist/exam-sheet.js';
import {exercises} from '../dist/course.js';
test('all numbered questions and descriptive statistics have runnable library exercises',()=>{
 const rows=examSheet.flatMap(group=>group.items);
 const expected=[...Array.from({length:4},(_,g)=>Array.from({length:5},(_,i)=>`${g+1}.${i+1}`)).flat(),...Array.from({length:4},(_,i)=>`5.${i+1}`)];
 assert.deepEqual(rows.slice(0,24).map(r=>r[0]),expected);
 assert.equal(rows.length,31);
 for(const [number,,ids] of rows){assert.ok(ids.length,number);for(const id of ids)assert.ok(exercises.find(e=>e.id===id),`${number}: ${id}`);}
 const byId=id=>exercises.find(e=>e.id===id);
 assert.match(byId('f-hp').solution,/> 150/);
 assert.match(byId('f-hp-atleast').solution,/>= 150/);
 assert.match(byId('f-five-and').solution,/&/);
 assert.match(byId('f-hp-desc').solution,/decreasing = TRUE/);
 assert.match(byId('d-new-ten').setup,/high_mpg/);
 assert.match(byId('s-mpg-summary').solution,/summary\(biler\$mpg\)/);
});

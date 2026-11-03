import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyProgress,validateProgress,skipExamQuestion,examScore,summary} from '../dist/progress.js';
import {mergeGuest,ProgressSync} from '../dist/sync.js';
import {exercises} from '../dist/course.js';
const report={id:'r1',exerciseId:'d-drop',title:'Fravælg kolonner',description:'Mit korrekte select-svar blev afvist.',code:'select(biler, -disp, -carb)',at:'2026-11-03T12:00:00Z',status:'open'};
test('reports survive backup and guest-to-account merge without duplicates',()=>{
 const guest={...emptyProgress(),reports:[report]};const account={...emptyProgress(),reports:[{...report,status:'resolved'}]};
 assert.deepEqual(validateProgress(JSON.parse(JSON.stringify(guest))).reports,[report]);
 const merged=mergeGuest(account,guest);assert.equal(merged.reports.length,1);assert.equal(merged.reports[0].status,'resolved');
 assert.deepEqual(mergeGuest(merged,guest),merged);
 assert.throws(()=>validateProgress({...guest,reports:[{...report,status:'invalid'}]}));
 const legacy=emptyProgress();delete legacy.reports;assert.deepEqual(validateProgress(legacy).reports,[]);
});
test('skipping has no practice penalty and excludes only explicitly skipped exam questions',()=>{
 const progress=emptyProgress(),before=summary(progress,exercises);
 const exam={ids:['a','b','c'],index:0,answers:{b:{correct:true,answer:'yes'}}};
 skipExamQuestion(exam);assert.equal(exam.index,1);assert.deepEqual(exam.skipped,['a']);assert.deepEqual(examScore(exam),{score:1,total:2});
 assert.deepEqual(summary(progress,exercises),before);
 exam.index=1;skipExamQuestion(exam);assert.equal(exam.answers.b,undefined);exam.index=2;skipExamQuestion(exam);assert.deepEqual(examScore(exam),{score:0,total:0});
});
test('reports use the existing account sync payload and survive restore',async()=>{
 let remote=null;const values=new Map();const storage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)};
 const client={from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:remote})})})}),rpc:async(_,args)=>{remote={progress:args.payload,revision:1};return {data:1};}};
 const sync=new ProgressSync({client,userId:'test',storage,onState:()=>{},onProgress:()=>{}});await sync.start();sync.save({...emptyProgress(),reports:[report]});await sync.flush();assert.deepEqual(remote.progress.reports,[report]);sync.close();
 let restored;const other=new ProgressSync({client,userId:'test',storage,onState:()=>{},onProgress:p=>restored=p});await other.start();assert.deepEqual(restored.reports,[report]);other.close();
});

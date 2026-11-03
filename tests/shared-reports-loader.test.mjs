import test from 'node:test';
import assert from 'node:assert/strict';
import {requiredPackages,deadline} from '../dist/engine.js';
import {createHandler,reportInput} from '../api/reports.js';
import {SharedReports} from '../dist/reports.js';
test('packages load on demand in any exercise; base R has no package downloads',()=>{
 assert.deepEqual(requiredPackages({},'select(biler, -disp, -carb)'),['dplyr']);
 assert.deepEqual(requiredPackages({},'head(biler)'),[]);
 assert.deepEqual(requiredPackages({},'x <- 1:10; mean(x)'),[]);
 assert.deepEqual(requiredPackages({},'ggplot(biler, aes(wt, mpg)) + geom_point()'),['ggplot2']);
 assert.deepEqual(requiredPackages({},'biler |> filter(str_detect(rownames(biler), "Mazda"))'),['stringr','dplyr']);
 assert.deepEqual(requiredPackages({},'jsonlite::fromJSON(current)'),['jsonlite']);
 assert.deepEqual(requiredPackages({},'library("tidyr")'),['tidyr']);
 assert.deepEqual(requiredPackages({},'# select(biler)\nx <- "geom_point()"'),[]);
});
test('stalled loading is bounded and calls cleanup',async()=>{
 let stopped=false;await assert.rejects(deadline(new Promise(()=>{}),10,'timed out',()=>stopped=true),/timed out/);assert.equal(stopped,true);
 assert.equal(await deadline(Promise.resolve(7),100,'error'),7);
});
function server(){
 const rows=new Map();const sql=async(parts,...args)=>{
  const query=parts.join('?');
  if(query.startsWith('insert into')){if(!rows.has(args[0]))rows.set(args[0],{...args[1],status:args[2]});return [];}
  if(query.startsWith('select body'))return [...rows.values()].sort((a,b)=>a.id.localeCompare(b.id)).filter(r=>r.id>args[0]).slice(0,500).map(report=>({report}));
  if(query.startsWith('update')){const report=rows.get(args[1]);if(!report)return [];report.status=args[0];return [{id:report.id,status:report.status}];}
  throw Error('Unexpected query');
 };sql.json=x=>x;
 const handler=createHandler({getDatabase:()=>sql,initialize:async()=>{}});
 const request=async(url,options={})=>{
  assert.equal(options.headers?.Authorization,undefined);
  let status,body;const res={setHeader(){},status(code){status=code;return this;},json(data){body=data;return this;}};
  await handler({method:options.method||'GET',query:Object.fromEntries(new URL(url,'https://test').searchParams),body:options.body?JSON.parse(options.body):undefined},res);
  return {ok:status>=200&&status<300,status,json:async()=>body};
 };return {request,rows};
}
const report={id:'12345678-1234-4234-9234-123456789abc',exerciseId:'d-drop',title:'Fravælg kolonner',description:'select blev afvist',code:'select(biler,-disp,-carb)',status:'open'};
test('two anonymous visitors share reports and both can resolve and reopen',async()=>{
 const {request,rows}=server();const a=new SharedReports({request}),b=new SharedReports({request});
 await a.publish(report);await b.refresh();assert.equal(b.reports[0].description,report.description);
 await b.status(report.id,'resolved');await a.refresh();assert.equal(a.reports[0].status,'resolved');
 await a.status(report.id,'open');await b.refresh();assert.equal(b.reports[0].status,'open');
 await a.refresh([report]);assert.equal(rows.size,1);
});
test('shared reports validate input and never publish account identity fields',()=>{
 assert.throws(()=>reportInput({...report,description:''}));assert.throws(()=>reportInput({...report,id:'bad'}));
 const result=reportInput({...report,email:'private@test',user_id:'private'});assert.equal('email' in result,false);assert.equal('user_id' in result,false);
});
test('offline report list retains its cache and exposes a retryable error',async()=>{
 const store=new SharedReports({request:async()=>{throw Error('offline');}});store.reports=[report];await store.refresh();assert.equal(store.error,'offline');assert.deepEqual(store.reports,[report]);
});
test('default browser fetch is called without the store as its receiver',async()=>{
 const original=globalThis.fetch;let receiver;
 globalThis.fetch=async function(){receiver=this;return {ok:true,json:async()=>({reports:[]})};};
 try{const store=new SharedReports();await store.refresh();assert.equal(receiver,undefined);assert.equal(store.error,'');}
 finally{globalThis.fetch=original;}
});

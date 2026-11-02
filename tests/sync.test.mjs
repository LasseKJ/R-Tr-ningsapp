import test from 'node:test';
import assert from 'node:assert/strict';
import {ProgressSync,mergeGuest} from '../dist/sync.js';
import {emptyProgress} from '../dist/progress.js';

function fixture(userId='alice',map=new Map()){
 let remote=null;const states=[];let displayed;
 const storage={getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v)};
 const client={from:()=>({select:()=>({eq:(_,id)=>{assert.equal(id,userId);return {maybeSingle:async()=>({data:remote})};}})}),rpc:async(name,args)=>{assert.equal(name,'rlab_save');assert.equal('user_id' in args,false);if(args.expected_revision!==(remote?.revision||0))return {error:{code:'40001'}};remote={progress:structuredClone(args.payload),revision:(remote?.revision||0)+1};return {data:remote.revision};}};
 const sync=new ProgressSync({client,userId,storage,onState:s=>states.push(s),onProgress:p=>{displayed=p;}});
 return {sync,states,map,remote:()=>remote,editRemote:p=>{remote={progress:p,revision:(remote?.revision||0)+1};},displayed:()=>displayed};
}
test('guest import is idempotent and preserves account drafts and trials',()=>{
 const account=emptyProgress(),guest=emptyProgress();guest.attempts=[{exerciseId:'v1',correct:true,seconds:2,at:'2026-11-02T10:00:00Z'}];guest.drafts.x='guest';account.drafts.x='account';
 const merged=mergeGuest(account,guest);assert.equal(merged.attempts.length,1);assert.equal(merged.drafts.x,'account');assert.deepEqual(mergeGuest(merged,guest),merged);
});
test('sync persists, restores, and isolates caches by account',async()=>{
 const f=fixture();await f.sync.start();const p=emptyProgress();p.dailyGoal=10;f.sync.save(p);assert.equal(await f.sync.flush(),true);assert.equal(f.remote().progress.dailyGoal,10);f.sync.close();
 const other=fixture('bob',f.map);await other.sync.start();assert.equal(other.displayed().dailyGoal,5);other.sync.close();
 assert.equal(JSON.parse(f.map.get('r-lab-account-alice')).dirty,false);
});
test('concurrent device writes are blocked instead of losing cloud progress',async()=>{
 const f=fixture();await f.sync.start();f.editRemote({...emptyProgress(),dailyGoal:10});f.sync.save({...emptyProgress(),dailyGoal:3});assert.equal(await f.sync.flush(),false);assert.equal(f.states.at(-1),'conflict');assert.equal(f.remote().progress.dailyGoal,10);assert.equal(JSON.parse(f.map.get('r-lab-account-alice')).progress.dailyGoal,3);
 await f.sync.useCloud();assert.equal(f.displayed().dailyGoal,10);assert.equal(f.sync.dirty,false);f.sync.close();
});
test('offline changes survive reload and retry against their original revision',async()=>{
 const f=fixture();await f.sync.start();f.sync.save({...emptyProgress(),dailyGoal:3});f.sync.close();
 const next=fixture('alice',f.map);await next.sync.start();assert.equal(next.remote().progress.dailyGoal,3);assert.equal(next.sync.dirty,false);next.sync.close();
});
test('closed account cannot upload a queued write',async()=>{
 const f=fixture();await f.sync.start();f.sync.save(emptyProgress());f.sync.close();await f.sync.flush();assert.equal(f.remote(),null);
});

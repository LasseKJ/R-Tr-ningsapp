import {emptyProgress,validateProgress} from './progress.js';

export function mergeGuest(account,guest){
 const unique=(a,b,key)=>[...new Map([...b,...a].map(x=>[key(x),x])).values()];
 return validateProgress({...account,
  attempts:unique(account.attempts,guest.attempts,x=>x.id||JSON.stringify(x)).sort((a,b)=>Date.parse(a.at)-Date.parse(b.at)),
  exams:unique(account.exams,guest.exams,x=>x.id).sort((a,b)=>Date.parse(a.at)-Date.parse(b.at)),
  reports:unique(account.reports||[],guest.reports||[],x=>x.id).sort((a,b)=>Date.parse(a.at)-Date.parse(b.at)),
  drafts:{...guest.drafts,...account.drafts},activeExam:account.activeExam||guest.activeExam});
}

// A separate cache per account, with a persisted dirty flag for offline recovery.
export class ProgressSync {
 constructor({client,userId,storage,onState,onProgress}){
  Object.assign(this,{client,userId,storage,onState,onProgress});
  this.key=`r-lab-account-${userId}`;this.revision=0;this.dirty=false;this.counter=0;this.closed=false;this.conflict=false;
 }
 cache(){this.storage.setItem(this.key,JSON.stringify({progress:this.progress,revision:this.revision,dirty:this.dirty}));}
 async read(){const {data,error}=await this.client.from('rlab_progress').select('progress,revision').eq('user_id',this.userId).maybeSingle();if(error)throw error;return data;}
 async start(){
  let cached;try{cached=JSON.parse(this.storage.getItem(this.key));if(cached)cached.progress=validateProgress(cached.progress);}catch{cached=null;}
  if(cached){this.progress=cached.progress;this.revision=cached.revision;this.dirty=!!cached.dirty;this.onProgress(this.progress);}
  try{
   const remote=await this.read();if(this.closed)return;
   if(this.dirty){if(this.revision!==(remote?.revision||0)){this.conflict=true;this.onState('conflict');return;}await this.flush();}
   else{this.progress=remote?validateProgress(remote.progress):emptyProgress();this.revision=remote?.revision||0;this.cache();this.onProgress(this.progress);this.onState('saved');}
  }catch{if(!this.progress)this.progress=emptyProgress();this.onState('offline');}
 }
 save(progress){if(this.closed)return;this.progress=structuredClone(progress);this.counter++;this.dirty=true;this.cache();if(!this.conflict)this.onState('pending');clearTimeout(this.timer);this.timer=setTimeout(()=>this.flush(),700);}
 async flush(){
  if(this.closed||this.running||this.conflict||!this.dirty)return !this.dirty;
  this.running=true;const counter=this.counter;this.onState('saving');
  try{
   const {data,error}=await this.client.rpc('rlab_save',{payload:this.progress,expected_revision:this.revision});
   if(error)throw error;if(this.closed)return false;this.revision=Number(data);this.dirty=counter!==this.counter;this.cache();this.onState(this.dirty?'pending':'saved');
  }catch(error){if(!this.closed){this.conflict=error.code==='40001'||String(error.message).includes('RLAB_CONFLICT');this.onState(this.conflict?'conflict':'offline');}}
  finally{this.running=false;}
  if(this.dirty&&!this.conflict&&!this.closed&&counter!==this.counter)return this.flush();
  return !this.dirty;
 }
 async useCloud(){const remote=await this.read();if(this.closed)return;this.progress=remote?validateProgress(remote.progress):emptyProgress();this.revision=remote?.revision||0;this.dirty=false;this.conflict=false;this.counter++;this.cache();this.onProgress(this.progress);this.onState('saved');}
 close(){this.closed=true;clearTimeout(this.timer);}
}

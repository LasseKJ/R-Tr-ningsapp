export const KEY='r-lab-progress-v1';
export const emptyProgress=()=>({version:1,attempts:[],drafts:{},revealedDrafts:{},exams:[],reports:[],activeExam:null,dailyGoal:5,enabledOlaYears:[]});
export function validateProgress(p){
 if(!p||p.version!==1||!Array.isArray(p.attempts)||p.attempts.length>100000||!Array.isArray(p.exams)||!p.drafts||typeof p.drafts!=='object'||Array.isArray(p.drafts)) throw new Error('Filen er ikke en gyldig R Lab-backup.');
 if(p.attempts.some(a=>!a||typeof a.exerciseId!=='string'||typeof a.correct!=='boolean'||!Number.isFinite(a.seconds)||a.seconds<0||!Number.isFinite(Date.parse(a.at))))throw new Error('Backup indeholder ugyldige forsøg.');
 if(Object.values(p.drafts).some(d=>typeof d!=='string')||p.exams.some(e=>!e||typeof e.id!=='string'||!Number.isFinite(e.score)||!Number.isFinite(e.total)||!Number.isFinite(Date.parse(e.at))))throw new Error('Backup indeholder ugyldige data.');
 if(p.activeExam && (!Array.isArray(p.activeExam.ids)||p.activeExam.ids.some(x=>typeof x!=='string')||!Number.isFinite(p.activeExam.endsAt)||typeof p.activeExam.id!=='string'||!p.activeExam.answers||typeof p.activeExam.answers!=='object'||Array.isArray(p.activeExam.answers)||!Number.isInteger(p.activeExam.index)||p.activeExam.index<0||p.activeExam.index>=p.activeExam.ids.length))throw new Error('Ugyldig eksamenssession.');
 if(p.revealedDrafts!==undefined&&(!p.revealedDrafts||typeof p.revealedDrafts!=='object'||Array.isArray(p.revealedDrafts)||Object.values(p.revealedDrafts).some(x=>typeof x!=='boolean')))throw new Error('Ugyldige kladdemarkeringer.');
 if(p.reports!==undefined&&(!Array.isArray(p.reports)||p.reports.length>10000||p.reports.some(r=>!r||typeof r.id!=='string'||typeof r.exerciseId!=='string'||typeof r.title!=='string'||typeof r.description!=='string'||r.description.length>5000||typeof r.code!=='string'||!Number.isFinite(Date.parse(r.at))||!['open','resolved'].includes(r.status))))throw new Error('Ugyldige fejlrapporter.');
 for(const e of [...p.exams,...(p.activeExam?[p.activeExam]:[])]){
  if(e.ids&&(!Array.isArray(e.ids)||e.ids.length>100||new Set(e.ids).size!==e.ids.length||e.ids.some(id=>typeof id!=='string')))throw new Error('Ugyldige eksamensopgaver.');
  if(e.skipped!==undefined&&(!Array.isArray(e.skipped)||e.skipped.some(id=>!e.ids?.includes(id))||new Set(e.skipped).size!==e.skipped.length))throw new Error('Ugyldige oversprungne opgaver.');
  if(e.answers&&Object.values(e.answers).some(a=>!a||typeof a.correct!=='boolean'||typeof a.answer!=='string'))throw new Error('Ugyldige eksamenssvar.');
 }
 return {...emptyProgress(),...p,dailyGoal:[3,5,10].includes(p.dailyGoal)?p.dailyGoal:5};
}
export function loadProgress(storage){try{const raw=storage.getItem(KEY);return raw?validateProgress(JSON.parse(raw)):emptyProgress();}catch{return emptyProgress();}}
export function dayKey(date=new Date()){return new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Copenhagen',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(date));}
export function summary(progress,exercises,now=new Date()){
 const a=progress.attempts.filter(a=>!a.examId);const known=new Set(exercises.map(x=>x.id));const solved=new Set(a.filter(x=>x.correct&&!x.revealed&&known.has(x.exerciseId)).map(x=>x.exerciseId));
 const first=new Map();for(const x of a)if(!first.has(x.exerciseId))first.set(x.exerciseId,x);
 const today=a.filter(x=>dayKey(x.at)===dayKey(now));
 const activeDays=new Set(a.map(x=>dayKey(x.at)));let streak=0;let cursor=new Date(now);if(!activeDays.has(dayKey(cursor)))cursor.setDate(cursor.getDate()-1);
 while(activeDays.has(dayKey(cursor))){streak++;cursor.setDate(cursor.getDate()-1);}
 return {attempts:a.length,solved,accuracy:a.length?Math.round(a.filter(x=>x.correct).length/a.length*100):0,firstAccuracy:first.size?Math.round([...first.values()].filter(x=>x.correct&&!x.hinted&&!x.revealed).length/first.size*100):0,today:new Set(today.filter(x=>x.correct&&!x.revealed).map(x=>x.exerciseId)).size,streak,minutes:Math.round(a.reduce((s,x)=>s+x.seconds,0)/60),topics:Object.fromEntries([...new Set(exercises.map(x=>x.topic))].map(t=>{const ids=exercises.filter(x=>x.topic===t).map(x=>x.id);const attempts=a.filter(x=>ids.includes(x.exerciseId)||(!known.has(x.exerciseId)&&x.topic===t));return[t,{total:ids.length,solved:ids.filter(id=>solved.has(id)).length,attempts:attempts.length,accuracy:attempts.length?Math.round(attempts.filter(x=>x.correct).length/attempts.length*100):null}];}))};
}
export function normalizeOutput(value){return String(value).trim().replace(/^\[1\]\s*/,'').replace(/^c\((.*)\)$/s,'$1').replace(/[",]/g,' ').replace(/\s+/g,' ').trim();}
export function gradeText(exercise,value){
 if(exercise.kind==='choice')return Number(value)===exercise.answer;
 const actual=normalizeOutput(value).split(' '),expected=normalizeOutput(exercise.answer).split(' ');
 if(actual.length!==expected.length)return false;
 const numeric=xs=>xs.every(x=>/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(x));
 if(numeric(actual)&&numeric(expected)){
  const a=actual.map(Number),b=expected.map(Number);
  if(exercise.orderMatters===false){a.sort((x,y)=>x-y);b.sort((x,y)=>x-y);}
  return a.every((x,i)=>Number.isFinite(x)&&Number.isFinite(b[i])&&Math.abs(x-b[i])<=1e-7*Math.max(1,Math.abs(b[i])));
 }
 if(exercise.orderMatters===false){actual.sort();expected.sort();}
 return JSON.stringify(actual)===JSON.stringify(expected);
}
export function selectExam(exercises,count=10,random=Math.random){
 const pool=[...exercises];for(let i=pool.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
 const chosen=[];for(const topic of [...new Set(exercises.map(x=>x.topic))]){const ex=pool.find(x=>x.topic===topic);if(ex)chosen.push(ex);}
 for(const ex of pool)if(chosen.length<count&&!chosen.includes(ex))chosen.push(ex);
 return chosen.slice(0,count).map(x=>x.id);
}

export function skipExamQuestion(exam){
 const id=exam.ids[exam.index];
 if(!id)throw new Error('Ingen aktiv opgave.');
 exam.skipped=[...new Set([...(exam.skipped||[]),id])];
 delete exam.answers[id];exam.index++;
}
export function examScore(exam){
 const skipped=new Set(exam.skipped||[]);
 return {score:exam.ids.filter(id=>!skipped.has(id)&&exam.answers[id]?.correct).length,total:exam.ids.filter(id=>!skipped.has(id)).length};
}

// A revealed draft belongs to that help-assisted session, never a fresh attempt.
export function prepareExerciseDraft(progress,key,exerciseId,commentPrevious=true){
 progress.revealedDrafts??={};
 const previous=progress.attempts.findLast(a=>a.exerciseId===exerciseId&&!a.examId);
 const legacyRevealed=key===exerciseId&&progress.revealedDrafts[key]===undefined&&previous?.revealed;
 const reset=progress.revealedDrafts[key]===true||!!legacyRevealed;
 if(reset)delete progress.drafts[key];
 else if(commentPrevious&&key===exerciseId&&previous?.correct&&!previous.revealed&&progress.drafts[key]?.trim()){
  const content=progress.drafts[key].replace(/^# Tidligere besvarelse\r?\n/,'');
  progress.drafts[key]='# Tidligere besvarelse\n'+content.split(/\r?\n/).map(line=>line.trimStart().startsWith('#')?line:'# '+line).join('\n');
 }
 progress.revealedDrafts[key]=false;
 return reset;
}

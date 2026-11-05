import {KEY,emptyProgress,loadProgress} from './progress.js';
import {ProgressSync,mergeGuest} from './sync.js';
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labels={guest:'Gemt på denne enhed',loading:'Forbinder…',saved:'Gemt online',pending:'Afventer synkronisering',saving:'Gemmer online…',offline:'Kun lokalt · prøv igen',conflict:'Ændringer på en anden enhed',unavailable:'Online profil utilgængelig'};
async function withTimeout(request){
 let timer;
 try{return await Promise.race([request,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Profilforbindelsen svarer ikke.')),8000);})]);}
 finally{clearTimeout(timer);}
}
export class Account {
 constructor({storage,getProgress,setProgress,render,toast,beforeSwitch}){Object.assign(this,{storage,getProgress,setProgress,render,toast,beforeSwitch});this.status='loading';this.mode='login';}
 syncStatusView(){return `<p data-sync-status role="status">${escape(labels[this.status])}</p>`;}
 badge(){return `<button class="profile account-link" data-nav="profile"><span class="avatar">${escape((this.user?.user_metadata?.display_name||'R')[0].toUpperCase())}</span><span>${escape(this.user?.user_metadata?.display_name|| (this.user?'Min profil':'Log ind / opret profil'))}<small data-sync-status>${labels[this.status]}</small></span><span class="online-dot"></span></button>`;}
 state(status){this.status=status;document.querySelectorAll('[data-sync-status]').forEach(el=>el.textContent=labels[status]);const conflict=document.querySelector('#sync-conflict');if(conflict)conflict.hidden=status!=='conflict';}
 async init(){
  try{
   const response=await fetch('/api/config',{signal:AbortSignal.timeout(8000)});if(!response.ok)throw Error();const config=await response.json();
   const {createClient}=await withTimeout(import('https://esm.sh/@supabase/supabase-js@2.80.0'));
   this.client=createClient(config.url,config.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
   this.client.auth.onAuthStateChange((event,session)=>{setTimeout(()=>this.changeUser(session?.user||null),0);});
   const {data,error}=await withTimeout(this.client.auth.getSession());if(error)throw error;await this.changeUser(data.session?.user||null);
   window.addEventListener('online',()=>this.sync?.flush());
  }catch{this.state('unavailable');this.render();}
 }
 async changeUser(user){
  if(this.initialized&&this.user?.id===user?.id){this.user=user;return;}
  this.beforeSwitch();this.sync?.close();this.initialized=true;this.user=user;this.setProgress(emptyProgress());
  if(!user){this.sync=null;this.setProgress(loadProgress(this.storage));this.state('guest');this.render();return;}
  this.state('loading');this.render();
  const sync=new ProgressSync({client:this.client,userId:user.id,storage:this.storage,onState:s=>this.state(s),onProgress:p=>{if(this.sync===sync){this.setProgress(p);this.render();}}});
  this.sync=sync;await sync.start();if(this.sync===sync)this.render();
 }
 save(progress){if(this.user){if(!this.sync)throw Error('Profilen indlæses. Prøv igen om lidt.');this.sync.save(progress);}else this.storage.setItem(KEY,JSON.stringify(progress));}
 view(){
  if(this.user)return `<section class="page-heading"><div><p class="eyebrow">DIT PERSONLIGE R LAB</p><h1>Min profil</h1><p>Din træning følger dig fra enhed til enhed.</p></div></section><div class="settings-grid"><section class="card"><h3>Din konto</h3><p>${escape(this.user.email)}</p><form id="profile-form" class="account-form"><label for="display-name">Dit navn</label><input id="display-name" maxlength="60" required value="${escape(this.user.user_metadata?.display_name||'')}"><button class="primary">Gem navn</button></form><button class="text-button" id="sign-out">Log ud</button></section><section class="card"><h3>Dine fremskridt</h3><p data-sync-status role="status">${labels[this.status]}</p><p>Besvarelser, kladder, prøver og dagsmål gemmes på din konto. Du kan fortsætte offline; ændringer sendes, når forbindelsen er tilbage.</p><button class="secondary" id="sync-now">Synkronisér nu</button><div id="sync-conflict" ${this.status==='conflict'?'':'hidden'}><p>En anden enhed har gemt nye data. Eksportér først din lokale backup under Indstillinger, hvis du vil bevare begge versioner. Hent derefter den online version.</p><button class="secondary" id="use-cloud">Hent online version</button></div></section><section class="card"><h3>Flyt din tidligere træning</h3><p>Tilføj de resultater, som blev gemt i denne browser før login. Eksisterende forsøg på din konto bevares. Import kan gentages uden at fordoble forsøg.</p><button class="secondary" id="import-guest">Tilføj lokale resultater</button></section><section class="card"><h3>Privat for dig</h3><p>Dine fremskridt er kun tilgængelige med din konto. Login og data håndteres af Supabase. Selve R-koden køres stadig i din browser.</p></section></div>`;
  return `<section class="page-heading"><div><p class="eyebrow">DIT R LAB, OVERALT</p><h1>Gem din læring online</h1><p>Én profil. Dine opgaver, kladder og resultater på alle dine enheder.</p></div></section><section class="card login-card"><span class="brandmark">R<span>_</span></span><h2>Log ind eller opret profil</h2><p>Vi sender et sikkert loginlink til din e-mail. Første gang oprettes din profil automatisk.</p><form id="login-form" class="account-form"><label for="login-email">E-mail</label><input id="login-email" type="email" autocomplete="email" placeholder="dig@eksempel.dk" required ${this.client?'':'disabled'}><button class="primary" ${this.client?'':'disabled'}>Send loginlink →</button></form><p id="account-message" role="status">${this.status==='unavailable'?'Login kunne ikke indlæses. Genindlæs siden, eller fortsæt træningen lokalt.':''}</p><p class="small-note">Lokale resultater flyttes først, når du selv vælger det efter login. Du kan også træne uden en konto.</p><button class="text-button" data-nav="tasks">Fortsæt uden login →</button></section>`;
 }
 bind(){
  const byId=id=>document.getElementById(id);
  if(byId('login-form'))byId('login-form').onsubmit=async e=>{e.preventDefault();const btn=e.target.querySelector('button');btn.disabled=true;try{const {error}=await this.client.auth.signInWithOtp({email:byId('login-email').value.trim(),options:{emailRedirectTo:location.origin+'/'}});if(error)throw error;byId('account-message').textContent='Tjek din indbakke (og spam). Åbn linket for at logge ind. Du kan lukke denne side imens.';}catch{byId('account-message').textContent='Loginlinket kunne ikke sendes. Kontrollér e-mailen, og prøv igen senere. Hvis adressen ikke er godkendt, skal sidens ejer aktivere mailudsendelse.';}finally{btn.disabled=false;}};
  if(byId('profile-form'))byId('profile-form').onsubmit=async e=>{e.preventDefault();const name=byId('display-name').value.trim();if(!name)return;const {data,error}=await this.client.auth.updateUser({data:{display_name:name}});if(error)this.toast('Navnet kunne ikke gemmes. Prøv igen.');else{this.user=data.user;this.render();this.toast('Dit navn er gemt.');}};
  if(byId('sign-out'))byId('sign-out').onclick=async()=>{this.beforeSwitch();if(this.sync?.dirty&&!await this.sync.flush()){this.toast('Dine ændringer er ikke gemt online endnu. Synkronisér eller eksportér en backup før logout.');return;}const {error}=await this.client.auth.signOut({scope:'local'});if(error)this.toast('Kunne ikke logge ud. Prøv igen.');};
  if(byId('sync-now'))byId('sync-now').onclick=async()=>{if(!this.sync||this.status==='loading')return;if(this.sync.dirty)await this.sync.flush();else try{await this.sync.useCloud();}catch{this.state('offline');}};
  if(byId('use-cloud'))byId('use-cloud').onclick=async()=>{if(!confirm('Erstat den lokale kontoversion med dine online data? Eksportér først en backup, hvis du vil beholde lokale ændringer.'))return;try{await this.sync.useCloud();}catch{this.toast('Kunne ikke hente online data.');}};
  if(byId('import-guest'))byId('import-guest').onclick=()=>{if(this.status==='loading')return;const merged=mergeGuest(this.getProgress(),loadProgress(this.storage));this.setProgress(merged);this.save(merged);this.render();this.toast('Lokale resultater er tilføjet til din profil.');};
 }
}

export class SharedReports {
 constructor({request=(...args)=>fetch(...args),onChange=()=>{}}={}){this.request=request;this.onChange=onChange;this.reports=[];this.error='';this.published=new Set();}
 async call(method,body,cursor=null){
  const response=await this.request('/api/reports'+(cursor?'?cursor='+encodeURIComponent(cursor):''),{method,headers:body?{'Content-Type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(15000)});
  const result=await response.json();if(!response.ok)throw Error(result.error||'Rapportlisten kunne ikke nås.');return result;
 }
 async refresh(local=[]){
  if(this.loading)return;this.loading=true;
  try{
   for(const report of local)if(!this.published.has(report.id)){await this.call('POST',report);this.published.add(report.id);}
   let cursor=null;const reports=[];do{const result=await this.call('GET',undefined,cursor);reports.push(...result.reports);cursor=result.cursor;}while(cursor);this.reports=reports;this.error='';
  }catch(error){this.error=error.message||'Rapportlisten kunne ikke nås.';}
  finally{this.loading=false;this.onChange();}
 }
 async publish(report){await this.call('POST',report);this.published.add(report.id);await this.refresh();if(this.error)throw Error(this.error);}
 async status(id,status){await this.call('PATCH',{id,status});await this.refresh();if(this.error)throw Error(this.error);}
}

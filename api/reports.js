import postgres from 'postgres';
let connection,initialized;
export function database(){
 if(!connection){const url=process.env.POSTGRES_URL||process.env.POSTGRES_URL_NON_POOLING;if(!url)throw Error('Database is not configured');connection=postgres(url,{ssl:'require',max:1,prepare:false,connect_timeout:10,idle_timeout:20});}
 return connection;
}
export async function ensureReports(sql){
 if(!initialized)initialized=(async()=>{
  await sql`create table if not exists public.rlab_reports (id uuid primary key, body jsonb not null, status text not null default 'open' check (status in ('open','resolved')), created_at timestamptz not null default now(), updated_at timestamptz not null default now())`;
  await sql`alter table public.rlab_reports enable row level security`;
  await sql`revoke all on public.rlab_reports from anon, authenticated`;
  // Only the report field is migrated. Account history and identities remain private.
  await sql`insert into public.rlab_reports (id,body,status,created_at)
   select (r->>'id')::uuid,jsonb_build_object('id',r->>'id','exerciseId',r->>'exerciseId','title',r->>'title','description',r->>'description','code',r->>'code','feedback',r->>'feedback','prompt',r->>'prompt'),case when r->>'status'='resolved' then 'resolved' else 'open' end,coalesce((r->>'at')::timestamptz,now())
   from public.rlab_progress p cross join lateral jsonb_array_elements(coalesce(p.progress->'reports','[]'::jsonb)) r
   where r->>'id' ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' on conflict (id) do nothing`;
 })().catch(error=>{initialized=null;throw error;});
 await initialized;
}
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function reportInput(input){
 if(!input||!uuid.test(input.id)||typeof input.exerciseId!=='string'||!input.exerciseId||typeof input.title!=='string'||!input.title||typeof input.description!=='string'||!input.description.trim())throw Error('Udfyld en forklaring af fejlen.');
 const result={id:input.id,exerciseId:input.exerciseId.slice(0,150),title:input.title.slice(0,300),description:input.description.trim().slice(0,5000),code:String(input.code||'').slice(0,20000),feedback:String(input.feedback||'').slice(0,10000),prompt:String(input.prompt||'').slice(0,5000),at:new Date().toISOString(),status:input.status==='resolved'?'resolved':'open'};
 return result;
}
export function createHandler({getDatabase=database,initialize=ensureReports}={}){
 return async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(!['GET','POST','PATCH'].includes(req.method)){res.setHeader('Allow','GET, POST, PATCH');return res.status(405).json({error:'Metoden understøttes ikke.'});}
  let input;
  try{if(req.method==='POST')input=reportInput(req.body);if(req.method==='PATCH'&&(!uuid.test(req.body?.id)||!['open','resolved'].includes(req.body?.status)))throw Error('Ugyldig status.');}
  catch(error){return res.status(400).json({error:error.message});}
  try{
   const sql=getDatabase();await initialize(sql);
   if(req.method==='GET'){
    const cursor=req.query?.cursor||'00000000-0000-0000-0000-000000000000';if(!uuid.test(cursor))return res.status(400).json({error:'Ugyldig side.'});
    const rows=await sql`select body || jsonb_build_object('id',id,'status',status,'at',created_at,'updatedAt',updated_at) as report from public.rlab_reports where id > ${cursor}::uuid order by id limit 500`;
    return res.status(200).json({reports:rows.map(r=>r.report),cursor:rows.length===500?rows.at(-1).report.id:null});
   }
   if(req.method==='POST'){
    await sql`insert into public.rlab_reports(id,body,status) values (${input.id},${sql.json(input)},${input.status}) on conflict(id) do nothing`;
    return res.status(201).json({id:input.id});
   }
   const rows=await sql`update public.rlab_reports set status=${req.body.status},updated_at=now() where id=${req.body.id} returning id,status`;
   return rows.length?res.status(200).json(rows[0]):res.status(404).json({error:'Fejlrapporten blev ikke fundet.'});
  }catch(error){console.error('Report database operation failed',error.code||error.name);return res.status(503).json({error:'Den fælles rapportliste kunne ikke nås. Prøv igen om lidt. Din forklaring er gemt lokalt.'});}
 };
}
export default createHandler();

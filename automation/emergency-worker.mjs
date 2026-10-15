import {spawn} from 'node:child_process';
import {access} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
const stateDir=process.env.FSJ_STATE_DIR,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!stateDir||!key)throw Error('Configure o estado e a chave protegida no executor.');
const base='https://awrxnzbfrsaurzpunuko.supabase.co';
async function db(path,body,method=body===undefined?'GET':'POST'){
 const r=await fetch(base+'/rest/v1/'+path,{method,headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=representation'},...(body===undefined?{}:{body:JSON.stringify(body)}),signal:AbortSignal.timeout(30000)});
 if(!r.ok)throw Error('Armazenagem indisponivel: HTTP '+r.status);const text=await r.text();return text?JSON.parse(text):null;
}
export async function processEmergency({db,run,isBusy,now=()=>new Date()}){
 // Never compete for WhatsApp while the established routine owns its lock.
 if(await isBusy()){await db('fsj_executor_emergencia?on_conflict=id',{id:true,visto_em:now().toISOString()});return;}
 const jobs=await db('rpc/fsj_assumir_emergencia',{});
 if(!jobs?.length)return;
 const job=jobs[0];
 const code=await run();
 await db('fsj_envios_emergencia?id=eq.'+encodeURIComponent(job.id)+'&estado=eq.executando',{
  estado:code===0?'concluido':'falhou',finalizado_em:now().toISOString(),
  resultado:code===0?'Rotina encerrada sem falhas. Conferir os registros individuais; folgas, ferias e envios ja registrados foram respeitados.':'Rotina apresentou falhas. Conferir historico individual e diario no executor. Envios incertos permanecem bloqueados.'
 },'PATCH');
}
export async function main(){
  for(;;){
   try{await processEmergency({db,isBusy:async()=>{try{await access(resolve(stateDir,'routine.lock'));return true;}catch(e){if(e.code==='ENOENT')return false;throw e;}},run:()=>new Promise(resolveExit=>{
    // Same entry point installed for the 7h task: no copied send/delete logic.
    const child=spawn(process.execPath,['run-retries.mjs'],{cwd:new URL('.',import.meta.url),env:process.env,stdio:'inherit'});
    child.once('error',()=>resolveExit(1));child.once('exit',(code,signal)=>resolveExit(signal?1:(code??1)));
   })});}catch(e){console.error(new Date().toISOString()+' Emergencia: '+e.message);}
   await new Promise(r=>setTimeout(r,15000));
  }
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))await main();

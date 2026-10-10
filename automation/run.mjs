import {runRoutine} from './routine.mjs';
import {connect,revoke,send} from './wa.mjs';
const base=process.env.SUPABASE_URL||'https://awrxnzbfrsaurzpunuko.supabase.co';
const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
const stateDir=process.env.FSJ_STATE_DIR;
if(!key||!stateDir)throw Error('Configure SUPABASE_SERVICE_ROLE_KEY e FSJ_STATE_DIR no computador executor; nunca no código.');
if(new URL(base).origin!=='https://awrxnzbfrsaurzpunuko.supabase.co')throw Error('Projeto Supabase inesperado.');
async function db(path,opt={}){
  const r=await fetch(base+'/rest/v1/'+path,{...opt,signal:AbortSignal.timeout(30000),headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json',...opt.headers}});
  if(!r.ok)throw Error('Armazenagem: HTTP '+r.status);
  const body=await r.text();return body?JSON.parse(body):null;
}
const result=await runRoutine({db,connect,revoke,send,stateDir});
if(result.failures)process.exitCode=1;

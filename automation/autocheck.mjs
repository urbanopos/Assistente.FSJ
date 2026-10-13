import {autocheck} from './autocheck-core.mjs';
import {connect} from './wa.mjs';
import {mkdir,readFile,writeFile,rename,access,unlink} from 'node:fs/promises';
import {resolve} from 'node:path';import {randomUUID} from 'node:crypto';
const stateDir=process.env.FSJ_STATE_DIR,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!stateDir||!key)throw Error('Configure FSJ_STATE_DIR e a chave protegida no executor.');
const base='https://awrxnzbfrsaurzpunuko.supabase.co';
async function db(path){const r=await fetch(base+'/rest/v1/'+path,{headers:{apikey:key,Authorization:'Bearer '+key},signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error('Banco indisponivel');return r.json();}
const report=await autocheck({db,connect,
 lockExists:async()=>{try{await access(resolve(stateDir,'routine.lock'));return true;}catch(e){if(e.code==='ENOENT')return false;throw e;}},
 readJournal:async()=>{try{return JSON.parse(await readFile(resolve(stateDir,'journal.json'),'utf8'));}catch(e){if(e.code==='ENOENT')return {};throw e;}},
 checkFiles:async()=>{for(const f of ['run.mjs','routine.mjs','wa.mjs','core.mjs'])await access(new URL(f,import.meta.url));await mkdir(stateDir,{recursive:true});const p=resolve(stateDir,'autocheck-write-'+randomUUID());await writeFile(p,'ok',{flag:'wx',mode:0o600});await unlink(p);return true;},
 checkPages:async()=>{for(const p of ['quadro.html','responder.html']){const r=await fetch('https://urbanopos.github.io/Assistente.FSJ/'+p,{cache:'no-store',signal:AbortSignal.timeout(30000)});if(!r.ok||!(await r.text()).includes('resposta-tarefa'))throw Error();}return true;}
});
report.smsConfigurado=false;
const tmp=resolve(stateDir,'autocheck-'+randomUUID()+'.tmp');await writeFile(tmp,JSON.stringify(report,null,2),{mode:0o600});await rename(tmp,resolve(stateDir,'autocheck-ultimo.json'));
for(const c of report.checks)console.log((c.ok?'OK: ':'FALHA: ')+c.name);
console.log('SMS ainda nao configurado. Resultado salvo em autocheck-ultimo.json.');
if(report.failures)process.exitCode=1;

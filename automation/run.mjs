import {mkdir,readFile,writeFile,rename} from 'node:fs/promises';
import {resolve} from 'node:path';
import {randomUUID} from 'node:crypto';
import {PERSON_ID,localDay,eligible,normalizePhone,cycle} from './core.mjs';
import {connect,revoke,send} from './wa.mjs';
const base=process.env.SUPABASE_URL||'https://awrxnzbfrsaurzpunuko.supabase.co';
const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
const stateDir=process.env.FSJ_STATE_DIR;
if(!key||!stateDir)throw Error('Configure SUPABASE_SERVICE_ROLE_KEY e FSJ_STATE_DIR no computador executor; nunca no código.');
if(new URL(base).origin!=='https://awrxnzbfrsaurzpunuko.supabase.co')throw Error('Projeto Supabase inesperado.');
const day=localDay(),dayStart=new Date(day+'T03:00:00Z'),dayEnd=new Date(+dayStart+86400000).toISOString();
async function db(path,opt={}){
  const r=await fetch(base+'/rest/v1/'+path,{...opt,signal:AbortSignal.timeout(30000),headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json',...opt.headers}});
  if(!r.ok)throw Error('Armazenagem: HTTP '+r.status);
  const body=await r.text();return body?JSON.parse(body):null;
}
const [people,tasks,assignments,returns,events]=await Promise.all([
  db('pessoas?id=eq.'+PERSON_ID+'&ativo=eq.true&select=*'),db('tarefas?select=*'),
  db('tarefa_responsaveis?pessoa_id=eq.'+PERSON_ID+'&select=*'),
  db('retornos?tipo=eq.sim&select=tarefa_id,tipo,criado_em'),
  db('mensagens_whatsapp?pessoa_id=eq.'+PERSON_ID+'&tipo=eq.quadro_automatico&order=criado_em.desc&select=*')]);
if(people.length!==1||people[0].identificacao.toLowerCase()!=='menininha')throw Error('Cadastro de Menininha não corresponde à configuração.');
const phone=normalizePhone(people[0].whatsapp);
if(events.some(e=>e.whatsapp_message_id&&localDay(new Date(e.criado_em))===day)){console.log('Mensagem de hoje já registrada; envio não repetido.');process.exit(0);}
await mkdir(stateDir,{recursive:true,mode:0o700});
const journal=resolve(stateDir,'journal.json');
let all={};try{all=JSON.parse(await readFile(journal,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
const journalKey=PERSON_ID+'|'+day;
const state=all[journalKey]||{phase:'new',eventIds:{}};
const persist=async s=>{all[journalKey]=s;await writeFile(journal+'.tmp',JSON.stringify(all),{mode:0o600});await rename(journal+'.tmp',journal);};
async function record(type,details){
  state.eventIds[type] ||= randomUUID();await persist(state);
  await db('mensagens_whatsapp?on_conflict=id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({id:state.eventIds[type],pessoa_id:PERSON_ID,direcao:'saida',tipo:type,conteudo:JSON.stringify({dia:day,...details}),whatsapp_message_id:type==='quadro_automatico'?details.messageId:null})});
}
if(state.phase==='sending')throw Error('Envio incerto no diário local; conferir antes de tentar de novo.');
// Reuse each day's tokens: refreshing or rerunning must not invalidate active links.
let boards=await db('quadros_do_dia?pessoa_id=eq.'+PERSON_ID+'&dia=eq.'+day+'&select=*');
if(!boards.length)boards=await db('quadros_do_dia?on_conflict=pessoa_id,dia',{method:'POST',headers:{Prefer:'resolution=ignore-duplicates,return=representation'},body:JSON.stringify({pessoa_id:PERSON_ID,dia:day,expira_em:dayEnd})});
if(!boards.length)boards=await db('quadros_do_dia?pessoa_id=eq.'+PERSON_ID+'&dia=eq.'+day+'&select=*');
const items=eligible(tasks,assignments,returns,PERSON_ID,day);
if(items.length)await db('links_resposta?on_conflict=tarefa_id,pessoa_id,dia',{method:'POST',headers:{Prefer:'resolution=ignore-duplicates,return=minimal'},body:JSON.stringify(items.map((t,i)=>({tarefa_id:t.id,pessoa_id:PERSON_ID,dia:day,expira_em:dayEnd,ordem:i+1})))});
const url='https://urbanopos.github.io/Assistente.FSJ/quadro.html#token='+boards[0].token;
const previousEvent=events.find(e=>e.whatsapp_message_id);
const previous=previousEvent?{messageId:previousEvent.whatsapp_message_id}:Object.entries(all).filter(([k,v])=>k.startsWith(PERSON_ID+'|')&&k<journalKey&&v.messageId).sort(([a],[b])=>b.localeCompare(a))[0]?.[1];
let client;
try{
  client=await connect();
  const number=await client.getNumberId(phone);
  if(!number?._serialized)throw Error('Número cadastrado não localizado no WhatsApp.');
  await cycle({state,previous,persist,record,url,revoke:id=>revoke(client,id,number._serialized),send:text=>send(client,number._serialized,text)});
  console.log('Mensagem enviada e registrada. Entrega/leitura não presumidas.');
}catch(e){await record('falha_rotina',{status:'falhou',reason:e.message}).catch(()=>{});throw e;}
finally{if(client)await client.destroy();}

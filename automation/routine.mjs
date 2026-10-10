import {mkdir,readFile,writeFile,rename,rmdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {randomUUID} from 'node:crypto';
import {localDay,eligible,normalizePhone,cycle,afterSeven,forEachRecipient,isDayOff} from './core.mjs';

export async function runRoutine({db,connect,revoke,send,stateDir,now=new Date()}) {
const day=localDay(now),dayStart=new Date(day+'T03:00:00Z'),dayEnd=new Date(+dayStart+86400000).toISOString();
if(!afterSeven(now)){console.log('Antes das 7h de Igarassu; nenhum envio realizado.');return {failures:0};}
const [people,tasks,assignments,returns]=await Promise.all([
  db('pessoas?ativo=eq.true&receber_tarefas_whatsapp=eq.true&select=*'),db('tarefas?select=*'),
  db('tarefa_responsaveis?select=*'),db('retornos?tipo=eq.sim&select=tarefa_id,tipo,criado_em')]);
await mkdir(stateDir,{recursive:true,mode:0o700});
const lock=resolve(stateDir,'routine.lock');
try{await mkdir(lock);}catch(e){if(e.code==='EEXIST')throw Error('Rotina já em execução ou interrompida. Conferir processos e diário antes de remover routine.lock.');throw e;}
let client;
try{
const journal=resolve(stateDir,'journal.json');
let all={};try{all=JSON.parse(await readFile(journal,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
async function runPerson(person){
const events=await db('mensagens_whatsapp?pessoa_id=eq.'+encodeURIComponent(person.id)+'&tipo=eq.quadro_automatico&order=criado_em.desc&select=*');
if(events.some(e=>e.whatsapp_message_id&&localDay(new Date(e.criado_em))===day)){console.log('Mensagem de hoje já registrada para '+person.id+'; envio não repetido.');return;}
const journalKey=person.id+'|'+day;
const state=all[journalKey]||{phase:'new',eventIds:{}};
state.eventIds ||= {};
const persist=async s=>{all[journalKey]=s;await writeFile(journal+'.tmp',JSON.stringify(all),{mode:0o600});await rename(journal+'.tmp',journal);};
async function record(type,details){
  state.eventIds[type] ||= randomUUID();await persist(state);
  await db('mensagens_whatsapp?on_conflict=id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({id:state.eventIds[type],pessoa_id:person.id,direcao:'saida',tipo:type,conteudo:JSON.stringify({dia:day,...details}),whatsapp_message_id:type==='quadro_automatico'?details.messageId:null})});
}
if(state.phase==='sending')throw Error('Envio incerto no diário local; conferir antes de tentar de novo.');
const phone=normalizePhone(person.whatsapp);
// Reuse each day's tokens: refreshing or rerunning must not invalidate active links.
let boards=await db('quadros_do_dia?pessoa_id=eq.'+person.id+'&dia=eq.'+day+'&select=*');
if(!boards.length)boards=await db('quadros_do_dia?on_conflict=pessoa_id,dia',{method:'POST',headers:{Prefer:'resolution=ignore-duplicates,return=representation'},body:JSON.stringify({pessoa_id:person.id,dia:day,expira_em:dayEnd})});
if(!boards.length)boards=await db('quadros_do_dia?pessoa_id=eq.'+person.id+'&dia=eq.'+day+'&select=*');
const items=eligible(tasks,assignments,returns,person.id,day);
if(items.length)await db('links_resposta?on_conflict=tarefa_id,pessoa_id,dia',{method:'POST',headers:{Prefer:'resolution=ignore-duplicates,return=minimal'},body:JSON.stringify(items.map((t,i)=>({tarefa_id:t.id,pessoa_id:person.id,dia:day,expira_em:dayEnd,ordem:i+1})))});
const url='https://urbanopos.github.io/Assistente.FSJ/quadro.html#token='+boards[0].token;
const previousEvent=events.find(e=>e.whatsapp_message_id);
const previous=previousEvent?{messageId:previousEvent.whatsapp_message_id}:Object.entries(all).filter(([k,v])=>k.startsWith(person.id+'|')&&k<journalKey&&v.messageId).sort(([a],[b])=>b.localeCompare(a))[0]?.[1];
try{
  // Check the saved selection again immediately before contacting WhatsApp.
  const current=await db('pessoas?id=eq.'+encodeURIComponent(person.id)+'&ativo=eq.true&receber_tarefas_whatsapp=eq.true&select=*');
  if(!current.length||isDayOff(current[0],day)){console.log('Destinatário desativado durante a execução: '+person.id);return;}
  if(current[0].whatsapp!==person.whatsapp)throw Error('WhatsApp alterado durante a execução; tentar na próxima rotina.');
  client ||= await connect();
  const number=await client.getNumberId(phone);
  if(!number?._serialized)throw Error('Número cadastrado não localizado no WhatsApp.');
  await cycle({state,previous,persist,record,url,revoke:id=>revoke(client,id,number._serialized),send:text=>send(client,number._serialized,text)});
  console.log('Mensagem enviada e registrada para '+person.id+'. Entrega/leitura não presumidas.');
}catch(e){await record('falha_rotina',{status:'falhou',reason:e.message}).catch(()=>{});throw e;}
}
  const failures=await forEachRecipient(people,runPerson,async(p,e)=>console.error('Falha para '+p.id+': '+e.message),day);
  if(!people.length)console.log('Nenhum destinatário ativo selecionado em Pessoas.');
  return {failures};
}finally{
  try{if(client)await client.destroy();}finally{await rmdir(lock);}
}
}

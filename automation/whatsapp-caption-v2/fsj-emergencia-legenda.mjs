import {mkdir,readFile,writeFile,rename,rmdir,copyFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {randomUUID} from 'node:crypto';
import wwebjs from 'whatsapp-web.js';
import {connect,revoke} from './wa.mjs';
import {localDay,afterSeven,normalizePhone,isDayOff,eligible} from './core.mjs';
import {compactDailyPdf} from './compact-card-pdf.mjs';
import {accessURL,accessCaption} from './fsj-access-caption.mjs';
const day=localDay(),dir=process.env.FSJ_STATE_DIR,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(day!=='2026-10-19')throw Error('Esta substituicao emergencial vale somente em 19/10/2026.');
if(!dir||!key)throw Error('Faltam FSJ_STATE_DIR ou SUPABASE_SERVICE_ROLE_KEY nesta sessao. Nada enviado.');
const base='https://awrxnzbfrsaurzpunuko.supabase.co';
async function db(path,opt={}){const r=await fetch(base+'/rest/v1/'+path,{...opt,signal:AbortSignal.timeout(30000),headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json',...opt.headers}});if(!r.ok)throw Error('Banco HTTP '+r.status);const s=await r.text();return s?JSON.parse(s):null;}
async function read(path,fallback){try{return JSON.parse(await readFile(path,'utf8'));}catch(e){if(e.code==='ENOENT')return fallback;throw e;}}
async function save(path,value){const tmp=path+'.'+randomUUID()+'.tmp';await writeFile(tmp,JSON.stringify(value),{mode:0o600});await rename(tmp,path);}
function web(value,page){const u=new URL(value);if(u.origin!=='https://urbanopos.github.io'||u.pathname!=='/Assistente.FSJ/'+page||u.username||u.password||!new URLSearchParams(u.hash.slice(1)).get('token'))throw Error('Link web invalido.');return u.href;}
const journalPath=resolve(dir,'journal.json'),receiptPath=resolve(dir,'substituicao-legenda-web-v2-'+day+'.json'),lock=resolve(dir,'routine.lock');
await mkdir(dir,{recursive:true,mode:0o700});await mkdir(lock).catch(()=>{throw Error('Outra rotina pode estar em execucao. Nada enviado. Nao apague o bloqueio sem conferir.');});
let client,failures=0;
try{
 const journal=await read(journalPath,{}),receipts=await read(receiptPath,{});
 try{await copyFile(journalPath,resolve(dir,'journal-antes-substituicao-'+Date.now()+'.json'));}catch(e){if(e.code!=='ENOENT')throw e;}
 await db('rpc/fsj_preparar_calendario',{method:'POST',body:JSON.stringify({p_dia:day})});
 const people=await db('pessoas?ativo=eq.true&receber_tarefas_whatsapp=eq.true&select=*');
 const [tasks,assignments,returns]=await Promise.all([db('tarefas?select=*'),db('tarefa_responsaveis?select=*'),db('retornos?tipo=eq.sim&select=tarefa_id,tipo,criado_em')]);
 for(const p of people){try{
  if(isDayOff(p,day)||await db('rpc/fsj_pode_enviar',{method:'POST',body:JSON.stringify({p_pessoa:p.id,p_dia:day})})!==true)continue;
  const jk=p.id+'|'+day;let receipt=receipts[p.id];
  if(receipt?.phase==='sending')throw Error('Resultado incerto: conferir conversa antes de qualquer nova tentativa.');
  if(receipt?.phase==='done'){console.log('Ja substituido: '+p.id);continue;}
  const register=async()=>{
   const result=receipt.result;
   await db('mensagens_whatsapp?on_conflict=id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({id:receipt.eventId,pessoa_id:p.id,direcao:'saida',tipo:'quadro_automatico',conteudo:JSON.stringify({dia:day,status:'enviado',emergencia:'pdf-legenda-web-v2',...result}),whatsapp_message_id:result.messageId})});
   journal[jk]={...journal[jk],phase:'sent',...result,eventIds:{...journal[jk]?.eventIds,quadro_automatico:receipt.eventId}};
   await save(journalPath,journal);receipt.phase='done';await save(receiptPath,receipts);
  };
  if(receipt?.result?.messageId){await register();console.log('Registro recuperado: '+p.id);continue;}
  if(journal[jk]?.phase==='sending')throw Error('Diario anterior incerto: conferir conversa.');
  let boards=await db('quadros_do_dia?pessoa_id=eq.'+encodeURIComponent(p.id)+'&dia=eq.'+day+'&select=*');
  if(!boards.length){await db('quadros_do_dia?on_conflict=pessoa_id,dia',{method:'POST',headers:{Prefer:'resolution=ignore-duplicates'},body:JSON.stringify({pessoa_id:p.id,dia:day,expira_em:new Date(Date.parse(day+'T03:00:00Z')+86400000).toISOString()})});boards=await db('quadros_do_dia?pessoa_id=eq.'+encodeURIComponent(p.id)+'&dia=eq.'+day+'&select=*');}
  if(boards.length!==1)throw Error('Quadro indisponivel.');
  const items=eligible(tasks,assignments,returns,p.id,day);
  if(items.length)await db('links_resposta?on_conflict=tarefa_id,pessoa_id,dia',{method:'POST',headers:{Prefer:'resolution=ignore-duplicates,return=minimal'},body:JSON.stringify(items.map((t,i)=>({tarefa_id:t.id,pessoa_id:p.id,dia:day,expira_em:new Date(Date.parse(day+'T03:00:00Z')+86400000).toISOString(),ordem:i+1})))});
  const board=web('https://urbanopos.github.io/Assistente.FSJ/quadro.html#token='+boards[0].token,'quadro.html');
  const supervision=await db('rpc/fsj_link_supervisao',{method:'POST',body:JSON.stringify({p_pessoa:p.id,p_token:boards[0].token})});
  if(supervision)web(supervision,'supervisor.html');
  const check=await fetch(base+'/functions/v1/resposta-tarefa',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://urbanopos.github.io'},body:JSON.stringify({action:'board',token:boards[0].token}),signal:AbortSignal.timeout(30000)});
  const payload=await check.json();if(!check.ok||payload.dia!==day)throw Error('Pagina de tarefas nao validada.');
  const events=await db('mensagens_whatsapp?pessoa_id=eq.'+encodeURIComponent(p.id)+'&tipo=eq.quadro_automatico&order=criado_em.desc&select=*');
  const ids=new Set();
  for(const event of events.filter(e=>localDay(new Date(e.criado_em))===day)){if(event.whatsapp_message_id)ids.add(event.whatsapp_message_id);let d;try{d=typeof event.conteudo==='string'?JSON.parse(event.conteudo):event.conteudo;}catch{throw Error('Registro anterior ilegivel; nada enviado.');}for(const id of d?.messageIds||[])if(typeof id==='string')ids.add(id);}
  for(const id of journal[jk]?.messageIds||[])ids.add(id);if(journal[jk]?.messageId)ids.add(journal[jk].messageId);
  const current=await db('pessoas?id=eq.'+encodeURIComponent(p.id)+'&ativo=eq.true&receber_tarefas_whatsapp=eq.true&select=*');
  if(current.length!==1||current[0].whatsapp!==p.whatsapp||isDayOff(current[0],day))throw Error('Cadastro mudou; envio suspenso.');
  if(!afterSeven()||await db('rpc/fsj_pode_enviar',{method:'POST',body:JSON.stringify({p_pessoa:p.id,p_dia:day})})!==true)throw Error('Envio fora da autorizacao.');
  client ||= await connect();const number=await client.getNumberId(normalizePhone(p.whatsapp));if(!number?._serialized)throw Error('WhatsApp nao localizado.');
  const now=new Date(),stamp=now.toLocaleTimeString('pt-BR',{timeZone:'America/Recife',hour:'2-digit',minute:'2-digit',second:'2-digit'});
  const direct=accessURL(board,'quadro.html',now.toISOString()),other=supervision?accessURL(supervision,'supervisor.html',now.toISOString()):undefined;
  const pdf=compactDailyPdf({day,name:p.nome,boardUrl:direct,supervisionUrl:other,sentAt:stamp});
  const caption=accessCaption({day,name:p.nome,boardUrl:direct,supervisionUrl:other});
  receipt=receipts[p.id]={phase:'prepared',eventId:randomUUID(),previousIds:[...ids]};await save(receiptPath,receipts);
  for(const id of ids){const result=await revoke(client,id,number._serialized);if(result.status!=='confirmado')throw Error('Apagamento anterior nao confirmado: '+String(result.reason||result.status).slice(0,250));}
  receipt.phase='sending';await save(receiptPath,receipts);
  const msg=await client.sendMessage(number._serialized,new wwebjs.MessageMedia('application/pdf',pdf.toString('base64'),'FSJ-Acesso-Web-'+day+'.pdf'),{caption,sendMediaAsDocument:true,sendSeen:false,waitUntilMsgSent:true,linkPreview:false});
  const id=msg?.id?._serialized??msg?.id?.$1;if(!id)throw Error('Envio incerto; nao repetir.');
  receipt.result={messageId:id,messageIds:[id],ack:msg.ack||0,sentAt:now.toISOString()};receipt.phase='sent';await save(receiptPath,receipts);await register();
  console.log('PDF unico enviado e registrado: '+p.id);
 }catch(e){failures++;console.error('Falha para '+p.id+': '+e.message);}}
}finally{try{if(client)await client.destroy();}finally{await rmdir(lock);}}
if(failures)process.exitCode=1;

import {mkdir,readFile,writeFile,rename,rmdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {randomUUID} from 'node:crypto';
import {connect,revoke,send} from '../wa.mjs';
import {reconcileManual} from '../manual-history.mjs';
import {normalizePhone,localDay} from '../core.mjs';
import {replaceEmergency} from '../emergency-replacement.mjs';

const dir=process.env.FSJ_EMERGENCY_STATE_DIR;
const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
const base='https://awrxnzbfrsaurzpunuko.supabase.co';
if(!dir||!key)throw Error('Configure pasta privada exclusiva e chave protegida do Executor de Emergência.');
if(process.env.FSJ_STATE_DIR&&resolve(process.env.FSJ_STATE_DIR)===resolve(dir))throw Error('Não reutilizar a pasta de sessão da rotina diária.');
process.env.FSJ_STATE_DIR=dir;
async function db(path,opt={}){
 const r=await fetch(base+'/rest/v1/'+path,{...opt,headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json',Prefer:'return=representation',...opt.headers},signal:AbortSignal.timeout(30000)});
 if(!r.ok)throw Error('Serviço de emergência: HTTP '+r.status);const text=await r.text();return text?JSON.parse(text):null;
}
const post=(path,body)=>db(path,{method:'POST',body:JSON.stringify(body)});
const patch=(path,body)=>db(path,{method:'PATCH',body:JSON.stringify(body)});
await mkdir(dir,{recursive:true,mode:0o700});
const lock=resolve(dir,'agent.lock');
try{await mkdir(lock);}catch{throw Error('Executor já ativo ou execução interrompida; conferir antes de liberar o lock.');}
let client,heartbeat,stopping=false;
async function identity(){
 const owners=await db('fsj_titularidade?id=eq.true&select=pessoa_id');
 if(owners.length!==1)throw Error('Titularidade indisponível.');
 const people=await db('pessoas?id=eq.'+encodeURIComponent(owners[0].pessoa_id)+'&select=whatsapp');
 const actual=String(client.info?.wid?.user||'');
 if(!people[0]||normalizePhone(people[0].whatsapp)!==actual)throw Error('A sessão WhatsApp não pertence ao proprietário cadastrado.');
 if(await client.getState()!=='CONNECTED')throw Error('WhatsApp desconectado.');
}
async function beat(connected){
 await db('fsj_emergency_agent?on_conflict=id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({id:true,visto_em:new Date().toISOString(),conectado:connected})});
}
async function processJob(job){
 const file=resolve(dir,'job-'+job.id+'.json');
 let state={eventIds:{}};
 try{state=JSON.parse(await readFile(file,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
 const persist=async s=>{await writeFile(file+'.tmp',JSON.stringify(s),{mode:0o600});await rename(file+'.tmp',file);};
 async function eligible(){
  await identity();
  if(job.dia!==localDay())throw Error('Pedido de outro dia; bloqueado.');
  const people=await db('pessoas?id=eq.'+encodeURIComponent(job.pessoa_id)+'&select=whatsapp');
  if(!people[0]||normalizePhone(people[0].whatsapp)!==job.phone)throw Error('Cadastro de WhatsApp alterado.');
  if(await post('rpc/fsj_pode_enviar',{p_pessoa:job.pessoa_id,p_dia:job.dia})!==true)throw Error('Envio bloqueado pelo calendário ou cadastro.');
 }
 await eligible();
 const number=await client.getNumberId(job.phone);
 if(!number?._serialized)throw Error('Destinatário não localizado no WhatsApp.');
 const chatId=number._serialized;
 const manual=await db('fsj_envios_manuais?pessoa_id=eq.'+encodeURIComponent(job.pessoa_id)+'&confirmado_em=not.is.null&order=confirmado_em.desc&limit=1&select=*');
 if(manual[0]&&!manual[0].whatsapp_message_id){
  await reconcileManual({db,connect:async()=>client,row:manual[0]});
  const fresh=await db('fsj_envios_manuais?id=eq.'+encodeURIComponent(manual[0].id)+'&select=whatsapp_message_id');
  if(!fresh[0]?.whatsapp_message_id)throw Error('Mensagem manual anterior não identificada de forma única. Nada será apagado/enviado.');
  manual[0].whatsapp_message_id=fresh[0].whatsapp_message_id;
 }
 const events=await db('mensagens_whatsapp?pessoa_id=eq.'+encodeURIComponent(job.pessoa_id)+'&tipo=in.(quadro_automatico,quadro_manual_identificado)&whatsapp_message_id=not.is.null&order=criado_em.desc&limit=1&select=*');
 const event=events[0];
 const previous=state.previousMessageId||(manual[0]&&(!event||Date.parse(manual[0].confirmado_em)>=Date.parse(event.criado_em))?manual[0].whatsapp_message_id:event?.whatsapp_message_id);
 if(!previous)throw Error('Mensagem anterior sem identificador real. Substituição bloqueada.');
 state.previousMessageId=previous;await persist(state);
 const record=async(type,details)=>{
  state.eventIds ||= {};state.eventIds[type] ||= randomUUID();await persist(state);
  await db('mensagens_whatsapp?on_conflict=id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({id:state.eventIds[type],pessoa_id:job.pessoa_id,direcao:'saida',tipo:type==='substituicao_emergencial'?'quadro_manual_identificado':type,conteudo:JSON.stringify({dia:job.dia,codigo_mensagem:job.codigo,...details}),whatsapp_message_id:details.messageId||null})});
 };
 await replaceEmergency({state,previousMessageId:previous,chatId,text:job.mensagem,persist,
 revoke:async(id,chat)=>{await eligible();return revoke(client,id,chat);},
 send:async(chat,text)=>{await eligible();return send(client,chat,text);},record});
 await patch('fsj_envios_manuais?pessoa_id=eq.'+encodeURIComponent(job.pessoa_id)+'&dia=eq.'+job.dia,{confirmado_em:new Date().toISOString(),whatsapp_message_id:state.messageId,mensagem_em:new Date().toISOString(),resultado_reconciliacao:'Enviado pelo Executor de Emergência após apagamento confirmado.'});
 await patch('fsj_emergency_jobs?id=eq.'+job.id,{estado:'enviado',finalizado_em:new Date().toISOString(),whatsapp_message_id:state.messageId,resultado:'Mensagem anterior apagada para todos; nova mensagem enviada.'});
}
try{
 client=await connect(process.argv.includes('--link'));
 await identity();
 if(process.argv.includes('--link')){console.log('WhatsApp do proprietário vinculado ao executor dedicado. Nenhuma mensagem enviada.');}
 else{
  await beat(true);
  heartbeat=setInterval(()=>identity().then(()=>beat(true)).catch(()=>beat(false)).catch(()=>{}),10000);
  process.on('SIGTERM',()=>{stopping=true;});process.on('SIGINT',()=>{stopping=true;});
  while(!stopping){
   const jobs=await post('rpc/fsj_emergency_claim',{});
   if(jobs?.[0]){
    const job=jobs[0];
    try{await processJob(job);}
    catch(e){
     // Um envio pode ter ocorrido antes de falha na gravação: nunca presumir falha de transmissão.
     let state={};try{state=JSON.parse(await readFile(resolve(dir,'job-'+job.id+'.json'),'utf8'));}catch{}
     const uncertain=['sending','uncertain','sent'].includes(state.phase)||!!state.messageId;
     await patch('fsj_emergency_jobs?id=eq.'+job.id,{estado:uncertain?'incerto':'bloqueado',finalizado_em:new Date().toISOString(),resultado:String(e.message).slice(0,1000)});
    }
   }
   if(!stopping)await new Promise(r=>setTimeout(r,5000));
  }
 }
}finally{
 clearInterval(heartbeat);
 try{await beat(false);}catch{}
 try{if(client)await client.destroy();}finally{await rmdir(lock);}
}

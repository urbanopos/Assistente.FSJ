import {mkdir,readFile,writeFile,rename,rmdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {randomUUID} from 'node:crypto';
import {connect,revoke} from '../wa.mjs';
import {reconcileManual} from '../manual-history.mjs';
import {normalizePhone,localDay} from '../core.mjs';
import {identifyPrevious} from '../emergency-replacement.mjs';
import {replaceEmergency} from '../emergency-replacement.mjs';
import wwebjs from 'whatsapp-web.js';
import {access} from 'node:fs/promises';

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
 const actual=String(client.info?.wid?.user||'').replace(/\D/g,'');
 if(!people[0])throw Error('Proprietário sem WhatsApp cadastrado.');
 const registered=normalizePhone(people[0].whatsapp);
 // Em números brasileiros, o identificador da própria sessão pode omitir o nono dígito.
 const legacy=registered.replace(/^(55\d{2})9(\d{8})$/,'$1$2');
 if(actual!==registered&&actual!==legacy)throw Error('A sessão WhatsApp não pertence ao proprietário cadastrado.');
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
 const headerPath=process.env.FSJ_EMERGENCY_HEADER_PATH;
 if(!headerPath)throw Error('Configure FSJ_EMERGENCY_HEADER_PATH com a imagem original da Fazenda São José.');
 await access(headerPath);
 const media=wwebjs.MessageMedia.fromFilePath(headerPath);
 if(!media.mimetype.startsWith('image/'))throw Error('Cabeçalho não é uma imagem válida.');
 if(!job.mensagem||job.mensagem.length>1024)throw Error('Legenda do cabeçalho indisponível ou longa demais.');
 const number=await client.getNumberId(job.phone);
 if(!number?._serialized)throw Error('Destinatário não localizado no WhatsApp.');
 const chatId=number._serialized;
 // O proprietário autorizou o envio mesmo se houver mensagem anterior.
 // Nunca repetir automaticamente um job cujo resultado de transmissão seja incerto.
 if(state.phase==='sending'||state.phase==='uncertain')throw Error('Envio incerto deste pedido: conferir a conversa antes de repetir.');
 if(!state.messageId){
  state.phase='sending';await persist(state);
  try{
   await eligible();
   const sent=await client.sendMessage(chatId,media,{caption:job.mensagem,sendMediaAsDocument:false});
   if(!sent?.id?._serialized)throw Error('WhatsApp não confirmou identificador da mensagem com imagem.');
   state.messageId=sent.id._serialized;state.ack=sent.ack||0;state.phase='sent';await persist(state);
  }catch(e){
   state.phase='uncertain';state.lastError=String(e.message||e).slice(0,500);await persist(state);throw e;
  }
 }
 const result={messageId:state.messageId,ack:state.ack};
 await db('mensagens_whatsapp?on_conflict=id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({id:job.id,pessoa_id:job.pessoa_id,direcao:'saida',tipo:'quadro_manual_identificado',conteudo:JSON.stringify({dia:job.dia,codigo_mensagem:job.codigo,status:'envio_emergencial_automatico'}),whatsapp_message_id:result.messageId})});
 await patch('fsj_emergency_jobs?id=eq.'+job.id,{estado:'enviado',whatsapp_message_id:result.messageId,finalizado_em:new Date().toISOString(),resultado:'Cabeçalho e legenda enviados em uma única mensagem pelo executor emergencial.'});
}
async function confirmManualJobs(){
 const jobs=await db('fsj_emergency_jobs?estado=eq.pronto_para_envio&dia=eq.'+localDay()+'&select=*&limit=20');
 for(const job of jobs){
  await identity();
  const number=await client.getNumberId(job.phone);if(!number?._serialized)continue;
  const chat=await client.getChatById(number._serialized);
  const messages=await chat.fetchMessages({limit:200,fromMe:true});
  let messageId;
  try{messageId=identifyPrevious(messages,{chatId:number._serialized,code:job.codigo});}catch{continue;}
  const message=messages.find(m=>m.id?._serialized===messageId);
  if(!message||message.timestamp*1000<Date.parse(job.finalizado_em))continue;
  const when=new Date(message.timestamp*1000).toISOString();
  await db('mensagens_whatsapp?on_conflict=id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({id:job.id,pessoa_id:job.pessoa_id,direcao:'saida',tipo:'quadro_manual_identificado',whatsapp_message_id:messageId,criado_em:when,conteudo:JSON.stringify({dia:job.dia,codigo_mensagem:job.codigo,status:'envio_manual_identificado'})})});
  await patch('fsj_envios_manuais?pessoa_id=eq.'+encodeURIComponent(job.pessoa_id)+'&dia=eq.'+job.dia,{confirmado_em:when,whatsapp_message_id:messageId,mensagem_em:when,resultado_reconciliacao:'Envio manual identificado após preparo emergencial.'});
  await patch('fsj_emergency_jobs?id=eq.'+job.id,{estado:'enviado',whatsapp_message_id:messageId,resultado:'Mensagem enviada manualmente pelo proprietário e identificada na conversa correta.'});
 }
}
try{
 client=await connect(process.argv.includes('--link'));
 await identity();
 if(process.argv.includes('--link')){console.log('WhatsApp do proprietário vinculado ao executor dedicado. Nenhuma mensagem enviada.');}
 else{
  await beat(true);
  heartbeat=setInterval(()=>identity().then(()=>beat(true)).catch(()=>beat(false)).catch(()=>{}),10000);
  process.on('SIGTERM',()=>{stopping=true;});process.on('SIGINT',()=>{stopping=true;});
  const maxSeconds=Number(process.env.FSJ_EMERGENCY_MAX_SECONDS||900);
  if(!Number.isFinite(maxSeconds)||maxSeconds<300||maxSeconds>3600)throw Error('Janela de execução inválida.');
  const deadline=Date.now()+maxSeconds*1000;
  while(!stopping&&Date.now()<deadline){
   await confirmManualJobs();
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

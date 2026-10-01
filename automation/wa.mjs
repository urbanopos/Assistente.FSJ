import wwebjs from 'whatsapp-web.js';
import {mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
export async function connect(interactive=false) {
  const dir=process.env.FSJ_STATE_DIR;
  if(!dir)throw Error('Configure FSJ_STATE_DIR fora do checkout, em uma pasta privada persistente.');
  await mkdir(dir,{recursive:true,mode:0o700});
  const client=new wwebjs.Client({authStrategy:new wwebjs.LocalAuth({clientId:'fsj',dataPath:resolve(dir,'auth')}),puppeteer:{headless:!interactive}});
  const ready=new Promise((resolveReady,reject)=>{
    const timer=setTimeout(()=>reject(Error('WhatsApp não ficou pronto em 90 segundos.')),90000);
    client.once('ready',()=>{clearTimeout(timer);resolveReady();});
    client.once('auth_failure',()=>{clearTimeout(timer);reject(Error('Vínculo WhatsApp expirou. Execute npm run link novamente.'));});
    client.once('qr',()=>{if(interactive)console.log('Escaneie o QR na janela aberta: WhatsApp → Aparelhos conectados.');else{clearTimeout(timer);reject(Error('WhatsApp ainda não vinculado. Execute npm run link no computador executor.'));}});
  });
  try{await client.initialize();await ready;return client;}catch(e){await client.destroy().catch(()=>{});throw e;}
}
export async function revoke(client,id,chatId) {
  const message=await client.getMessageById(id);
  if(!message||!message.fromMe||message.to!==chatId)return {status:'sem_confirmacao',reason:'Mensagem anterior não localizada na conversa correta; não foi apagada.'};
  let listener,timer;
  const observed=new Promise(resolve=>{
    listener=(after,before)=>{if(before?.id?._serialized===id||after?.id?._serialized===id)resolve(true);};
    client.on('message_revoke_everyone',listener);
    timer=setTimeout(()=>resolve(false),20000);
  });
  try{
    await message.delete(true);
    const confirmed=await observed;
    return {status:confirmed?'confirmado':'sem_confirmacao',reason:confirmed?'WhatsApp confirmou a revogação para todos.':'Exclusão solicitada, mas sem confirmação do WhatsApp.'};
  }catch{return {status:'falhou',reason:'WhatsApp não permitiu confirmar a exclusão para todos.'};}
  finally{clearTimeout(timer);client.off('message_revoke_everyone',listener);}
}
export async function send(client,chatId,text) {
  const m=await client.sendMessage(chatId,text,{linkPreview:true});
  if(!m?.id?._serialized)throw Error('WhatsApp não devolveu o identificador.');
  return {messageId:m.id._serialized,ack:m.ack||0};
}

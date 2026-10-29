// Complemento de emergência; requer executor autenticado, diário persistente e lock por conta.
import {createHash} from 'node:crypto';
export function identifyPrevious(messages,{chatId,code}){
 if(!chatId||!code)throw Error('Conversa e código anterior obrigatórios.');
 const matches=messages.filter(m=>m.fromMe===true&&m.to===chatId&&
  String(m.body||'').split(/\r?\n/).some(line=>line.trim()==='Código da mensagem: '+code));
 if(matches.length!==1)throw Error(matches.length?'Identificação ambígua; nada foi apagado.':'Mensagem anterior não localizada; substituição bloqueada.');
 const id=matches[0].id?._serialized;
 if(!id)throw Error('WhatsApp não forneceu identificador real da mensagem anterior.');
 return id;
}
export async function replaceEmergency({state,previousMessageId,chatId,text,persist,revoke,send,record}){
 if(!previousMessageId||!chatId||typeof text!=='string'||!text.trim())throw Error('Substituição exige mensagem anterior identificada, destinatário e texto.');
 const binding=createHash('sha256').update(JSON.stringify({previousMessageId,chatId,text})).digest('hex');
 if(state.binding&&state.binding!==binding)throw Error('Diário pertence a outra substituição.');
 state.binding=binding;
 if(state.phase==='sending'||state.phase==='uncertain')throw Error('Envio incerto: conferir a conversa antes de qualquer nova tentativa.');
 if(state.messageId){await record('substituicao_emergencial',{status:'enviado',messageId:state.messageId,previousMessageId});return state;}
 if(state.deletion?.status!=='confirmado'){
  state.phase='deleting';await persist(state);
  try{state.deletion=await revoke(previousMessageId,chatId);}
  catch(e){state.deletion={status:'falhou',reason:String(e.message||e).slice(0,500)};}
  await persist(state);
 }
 await record('apagamento_emergencial',{...state.deletion,previousMessageId});
 if(state.deletion?.status!=='confirmado'){
  state.phase='blocked';await persist(state);
  throw Error('Apagamento anterior não confirmado; a nova mensagem NÃO foi enviada.');
 }
 state.phase='sending';await persist(state);
 let result;
 try{
  result=await send(chatId,text);
  if(!result?.messageId)throw Error('WhatsApp não retornou identificador da nova mensagem.');
 }catch(e){
  state.phase=e.notTransmitted===true?'ready':'uncertain';
  state.lastError=String(e.message||e).slice(0,500);await persist(state);throw e;
 }
 state.messageId=result.messageId;state.ack=result.ack||0;state.phase='sent';await persist(state);
 await record('substituicao_emergencial',{status:'enviado',messageId:state.messageId,previousMessageId});
 return state;
}

import wwebjs from 'whatsapp-web.js';
import {afterSeven,localDay} from './core.mjs';
import {cardEnabled,prepareCard} from './card-bundle.mjs';
import {accessURL,accessCaption} from './fsj-access-caption.mjs';
import {sendAttempts} from './fsj-delivery-policy.mjs';
export async function sendDaily(client,chatId,text,onPart=async()=>{}){
 const failBefore=e=>{e.notTransmitted=true;return e};
 let info;
 try{
  if(!afterSeven())throw Error('Envio fora da janela permitida.');
  const match=text.match(/https:\/\/urbanopos\.github\.io\/Assistente\.FSJ\/quadro\.html(?:\?[^\s#]*)?#token=([0-9a-f-]{36})/i);if(!match)throw Error('Link individual de tarefas ausente.');
  const now=new Date(),day=localDay(now),r=await fetch('https://awrxnzbfrsaurzpunuko.supabase.co/functions/v1/resposta-tarefa',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://urbanopos.github.io'},body:JSON.stringify({action:'board',token:match[1]}),signal:AbortSignal.timeout(30000)});
  const board=await r.json();if(!r.ok||board.dia!==day)throw Error('Quadro indisponivel ou de outro dia.');
  const supervisionUrl=text.match(/https:\/\/urbanopos\.github\.io\/Assistente\.FSJ\/supervisor\.html[^\s]*/)?.[0];
  const boardUrl=accessURL(match[0],'quadro.html',now.toISOString());
  info={now,day,name:board.responsavel,boardUrl,supervisionUrl,warning:text.startsWith('Aviso:')?'Apagamento anterior sem confirmacao.':''};
 }catch(e){throw failBefore(e)}
 const deliver=async prepare=>{
  let payload;try{if(!afterSeven())throw Error('Janela de envio encerrada.');payload=await prepare();if(!afterSeven())throw Error('Janela de envio encerrada.');}catch(e){throw failBefore(e)}
  // Depois desta chamada, uma falha sem identificador pode ser incerta: nao repetir.
  const m=await client.sendMessage(chatId,payload.media||payload.text,{...payload.options,linkPreview:false,sendSeen:false,waitUntilMsgSent:true});
  const id=m?.id?._serialized??m?.id?.$1;if(!id)throw Error('Envio sem identificador; conferir conversa antes de repetir.');
  const result={messageId:id,messageIds:[id],ack:m.ack||0,sentAt:info.now.toISOString()};
  try{await onPart(result);}catch(e){e.deliveryResult=result;throw e;}return result;
 };
 return await sendAttempts({card:cardEnabled(info.day)?()=>deliver(async()=>{const p=await prepareCard(info);return {media:new wwebjs.MessageMedia('application/pdf',p.pdf.toString('base64'),p.filename),options:{caption:p.caption,sendMediaAsDocument:true}};}):null,conventional:()=>deliver(async()=>({text:accessCaption(info)}))});
}

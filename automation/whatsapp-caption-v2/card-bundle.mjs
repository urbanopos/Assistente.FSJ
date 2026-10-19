import {readFileSync} from 'node:fs';
import {compactDailyPdf} from './compact-card-pdf.mjs';
import {accessURL,accessCaption} from './fsj-access-caption.mjs';
export function cardEnabled(day){try{const c=JSON.parse(readFileSync(new URL('./fsj-card-mode.json',import.meta.url),'utf8'));return c.enabled===true&&(c.daily===true||Array.isArray(c.days)&&c.days.includes(day));}catch{return false;}}
export async function prepareCard({day,name,boardUrl,supervisionUrl,now,warning=''}){
 const sentAt=now.toISOString();
 const own=accessURL(boardUrl,'quadro.html',sentAt),other=supervisionUrl?accessURL(supervisionUrl,'supervisor.html',sentAt):undefined;
 const stamp=now.toLocaleTimeString('pt-BR',{timeZone:'America/Recife',hour:'2-digit',minute:'2-digit',second:'2-digit'});
 const pdf=compactDailyPdf({day,name,boardUrl:own,supervisionUrl:other,sentAt:stamp,warning});
 const date=day.split('-').reverse().join('/');
 return {pdf,title:'Fazenda S\u00e3o Jos\u00e9 - Tarefas do dia '+date,filename:'FSJ-Acesso-Web-'+day+'.pdf',sentAt,caption:accessCaption({day,name,boardUrl:own,supervisionUrl:other,warning})};
}
const messageId=m=>m?.id?._serialized??m?.id?.$1;
export async function transmitCard({client,chatId,prepared,MessageMedia,beforeTransmit,onPart=async()=>{}}){
 if(!prepared.caption)throw Error('Legenda de acesso ausente; nada enviado.');
 await beforeTransmit();
 const m=await client.sendMessage(chatId,new MessageMedia('application/pdf',prepared.pdf.toString('base64'),prepared.filename),{caption:prepared.caption,sendMediaAsDocument:true,linkPreview:false,sendSeen:false,waitUntilMsgSent:true});
 const id=messageId(m);if(!id)throw Error('Envio incerto: conferir conversa antes de repetir.');
 const result={messageId:id,messageIds:[id],ack:m.ack||0,sentAt:prepared.sentAt,headerStatus:'integrado_no_pdf',layout:'pdf-legenda-web-v2'};
 await onPart(result);return result;
}

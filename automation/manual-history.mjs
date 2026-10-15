import {localDay,normalizePhone} from './core.mjs';

export function matchManualMessages(messages,row,chatId){
 const link='https://urbanopos.github.io/Assistente.FSJ/quadro.html#token='+row.token;
 return messages.filter(m=>{
  if(m.fromMe!==true||m.to!==chatId||!m.id?._serialized||!Number.isFinite(m.timestamp))return false;
  if(localDay(new Date(m.timestamp*1000))!==row.dia)return false;
  const body=String(m.body||''),at=body.indexOf(link);
  return at>=0&&(at===0||/\s/.test(body[at-1]))&&(body.length===at+link.length||/[\s&]/.test(body[at+link.length]));
 });
}

export async function reconcileManual({db,connect,row}){
 if(row.whatsapp_message_id)return;
 const client=await connect(),number=await client.getNumberId(normalizePhone(row.whatsapp));
 if(!number?._serialized)throw Error('Conversa do envio manual não localizada.');
 const chatId=number._serialized,chat=await client.getChatById(chatId);
 const matches=matchManualMessages(await chat.fetchMessages({limit:200,fromMe:true}),row,chatId);
 const path='fsj_envios_manuais?id=eq.'+encodeURIComponent(row.id);
 const patch=body=>db(path,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify(body)});
 if(matches.length!==1){await patch({resultado_reconciliacao:matches.length?'Mais de uma mensagem corresponde ao quadro; identificação pendente.':'Mensagem não localizada entre as mensagens recentes; apagamento não garantido.'});return;}
 const message=matches[0],id=message.id._serialized,when=new Date(message.timestamp*1000).toISOString();
 const events=await db('mensagens_whatsapp?whatsapp_message_id=eq.'+encodeURIComponent(id)+'&select=id,pessoa_id');
 if(events.some(e=>e.pessoa_id!==row.pessoa_id))throw Error('Identificador associado a outro destinatário; nenhuma alteração realizada.');
 if(!events.length)await db('mensagens_whatsapp?on_conflict=id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({id:row.id,pessoa_id:row.pessoa_id,direcao:'saida',tipo:'quadro_manual_identificado',conteudo:JSON.stringify({dia:row.dia,status:'identificado_no_whatsapp',confirmado_pelo_gestor:true}),whatsapp_message_id:id,criado_em:when})});
 await patch({whatsapp_message_id:id,mensagem_em:when,reconciliado_em:new Date().toISOString(),resultado_reconciliacao:'Mensagem identificada na conversa correta pelo link individual e pela data.'});
}

export async function runManualAwareRoutine({routine,db,connect,...options}){
 let connection,client,closed=false;
 const sharedConnect=()=>connection||=(async()=>{
  client=await connect();const destroy=client.destroy.bind(client);
  client.destroy=async()=>{if(closed)return;closed=true;await destroy();};return client;
 })();
 async function manualDb(path,opt={}){
  if(path==='rpc/fsj_pode_enviar'){
   const data=JSON.parse(opt.body||'{}');
   const rows=await db('fsj_envios_manuais?pessoa_id=eq.'+encodeURIComponent(data.p_pessoa)+'&dia=eq.'+encodeURIComponent(data.p_dia)+'&confirmado_em=not.is.null&select=id&limit=1');
   if(rows.length){console.log('Envio manual confirmado pelo gestor para '+data.p_pessoa+' em '+data.p_dia+'; automático não repetido.');return false;}
  }
  if(path.startsWith('mensagens_whatsapp?')&&path.includes('&tipo=eq.quadro_automatico&')&&!opt.method){
   const params=new URLSearchParams(path.slice(path.indexOf('?')+1)),pid=params.get('pessoa_id')?.replace(/^eq\./,'');
   const rows=await db('fsj_envios_manuais?pessoa_id=eq.'+encodeURIComponent(pid)+'&dia=lt.'+localDay()+'&confirmado_em=not.is.null&order=dia.desc&limit=1&select=*');
   if(rows[0])await reconcileManual({db,connect:sharedConnect,row:rows[0]});
   return db(path.replace('&tipo=eq.quadro_automatico&','&tipo=in.(quadro_automatico,quadro_manual_identificado)&'),opt);
  }
  return db(path,opt);
 }
 try{return await routine({...options,db:manualDb,connect:sharedConnect});}
 finally{if(client&&!closed)await client.destroy();}
}

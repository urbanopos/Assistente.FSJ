const pause=ms=>new Promise(r=>setTimeout(r,ms));
export async function deletionAttempts({ids,revoke,state={},persist=async()=>{},wait=pause}){
 const unique=[...new Set(ids.filter(x=>typeof x==='string'&&x))];
 state.policy=3;state.items ||= {};
 for(const id of unique){const item=state.items[id]||={attempts:0,status:'pendente'};
  while(item.status!=='confirmado'&&item.attempts<5){item.attempts++;await persist(state);
   try{const r=await revoke(id);item.status=r.status;item.reason=String(r.reason||'').slice(0,500);}catch(e){item.status='falhou';item.reason=String(e.message).slice(0,500);}
   await persist(state);if(item.status!=='confirmado'&&item.attempts<5)await wait(1000);
  }
 }
 const failures=unique.filter(id=>state.items[id].status!=='confirmado');
 state.status=!unique.length?'nao_aplicavel':failures.length?'sem_confirmacao':'confirmado';
 state.failedIds=failures;state.reason=failures.map(id=>state.items[id].reason||state.items[id].status).join('; ').slice(0,2000);await persist(state);return state;
}
export async function sendAttempts({card,conventional,wait=pause}){
 let last;
 for(const [format,attempt] of [['pdf',card],['convencional',conventional]]){
  if(!attempt)continue;
  for(let i=1;i<=5;i++){
   try{return {...await attempt(i),format};}catch(e){last=e;if(e.deliveryResult?.messageId||e.notTransmitted!==true)throw e;if(i<5)await wait(1000);}
  }
 }
 throw last||Object.assign(Error('Nenhuma mensagem preparada.'),{notTransmitted:true});
}
export async function reportDeletion({personId,day,ids,reason}){
 const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!key)throw Error('Chave do executor indisponivel para registrar pendencia.');
 const r=await fetch('https://awrxnzbfrsaurzpunuko.supabase.co/rest/v1/rpc/fsj_pendencia_apagamento_whatsapp',{method:'POST',headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({p_pessoa:personId,p_dia:day,p_ids:ids,p_motivo:reason}),signal:AbortSignal.timeout(30000)});
 if(!r.ok)throw Error('Registro da tarefa de limpeza: HTTP '+r.status);return await r.json();
}
export async function ensureDeletionTask({deletion,personId,day,state,persist,report=reportDeletion}){
 if(!deletion?.failedIds?.length||state.deletionTask?.tarefa_id)return;
 state.deletionTaskPending=true;await persist(state);
 try{state.deletionTask=await report({personId,day,ids:deletion.failedIds,reason:deletion.reason});state.deletionTaskPending=false;delete state.deletionTaskError;await persist(state);}
 catch(e){state.deletionTaskError=String(e.message).slice(0,500);await persist(state);console.warn('Tarefa de limpeza pendente de registro; envio do dia continua. '+state.deletionTaskError);}
}
export async function cycleWithFollowup({state,previous,persist,revoke,send,record,url,personId,day,report,wait}){
 if(state.phase==='sending'&&!state.messageId)throw Error('Envio incerto: conferir a conversa antes de repetir.');
 if(state.messageId){await ensureDeletionTask({deletion:state.deletion,personId,day,state,persist,report});await record('quadro_automatico',{status:'enviado',messageId:state.messageId,messageIds:state.messageIds||[state.messageId],ack:state.ack||0});return state;}
 const ids=[...(previous?.messageIds||[]),...(previous?.messageId?[previous.messageId]:[])];
 state.deletion=await deletionAttempts({ids,revoke,state:state.deletion?.policy===3?state.deletion:{},persist:async d=>{state.deletion=d;await persist(state)},wait});
 await record('apagamento_automatico',state.deletion);
 await ensureDeletionTask({deletion:state.deletion,personId,day,state,persist,report});
 const text=(state.deletion.failedIds.length?'Aviso: a mensagem anterior nao teve o apagamento confirmado.\n':'')+url+'\n\nESTA MENSAGEM CANCELA AS ANTERIORES';
 state.phase='sending';await persist(state);
 const known=async result=>{state.messageId=result.messageId;state.messageIds=result.messageIds||[result.messageId];state.ack=result.ack||0;state.sentAt=result.sentAt;state.phase='sent';await persist(state);};
 try{const result=await send(text,known);await known(result);}
 catch(e){if(e.deliveryResult?.messageId){await known(e.deliveryResult);}else{state.phase=e.notTransmitted===true?'new':'sending';state.lastSendError=String(e.message).slice(0,500);await persist(state);await record(e.notTransmitted===true?'falha_rotina':'envio_incerto',{status:'sem_confirmacao',reason:state.lastSendError});throw e;}}
 await record('quadro_automatico',{status:'enviado',messageId:state.messageId,messageIds:state.messageIds,ack:state.ack,sentAt:state.sentAt});
 await ensureDeletionTask({deletion:state.deletion,personId,day,state,persist,report});return state;
}

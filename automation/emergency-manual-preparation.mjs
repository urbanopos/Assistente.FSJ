// Executor emergencial apaga a anterior; o proprietário envia a nova no WhatsApp.
export async function prepareEmergencyManual({state,previousMessageId,chatId,persist,revoke,record}){
 if(!previousMessageId||!chatId)throw Error('Destinatário e mensagem anterior identificada são obrigatórios.');
 const binding=JSON.stringify({previousMessageId,chatId});
 if(state.manualBinding&&state.manualBinding!==binding)throw Error('Diário pertence a outro destinatário.');
 state.manualBinding=binding;
 if(state.deletion?.status!=='confirmado'){
  state.phase='deleting';await persist(state);
  try{state.deletion=await revoke(previousMessageId,chatId);}
  catch(e){state.deletion={status:'falhou',reason:String(e.message||e).slice(0,500)};}
  await persist(state);
 }
 await record('apagamento_emergencial',{...state.deletion,previousMessageId});
 if(state.deletion?.status!=='confirmado'){
  state.phase='blocked';await persist(state);
  throw Error('Apagamento não confirmado. A nova mensagem não foi liberada para envio.');
 }
 state.phase='ready_manual';await persist(state);return state;
}

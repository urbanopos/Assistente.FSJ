/* Componente interno do pacote Disparo de Emergência; usa a sessão do proprietário. */
(()=>{
 const running=new Map();
 window.fsjDisparoEmergencialIntegrado=async function(pessoaId,onStatus=()=>{}){
  if(running.has(pessoaId))return running.get(pessoaId);
  const operation=(async()=>{
   const status=await api('/functions/v1/emergency-agent',{method:'POST',body:JSON.stringify({action:'status'})});
   if(status.online!==true)throw Error('Disparo de Emergência indisponível: executor do pacote desconectado. Nenhum apagamento ou envio solicitado.');
   onStatus('Solicitando substituição: apagar a anterior e enviar a nova...');
   const result=await api('/functions/v1/emergency-agent',{method:'POST',body:JSON.stringify({action:'submit',pessoa_id:pessoaId,request_id:crypto.randomUUID()})});
   const id=result.job?.id;if(!id)throw Error('O pacote não retornou o identificador do pedido.');
   // Guardar o pedido, sem reenviar em caso de perda da página ou resposta demorada.
   try{sessionStorage.setItem('fsj_emergencia_pedido:'+pessoaId,id);}catch{}
   const until=Date.now()+180000;
   while(Date.now()<until){
    const response=await api('/functions/v1/emergency-agent',{method:'POST',body:JSON.stringify({action:'job',id})});
    const job=response.job;
    if(!job)throw Error('Pedido não localizado. Nenhuma repetição automática será feita.');
    if(job.estado==='enviado'){onStatus('Mensagem anterior apagada para todos e nova mensagem enviada.');return job;}
    if(['bloqueado','incerto','expirado'].includes(job.estado))throw Error(job.resultado||'Substituição interrompida. Confira a conversa antes de repetir.');
    onStatus(job.estado==='executando'?'Executor realizando apagamento e substituição...':'Pedido aguardando o executor do pacote...');
    await new Promise(r=>setTimeout(r,2000));
   }
   throw Error('Pedido ainda sem resultado final. Ele permanece registrado; não houve nova solicitação automática.');
  })();
  running.set(pessoaId,operation);
  try{return await operation;}finally{running.delete(pessoaId);}
 };
})();

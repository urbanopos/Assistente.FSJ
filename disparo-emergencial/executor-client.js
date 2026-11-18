/* Disparo emergencial: envio automático pelo executor dedicado; sem abrir envio manual. */
(()=>{
 const running=new Map();
 window.fsjDisparoEmergencialIntegrado=async function(pessoaId,onStatus=()=>{},onReady=()=>{}){
  if(running.has(pessoaId))return running.get(pessoaId);
  const operation=(async()=>{
   const status=await api('/functions/v1/emergency-agent',{method:'POST',body:JSON.stringify({action:'status'})});
   if(status.online!==true)throw Error('Executor do pacote desconectado. Nenhuma mensagem foi apagada ou enviada.');
   onStatus('Preparando a conversa: identificando e apagando a mensagem anterior...');
   const result=await api('/functions/v1/emergency-agent',{method:'POST',body:JSON.stringify({action:'submit',pessoa_id:pessoaId,request_id:crypto.randomUUID()})});
   const id=result.job?.id;if(!id)throw Error('Pedido de emergência sem identificador.');
   try{sessionStorage.setItem('fsj_emergencia_pedido:'+pessoaId,id);}catch{}
   const until=Date.now()+180000;
   while(Date.now()<until){
    const response=await api('/functions/v1/emergency-agent',{method:'POST',body:JSON.stringify({action:'job',id})});
    const job=response.job;if(!job)throw Error('Pedido não localizado; nenhuma repetição automática.');
    if(job.estado==='pronto_para_envio'){
     onStatus('Envio preparado. Aguardando confirmação no WhatsApp, sem abrir outro envio.');
    }
    if(job.estado==='enviado'){onStatus('Envio confirmado pelo executor no WhatsApp; nenhuma repetição solicitada.');return job;}
    if(['bloqueado','incerto','expirado'].includes(job.estado))throw Error(job.resultado||'Preparação interrompida. Confira a conversa antes de repetir.');
    if(job.estado!=='pronto_para_envio')onStatus('Aguardando o executor concluir o envio com o cabeçalho...');
    await new Promise(r=>setTimeout(r,2000));
   }
   throw Error('Pedido ainda sem resultado final. Não será repetido automaticamente.');
  })();
  running.set(pessoaId,operation);
  try{return await operation;}finally{running.delete(pessoaId);}
 };
})();

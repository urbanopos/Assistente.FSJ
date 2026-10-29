/* Disparo emergencial: apaga a anterior; abertura da conversa e envio final manual. */
(()=>{
 const running=new Map();
 window.fsjDisparoEmergencialIntegrado=async function(pessoaId,onStatus=()=>{},onReady=()=>{}){
  if(running.has(pessoaId))return running.get(pessoaId);
  let tab=null,opened=false;
  try{tab=window.open('about:blank','_blank');if(tab)tab.opener=null;}catch{}
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
     if(!/^55[0-9]{10,11}$/.test(job.phone)||!job.mensagem)throw Error('Dados da mensagem indisponíveis.');
     const mobile=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
     const url=mobile?'https://wa.me/'+job.phone+'?text='+encodeURIComponent(job.mensagem):'https://web.whatsapp.com/send?phone='+encodeURIComponent(job.phone)+'&text='+encodeURIComponent(job.mensagem);
     onReady(job,url);
     if(tab&&!tab.closed){tab.location.replace(url);opened=true;}
     onStatus(opened?'Mensagem anterior apagada. Confira a conversa e pressione Enviar no WhatsApp.':'Mensagem anterior apagada. Toque em Abrir conversa com a mensagem; confira e pressione Enviar no WhatsApp.');
     return job;
    }
    if(job.estado==='enviado'){onStatus('Envio já identificado no WhatsApp; nenhuma repetição solicitada.');return job;}
    if(['bloqueado','incerto','expirado'].includes(job.estado))throw Error(job.resultado||'Preparação interrompida. Confira a conversa antes de repetir.');
    onStatus('Aguardando confirmação do apagamento da mensagem anterior...');
    await new Promise(r=>setTimeout(r,2000));
   }
   throw Error('Pedido ainda sem resultado final. Não será repetido automaticamente.');
  })();
  running.set(pessoaId,operation);
  try{return await operation;}finally{running.delete(pessoaId);if(tab&&!opened){try{tab.close();}catch{}}}
 };
})();

/* FSJ_DAILY_PROGRESS_V1: monthly display never changes operational task state. */
window.FSJDaily=(()=>{
 const cache=new Map(),requests=new Map();
 const month=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Recife',year:'numeric',month:'2-digit'}).format(new Date()).slice(0,7);
 const daily=t=>['diaria'].includes(t.frequency||t.periodicidade)||(t.daily===true||t.diaria===true);
 const key=(m,p)=>m+'|'+(p||'');
 function text(t,progress){
  const status=t.status||t.situacao||'Em aberto';
  if(!daily(t)||status==='Arquivado')return status;
  const ratio=progress?.rotulo||'… / …';
  return status==='Concluída'?ratio:status+' • '+ratio;
 }
 async function load(m=month(),p='',force=false){
  m=m||month();p=p||'';const k=key(m,p);
  if(requests.has(k))return requests.get(k);
  if(!force&&cache.has(k))return cache.get(k);
  const pending=(async()=>{
   const result=await api('/functions/v1/supervisao',{method:'POST',body:JSON.stringify({action:'daily-progress',mes:m,pessoa_id:p})});
   cache.set(k,result.resumos||{});return result.resumos||{};
  })().finally(()=>requests.delete(k));
  requests.set(k,pending);return pending;
 }
 function ownerText(t,m=month(),p=''){
  m=m||month();return text(t,cache.get(key(m,p))?.[t.id]);
 }
 function ensure(m=month(),p='',redraw){
  m=m||month();const k=key(m,p);
  if(cache.has(k)||requests.has(k))return;
  load(m,p).then(()=>redraw?.()).catch(()=>{
   const el=document.getElementById('retornosSyncStatus');
   if(el)el.textContent='Indicador mensal indisponível. Confira a conexão e atualize novamente.';
  });
 }
 const hint=p=>p?'Concluídas em tempo / dias de trabalho previstos em '+p.mes+'. Até 23h59 do dia seguinte (Recife).':'Indicador mensal em atualização.';
 return {month,daily,text,load,ensure,ownerText,hint};
})();

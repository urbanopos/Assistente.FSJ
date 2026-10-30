/* Aviso de expediente; mantém a autorização e os perfis sob controle do servidor. */
(()=>{
 const endpoint=/^https:\/\/awrxnzbfrsaurzpunuko\.supabase\.co\/functions\/v1\/(resposta-tarefa|supervisao)(?:\?|$)/;
 const nativeFetch=window.fetch.bind(window);
 let lastOpen=null,ownerExempt=false;
 function isOpen(now=new Date()){
  const p=new Intl.DateTimeFormat('en-GB',{timeZone:'America/Recife',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(now);
  const value=k=>Number(p.find(x=>x.type===k).value),t=value('hour')*3600+value('minute')*60+value('second');
  return t>=7*3600&&t<=12*3600||t>=14*3600&&t<=16*3600+20*60;
 }
 window.fsjConsultaEmExpediente=isOpen;
 function notice(show){
  if(ownerExempt)show=false;
  document.documentElement.classList.toggle('fsj-afterhours',show);
  if(!document.body)return;
  document.body.classList.toggle('fsj-afterhours',show);
  let banner=document.getElementById('fsjHoursBanner');
  if(!banner&&show){
   banner=document.createElement('aside');banner.id='fsjHoursBanner';banner.className='fsj-hours-banner';banner.setAttribute('role','status');
   banner.innerHTML='<div class="fsj-hours-clock" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"></circle><path d="M12 6v6l4 2"></path></svg></div><div class="fsj-hours-copy"><p class="fsj-hours-eyebrow">CONSULTA DE TAREFAS</p><p class="fsj-hours-text">A partir das <span class="fsj-hours-time">7:00h</span>, disponível para consulta, exceto nos horários de descanso e após o expediente.</p><p class="fsj-hours-note">Horário de Pernambuco</p></div>';
   // Fora dos quadros protegidos: o aviso continua visível ao ocultar toda a tela.
   (document.querySelector('main')||document.body).prepend(banner);
  }
  if(banner)banner.hidden=!show;
  document.querySelectorAll('main > :not(#fsjHoursBanner),.footnav,[role="dialog"],dialog').forEach(el=>{
   if(show){if(!el.hasAttribute('data-fsj-hours-inert'))el.setAttribute('data-fsj-hours-inert',el.inert?'1':'0');el.inert=true;}
   else if(el.hasAttribute('data-fsj-hours-inert')){el.inert=el.getAttribute('data-fsj-hours-inert')==='1';el.removeAttribute('data-fsj-hours-inert');}
  });
  if(show)for(const id of ['openCount','runningCount','pendingCount','questionCount']){const el=document.getElementById(id);if(el)el.textContent='—';}
 }
 window.fetch=async function(input,init){
  const response=await nativeFetch(input,init);
  const url=typeof input==='string'?input:input?.url||'';
  if(endpoint.test(url)){
   let token=null,action=null;try{const body=init?.body;const data=typeof body==='string'?JSON.parse(body):null;token=data?.token||body?.get?.('token');action=data?.action||body?.get?.('action');}catch{}
   if(token&&action!=='diagnostic'){
    try{
     const data=await response.clone().json();
     if(response.status===403&&['fora_expediente','consulta_antes_7h'].includes(data.codigo)){ownerExempt=false;notice(true);}
     else if(response.ok){ownerExempt=data.proprietario_horario_livre===true;notice(!ownerExempt&&!isOpen());}
    }catch{}
   }
  }
  return response;
 };
 function check(){const open=isOpen();if(!open)notice(true);if(lastOpen!==null&&open!==lastOpen)window.dispatchEvent(new CustomEvent('fsj-expediente-change',{detail:{open}}));lastOpen=open;}
 // Retorno do Android e restauração do histórico também passam pelo bloqueio.
 setInterval(check,1000);
 document.addEventListener('DOMContentLoaded',check);
 window.addEventListener('pageshow',check);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)check();});
 check();
})();


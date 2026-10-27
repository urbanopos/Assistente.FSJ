/* FSJ: modo diagnostico autenticado, somente consulta. */
(()=>{'use strict';
const endpoint='https://awrxnzbfrsaurzpunuko.supabase.co/functions/v1/resposta-tarefa';
const token=new URLSearchParams(location.hash.slice(1)).get('token')||'';
const access=localStorage.getItem('fsj_access_token')||'';
let active=false,checking=!!access;
const original=window.fetch.bind(window);
function mutates(body){if(body instanceof FormData)return /^(start|submit)$/i.test(String(body.get('action')||''));if(typeof body==='string'){try{return /^(start|submit)$/i.test(String(JSON.parse(body).action||''))}catch{}}return false;}
window.fetch=(input,init={})=>{
 const url=typeof input==='string'?input:input?.url||'';
 const method=String(init.method||input?.method||'GET').toUpperCase();
 if((active||checking)&&!['GET','HEAD'].includes(method)){
  if(url.startsWith(endpoint)){
   if(mutates(init.body))return Promise.reject(Error('Modo Diagnóstico: gravação bloqueada.'));
   const headers=new Headers(init.headers||input?.headers||{});
   headers.set('Authorization','Bearer '+access);
   init={...init,headers};
  }else return Promise.reject(Error('Modo Diagnóstico: operação bloqueada.'));
 }
 return original(input,init);
};
function decorate(){
 if(document.getElementById('fsjDiagnosticBadge'))return;
 document.documentElement.classList.add('fsj-diagnostic');
 const badge=document.createElement('span');badge.id='fsjDiagnosticBadge';badge.textContent='Modo Diagnóstico';
 badge.style.cssText='display:inline-block;margin:5px;padding:5px 9px;border-radius:9px;background:#eef6ef;color:#174b3b;font:600 12px system-ui';
 (document.querySelector('header .brand,.top .brand,header')||document.body).append(badge);
 const note=document.createElement('p');note.textContent='Somente consulta — ações executivas desativadas.';
 note.style.cssText='padding:7px;text-align:center;background:#eef6ef;color:#174b3b;font:12px system-ui';
 (document.querySelector('header,.top')||document.body).insertAdjacentElement('afterend',note);
 document.querySelectorAll('#startTask,#taskAnswer,#send,#dictate,#files,#why,#missing').forEach(x=>{x.hidden=true;x.disabled=true;});
 const form=document.getElementById('form');if(form){form.hidden=true;form.style.display='none';}
}
document.addEventListener('click',e=>{
 if(!active&&!checking)return;
 const el=e.target.closest('button,input[type=submit],a');if(!el)return;
 const label=(el.textContent||el.value||'').trim();
 if(el.matches('#startTask,#answerYes,#answerNo,#send,#dictate,#files,#why,#missing')||/^(iniciar|retomar|conclu[ií]r|enviar resposta|enviar justificativa|salvar|registrar|excluir|editar|aprovar|rejeitar|solicitar|sugerir)/i.test(label)){e.preventDefault();e.stopImmediatePropagation();}
},true);
document.addEventListener('submit',e=>{if(active||checking){e.preventDefault();e.stopImmediatePropagation();}},true);
const ready=(async()=>{
 if(!access||!token){checking=false;return false;}
 try{
  const r=await original(endpoint,{method:'POST',cache:'no-store',headers:{'Content-Type':'application/json',Authorization:'Bearer '+access},body:JSON.stringify({action:'diagnostic',token})});
  if(!r.ok)return false;
  active=(await r.json()).diagnostico===true;
  if(active){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',decorate,{once:true});else decorate();}
  return active;
 }catch{return false}finally{checking=false;}
})();
window.FSJDiagnostic={ready,isActive:()=>active,isChecking:()=>checking};
})();
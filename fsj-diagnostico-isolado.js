/* FSJ diagnostico isolado: sem acesso a fsj_access_token do aplicativo principal. */
(()=>{'use strict';
const store='fsj_diag_session_v1',base='https://awrxnzbfrsaurzpunuko.supabase.co',endpoint=base+'/functions/v1/resposta-tarefa',key='sb_publishable_IU8K4qN5LLWSmr8Z4vYxMA_NiEY9gu3';
const token=new URLSearchParams(location.hash.slice(1)).get('token')||'';
const nativeFetch=window.fetch.bind(window);let active=false,checking=false,session=null;
try{session=JSON.parse(localStorage.getItem(store)||'null')}catch{}
const originalToken=session?.access_token||'';
checking=!!(token&&session?.refresh_token);
const guarded=new Set(['start','submit','save','delete','update','create','approve','reject']);
function actionOf(body){if(body instanceof FormData)return String(body.get('action')||'').toLowerCase();if(typeof body==='string'){try{return String(JSON.parse(body).action||'').toLowerCase()}catch{}}return ''}
function readOnly(e){const t=e.target.closest('button,input,select,textarea,a');if(!t)return;const label=(t.textContent||t.value||'').trim();if(t.matches('#startTask,#answerYes,#answerNo,#send,#dictate,#files,#why,#missing,[type=submit],[type=file]')||/^(iniciar|retomar|conclu[ií]r|enviar|salvar|registrar|excluir|editar|aprovar|rejeitar|solicitar|sugerir)/i.test(label)){e.preventDefault();e.stopImmediatePropagation();}}
window.fetch=(input,init={})=>{
 const url=typeof input==='string'?input:input?.url||'',method=String(init.method||input?.method||'GET').toUpperCase();
 if((active||checking)&&url.startsWith(endpoint)&&method==='POST'){
  if(guarded.has(actionOf(init.body)))return Promise.reject(Error('Modo Diagnóstico: alterações bloqueadas.'));
  const headers=new Headers(init.headers||input?.headers||{});headers.set('Authorization','Bearer '+(session?.access_token||''));init={...init,headers};
 }else if(active&&method!=='GET'&&method!=='HEAD')return Promise.reject(Error('Modo Diagnóstico: somente consulta.'));
 return nativeFetch(input,init);
};
function badge(){if(document.getElementById('fsjDiagnosticBadge'))return;const note=document.createElement('div');note.id='fsjDiagnosticBadge';note.textContent='MODO DIAGNÓSTICO · Somente consulta';note.style.cssText='position:sticky;top:0;z-index:99999;padding:9px;text-align:center;background:#e0f1e7;color:#174b3b;font:bold 13px system-ui;border-bottom:2px solid #175c40';document.body.prepend(note);document.querySelectorAll('#startTask,#taskAnswer,#send,#dictate,#files,#why,#missing,#form').forEach(el=>{el.hidden=true;el.style.display='none';el.disabled=true});}
function expired(){const p=document.createElement('div');p.setAttribute('role','alert');p.style.cssText='padding:10px;background:#fff3da;color:#694800;text-align:center';p.textContent='Sessão de diagnóstico expirada. ';const a=document.createElement('a');a.href='./diagnostico-acesso.html';a.textContent='Autenticar novamente';p.append(a);document.body.prepend(p)}
async function renew(){if(!session?.refresh_token)throw Error('Sem renovação');const r=await nativeFetch(base+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:key,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:session.refresh_token})});if(!r.ok)throw Error('Sessão expirada');const d=await r.json();session={access_token:d.access_token,refresh_token:d.refresh_token,expires_at:Date.now()+(d.expires_in||3600)*1000};localStorage.setItem(store,JSON.stringify(session));}
async function verify(){let r=await nativeFetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+session.access_token},body:JSON.stringify({action:'diagnostic',token})});if(r.status===401){await renew();r=await nativeFetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+session.access_token},body:JSON.stringify({action:'diagnostic',token})});}if(!r.ok)throw Error('Falha de autenticação');return (await r.json()).diagnostico===true;}
document.addEventListener('click',e=>{if(active||checking)readOnly(e)},true);document.addEventListener('submit',e=>{if(active||checking){e.preventDefault();e.stopImmediatePropagation()}},true);
const ready=(async()=>{if(!checking)return false;try{if(session.expires_at<Date.now()+30000)await renew();active=await verify();if(active){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',badge,{once:true});else badge();}return active}catch{localStorage.removeItem(store);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',expired,{once:true});else expired();return false}finally{checking=false}})();
window.FSJDiagnostic={ready,isActive:()=>active,isChecking:()=>checking};
})();
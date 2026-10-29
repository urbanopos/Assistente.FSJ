/* FSJ: consulta protegida para Proprietario em links de resposta. Funcionarios sem sessao de gestor nao sao alterados. */
(()=>{'use strict';
const access=localStorage.getItem('fsj_access_token'),refresh=localStorage.getItem('fsj_refresh_token');
if(!access&&!refresh)return;
const token=new URLSearchParams(location.hash.slice(1)).get('token');
if(!token||!location.pathname.endsWith('/responder.html'))return;
const endpoint='https://awrxnzbfrsaurzpunuko.supabase.co/functions/v1/resposta-tarefa';
const auth='https://awrxnzbfrsaurzpunuko.supabase.co/auth/v1/token?grant_type=refresh_token';
const key='sb_publishable_IU8K4qN5LLWSmr8Z4vYxMA_NiEY9gu3';
let mode='checking',verified=false;
const status=document.createElement('div');status.id='fsjOwnerDiagnostic';
status.style.cssText='position:sticky;top:0;z-index:99999;background:#e0f1e7;color:#174b3b;border-bottom:2px solid #175c40;padding:8px 12px;font:14px system-ui;text-align:center';
const label=document.createElement('strong'),button=document.createElement('button');
button.type='button';button.style.cssText='margin-left:10px;padding:7px 12px;border-radius:8px;background:#175c40;color:#fff;border:0;font:inherit';
status.append(label,button);
function show(){document.documentElement.dataset.fsjOwnerMode=mode;document.dispatchEvent(new CustomEvent('fsj:owner-mode'));label.textContent=mode==='checking'?'Verificando acesso do Proprietário…':mode==='readonly'?'MODO DIAGNÓSTICO · Somente consulta':mode==='unlocked'?'AÇÕES DESBLOQUEADAS · Proprietário':'Acesso pelo link da tarefa · permissões verificadas pelo servidor';button.hidden=mode==='checking'||mode==='failed';button.textContent=mode==='readonly'?'Desbloquear ações':'Voltar ao diagnóstico';}
function mount(){if(!document.getElementById(status.id))document.body.prepend(status);show();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
function guarded(e){if(mode==='unlocked'||mode==='failed')return;
const el=e.target.closest?.('button,input,select,textarea,a');
if(!el||status.contains(el))return;
if(el.matches('#startTask,#suspendTask,#answerYes,#answerNo,#send,#dictate,#files,#galleryFiles,#openGallery,#why,#missing,[type=submit],[type=file]')){e.preventDefault();e.stopImmediatePropagation();if(mode==='readonly')label.textContent='Modo Diagnóstico: use Desbloquear ações para registrar.';}}
document.addEventListener('click',guarded,true);
document.addEventListener('submit',e=>{if(mode==='readonly'||mode==='checking'){e.preventDefault();e.stopImmediatePropagation();}},true);
const nativeFetch=window.fetch.bind(window);
window.fetch=(input,init={})=>{
 const url=typeof input==='string'?input:input?.url||'';
 const method=String(init.method||input?.method||'GET').toUpperCase();
 if(url.startsWith(endpoint)&&method==='POST'){
  let action='';try{action=init.body instanceof FormData?String(init.body.get('action')||''):JSON.parse(init.body||'{}').action||''}catch{}
  if((mode==='readonly'||mode==='checking')&&['start','suspend','submit'].includes(action))return Promise.reject(Error('Modo Diagnóstico: desbloqueie ações primeiro.'));
  if(mode==='readonly'||mode==='checking'){
   const headers=new Headers(init.headers||{});if(window.fsjOwnerDiagnosticToken)headers.set('Authorization','Bearer '+window.fsjOwnerDiagnosticToken);
   init={...init,headers};
  }
 }
 return nativeFetch(input,init);
};
button.onclick=()=>{if(!verified)return;mode=mode==='readonly'?'unlocked':'readonly';show();};
async function verify(jwt){const r=await nativeFetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+jwt},body:JSON.stringify({action:'diagnostic',token})});if(!r.ok)return null;const d=await r.json();return d.diagnostico===true?d:null;}
(async()=>{
 try{
  let jwt=access;
  let identity=jwt?await verify(jwt):null;
  if(identity){verified=true;window.fsjOwnerDiagnosticToken=jwt;mode=identity.propria_tarefa===true?'unlocked':'readonly';show();return;}
  if(refresh){
   const r=await nativeFetch(auth,{method:'POST',headers:{apikey:key,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:refresh})});
   if(r.ok){const d=await r.json();jwt=d.access_token;localStorage.setItem('fsj_access_token',d.access_token);localStorage.setItem('fsj_refresh_token',d.refresh_token);
    identity=await verify(jwt);if(identity){verified=true;window.fsjOwnerDiagnosticToken=jwt;mode=identity.propria_tarefa===true?'unlocked':'readonly';show();return;}
   }
  }
  mode='failed';show();
 }catch{mode='failed';show();}
})();
})();

/* FSJ - Protecao de consulta do Proprietario.
 * Nunca transforma um link individual em autorizacao para agir pelo executor.
 * Acoes administrativas sao realizadas exclusivamente no painel de gestao.
 */
(()=>{'use strict';
const base='https://awrxnzbfrsaurzpunuko.supabase.co';
const endpoint=base+'/functions/v1/resposta-tarefa';
const key='sb_publishable_IU8K4qN5LLWSmr8Z4vYxMA_NiEY9gu3';
const token=new URLSearchParams(location.hash.slice(1)).get('token');
if(!token||!location.pathname.endsWith('/responder.html'))return;
const hadSession=!!(localStorage.getItem('fsj_access_token')||localStorage.getItem('fsj_refresh_token'));
if(!hadSession)return; // Acesso de executor continua regido pelo token e pelo servidor.
const nativeFetch=window.fetch.bind(window);
let mode='checking',access=localStorage.getItem('fsj_access_token')||'',refreshing=null;
const banner=document.createElement('section');banner.id='fsjOwnerDiagnostic';
banner.setAttribute('role','status');banner.style.cssText='position:sticky;top:0;z-index:99999;padding:10px;background:#e0f1e7;color:#174b3b;border-bottom:2px solid #175c40;text-align:center;font:14px system-ui';
const label=document.createElement('strong'),button=document.createElement('button');
button.type='button';button.style.cssText='margin:5px 0 0 10px;padding:8px 12px;border:0;border-radius:8px;background:#175c40;color:white;font:inherit';
banner.append(label,button);
function render(){
 label.textContent=mode==='checking'?'Verificando sessão do Proprietário…':mode==='readonly'?'MODO DIAGNÓSTICO · Somente consulta':'Sessão de gestão não validada. Ações bloqueadas.';
 button.hidden=mode!=='readonly';
 button.textContent='Abrir gestão autorizada';
}
function mount(){if(!document.getElementById(banner.id))document.body.prepend(banner);render();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
function block(e){
 if(banner.contains(e.target))return;
 const el=e.target.closest?.('button,input,select,textarea,label');
 if(!el)return;
 if(el.matches('#startTask,#answerYes,#answerNo,#send,#dictate,#files,#galleryFiles,#openGallery,#why,#missing,[type=submit],[type=file]')||el.closest('#taskAnswer')){
  e.preventDefault();e.stopImmediatePropagation();
  label.textContent='Somente consulta: o Proprietário não pode responder pelo executor.';
 }
}
document.addEventListener('click',block,true);
document.addEventListener('change',block,true);
document.addEventListener('submit',e=>{e.preventDefault();e.stopImmediatePropagation();},true);
function hideActions(){
 for(const selector of ['#startTask','#taskAnswer','#send','#dictate','#files','#why','#missing']){
  const el=document.querySelector(selector);if(el){if(!el.hidden)el.hidden=true;if(el.style.display!=='none')el.style.display='none';if('disabled' in el&&!el.disabled)el.disabled=true;}
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hideActions,{once:true});else hideActions();
new MutationObserver(()=>hideActions()).observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:['hidden','style','disabled']});
async function renew(){
 if(refreshing)return refreshing;
 refreshing=(async()=>{
  const refresh=localStorage.getItem('fsj_refresh_token');
  if(!refresh)throw Error('Sem sessão renovável');
  const r=await nativeFetch(base+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:key,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:refresh})});
  if(!r.ok)throw Error('Sessão expirada');
  const d=await r.json();if(!d.access_token||!d.refresh_token)throw Error('Sessão inválida');
  access=d.access_token;localStorage.setItem('fsj_access_token',access);localStorage.setItem('fsj_refresh_token',d.refresh_token);
  return access;
 })();
 try{return await refreshing}finally{refreshing=null}
}
async function check(jwt){
 const r=await nativeFetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+jwt},body:JSON.stringify({action:'diagnostic',token})});
 if(!r.ok)return false;return (await r.json()).diagnostico===true;
}
// Uma sessão de gestão nunca pode usar o token do executor para gravar ações.
window.fetch=async(input,init={})=>{
 const url=typeof input==='string'?input:input?.url||'';
 const method=String(init.method||input?.method||'GET').toUpperCase();
 if(url.startsWith(endpoint)&&method==='POST'){
  let action='';
  try{action=init.body instanceof FormData?String(init.body.get('action')||''):String(JSON.parse(init.body||'{}').action||'')}catch{}
  if(['start','submit'].includes(action))throw Error('Modo Diagnóstico: ações do executor são proibidas ao Proprietário.');
  if(!access||mode==='failed')throw Error('Sessão de gestão não validada.');
  const headers=new Headers(init.headers||input?.headers||{});headers.set('Authorization','Bearer '+access);
  return nativeFetch(input,{...init,headers});
 }
 return nativeFetch(input,init);
};
button.onclick=()=>{if(mode!=='readonly')return;location.assign('./index.html');};
(async()=>{
 try{
  if(access&&await check(access)){mode='readonly';render();hideActions();return;}
  await renew();
  if(await check(access)){mode='readonly';render();hideActions();return;}
 }catch{}
 mode='failed';render();hideActions();
})();
})();
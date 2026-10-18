/* FSJ_AUTO_LOGIN_V1 */
;(()=>{
if(window.fsjAutoLoginInstalled)return;window.fsjAutoLoginInstalled=true;
const el=id=>document.getElementById(id),bridge=window.FSJAndroid;
if(!el('loginForm')||!bridge?.savedLogin||!bridge?.saveLogin)return;
let started=false,created=null;
const creation=el('createPasswordForm');
if(creation){
 const label=document.createElement('label');label.className='check';
 const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.id='fsjRememberCreated';checkbox.checked=true;
 label.append(checkbox,document.createTextNode('Salvar acesso neste aparelho'));creation.append(label);
 creation.addEventListener('submit',()=>{
  const first=el('createPassword')?.value,repeat=el('repeatPassword')?.value;
  created=first&&first===repeat?{password:first,remember:checkbox.checked}:null;
 },true);
}
document.addEventListener('fsj:session',event=>{
 if(!created)return;const data=created;created=null;
 // A senha só é salva depois de a VM confirmar a conta autenticada.
 const user=event.detail||window.fsjCurrentUser;
 if(user?.name)bridge.saveLogin(user.name,data.password,data.remember);
});
// Sair explicitamente cancela o acesso salvo, sem interferir em fechar/minimizar.
el('logout')?.addEventListener('click',()=>bridge.saveLogin('','',false),true);
async function start(){
 if(started)return;started=true;
 try{
  const saved=JSON.parse(bridge.savedLogin()||'{}');
  if(!saved.name||!saved.password)return;
  // Nunca substitui uma sessão existente, inclusive a sessão restrita de chamada.
  const response=await fetch('/api/me',{credentials:'same-origin',cache:'no-store'});
  if(response.ok)return;
  if(response.status!==401&&response.status!==403)return;
  if(window.fsjCurrentUser||el('content')?.hidden===false)return;
  el('name').value=saved.name;el('password').value=saved.password;
  if(el('rememberLogin'))el('rememberLogin').checked=true;
  el('loginForm').requestSubmit();
 }catch{/* Falha de rede mantém o login disponível, sem tentativas em ciclo. */}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();

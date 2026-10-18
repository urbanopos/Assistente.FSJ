/* FSJ_PASSWORD_RECOVERY_V1 */
;(()=>{
const login=document.getElementById('login'),form=document.getElementById('loginForm');
if(!login||!form||document.getElementById('fsjForgotPassword'))return;
const requestButton=document.createElement('button');requestButton.type='button';requestButton.id='fsjForgotPassword';requestButton.textContent='Esqueci minha senha';
form.insertAdjacentElement('afterend',requestButton);
const panel=document.createElement('section');panel.className='card';panel.id='fsjRecovery';panel.hidden=true;
panel.style.cssText='order:-1;flex:1;min-height:0;overflow:auto';
panel.innerHTML='<h2>Recuperar senha</h2><form id="fsjRecoveryRequest"><label>Login<input id="fsjRecoveryName" autocomplete="username" required maxlength="40"></label><p>O codigo sera enviado automaticamente ao WhatsApp confirmado pelo Proprietario. Ele vale por 5 minutos.</p><button>Enviar codigo pelo WhatsApp</button></form><form id="fsjRecoveryReset" hidden><label>Codigo recebido<input id="fsjRecoveryCode" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" maxlength="6" required></label><label>Nova senha<input id="fsjRecoveryPassword" type="password" minlength="10" maxlength="200" autocomplete="new-password" required></label><label>Confirmar nova senha<input id="fsjRecoveryConfirmation" type="password" minlength="10" maxlength="200" autocomplete="new-password" required></label><button type="button" id="fsjRecoveryShow">Mostrar senhas</button><button type="submit">Salvar nova senha</button><button type="button" id="fsjRecoveryResend">Solicitar outro codigo</button></form><p id="fsjRecoveryStatus" role="status" aria-live="polite"></p><button type="button" id="fsjRecoveryBack">Voltar para entrar</button>';
login.insertAdjacentElement('afterend',panel);
let ticket=null;
const el=id=>document.getElementById(id);
async function post(action,data){const response=await fetch('/api/password-recovery/'+action,{method:'POST',headers:{'Content-Type':'application/json','X-FSJ-Request':'1'},body:JSON.stringify(data),signal:AbortSignal.timeout(20000)});const result=await response.json();if(!response.ok)throw Error(result.error||'Nao foi possivel concluir.');return result;}
function back(){ticket=null;panel.hidden=true;login.hidden=false;el('fsjRecoveryReset').reset();el('fsjRecoveryStatus').textContent='';}
requestButton.onclick=()=>{login.hidden=true;const download=el('androidDownload');if(download)download.hidden=true;panel.hidden=false;el('fsjRecoveryName').value=el('name').value;el('fsjRecoveryRequest').hidden=false;el('fsjRecoveryReset').hidden=true;el('fsjRecoveryName').focus();};
el('fsjRecoveryBack').onclick=back;
el('fsjRecoveryResend').onclick=()=>{ticket=null;el('fsjRecoveryRequest').hidden=false;el('fsjRecoveryReset').hidden=true;el('fsjRecoveryReset').reset();el('fsjRecoveryStatus').textContent='Solicite outro codigo. Aguarde pelo menos um minuto entre envios.';};
el('fsjRecoveryShow').onclick=()=>{const show=el('fsjRecoveryPassword').type==='password';for(const id of ['fsjRecoveryPassword','fsjRecoveryConfirmation'])el(id).type=show?'text':'password';el('fsjRecoveryShow').textContent=show?'Ocultar senhas':'Mostrar senhas';el('fsjRecoveryShow').setAttribute('aria-pressed',String(show));};
el('fsjRecoveryRequest').onsubmit=async event=>{event.preventDefault();const button=event.target.querySelector('button');button.disabled=true;try{const data=await post('request',{name:el('fsjRecoveryName').value});ticket=data.request;el('fsjRecoveryRequest').hidden=true;el('fsjRecoveryReset').hidden=false;el('fsjRecoveryStatus').textContent=data.message;el('fsjRecoveryCode').focus();}catch(error){el('fsjRecoveryStatus').textContent=error.message;}finally{button.disabled=false;}};
el('fsjRecoveryReset').onsubmit=async event=>{event.preventDefault();if(!ticket)return;const button=event.target.querySelector('[type="submit"]');button.disabled=true;try{const data=await post('reset',{request:ticket,code:el('fsjRecoveryCode').value,password:el('fsjRecoveryPassword').value,confirmation:el('fsjRecoveryConfirmation').value});back();el('password').value='';const message=el('status');if(message)message.textContent=data.message;}catch(error){el('fsjRecoveryStatus').textContent=error.message;}finally{button.disabled=false;}};
// O contato de recuperacao so pode ser definido por uma sessao do Proprietario.
const details=el('accountDetails');
if(details){
const button=document.createElement('button');button.type='button';button.textContent='Confirmar WhatsApp de recuperacao';details.insertAdjacentElement('afterend',button);
button.onclick=async()=>{
const account=el('accountSelect')?.value;if(!account){alert('Selecione uma pessoa cadastrada.');return;}
const phone=prompt('WhatsApp confirmado desta pessoa (DDD e numero):');if(phone===null)return;
if(!confirm('Confirma que este WhatsApp pertence a pessoa selecionada? '+phone))return;
button.disabled=true;try{await post('owner/phone',{id:account,phone});alert('WhatsApp de recuperacao confirmado.');}catch(error){alert(error.message);}finally{button.disabled=false;}
};
}
})();

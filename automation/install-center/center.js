/* FSJ_INSTALL_CENTER_V1 */
;(()=>{
if(document.getElementById('fsjInstallCenter'))return;
const login=document.getElementById('login');if(!login)return;
const box=document.createElement('section');box.id='fsjInstallCenter';box.className='card';
box.innerHTML='<h2>Instalação e atualização</h2><p id="fsjInstallMessage" role="status">Solicite autorização ao Proprietário para liberar seu acesso.</p><button id="fsjInstallRequest" type="button">Solicitar autorização</button><button id="fsjInstallCheck" type="button">Consultar autorização</button><a id="fsjInstallPackage" class="download-app" href="/baixar/android" download="Assistente-FSJ-Reserva.apk" hidden>Instalar Android</a><button id="fsjInstallUpdate" type="button" hidden>Verificar atualização</button><p id="fsjInstallHelp">Instalação e atualização neste aparelho, diretamente do servidor da fazenda.</p>';
login.append(box);
const el=id=>document.getElementById(id);let busy=false;
async function check(){
if(busy)return;busy=true;el('fsjInstallCheck').disabled=true;
try{
 let allowed=false,message='Solicite autorização ao Proprietário para liberar seu acesso.';
 const response=await fetch('/api/me',{credentials:'same-origin',cache:'no-store'});
 if(response.ok){const user=await response.json();allowed=!user.call_only;message=allowed?'Conta autorizada. Instalação e atualizações disponíveis.':'Sessão restrita a chamada.';}
 else if(response.status===401||response.status===403){
  const token=localStorage.getItem('fsj_activation');
  if(token){const status=await fetch('/api/request-status',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','X-FSJ-Request':'1'},body:JSON.stringify({activation:token})});
   if(!status.ok)throw Error('Não foi possível consultar este pedido. Use sua senha ou fale com o Proprietário.');
   const data=await status.json();allowed=data.status==='approved'&&!data.expired;message=allowed?'Autorização aprovada. Crie sua senha e instale o aplicativo.':data.expired?'Autorização expirada. Solicite renovação ao Proprietário.':'Pedido aguardando liberação do Proprietário.';
  }
 }else throw Error('Servidor indisponível. Tente consultar novamente.');
 const android=/Android/i.test(navigator.userAgent),native=!!window.FSJAndroid;
 el('fsjInstallPackage').hidden=!allowed||!android||native;
 el('fsjInstallUpdate').hidden=!allowed;
 el('fsjInstallMessage').textContent=message;
 el('fsjInstallHelp').textContent=native?'As telas vêm da VM. Novas versões do Android são verificadas pelo aplicativo e pedem confirmação para instalar.':android?'Após baixar, abra o APK e confirme Instalar. Se solicitado, permita esta fonte no Android.':'Este instalador é para Android. No iPhone, use a versão web; não há pacote iOS nativo disponível.';
}catch(error){el('fsjInstallPackage').hidden=true;el('fsjInstallUpdate').hidden=true;el('fsjInstallMessage').textContent=error.message;}finally{busy=false;el('fsjInstallCheck').disabled=false;}
}
el('fsjInstallRequest').onclick=()=>document.getElementById('showRequest')?.click();
el('fsjInstallCheck').onclick=check;
el('fsjInstallUpdate').onclick=async()=>{
 const button=el('fsjInstallUpdate');button.disabled=true;
 try{const response=await fetch('/api/update-check',{cache:'no-store',credentials:'same-origin'});if(!response.ok)throw Error('Não foi possível solicitar a atualização.');el('fsjInstallMessage').textContent='Verificação solicitada. Reabrindo a tela atualizada…';setTimeout(()=>location.reload(),2000);}catch(error){el('fsjInstallMessage').textContent=error.message;button.disabled=false;}
};
document.addEventListener('fsj:session',check);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)check();});
// Mesmo local de consulta ao voltar do cadastro, sem substituir o formulário existente.
document.getElementById('backLogin')?.addEventListener('click',check);
check();
})();

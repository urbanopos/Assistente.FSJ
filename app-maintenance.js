/* Recuperacao explicita: preserva armazenamento, autenticacao e registros. */
(()=>{
'use strict';
let panel;
function show(mode='vm'){
 if(!panel){
 panel=document.createElement('dialog');panel.id='fsjMaintenance';panel.setAttribute('aria-labelledby','fsjMaintenanceTitle');
 panel.style.cssText='max-width:480px;width:calc(100% - 48px);border:0;border-radius:16px;padding:20px';
 panel.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center"><h2 id="fsjMaintenanceTitle"></h2><button type="button" aria-label="Fechar" data-close>×</button></div><p role="status" data-message></p><div data-actions style="display:grid;gap:12px"></div>';
 document.body.append(panel);panel.querySelector('[data-close]').onclick=()=>panel.close();
 }
 const vm=mode==='vm';panel.querySelector('h2').textContent=vm?'Assistente FSJ.VM — vídeos e chamadas':'Assistente FSJ.Web';
 panel.querySelector('[data-message]').textContent=vm?'Escolha o acesso. Se a internet pública falhar e você estiver na rede da fazenda, tente a rede local. O servidor precisa estar ligado.':'A atualização é automática. Use o reparo se alguma tela não estiver funcionando.';
 const actions=panel.querySelector('[data-actions]');actions.replaceChildren();
 function link(label,url){const a=document.createElement('a');a.textContent=label;a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.style.cssText='display:block;padding:12px;background:#176341;color:white;border-radius:8px;text-decoration:none';actions.append(a);}
 if(vm){
 link('Abrir pela internet pública','https://168.196.84.147/');
 link('Abrir pela rede local da fazenda','https://192.168.1.114:8443/');
 link('Reparar / atualizar aplicativo Android','./instalar-fsj-vm.html?manutencao=1');
 const note=document.createElement('p');note.textContent='Se os dois endereços falharem, o servidor ou a conexão precisam de manutenção. Reinstalar o aplicativo não corrige uma falha de rede. No Android, atualize sem desinstalar para preservar o acesso.';actions.append(note);
 }else{
 const b=document.createElement('button');b.type='button';b.textContent='Reparar telas do FSJ.Web';b.onclick=()=>{
 if(typeof window.fsjCanUpdate==='function'&&!window.fsjCanUpdate()){panel.querySelector('[data-message]').textContent='Conclua ou salve a edição antes do reparo. Seus dados foram preservados.';return;}
 panel.querySelector('[data-message]').textContent='Buscando as telas atuais. Sua sessão e seus registros serão preservados.';
 const url=new URL(location.href);url.searchParams.set('_fsj_repair',Date.now().toString());location.replace(url.href);
 };actions.append(b);
 link('Orientações de instalação','./instalar-fsj-web.html');
 }
 if(!panel.open)panel.showModal();
}
window.fsjOpenMaintenance=show;
window.abrirVideosReserva=()=>show('vm');
const section=document.getElementById('reservaInstallShare');
if(section){const row=document.createElement('div');row.className='row';for(const [mode,name] of [['web','FSJ.Web'],['vm','FSJ.VM']]){const b=document.createElement('button');b.type='button';b.textContent='Abrir / reparar '+name;b.onclick=()=>show(mode);row.append(b);}section.append(row);}
})();

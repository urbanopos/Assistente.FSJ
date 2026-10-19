/* FSJ_GUIDED_INSTALL_V1 */
;(()=>{
const el=id=>document.getElementById(id),mode=document.body.dataset.fsjApp,device=el('guideDevice');let step=0;
const vm='https://168.196.84.147/',web='https://urbanopos.github.io/Assistente.FSJ/';
const link=(url,label)=>url===vm?'<a class="action" href="'+url+'" target="FSJ_VIDEOS_CHAMADAS">'+label+'</a>':'<a class="action" href="'+url+'" target="_blank" rel="noopener noreferrer">'+label+'</a>';
const apk='<a class="action" href="./downloads/FSJ-Reserva-VM.apk" download="Assistente-FSJ-VM.apk">Baixar Assistente FSJ.VM para Android</a>';
function steps(){
 if(new URL(location.href).searchParams.get('manutencao')==='1'){
  return [[mode==='web'?'Atualizar Assistente FSJ.Web':'Atualizar Assistente FSJ.VM',
   '<p>Abra o aplicativo existente. As telas verificam atualizações ao abrir ou retomar, preservando seu acesso.</p>'+
   '<a class="action" href="'+(mode==='web'?web:vm)+'" target="FSJ_'+(mode==='web'?'WEB':'VIDEOS_CHAMADAS')+'">Abrir aplicativo e verificar atualizações</a>'+
   '<p>Na VM, use Verificar atualização dentro do aplicativo. Uma nova versão Android pede a confirmação de instalação do sistema.</p>'+
   '<p>Este procedimento não baixa o instalador Windows. A primeira instalação continua disponível no guia de instalação.</p>']];
 }

 if(mode==='web'){
  const instruction=device.value==='ios'?'Abra o aplicativo no Safari. Toque em Compartilhar, escolha Adicionar à Tela de Início e confirme Adicionar.':device.value==='android'?'Abra o aplicativo no Chrome. No menu ⋮, procure Instalar aplicativo ou Adicionar à tela inicial e confirme. O ícone será o da casinha.':'Abra o aplicativo no navegador. Use a opção Instalar aplicativo ou Criar atalho, quando disponível. Dê o nome Assistente FSJ.Web ao atalho.';
  return [
   ['Abrir o Assistente FSJ.Web','<p>Este é o aplicativo principal. Abra pelo botão abaixo e mantenha este guia aberto para consultar os próximos passos.</p>'+link(web,'Abrir Assistente FSJ.Web')],
   ['Adicionar o ícone','<p>'+instruction+'</p><p>Se o navegador oferecer apenas um atalho, ele abrirá o aplicativo pela internet.</p>'+link(web,'Abrir para instalar')],
   ['Entrar com sua autorização','<p>Abra pelo ícone criado. Use o acesso autorizado pelo Proprietário. O link de instalação não concede acesso aos registros e não altera as permissões existentes.</p><p>Se aparecer Acesso do Proprietário, somente o Proprietário deve usar a identificação exibida. Participantes devem utilizar seus próprios acessos autorizados.</p>'],
   ['Pronto para usar','<p>O ícone abre o Assistente FSJ.Web. As atualizações são verificadas automaticamente ao abrir ou retomar o aplicativo.</p>'+link(web,'Abrir Assistente FSJ.Web')]
  ];
 }
 if(device.value==='ios')return [
  ['Assistente FSJ.VM no iPhone','<p>Ainda não há instalador nativo para iPhone. O arquivo Android não funciona no iOS.</p><p>Há acesso web pela VM, quando a conexão HTTPS estiver reconhecida pelo aparelho. A instalação simplificada de um aplicativo iOS nativo ainda está pendente.</p>'],
  ['Consultar acesso web','<p>Abra no Safari. Se a conexão não for reconhecida ou não abrir, informe ao Proprietário; este guia não instala certificados no iPhone.</p>'+link(vm,'Abrir versão web da VM')],
  ['Adicionar à tela inicial','<p>Com o acesso web funcionando e autorizado: Safari → Compartilhar → Adicionar à Tela de Início. O ícone abrirá a versão web. Isso não instala um aplicativo iOS nativo.</p>']
 ];
 if(device.value==='desktop')return [
  ['Preparar o computador','<p>No Windows, o instalador existente configura os acessos e o certificado para o seu usuário. Ele cria os atalhos FSJ.Web e FSJ.VM.</p><a class="action" href="./downloads/Instalar-Assistente-FSJ.cmd" download>Baixar instalador Windows</a><p>Abra o arquivo e acompanhe as instruções. Em outros sistemas, use o navegador com conexão HTTPS reconhecida.</p>'],
  ['Solicitar autorização','<p>Abra Assistente FSJ.VM, escolha Primeiro acesso e informe seu nome, login desejado e contato. Aguarde a aprovação do Proprietário. Se já possui conta, use sua senha.</p>'+link(vm,'Abrir página da VM')],
  ['Usar o aplicativo','<p>Após aprovação, crie e confirme sua senha conforme a tela. Abra pelo atalho Assistente FSJ.VM. As atualizações das telas vêm da VM automaticamente.</p>']
 ];
 return [
  ['Solicitar autorização','<p>Abra a página da VM. Toque em Primeiro acesso · solicitar autorização, informe nome, login e contato. Depois consulte a aprovação do Proprietário.</p>'+link(vm,'Abrir página de autorização')+'<p>Se a página não abrir no navegador, avance e instale o Android para fazer essa solicitação dentro do aplicativo, que já inclui o certificado da VM. Instalar não libera os dados.</p>'],
  ['Baixar o aplicativo Android','<p>Depois da aprovação, baixe o arquivo abaixo. Se o pedido ainda estiver pendente, o aplicativo continuará aguardando liberação para acessar os dados.</p>'+apk],
  ['Confirmar a instalação','<p>Abra Downloads no navegador ou no aplicativo Arquivos. Toque em Assistente-FSJ-VM.apk e depois em Instalar.</p><p>Se o Android pedir, permita instalar desta fonte e volte para confirmar. Se já estiver instalado, escolha Atualizar. Não desinstale a versão existente.</p>'],
  ['Criar sua senha e entrar','<p>Abra o ícone Assistente FSJ.VM. Se ainda não solicitou acesso, toque em Primeiro acesso e envie o cadastro. Após a aprovação, crie e confirme sua senha seguindo a tela.</p><p>Se já criou a senha no navegador, use o mesmo login e senha no aplicativo. Marque Salvar senha para os próximos acessos.</p>'],
  ['Instalação concluída','<p>Use o ícone Assistente FSJ.VM. As telas são atualizadas automaticamente pela VM; novas versões Android são oferecidas pelo aplicativo e pedem apenas as confirmações do sistema.</p><p>Se o servidor estiver indisponível, informe ao Proprietário. A instalação não corrige uma interrupção da conexão da fazenda.</p>']
 ];
}
function render(){const list=steps();step=Math.min(step,list.length-1);el('guideProgress').textContent='Etapa '+(step+1)+' de '+list.length;el('guideTitle').textContent=list[step][0];el('guideBody').innerHTML=list[step][1];el('guideBack').disabled=step===0;el('guideNext').hidden=step===list.length-1;el('guideStatus').textContent='';}
const ua=navigator.userAgent;device.value=/iPhone|iPad|iPod/i.test(ua)||(/Macintosh/.test(ua)&&navigator.maxTouchPoints>1)?'ios':/Android/i.test(ua)?'android':'desktop';
device.onchange=()=>{step=0;render();};el('guideBack').onclick=()=>{if(step>0)step--;render();};el('guideNext').onclick=()=>{step++;render();};render();
// Atualização do próprio guia sem perder a etapa em uso nem provocar ciclos.
const build=document.querySelector('meta[name="fsj-guide-build"]').content;let checking=false,pending=false;
async function check(){if(checking||document.hidden||!navigator.onLine)return;checking=true;try{const url=new URL(location.href);url.hash='';url.searchParams.set('guide_check',String(Date.now()));const response=await fetch(url,{cache:'no-store'});if(!response.ok)return;const doc=new DOMParser().parseFromString(await response.text(),'text/html'),latest=doc.querySelector('meta[name="fsj-guide-build"]')?.content;if(!latest||latest===build)return;const next=new URL(location.href);if(next.searchParams.get('guide_version')===latest)return;const key='fsj-guide-reload:'+mode+':'+latest;if(sessionStorage.getItem(key))return;sessionStorage.setItem(key,'1');sessionStorage.setItem('fsj-guide-state:'+mode,JSON.stringify({step,device:device.value}));next.searchParams.delete('guide_check');next.searchParams.set('guide_version',latest);pending=true;location.replace(next.href);}catch{}finally{checking=false;}}
try{const saved=JSON.parse(sessionStorage.getItem('fsj-guide-state:'+mode)||'null');if(saved){if(['android','ios','desktop'].includes(saved.device))device.value=saved.device;step=Math.max(0,Number(saved.step)||0);render();sessionStorage.removeItem('fsj-guide-state:'+mode);}}catch{}
window.addEventListener('pageshow',check);document.addEventListener('visibilitychange',()=>{if(!document.hidden)check();});window.addEventListener('online',check);check();setInterval(check,60000);
})();

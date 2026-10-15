const endpoint='https://awrxnzbfrsaurzpunuko.supabase.co/functions/v1/fsj-reserva';
const $=id=>document.getElementById(id);let board=null,busy=false,promptInstall,openedKey='',closed=false,requestController=null,exitObserver=null;
function openBoard(){if(closed||!board?.liberado)return;$('frame').src='../quadro.html#token='+encodeURIComponent(board.token);$('viewer').hidden=false;$('setup').hidden=true;$('loadingHeader').hidden=true;openedKey=board.dia+'|'+board.token;localStorage.setItem('fsj_reserva_read_day',board.dia);}
function render(d){if(closed)return;board=d;if(d.liberado){if(openedKey!==d.dia+'|'+d.token||$('viewer').hidden)openBoard();}else{$('viewer').hidden=true;$('frame').src='about:blank';$('setup').hidden=false;$('loadingHeader').hidden=false;$('status').textContent=d.motivo;openedKey='';}}
async function refresh(){if(busy||closed)return;busy=true;$('refresh').disabled=true;$('retry').disabled=true;$('login').hidden=true;try{requestController=new AbortController();const token=localStorage.getItem('fsj_access_token');if(!token){$('login').hidden=false;throw Error('Acesso privado: entre no principal para vincular seu celular.');}const r=await fetch(endpoint,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:'{}',signal:AbortSignal.any([AbortSignal.timeout(20000),requestController.signal])});const d=await r.json();if(closed)return;if(!r.ok){if(r.status===401)$('login').hidden=false;throw Error(d.erro||'Consulta indisponível');}render(d);}catch(e){if(closed)return;board=null;$('viewer').hidden=true;$('setup').hidden=false;$('loadingHeader').hidden=false;$('status').textContent=e.message;}finally{busy=false;$('refresh').disabled=false;$('retry').disabled=false;}}
$('refresh').onclick=()=>{openedKey='';refresh();};$('retry').onclick=refresh;$('back').onclick=openBoard;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();promptInstall=e;$('install').hidden=false;});
$('install').onclick=async()=>{if(!promptInstall)return;await promptInstall.prompt();promptInstall=null;$('install').hidden=true;};
window.addEventListener('appinstalled',()=>{$('install').hidden=true;});
function canRefresh(){if(closed)return false;try{return $('viewer').hidden||!$('frame').contentWindow.location.pathname.endsWith('/responder.html');}catch{return false;}}
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&canRefresh())refresh();});
const refreshTimer=setInterval(()=>{if(!document.hidden&&canRefresh())refresh();},60000);
if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>{});
refresh();

$('frame').addEventListener('load',()=>{try{const child=$('frame').contentWindow,doc=$('frame').contentDocument;if(closed||!doc||$('frame').src==='about:blank')return;exitObserver?.disconnect();if(child.fsjExited){encerrarReserva();return;}exitObserver=new MutationObserver(()=>{if(child.fsjExited)encerrarReserva();});if(doc.body)exitObserver.observe(doc.body,{childList:true,subtree:true});}catch{}});

function encerrarReserva(){if(closed)return;closed=true;clearInterval(refreshTimer);requestController?.abort();exitObserver?.disconnect();try{$('frame').contentWindow.brisaEncerrarEscuta?.();}catch{}$('viewer').hidden=true;$('setup').hidden=true;$('loadingHeader').hidden=true;$('frame').src='about:blank';board=null;openedKey='';$('closed').hidden=false;setTimeout(()=>{try{window.close();}catch{}},200);}
$('reopen').onclick=()=>location.reload();

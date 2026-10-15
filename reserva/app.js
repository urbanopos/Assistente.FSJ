const endpoint='https://awrxnzbfrsaurzpunuko.supabase.co/functions/v1/fsj-reserva';
const $=id=>document.getElementById(id);let board=null,busy=false,promptInstall,openedKey='';
function openBoard(){if(!board?.liberado)return;$('frame').src='../quadro.html#token='+encodeURIComponent(board.token);$('viewer').hidden=false;$('setup').hidden=true;$('loadingHeader').hidden=true;openedKey=board.dia+'|'+board.token;localStorage.setItem('fsj_reserva_read_day',board.dia);}
function render(d){board=d;if(d.liberado){if(openedKey!==d.dia+'|'+d.token||$('viewer').hidden)openBoard();}else{$('viewer').hidden=true;$('frame').src='about:blank';$('setup').hidden=false;$('loadingHeader').hidden=false;$('status').textContent=d.motivo;openedKey='';}}
async function refresh(){if(busy)return;busy=true;$('refresh').disabled=true;$('retry').disabled=true;$('login').hidden=true;try{const token=localStorage.getItem('fsj_access_token');if(!token){$('login').hidden=false;throw Error('Acesso privado: entre no principal para vincular seu celular.');}const r=await fetch(endpoint,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:'{}',signal:AbortSignal.timeout(20000)});const d=await r.json();if(!r.ok){if(r.status===401)$('login').hidden=false;throw Error(d.erro||'Consulta indisponível');}render(d);}catch(e){board=null;$('viewer').hidden=true;$('setup').hidden=false;$('loadingHeader').hidden=false;$('status').textContent=e.message;}finally{busy=false;$('refresh').disabled=false;$('retry').disabled=false;}}
$('refresh').onclick=()=>{openedKey='';refresh();};$('retry').onclick=refresh;$('back').onclick=openBoard;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();promptInstall=e;$('install').hidden=false;});
$('install').onclick=async()=>{if(!promptInstall)return;await promptInstall.prompt();promptInstall=null;$('install').hidden=true;};
window.addEventListener('appinstalled',()=>{$('install').hidden=true;});
function canRefresh(){try{return $('viewer').hidden||!$('frame').contentWindow.location.pathname.endsWith('/responder.html');}catch{return false;}}
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&canRefresh())refresh();});
setInterval(()=>{if(!document.hidden&&canRefresh())refresh();},60000);
if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>{});
refresh();

$('frame').addEventListener('load',()=>{try{const doc=$('frame').contentDocument;if(!doc||$('frame').src==='about:blank')return;const img=doc.querySelector('.brand img');if(img){img.src=new URL('./icon-ramo-r-v3-192.png',location.href).href;img.alt='FSJ Reserva';}const header=doc.querySelector('header');if(header&&!header.querySelector('[data-reserva]')){const icon=doc.createElement('img');icon.dataset.reserva='1';icon.src=new URL('./icon-ramo-r-v3-192.png',location.href).href;icon.alt='FSJ Reserva';icon.style.cssText='width:36px;height:36px;vertical-align:middle;margin-right:8px';header.prepend(icon);}}catch{}});

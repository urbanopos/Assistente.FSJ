const endpoint='https://awrxnzbfrsaurzpunuko.supabase.co/functions/v1/fsj-reserva';
const $=id=>document.getElementById(id);let board=null,busy=false,promptInstall;
function render(d){board=d;$('day').textContent=d.dia.split('-').reverse().join('/');$('status').textContent=d.liberado?'Abra o quadro para consultar e responder suas tarefas.':d.motivo;$('open').hidden=!d.liberado;const read=localStorage.getItem('fsj_reserva_read_day')===d.dia;$('badge').hidden=!d.liberado||read;$('read').textContent=d.liberado&&read?'✓✓ Quadro aberto neste aparelho':'';}
async function refresh(){if(busy)return;busy=true;$('refresh').disabled=true;$('login').hidden=true;try{const token=localStorage.getItem('fsj_access_token');if(!token){$('login').hidden=false;throw Error('Acesso privado: entre no principal para vincular seu celular.');}const r=await fetch(endpoint,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:'{}',signal:AbortSignal.timeout(20000)});const d=await r.json();if(!r.ok){if(r.status===401)$('login').hidden=false;throw Error(d.erro||'Consulta indisponível');}render(d);}catch(e){board=null;$('open').hidden=true;$('badge').hidden=true;$('status').textContent=e.message;$('read').textContent='';}finally{busy=false;$('refresh').disabled=false;}}
$('refresh').onclick=refresh;
$('open').onclick=()=>{if(!board?.liberado)return;$('frame').src='../quadro.html#token='+encodeURIComponent(board.token);$('viewer').hidden=false;localStorage.setItem('fsj_reserva_read_day',board.dia);render(board);};
$('back').onclick=()=>{$('viewer').hidden=true;$('frame').src='about:blank';refresh();};
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();promptInstall=e;$('install').hidden=false;});
$('install').onclick=async()=>{if(!promptInstall)return;await promptInstall.prompt();promptInstall=null;$('install').hidden=true;};
window.addEventListener('appinstalled',()=>{$('install').hidden=true;});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&$('viewer').hidden)refresh();});
setInterval(()=>{if(!document.hidden&&$('viewer').hidden)refresh();},60000);
if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>{});
refresh();

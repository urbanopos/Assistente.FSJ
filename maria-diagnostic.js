/* Diagnósticos da MarIA: cinco posições locais; nenhum upload ou arquivo na VM. */
(function(root){
'use strict';
const LIMIT=5,MAX_BYTES=12*1024*1024,MAX_MS=60000,DB_NAME='fsj_maria_diagnostics_v1';
function slotFor(sequence){return ((sequence-1)%LIMIT)+1}
function saveRecording(db,blob,createdAt=new Date().toISOString()){
 if(!blob||!Number.isFinite(blob.size)||blob.size<=0||blob.size>MAX_BYTES)return Promise.reject(Error('Vídeo vazio ou acima do limite de 12 MB. Os anteriores foram preservados.'));
 return new Promise((resolve,reject)=>{
  const tx=db.transaction(['clips','meta'],'readwrite');const clips=tx.objectStore('clips'),meta=tx.objectStore('meta');let saved;
  tx.oncomplete=()=>resolve(saved);tx.onabort=tx.onerror=()=>reject(Error('Não foi possível salvar o vídeo. Os vídeos anteriores foram preservados.'));
  const request=meta.get('sequence');request.onsuccess=()=>{
   const previous=request.result?.value||0;if(!Number.isSafeInteger(previous)||previous<0||previous>=Number.MAX_SAFE_INTEGER){tx.abort();return}const sequence=previous+1;saved={slot:slotFor(sequence),sequence,createdAt,blob};
   clips.put(saved);meta.put({key:'sequence',value:sequence});
  };
 });
}
function openDatabase(){
 return new Promise((resolve,reject)=>{
  const request=indexedDB.open(DB_NAME,1);
  request.onupgradeneeded=()=>{const db=request.result;db.createObjectStore('clips',{keyPath:'slot'});db.createObjectStore('meta',{keyPath:'key'})};
  request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(Error('O armazenamento de diagnósticos não está disponível neste navegador.'));
 });
}
function listRecordings(db){return new Promise((resolve,reject)=>{
 const tx=db.transaction('clips','readonly'),request=tx.objectStore('clips').getAll();request.onsuccess=()=>resolve(request.result.sort((a,b)=>b.sequence-a.sequence));request.onerror=()=>reject(Error('Não foi possível consultar os diagnósticos.'));
})}
if(typeof module!=='undefined'&&module.exports){module.exports={LIMIT,MAX_BYTES,MAX_MS,DB_NAME,slotFor,saveRecording,listRecordings};return}
function install(){
 const body=document.querySelector('#brisaPanel .brisa-body');if(!body||document.getElementById('mariaDiagnostics'))return;
 let dbPromise=null,recorder=null,screen=null,mic=null,mix=null,chunks=[],bytes=0,failed=false,timer=null,starting=false,saving=false;
 const urls=[];
 function database(){return dbPromise||(dbPromise=openDatabase().catch(e=>{dbPromise=null;throw e}))}
 const box=document.createElement('details');box.id='mariaDiagnostics';box.className='card';
 const title=document.createElement('summary');title.textContent='Gravar diagnóstico · até 5 vídeos';box.append(title);
 const help=document.createElement('p');help.textContent='Grave até 1 minuto. Na seleção do navegador, escolha a tela do Assistente e habilite o áudio, quando disponível. Os cinco vídeos ficam somente neste navegador: o sexto substitui o vídeo 1, depois o 2, e assim por diante.';box.append(help);
 const label=document.createElement('label'),checkbox=document.createElement('input');checkbox.type='checkbox';label.append(checkbox,document.createTextNode(' Incluir minha voz pelo microfone'));box.append(label);
 const row=document.createElement('div');row.className='brisa-actions';
 const start=document.createElement('button');start.type='button';start.textContent='Iniciar gravação';
 const stop=document.createElement('button');stop.type='button';stop.textContent='Parar e salvar';stop.disabled=true;row.append(start,stop);box.append(row);
 const status=document.createElement('p');status.setAttribute('role','status');box.append(status);
 const listing=document.createElement('div');listing.setAttribute('aria-label','Vídeos de diagnóstico salvos');box.append(listing);
 const note=document.createElement('p');note.className='muted';note.textContent='Baixe o vídeo e anexe no chat da Brisa. Cópias baixadas na pasta Downloads e gravações feitas pelo Windows não entram nesta rotação. Nenhum vídeo é enviado à VM.';box.append(note);
 body.insertBefore(box,document.getElementById('brisaContaChatGPT')||body.firstChild);
 function busy(value){root.mariaDiagnosticBusy=value;start.disabled=value;stop.disabled=!value||starting||saving;checkbox.disabled=value;const top=document.getElementById('mariaRecordOpen');if(top){top.textContent=value?(starting?'Preparando gravação…':saving?'Salvando vídeo…':'Parar e salvar'):'Gravar diagnóstico';top.disabled=starting||saving}}
 function release(){clearTimeout(timer);timer=null;for(const stream of [screen,mic])stream?.getTracks().forEach(track=>track.stop());screen=mic=null;mix?.close().catch(()=>{});mix=null;chunks=[];bytes=0;recorder=null;starting=saving=false;busy(false)}
 async function refreshList(){
  for(const url of urls)URL.revokeObjectURL(url);urls.length=0;listing.replaceChildren();
  const db=await database(),clips=await listRecordings(db);
  if(!clips.length){listing.textContent='Nenhum diagnóstico gravado neste navegador.';return}
  for(const clip of clips){
   const item=document.createElement('p'),url=URL.createObjectURL(clip.blob);urls.push(url);
   const link=document.createElement('a');link.href=url;
   const extension=clip.blob.type.includes('mp4')?'mp4':'webm';
   link.download='MarIA-diagnostico-'+clip.slot+'-'+clip.createdAt.replace(/[:.]/g,'-')+'.'+extension;
   link.textContent='Baixar vídeo '+clip.slot+' · '+new Date(clip.createdAt).toLocaleString('pt-BR');item.append(link);listing.append(item);
  }
 }
 function finish(){if(recorder&&recorder.state!=='inactive'){stop.disabled=true;recorder.stop()}}
 async function capture(){
  if(starting||saving||recorder)return;
  if(!navigator.mediaDevices?.getDisplayMedia||!root.MediaRecorder){status.textContent='A gravação de tela não está disponível neste navegador. Use o gravador do Windows.';return}
  starting=true;busy(true);status.textContent='Escolha o que será gravado na janela do navegador…';failed=false;chunks=[];bytes=0;
  try{
   // Deve ocorrer diretamente no clique; a escolha e a autorização pertencem ao navegador.
   screen=await navigator.mediaDevices.getDisplayMedia({video:{frameRate:12,width:{max:1280},height:{max:720}},audio:true,systemAudio:'include'});
   if(!screen.getVideoTracks().length)throw Error('Nenhuma tela selecionada.');
   let output=screen;
   if(checkbox.checked){
    mic=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true},video:false});
    const Audio=root.AudioContext||root.webkitAudioContext;if(!Audio)throw Error('Mistura de áudio indisponível.');
    mix=new Audio();await mix.resume();const destination=mix.createMediaStreamDestination();
    if(screen.getAudioTracks().length)mix.createMediaStreamSource(new MediaStream(screen.getAudioTracks())).connect(destination);
    mix.createMediaStreamSource(mic).connect(destination);output=new MediaStream([...screen.getVideoTracks(),...destination.stream.getAudioTracks()]);
   }
   const mime=['video/webm;codecs=vp8,opus','video/webm','video/mp4'].find(type=>MediaRecorder.isTypeSupported(type));
   recorder=new MediaRecorder(output,{...(mime?{mimeType:mime}:{}),videoBitsPerSecond:900000,audioBitsPerSecond:64000});
   recorder.ondataavailable=event=>{if(event.data?.size){bytes+=event.data.size;if(bytes>MAX_BYTES){failed=true;status.textContent='Limite de tamanho atingido. Os cinco vídeos anteriores serão preservados.';finish()}else chunks.push(event.data)}};
   recorder.onerror=()=>{failed=true;status.textContent='Falha na gravação. Os vídeos anteriores foram preservados.';finish()};
   recorder.onstop=async()=>{
    saving=true;stop.disabled=true;
    try{
     if(failed)return;
     const blob=new Blob(chunks,{type:recorder.mimeType||mime||'video/webm'}),db=await database();
     const saved=await saveRecording(db,blob);status.textContent='Vídeo '+saved.slot+' salvo neste navegador. Se essa posição já existia, foi substituída. Nenhum arquivo foi enviado à VM.';
     await refreshList();
    }catch(error){status.textContent=error.message;}
    finally{release()}
   };
   screen.getVideoTracks()[0].addEventListener('ended',finish,{once:true});
   recorder.start(1000);starting=false;busy(true);timer=setTimeout(finish,MAX_MS);
   status.textContent='Gravando · limite de 1 minuto. '+(screen.getAudioTracks().length?'Áudio compartilhado incluído.':'O navegador não forneceu áudio da tela; '+(mic?'somente sua voz será captada.':'este vídeo ficará sem som.'));
  }catch(error){status.textContent=error.name==='NotAllowedError'?'Gravação cancelada ou não autorizada. Nenhum vídeo anterior foi alterado.':error.message;release()}
 }
 root.mariaOpenDiagnostic=()=>{if(recorder&&recorder.state!=='inactive'){finish();return}box.open=true;box.scrollIntoView({block:'start',behavior:'smooth'})};
 start.onclick=capture;stop.onclick=finish;
 box.addEventListener('toggle',()=>{if(box.open&&!root.mariaDiagnosticBusy)refreshList().catch(e=>status.textContent=e.message)});
 root.addEventListener('beforeunload',event=>{if(root.mariaDiagnosticBusy){event.preventDefault();event.returnValue=''}});
 root.addEventListener('pagehide',()=>{failed=true;finish();for(const url of urls)URL.revokeObjectURL(url)});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})(typeof window!=='undefined'?window:globalThis);

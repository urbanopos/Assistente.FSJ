/* FSJ_UNIFIED_VIDEO_ACCESS_V1 */
(()=>{
 const key=new URLSearchParams(location.hash.slice(1)).get('token');if(!key)return;
 const origin='https://192.168.1.114';let frame,notice,nonce='',open=false;
 const button=document.createElement('button');button.className='fsj-video-access-button';button.type='button';button.textContent='Vídeos e Chamadas';button.hidden=true;button.style.cssText='background:#235d41;color:white;border:0;border-radius:8px;padding:12px 18px;margin:10px 0;font:inherit';
 const host=document.getElementById('content');if(!host)return;host.prepend(button);
 async function available(){try{const r=await fetch('https://awrxnzbfrsaurzpunuko.supabase.co/rest/v1/rpc/fsj_video_access',{method:'POST',headers:{apikey:'sb_publishable_IU8K4qN5LLWSmr8Z4vYxMA_NiEY9gu3','Content-Type':'application/json'},body:JSON.stringify({quadro_token:key})});const d=await r.json();button.hidden=!r.ok||!d.person_id;if(button.hidden&&frame){frame.remove();frame=null;notice?.remove();open=false;}}catch{button.hidden=true;}}
 button.onclick=()=>{
  if(!frame){const wrap=document.createElement('section');wrap.style.cssText='width:100%;margin-top:12px';notice=document.createElement('p');notice.setAttribute('role','status');notice.textContent='Conectando com seu acesso de tarefas…';frame=document.createElement('iframe');frame.src=origin+'/?fsj_aba=1';frame.title='Vídeos e Chamadas';frame.allow='camera; microphone; autoplay; fullscreen';frame.style.cssText='width:100%;height:75dvh;border:0;border-radius:10px';wrap.append(notice,frame);button.after(wrap);open=true;}else{open=!open;frame.parentElement.hidden=!open;}
 };
 window.addEventListener('message',e=>{
  if(!frame||e.source!==frame.contentWindow||e.origin!==origin)return;
  if(e.data?.type==='fsj-tv-tasks'){open=false;frame.parentElement.hidden=true;document.dispatchEvent(new CustomEvent('fsj:page-target',{detail:document.getElementById('tasks')}));return;}
  const d=e.data;if(!d||typeof d.nonce!=='string'||!/^[0-9a-f-]{36}$/i.test(d.nonce))return;
  if(d.type==='fsj-sso-ready'){nonce=d.nonce;frame.contentWindow.postMessage({type:'fsj-sso-token',nonce,access_token:key},origin);}
  else if(d.nonce===nonce&&d.type==='fsj-sso-ok')notice.textContent='';
  else if(d.nonce===nonce&&d.type==='fsj-sso-error')notice.textContent=String(d.message||'Acesso não autorizado.');
 });
 available();setInterval(available,60000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)available()});
})();

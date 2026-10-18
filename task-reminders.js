/* Avisos por pessoa; abrir outra tela preserva o intervalo entre exibicoes. */
(()=>{
 'use strict';
 const endpoint='https://awrxnzbfrsaurzpunuko.supabase.co/functions/v1/resposta-tarefa';
 const repeat=2*60*60*1000,memory=new Map();let busy=false,hideTimer;
 const style=document.createElement('style');
 style.textContent='@keyframes fsjReminderPulse{50%{opacity:.35}}#fsjTaskReminder{position:fixed;z-index:10000;top:12px;left:12px;right:12px;max-width:620px;margin:auto;padding:16px;background:#fff;border:3px solid #b91c1c;border-radius:12px;color:#b91c1c;font-weight:800;text-align:center;box-shadow:0 4px 24px #0003;animation:fsjReminderPulse 1s ease-in-out 5;pointer-events:none}#fsjTaskReminder[hidden]{display:none}@media(prefers-reduced-motion:reduce){#fsjTaskReminder{animation:none}}';
 document.head.append(style);
 const box=document.createElement('div');box.id='fsjTaskReminder';box.setAttribute('role','alert');box.hidden=true;document.body.append(box);
 function read(key){try{return Number(localStorage.getItem(key))||memory.get(key)||0}catch{return memory.get(key)||0}}
 function write(key,value){memory.set(key,value);try{localStorage.setItem(key,String(value))}catch{}}
 async function check(){
  if(document.hidden||busy||typeof token==='undefined'||!token)return;
  busy=true;
  try{
   const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'reminders',token}),signal:AbortSignal.timeout(20000)});
   if(!response.ok)return;
   const data=await response.json(),now=Date.now(),messages=[];
   for(const alert of data.alerts||[]){
    const key='fsj:reminder:'+data.pessoa_id+':'+alert.kind;
    if(now-read(key)<repeat)continue;
    write(key,now);messages.push(alert.message);
   }
   if(messages.length){box.replaceChildren();for(const message of messages){const line=document.createElement('div');line.textContent=message;box.append(line)}box.hidden=false;box.style.animation='none';void box.offsetWidth;box.style.animation='';clearTimeout(hideTimer);hideTimer=setTimeout(()=>{box.hidden=true;box.replaceChildren()},5000);}
  }catch{/* Falha de consulta nao altera registros nem gera aviso sem confirmacao. */}
  finally{busy=false;}
 }
 check();setInterval(check,60000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)check()});
})();

/* A entrada individual reconhece a sessão do titular por consulta protegida por RLS. */
(()=>{'use strict';
 if(!location.pathname.endsWith('/inicio-usuario.html'))return;
 // O link individual define o destinatário, mesmo em aparelho com sessão do titular.
 const individualLink=()=>new URLSearchParams(location.hash.slice(1)).has('token')||new URLSearchParams(location.search).has('token');
 if(individualLink())return;
 const base='https://awrxnzbfrsaurzpunuko.supabase.co';
 const key='sb_publishable_IU8K4qN5LLWSmr8Z4vYxMA_NiEY9gu3';
 async function restore(){
  const refresh=localStorage.getItem('fsj_refresh_token');if(!refresh)return null;
  const r=await fetch(base+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:key,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:refresh}),signal:AbortSignal.timeout(10000)});
  if(!r.ok)return null;const d=await r.json();if(!d.access_token||!d.refresh_token)return null;
  localStorage.setItem('fsj_access_token',d.access_token);localStorage.setItem('fsj_refresh_token',d.refresh_token);return d.access_token;
 }
 async function ownership(jwt){return fetch(base+'/rest/v1/fsj_titularidade?id=eq.true&select=pessoa_id',{headers:{apikey:key,Authorization:'Bearer '+jwt},cache:'no-store',signal:AbortSignal.timeout(10000)});}
 (async()=>{try{
  let jwt=localStorage.getItem('fsj_access_token');if(!jwt)jwt=await restore();if(!jwt)return;
  let r=await ownership(jwt);if(r.status===401){jwt=await restore();if(!jwt)return;r=await ownership(jwt);}
  if(!r.ok)return;const rows=await r.json();
  // A política do banco exige auth.uid() = auth_user_id; nome e token de tarefa não promovem ninguém.
  if(!individualLink()&&rows.length===1&&rows[0].pessoa_id)location.replace('./index.html?fsj_perfil=proprietario');
 }catch{/* Sem validação, preservar o acesso individual e sua mensagem de estado. */}})();
})();

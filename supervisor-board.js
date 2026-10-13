async function fsjBoardSupervisor(){
 const box=document.getElementById('supervisaoAcesso');box.replaceChildren();
 if(!token)return;
 try{const r=await fetch('https://awrxnzbfrsaurzpunuko.supabase.co/functions/v1/supervisao',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'available',token}),signal:AbortSignal.timeout(30000)});const d=await r.json();if(!r.ok)throw Error();if(!d.ativo){box.hidden=true;return;}const a=document.createElement('a');a.className='task';a.href='./supervisor.html#token='+encodeURIComponent(token);a.textContent='Supervisão: demandas dos supervisionados';box.append(a);box.hidden=false;}catch{box.hidden=false;box.textContent='Não foi possível verificar o acesso de supervisão. Reabra o quadro para tentar novamente.';}
}
fsjBoardSupervisor();document.addEventListener('visibilitychange',()=>{if(!document.hidden)fsjBoardSupervisor()});

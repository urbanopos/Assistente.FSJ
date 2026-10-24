/* MarIA: ponte documental privada; nenhum texto gerado por modelo nem ação automática. */
let mariaVMOrigin=null;
function mariaVMOrigins(){
 const known=['https://168.196.84.147','https://192.168.1.114','https://192.168.1.114:8443','https://192.168.77.2:8443'];
 let configured='';try{configured=new URL(FSJ_VIDEO_VM_URL).origin}catch{}
 return [...new Set([mariaVMOrigin,known.includes(configured)?configured:null,...known].filter(Boolean))];
}
async function mariaVMRequest(path,body,signal){
 if(!['/api/maria/status','/api/maria/ask'].includes(path))throw Error('Consulta da MarIA inválida.');
 if(signal?.aborted)throw new DOMException('Consulta interrompida.','AbortError');
 let token=await recuperarAcessoGestor();if(!token)throw Error('Entre como Proprietário para consultar a base técnica da MarIA.');
 let refreshed=false,lastError;
 for(const origin of mariaVMOrigins()){
  if(signal?.aborted)throw new DOMException('Consulta interrompida.','AbortError');
  try{
   const send=()=>fetch(origin+path,{method:body?'POST':'GET',credentials:'omit',redirect:'error',cache:'no-store',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json','X-FSJ-Request':'1'},...(body?{body:JSON.stringify(body)}:{}),signal:signal?AbortSignal.any([signal,AbortSignal.timeout(6500)]):AbortSignal.timeout(4500)});
   let response=await send();
   if(response.status===401&&!refreshed){refreshed=true;token=await renovarSessao();response=await send();}
   const result=await response.json();
   if(!response.ok){const error=Error(result.error||'A base técnica da VM não está disponível.');error.status=response.status;throw error;}
   if(result.mode!=='documental')throw Error('Resposta da ponte não reconhecida.');
   mariaVMOrigin=origin;return result;
  }catch(error){
   if(signal?.aborted)throw new DOMException('Consulta interrompida.','AbortError');
   if([401,403,429].includes(error.status))throw error;
   lastError=error;
  }
 }
 throw Error(lastError?.status===503?lastError.message:'Não consegui acessar a base técnica da VM. Confira a conexão e o acesso HTTPS. As consultas locais de tarefas continuam disponíveis.');
}
async function mariaConsultarVM(texto,signal){
 const result=await mariaVMRequest('/api/maria/ask',{message:texto},signal);
 if(typeof result.answer!=='string'||!result.answer.trim())throw Error('Não recebi uma resposta documental.');
 return {answer:result.answer,actions:[]};
}
let mariaStatusRequest=0;
async function mariaVerificarVM(){
 const info=document.getElementById('brisaIAStatus');if(!info)return;
 const request=++mariaStatusRequest;
 info.textContent='Verificando a base documental da MarIA na VM…';
 try{
  await brisaCargaInicial;
  const result=await mariaVMRequest('/api/maria/status');
  if(request!==mariaStatusRequest)return;
  info.textContent=result.ready?'MarIA conectada à base técnica da VM. Tarefas usam os registros autorizados do aplicativo. Respostas livres por modelo permanecem desativadas.':'A base técnica da MarIA ainda não está disponível.';
 }catch(error){if(request===mariaStatusRequest)info.textContent=error.message;}
}

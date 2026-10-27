/* Dúvidas autorizadas: escopo conferido no servidor, sem escrita em tarefas. */
(()=>{
'use strict';
const button=document.getElementById('fsjAtualizarDuvidas'),status=document.getElementById('fsjDuvidasStatus'),list=document.getElementById('fsjDuvidasLista');
if(!button||!status||!list)return;
async function load(){
 button.disabled=true;status.textContent='Consultando dúvidas autorizadas…';list.replaceChildren();
 try{
  const token=new URLSearchParams(location.hash.slice(1)).get('token')||'';
  if(!token)throw Error('Abra o link individual de supervisão.');
  const response=await fetch('https://awrxnzbfrsaurzpunuko.supabase.co/functions/v1/supervisao',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'questions',token}),cache:'no-store'});
  const result=await response.json();if(!response.ok)throw Error(result.erro||'Não foi possível consultar.');
  const questions=result.duvidas||[];
  status.textContent=questions.length?questions.length+' dúvida(s) no seu âmbito de supervisão.':'Nenhuma dúvida registrada para seu âmbito de supervisão.';
  for(const q of questions){
   const card=document.createElement('article');card.className='response';card.style.margin='10px 0';
   const title=document.createElement('strong');title.textContent='Pessoa: '+q.pessoa_id+' · Tarefa: '+q.tarefa_origem_id;
   const body=document.createElement('p');body.textContent=q.descricao;
   const date=document.createElement('small');date.textContent=new Date(q.criado_em).toLocaleString('pt-BR',{timeZone:'America/Recife'})+' · '+(q.estado==='aprovada'?'Respondida':'Aguardando resposta');
   card.append(title,body,date);
   if(q.observacoes){const answer=document.createElement('p');answer.textContent='Resposta da gestão: '+q.observacoes;card.append(answer);}
   list.append(card);
  }
 }catch(e){status.textContent=e.message||'Não foi possível carregar as dúvidas.';}
 finally{button.disabled=false;}
}
button.addEventListener('click',load);
window.addEventListener('pageshow',load,{once:true});
})();
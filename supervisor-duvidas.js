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
   if(q.estado==='aguardando'){
    const label=document.createElement('label');label.textContent='Resposta à dúvida';label.style.display='block';
    const field=document.createElement('textarea');field.rows=3;field.maxLength=2000;field.placeholder='Escreva ou dite sua orientação…';field.style.cssText='display:block;width:100%;font:inherit;padding:10px;margin:7px 0;box-sizing:border-box';
    const controls=document.createElement('div');controls.style.cssText='display:flex;gap:8px;flex-wrap:wrap';
    const mic=document.createElement('button');mic.type='button';mic.textContent='🎙 Captar voz';
    mic.onclick=()=>{
     const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
     if(!SpeechRecognition){status.textContent='Reconhecimento de voz indisponível neste navegador. Digite sua resposta.';return;}
     const rec=new SpeechRecognition();rec.lang='pt-BR';rec.interimResults=false;
     rec.onresult=e=>{field.value=(field.value+' '+Array.from(e.results).map(x=>x[0].transcript).join(' ')).trim();};
     rec.onerror=()=>{status.textContent='Não foi possível captar a voz. Você pode digitar a resposta.';};
     rec.start();
    };
    const send=document.createElement('button');send.type='button';send.textContent='Enviar resposta';
    send.onclick=async()=>{
     const resposta=field.value.trim();if(!resposta){status.textContent='Preencha a resposta antes de enviar.';field.focus();return;}
     if(!confirm('Enviar esta resposta ao registro da dúvida?'))return;
     send.disabled=true;mic.disabled=true;status.textContent='Registrando resposta…';
     try{
      const token=new URLSearchParams(location.hash.slice(1)).get('token')||'';
      const resp=await fetch('https://awrxnzbfrsaurzpunuko.supabase.co/functions/v1/supervisao',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'answer-question',token,id:q.id,resposta})});
      const result=await resp.json();if(!resp.ok)throw Error(result.erro||'Falha ao registrar');
      await load();
     }catch(e){status.textContent=e.message;send.disabled=false;mic.disabled=false;}
    };
    controls.append(mic,send);label.append(field,controls);card.append(label);
   }
   list.append(card);
  }
 }catch(e){status.textContent=e.message||'Não foi possível carregar as dúvidas.';}
 finally{button.disabled=false;}
}
button.addEventListener('click',load);
window.addEventListener('pageshow',load,{once:true});
})();
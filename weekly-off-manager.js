const folgasEndpoint='https://awrxnzbfrsaurzpunuko.supabase.co/functions/v1/folgas-semana';
const folgaHoje=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Recife'}).format(new Date());
function folgaSomar(day,n){const d=new Date(day+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)}
function folgaSegunda(day){const d=new Date(day+'T12:00:00Z');return folgaSomar(day,-((d.getUTCDay()+6)%7))}
async function folgasPost(body){const tok=await recuperarAcessoGestor();if(!tok)throw Error('Entre como gestor');const r=await fetch(folgasEndpoint,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+tok},body:JSON.stringify(body),signal:AbortSignal.timeout(30000)});const d=await r.json();if(!r.ok)throw Error(d.erro||'Falha na agenda');return d;}
let folgasAgenda=null;
async function carregarFolgas(){
 const status=document.getElementById('folgasStatus');status.textContent='Consultando calendário...';
 const input=document.getElementById('folgasSemana');if(!input.value)input.value=folgaSegunda(folgaHoje());
 try{
  folgasAgenda=await folgasPost({action:'manager-calendar',semana:input.value});input.value=folgasAgenda.semana;
  const people=S.people.filter(p=>p.active&&p.whatsapp7h),week=folgasAgenda.semana,end=folgaSomar(week,6);
  document.getElementById('folgasLista').innerHTML=people.length?people.map((p,i)=>{
   const f=folgasAgenda.folgas.find(x=>x.pessoa_id===p.id);
   const controls='<label for="folgaGestor'+i+'">Definir ou alterar a folga desta semana</label><div class="row"><input type="date" id="folgaGestor'+i+'" min="'+week+'" max="'+end+'" value="'+(f?.dia||'')+'"><button type="button" data-folga-pessoa="'+esc(p.id)+'" data-folga-index="'+i+'">Salvar e bloquear alteração pelo empregado</button></div>';
   return '<div class="card"><h3>'+esc(p.nick||p.name)+'</h3><p>'+(f?.dia?'Folga: <b>'+esc(fsjData(f.dia))+'</b> • '+(f.bloqueada_gestor?'Definida pelo gestor; empregado bloqueado.':'Informada pelo empregado.'):'Folga semanal pendente: empregado ainda não escolheu.')+'</p>'+(f?.dia?'<details class="folga-alterar"><summary>Alterar folga</summary>'+controls+'</details>':controls)+'</div>';
  }).join(''):'<p>Nenhum destinatário ativo selecionado para o WhatsApp.</p>';
  const holidaySection=document.getElementById('feriadosSection');if(holidaySection)holidaySection.hidden=folgasAgenda.feriados.length===0;
  document.getElementById('feriadosLista').innerHTML=folgasAgenda.feriados.map(h=>'<details class="card"><summary><b>'+esc(fsjData(h.dia))+' • '+esc(h.nome)+'</b> — '+esc(h.ambito)+'</summary><p><a href="'+esc(h.fonte)+'" target="_blank" rel="noopener noreferrer">Fonte do calendário</a></p>'+people.map(p=>{
   const v=folgasAgenda.decisoes.find(x=>x.pessoa_id===p.id&&x.dia===h.dia);
   return '<label>'+esc(p.nick||p.name)+'<select data-feriado-pessoa="'+esc(p.id)+'" data-feriado-dia="'+h.dia+'"><option value=""'+(!v?' selected':'')+'>Decisão pendente — não enviar</option><option value="sim"'+(v?.receber===true?' selected':'')+'>Recebe tarefas</option><option value="nao"'+(v?.receber===false?' selected':'')+'>Não recebe tarefas</option></select></label>';
  }).join('')+'</details>').join('');
  document.getElementById('folgasHistorico').textContent=folgasAgenda.historico.map(h=>(S.people.find(p=>p.id===h.pessoa_id)?.nick||h.pessoa_id)+': '+(h.dia_anterior?fsjData(h.dia_anterior):'pendente')+' → '+fsjData(h.dia_novo)+' ('+h.definido_por+')').join('\n')||'Nenhuma alteração nesta semana.';
  const pending=people.filter(p=>!folgasAgenda.folgas.find(f=>f.pessoa_id===p.id)?.dia).length;
  const nextHoliday=folgasAgenda.feriados[0];
  document.getElementById('folgasResumo').textContent=pending+' escolha(s) de folga pendente(s) nesta semana.'+(nextHoliday?' Próximo feriado: '+fsjData(nextHoliday.dia)+' — '+nextHoliday.nome+'. Confira sua decisão por empregado.':'');
  status.textContent='Atualizado em '+new Date().toLocaleString('pt-BR',{timeZone:'America/Recife'});
 }catch(e){status.textContent='Não foi possível atualizar: '+e.message;document.getElementById('folgasResumo').textContent=status.textContent;document.getElementById('folgasLista').replaceChildren();document.getElementById('feriadosLista').replaceChildren();const holidaySection=document.getElementById('feriadosSection');if(holidaySection)holidaySection.hidden=true;}
}
document.getElementById('folgasLista').addEventListener('click',async e=>{
 const b=e.target.closest('[data-folga-pessoa]');if(!b)return;
 const day=document.getElementById('folgaGestor'+b.dataset.folgaIndex).value;
 if(!day)return alert('Escolha a data da folga.');b.disabled=true;
 try{await folgasPost({action:'manager-set',pessoa_id:b.dataset.folgaPessoa,semana:folgasAgenda.semana,dia:day});await carregarFolgas();}catch(err){alert(err.message);}finally{b.disabled=false;}
});
document.getElementById('feriadosLista').addEventListener('change',async e=>{
 const input=e.target.closest('[data-feriado-pessoa]');if(!input)return;if(!input.value){await carregarFolgas();return;}
 input.disabled=true;try{await folgasPost({action:'holiday-set',pessoa_id:input.dataset.feriadoPessoa,dia:input.dataset.feriadoDia,receber:input.value==='sim'});await carregarFolgas();}catch(err){alert(err.message);await carregarFolgas();}finally{input.disabled=false;}
});

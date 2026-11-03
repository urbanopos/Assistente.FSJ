const folgasEndpoint='https://awrxnzbfrsaurzpunuko.supabase.co/functions/v1/folgas-semana';
const folgaHoje=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Recife'}).format(new Date());
function folgaSomar(day,n){const d=new Date(day+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)}
function folgaSegunda(day){const d=new Date(day+'T12:00:00Z');return folgaSomar(day,-((d.getUTCDay()+6)%7))}
async function folgasPost(body){const tok=await recuperarAcessoGestor();if(!tok)throw Error('Entre como gestor');const r=await fetch(folgasEndpoint,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+tok},body:JSON.stringify(body),signal:AbortSignal.timeout(30000)});const d=await r.json();if(!r.ok)throw Error(d.erro||'Falha na agenda');return d;}
let folgasAgenda=null,folgasConsulta=0;
let folgasCiclo=folgaSegunda(folgaHoje());
const folgasReferenciaKey='fsj_folgas_semana_referencia';
function folgasRestaurarReferencia(){
 const input=document.getElementById('folgasSemana');
 try{const saved=JSON.parse(localStorage.getItem(folgasReferenciaKey)||'null');
  if(saved?.ciclo===folgasCiclo&&/^\d{4}-\d{2}-\d{2}$/.test(saved.semana||''))input.value=saved.semana;
 }catch{}
 if(!input.value)input.value=folgasCiclo;
}
function folgasVirarSemana(){
 const cycle=folgaSegunda(folgaHoje());if(cycle===folgasCiclo)return false;
 folgasCiclo=cycle;folgasConsulta++;folgasAgenda=null;
 document.getElementById('folgasSemana').value=cycle;
 document.getElementById('folgasPessoaDados').hidden=true;
 try{localStorage.setItem(folgasReferenciaKey,JSON.stringify({ciclo:cycle,semana:cycle}));}catch{}
 return true;
}

function fsjPreencherSeletorFolgas(){
 const select=document.getElementById('folgasPessoaSelect');if(!select)return;
 const source=document.getElementById('personSelect');
 const previous=select.value;
 // A página Pessoas é a referência operacional já funcional.
 // Reutilizar exatamente seus identificadores, sem uma segunda lista paralela.
 const sourceOptions=source?[...source.options].filter(o=>o.value):[];
 const people=Array.isArray(S.people)?S.people.filter(p=>p&&p.id):[];
 const options=sourceOptions.length
  ?sourceOptions.map(o=>({id:String(o.value),label:o.textContent||o.value}))
  :[...people].sort((a,b)=>String(a.name||a.nick||'').localeCompare(String(b.name||b.nick||''),'pt-BR')).map(p=>({id:String(p.id),label:String(p.name||p.nick||p.id)+(p.active===false?' (inativo)':'')}));
 const current=[...select.options].slice(1);
 if(current.length===options.length&&current.every((o,i)=>o.value===options[i].id&&o.textContent===options[i].label))return;
 if(document.activeElement===select&&select.options.length>1)return;
 select.replaceChildren(new Option(options.length?'Selecione uma pessoa':'Cadastro de pessoas não carregado',''));
 for(const item of options)select.add(new Option(item.label,item.id));
 if(previous&&options.some(o=>o.id===previous))select.value=previous;
}
(function fsjVincularCadastroPessoas(){
 const source=document.getElementById('personSelect');
 if(!source)return;
 const observer=new MutationObserver(()=>fsjPreencherSeletorFolgas());
 observer.observe(source,{childList:true,subtree:true,characterData:true});
 document.getElementById('folgasPessoaSelect')?.addEventListener('blur',()=>fsjPreencherSeletorFolgas());
 fsjPreencherSeletorFolgas();
})();
let fsjFolgasPessoasPendente=null;
async function fsjCarregarPessoasFolgas(){
 const select=document.getElementById('folgasPessoaSelect');if(!select)return;
 fsjPreencherSeletorFolgas();
 if(fsjFolgasPessoasPendente)return fsjFolgasPessoasPendente;
 fsjFolgasPessoasPendente=(async()=>{
  try{
   const rows=await api('/rest/v1/pessoas?select=*&order=nome.asc');
   if(!Array.isArray(rows))throw Error('Resposta inválida do cadastro de pessoas');
   if(!rows.length){const status=document.getElementById('folgasStatus');if(status)status.textContent='A consulta de pessoas retornou vazia. Verifique o cadastro em Pessoas e Grupos.';}
   if(rows.length){
    const known=new Map((Array.isArray(S.people)?S.people:[]).map(p=>[String(p.id),p]));
    for(const row of rows){
     const id=String(row.id),old=known.get(id)||{};
     known.set(id,{...old,id,name:row.nome||old.name||row.identificacao||id,nick:row.identificacao||old.nick||row.nome,active:row.ativo!==false,whatsapp7h:row.receber_tarefas_whatsapp===true});
    }
    S.people=[...known.values()];
   }
   fsjPreencherSeletorFolgas();
   if(folgasAgenda)fsjRenderFolgas();
   const status=document.getElementById('folgasStatus');
   if(!rows.length&&status)status.textContent='Nenhuma pessoa cadastrada foi retornada pela Armazenagem.';
  }catch(e){
   fsjPreencherSeletorFolgas();
   const status=document.getElementById('folgasStatus');
   if(status)status.textContent='Não foi possível consultar as pessoas cadastradas: '+e.message;
  }finally{fsjFolgasPessoasPendente=null}
 })();
 return fsjFolgasPessoasPendente;
}
// Evita que atualizações assíncronas fechem a lista nativa durante a escolha.
document.getElementById('folgasPessoaSelect')?.addEventListener('pointerdown',()=>{
 const select=document.getElementById('folgasPessoaSelect');
 const status=document.getElementById('folgasStatus');
 if(select.options.length<=1){
  if(status)status.textContent='Consultando pessoas cadastradas para a folga semanal…';
  void fsjCarregarPessoasFolgas();
 }
});
document.getElementById('folgasPessoaSelect')?.addEventListener('focus',()=>{
 if(!document.getElementById('folgasPessoaSelect').options.length||document.getElementById('folgasPessoaSelect').options.length===1)void fsjCarregarPessoasFolgas();
});
async function carregarFolgas(){
 fsjCarregarPessoasFolgas();
 folgasVirarSemana();
 const request=++folgasConsulta;
 const status=document.getElementById('folgasStatus');status.textContent='Consultando calendário...';
 const input=document.getElementById('folgasSemana');if(!input.value)input.value=folgaSegunda(folgaHoje());
 try{
  const agenda=await folgasPost({action:'manager-calendar',semana:input.value});
  if(request!==folgasConsulta)return;
  if(folgasVirarSemana()){carregarFolgas();return;}
  folgasAgenda=agenda;
  if(Array.isArray(agenda.pessoas)){
   const known=new Map((Array.isArray(S.people)?S.people:[]).map(p=>[String(p.id),p]));
   for(const row of agenda.pessoas){
    const id=String(row.id),old=known.get(id)||{};
    known.set(id,{...old,id,name:row.nome||old.name||row.identificacao||id,nick:row.identificacao||old.nick||row.nome,active:row.ativo!==false,whatsapp7h:row.receber_tarefas_whatsapp===true});
   }
   S.people=[...known.values()];
   fsjPreencherSeletorFolgas();
  }
  input.value=folgasAgenda.semana;
  try{localStorage.setItem(folgasReferenciaKey,JSON.stringify({ciclo:folgasCiclo,semana:folgasAgenda.semana}));}catch{}

  fsjRenderFolgas();
  status.textContent='Atualizado em '+new Date().toLocaleString('pt-BR',{timeZone:'America/Recife'});
 }catch(e){if(request!==folgasConsulta)return;folgasAgenda=null;document.getElementById('folgasPessoaDados').hidden=true;status.textContent='Não foi possível atualizar: '+e.message;document.getElementById('folgasResumo').textContent=status.textContent;document.getElementById('folgasLista').replaceChildren();document.getElementById('feriadosLista').replaceChildren();const holidaySection=document.getElementById('feriadosSection');if(holidaySection)holidaySection.hidden=true;}
}

function fsjRenderFolgas(){
 const select=document.getElementById('folgasPessoaSelect');if(!select)return;
 // Não reconstruir o elemento select a cada atualização de tela: isso interrompe
 // o menu nativo do navegador enquanto o Proprietário escolhe a pessoa.
 const chosen=select.value;
 const expected=(Array.isArray(S.people)?S.people:[]).filter(p=>p&&p.id);
 const existing=[...select.options].slice(1).map(o=>o.value).join('|');
 const wanted=expected.map(p=>String(p.id)).join('|');
 if(existing!==wanted&&document.activeElement!==select)fsjPreencherSeletorFolgas();
 document.getElementById('folgasPessoaDados').hidden=!select.value||!folgasAgenda;
 if(!folgasAgenda)return;
  const holidayToday=folgaHoje(),holidayStart=folgaSomar(holidayToday,-30),holidayEnd=folgaSomar(holidayToday,30);
  folgasAgenda.feriados=folgasAgenda.feriados.filter(h=>h.dia>=holidayStart&&h.dia<=holidayEnd);
  const selected=S.people.find(p=>p.id===document.getElementById('folgasPessoaSelect').value);
  const people=selected?[selected]:[],week=folgasAgenda.semana,end=folgaSomar(week,6);
  document.getElementById('folgasPessoaNome').textContent=selected?'Folgas e feriados de '+selected.name:'';
  document.getElementById('folgasPessoaSituacao').textContent=selected?(selected.active?(selected.whatsapp7h?'Recebimento de tarefas às 7h habilitado.':'Recebimento de tarefas às 7h desmarcado no cadastro.'):'Cadastro inativo; sem envio automático de tarefas.'):'';
  const period=document.getElementById('folgasPeriodo');if(period)period.textContent='Período: '+fsjData(week)+' a '+fsjData(end)+'. Independente das folgas de feriado.';
  document.getElementById('folgasLista').innerHTML=people.length?people.map((p,i)=>{
   const f=folgasAgenda.folgas.find(x=>x.pessoa_id===p.id);
   const controls='<label for="folgaGestor'+i+'">Definir ou alterar a folga desta semana</label><div class="row"><select id="folgaGestor'+i+'"><option value="">Selecione um dia desta semana</option>'+Array.from({length:7},(_,n)=>{const day=folgaSomar(week,n),label=new Date(day+'T12:00:00Z').toLocaleDateString('pt-BR',{timeZone:'America/Recife',weekday:'long',day:'2-digit',month:'2-digit'});return '<option value="'+day+'"'+(f?.dia===day?' selected':'')+'>'+esc(label)+'</option>';}).join('')+'</select><button type="button" data-folga-pessoa="'+esc(p.id)+'" data-folga-index="'+i+'">Salvar e bloquear alteração pelo empregado</button></div>';
   return '<div class="card"><h3>'+esc(p.nick||p.name)+'</h3><p>'+(f?.dia?'Folga semanal: <b>'+esc(fsjData(f.dia))+'</b> • '+(f.bloqueada_gestor?'Definida pelo gestor; empregado bloqueado.':'Informada pelo empregado.'):'Folga semanal pendente: empregado ainda não escolheu.')+'</p>'+(f?.dia?'<details class="folga-alterar"><summary>Alterar folga</summary>'+controls+'</details>':controls)+'</div>';
  }).join(''):'<p>Nenhum destinatário ativo selecionado para o WhatsApp.</p>';
  const holidaySection=document.getElementById('feriadosSection');if(holidaySection)holidaySection.hidden=folgasAgenda.feriados.length===0;
  document.getElementById('feriadosLista').innerHTML=folgasAgenda.feriados.map(h=>'<details class="card" open><summary><b>'+esc(fsjData(h.dia))+' • '+esc(h.nome)+'</b> — '+esc(h.ambito)+'</summary><p><a href="#" data-fsj-calendario-dia="'+esc(h.dia)+'" aria-label="Abrir calendário mensal operacional">Fonte do calendário</a></p>'+people.map(p=>{
   const v=folgasAgenda.decisoes.find(x=>x.pessoa_id===p.id&&x.dia===h.dia);
   const label='Folga compensatória do Feriado '+h.dia.slice(8,10)+'/'+h.dia.slice(5,7)+'/'+h.dia.slice(2,4);
   const compensation='<details><summary>'+(v?.folga_compensatoria?'Alterar folga compensatória':'Registrar folga compensatória')+'</summary><p class="muted">Definição exclusiva do Proprietário. A data do feriado é obrigatória e vinculada à folga.</p><label>Data do feriado a compensar<input type="date" value="'+esc(h.dia)+'" readonly required></label><label>'+esc(label)+'<input type="date" data-compensacao-input="'+esc(p.id)+'|'+h.dia+'" min="'+folgaSomar(h.dia,-30)+'" max="'+folgaSomar(h.dia,30)+'" value="'+(v?.folga_compensatoria||'')+'"></label><button type="button" data-compensacao-pessoa="'+esc(p.id)+'" data-compensacao-feriado="'+h.dia+'">Salvar compensação</button><p class="muted">A folga pode ser antes, no próprio feriado ou depois. No dia marcado não há mensagem. Se a folga ocorrer em outra data, o feriado permite tarefas. A folga semanal continua separada.</p></details>';
   return '<div>'+(v?.folga_compensatoria?'<p><b>'+esc(p.nick||p.name)+' — '+esc(label)+'</b>: '+esc(fsjData(v.folga_compensatoria))+'</p>':'')+'<label>'+esc(p.nick||p.name)+'<select data-feriado-pessoa="'+esc(p.id)+'" data-feriado-dia="'+h.dia+'"><option value=""'+(!v?' selected':'')+'>Decisão pendente — não enviar</option><option value="sim"'+(v?.receber===true?' selected':'')+'>Recebe tarefas</option><option value="nao"'+(v?.receber===false?' selected':'')+'>Não recebe tarefas</option></select></label>'+compensation+'</div>';
  }).join('')+'</details>').join('');
  document.getElementById('folgasHistorico').textContent=folgasAgenda.historico.filter(h=>h.pessoa_id===selected?.id).map(h=>(S.people.find(p=>p.id===h.pessoa_id)?.nick||h.pessoa_id)+': '+(h.dia_anterior?fsjData(h.dia_anterior):'pendente')+' → '+(h.dia_novo?fsjData(h.dia_novo):'pendente')+' ('+h.definido_por+')').join('\n')||'Nenhuma alteração nesta semana.';
  const pending=S.people.filter(p=>p.active&&p.whatsapp7h).filter(p=>!folgasAgenda.folgas.find(f=>f.pessoa_id===p.id)?.dia).length;
  const nextHoliday=folgasAgenda.feriados.find(h=>h.dia>=folgaHoje());
  document.getElementById('folgasResumo').textContent=pending+' escolha(s) de folga pendente(s) nesta semana.'+(nextHoliday?' Próximo feriado: '+fsjData(nextHoliday.dia)+' — '+nextHoliday.nome+'. Confira sua decisão por empregado.':'');

}
function selecionarPessoaFolgas(){
 fsjRenderFolgas();
 if(typeof fsjPersonLayout==='function')fsjPersonLayout(true);
 const target=document.getElementById('folgasPessoaSelect').value&&folgasAgenda?document.getElementById('folgasPessoaNome'):document.getElementById('folgasPessoaSelect');
 document.dispatchEvent(new CustomEvent('fsj:page-target',{detail:target}));
}
fsjRenderFolgas();

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

document.getElementById('feriadosLista').addEventListener('click',async e=>{const b=e.target.closest('[data-compensacao-pessoa]');if(!b)return;const input=[...document.querySelectorAll('[data-compensacao-input]')].find(x=>x.dataset.compensacaoInput===b.dataset.compensacaoPessoa+'|'+b.dataset.compensacaoFeriado);if(!input?.value)return alert('Escolha a data da folga compensatória.');b.disabled=true;try{await folgasPost({action:'compensation-set',pessoa_id:b.dataset.compensacaoPessoa,feriado:b.dataset.compensacaoFeriado,folga:input.value});await carregarFolgas();}catch(err){alert(err.message);}finally{b.disabled=false;}});

// Revalida ao retomar e na meia-noite local, sem depender de recarregar o aplicativo.
folgasRestaurarReferencia();
let folgasViradaTimer;
function folgasAgendarVirada(){
 clearTimeout(folgasViradaTimer);
 const next=folgaSomar(folgaSegunda(folgaHoje()),7);
 const delay=Math.max(1,new Date(next+'T00:00:00-03:00').getTime()-Date.now());
 folgasViradaTimer=setTimeout(()=>{if(folgasVirarSemana())carregarFolgas();folgasAgendarVirada();},delay);
}
function folgasRetomar(){if(document.hidden)return;if(folgasVirarSemana())carregarFolgas();folgasAgendarVirada();}
document.addEventListener('visibilitychange',folgasRetomar);
window.addEventListener('pageshow',folgasRetomar);
folgasAgendarVirada();

/* Calendário operacional do Desktop: o link de cada feriado abre o mês,
   sem redirecionar para a fonte legal. Consulta os registros vigentes. */
async function fsjAbrirMesOperacionalDesktop(day, personId){
 const link={dataset:{fsjCalendarioDia:day}};
 await fsjRenderMesOperacionalDesktop(link,personId);
}
async function fsjRenderMesOperacionalDesktop(link,personId){
 if(!link)return;
 const day=link.dataset.fsjCalendarioDia;
 if(!/^\d{4}-\d{2}-\d{2}$/.test(day))return;
 let dialog=document.getElementById('fsjCalendarioFeriadosDesktop');
 if(!dialog){
  dialog=document.createElement('dialog');
  dialog.id='fsjCalendarioFeriadosDesktop';
  dialog.style.cssText='width:min(96vw,780px);max-height:90vh;overflow:auto;border:1px solid #a9c4d0;border-radius:12px;padding:16px;background:#fff;color:#172b35';
  dialog.innerHTML='<div style="display:flex;align-items:center;justify-content:space-between;gap:10px"><h2 style="margin:0">Calendário mensal de folgas e feriados</h2><button type="button" data-fechar-calendario>Fechar</button></div><div class="row" style="align-items:center;gap:10px;margin:12px 0"><button type="button" data-mes-anterior aria-label="Mês anterior">←</button><strong id="fsjMesDesktopTitulo"></strong><button type="button" data-mes-proximo aria-label="Próximo mês">→</button></div><label>Funcionário <select id="fsjCalendarioDesktopPessoa"></select></label><div class="row" style="gap:8px;flex-wrap:wrap;margin:12px 0"><button type="button" data-fsj-alterar-folga>Alterar folga / compensação</button><button type="button" data-fsj-emergencia>Disparo Emergencial</button></div><div id="fsjCalendarioFeriadosConteudo" role="status"></div>';
  dialog.querySelector('[data-fechar-calendario]').onclick=()=>dialog.close();
  dialog.querySelector('[data-fsj-alterar-folga]').onclick=()=>{const pid=dialog.querySelector('#fsjCalendarioDesktopPessoa').value;dialog.close();navTo('folgasGestor');if(pid){const select=document.getElementById('folgasPessoaSelect');select.value=pid;selecionarPessoaFolgas();}document.getElementById('feriadosSection')?.scrollIntoView({block:'nearest'});};
  dialog.querySelector('[data-fsj-emergencia]').onclick=()=>{const pid=dialog.querySelector('#fsjCalendarioDesktopPessoa').value;dialog.close();fsjAbrirDisparoEmergencial();if(pid){const select=document.getElementById('fsjEmergenciaPessoa');if(select){select.value=pid;fsjRenderEmergenciaPessoas();}}};
  document.body.appendChild(dialog);
 }
 const selector=dialog.querySelector('#fsjCalendarioDesktopPessoa');
 const current=personId===undefined?(document.getElementById('folgasPessoaSelect')?.value||''):personId;
 selector.innerHTML='<option value="">Selecione uma pessoa</option>'+[...S.people].sort((a,b)=>a.name.localeCompare(b.name,'pt-BR')).map(p=>'<option value="'+esc(p.id)+'">'+esc(p.nick||p.name)+'</option>').join('');
 selector.value=current;
 selector.onchange=()=>fsjAbrirMesOperacionalDesktop(day,selector.value);
 dialog.querySelector('[data-mes-anterior]').onclick=()=>fsjAbrirMesOperacionalDesktop(folgaSomar(day.slice(0,7)+'-01',-1),selector.value);
 dialog.querySelector('[data-mes-proximo]').onclick=()=>{const d=new Date(day.slice(0,7)+'-01T12:00:00Z');d.setUTCMonth(d.getUTCMonth()+1);fsjAbrirMesOperacionalDesktop(d.toISOString().slice(0,10),selector.value)};
 if(!dialog.open)dialog.showModal();
 const content=dialog.querySelector('#fsjCalendarioFeriadosConteudo');
 content.textContent='Consultando marcações do mês...';
 const selected=dialog.querySelector('#fsjCalendarioDesktopPessoa')?.value||'';
 const start=day.slice(0,7)+'-01',last=new Date(Number(day.slice(0,4)),Number(day.slice(5,7)),0).getDate();
 const end=day.slice(0,7)+'-'+String(last).padStart(2,'0');
 try{
  const [holidays,weekly,decisions,people]=await Promise.all([
   api('/rest/v1/feriados_fsj?dia=gte.'+start+'&dia=lte.'+end+'&select=dia,nome'),
   selected?api('/rest/v1/folgas_semana?pessoa_id=eq.'+encodeURIComponent(selected)+'&dia=gte.'+start+'&dia=lte.'+end+'&select=dia'):Promise.resolve([]),
   selected?api('/rest/v1/feriados_envio?pessoa_id=eq.'+encodeURIComponent(selected)+'&select=dia,receber,folga_compensatoria'):Promise.resolve([]),
   selected?api('/rest/v1/pessoas?id=eq.'+encodeURIComponent(selected)+'&select=nome,identificacao,folgas_datas,folgas_motivos,ferias_inicio,ferias_fim'):Promise.resolve([])
  ]);
  const p=people[0]||{},reasons=p.folgas_motivos||{},manual=p.folgas_datas||[];
  const name=p.identificacao||p.nome||'';
  const marks={};
  const add=(d,label)=>{if(d>=start&&d<=end)(marks[d]??=[]).push(label)};
  holidays.forEach(h=>add(h.dia,'Feriado: '+h.nome));
  weekly.forEach(f=>add(f.dia,'Folga semanal'));
  manual.forEach(d=>add(d,reasons[d]||'Folga cadastrada'));
  decisions.forEach(d=>{if(d.folga_compensatoria)add(d.folga_compensatoria,'Compensatória do feriado '+fsjData(d.dia));if(d.dia>=start&&d.dia<=end&&d.receber)add(d.dia,'Trabalho autorizado no feriado')}
document.addEventListener('click',ev=>{const link=ev.target.closest('a[data-fsj-calendario-dia]');if(!link)return;ev.preventDefault();fsjRenderMesOperacionalDesktop(link);});
  if(p.ferias_inicio&&p.ferias_fim){for(let i=1;i<=last;i++){const d=start.slice(0,7)+'-'+String(i).padStart(2,'0');if(d>=p.ferias_inicio&&d<=p.ferias_fim)add(d,'Férias')}}
  const month=new Date(Number(day.slice(0,4)),Number(day.slice(5,7))-1,1);
  dialog.querySelector('#fsjMesDesktopTitulo').textContent=month.toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
  const offset=month.getDay();
  const cells=Array.from({length:offset},()=>'<div></div>');
  for(let i=1;i<=last;i++){
   const d=start.slice(0,7)+'-'+String(i).padStart(2,'0'),notes=marks[d]||[];
   cells.push('<div style="min-height:76px;padding:6px;border:1px solid #c5d5dd;border-radius:6px;background:'+(notes.some(n=>n.includes('Compensatória'))?'#fff0d5':notes.some(n=>n.includes('Férias'))?'#e8f1ff':notes.some(n=>n.includes('Trabalho autorizado'))?'#d9f4df':notes.length?'#eef2f5':'#fff')+'"><strong>'+i+'</strong>'+notes.map(n=>'<div style="font-size:11px;line-height:1.25;margin-top:4px">'+esc(n)+'</div>').join('')+'</div>');
  }
  content.innerHTML='<p><strong>'+esc(month.toLocaleDateString('pt-BR',{month:'long',year:'numeric'}))+'</strong>'+(name?' — '+esc(name):' — Selecione uma pessoa para visualizar as folgas individuais')+'</p><div style="display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px;font-size:12px">'+['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(d=>'<strong style="text-align:center">'+d+'</strong>').join('')+cells.join('')+'</div><p style="font-size:12px">Marcações consultadas nos registros operacionais do Assistente FSJ.</p>';
 }catch(err){content.textContent='Não foi possível carregar o calendário: '+err.message}
}
document.addEventListener('click',ev=>{const link=ev.target.closest('a[data-fsj-calendario-dia]');if(!link)return;ev.preventDefault();fsjRenderMesOperacionalDesktop(link);});

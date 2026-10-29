// Calendário mensal: grava somente datas/motivos da pessoa, sob RLS existente.
let fsjCalendarContext=null,fsjCalendarBusy=false,fsjCalendarDirty=false;
async function fsjPrepararCalendario(){
 const modal=document.getElementById('fsjCalendarioModal');
 let box=document.getElementById('fsjCalendarControls');
 if(!box){
  box=document.createElement('div');box.id='fsjCalendarControls';
  box.innerHTML='<label for="fsjCalendarPerson">Pessoa</label><select id="fsjCalendarPerson"></select><p id="fsjCalendarStatus" role="status"></p>';
  modal.prepend(box);
  const actions=document.createElement('div');actions.className='row';actions.style.cssText='gap:8px;margin:12px 0;flex-wrap:wrap';
  actions.innerHTML='<button type="button" class="primary" id="fsjCalendarSave">Salvar datas</button><button type="button" id="fsjCalendarReport">Consultar relatório</button>';
  modal.insertBefore(actions,document.getElementById('fsjFecharCalendario'));
  document.getElementById('fsjCalendarSave').onclick=fsjSalvarDatasCalendario;
  document.getElementById('fsjCalendarReport').onclick=()=>{if(fsjCalendarDirty){fsjCalendarStatus('Salve as datas antes de consultar o relatório.');return;}modal.close();fsjAbrirRelatorioFolgas();};
  document.getElementById('fsjCalendarPerson').onchange=async e=>{
   if(fsjCalendarDirty){e.target.value=fsjCalendarContext?.id||'';fsjCalendarStatus('Salve as datas antes de trocar a pessoa.');return;}
   await fsjCarregarPessoaCalendario(e.target.value);
  };
  modal.addEventListener('cancel',e=>{if(fsjCalendarBusy||fsjCalendarDirty){e.preventDefault();fsjCalendarStatus('Salve as datas antes de fechar o calendário.');}});
  modal.addEventListener('close',()=>{if(fsjCalendarContext?.backup){personDatesOff=fsjCalendarContext.backup.dates;personDayReasons=fsjCalendarContext.backup.reasons;renderPersonDatesOff();}fsjCalendarContext=null;});
  document.getElementById('fsjFecharCalendario').onclick=()=>{if(fsjCalendarBusy||fsjCalendarDirty){fsjCalendarStatus('Salve as datas antes de fechar o calendário.');return;}modal.close();};
 }
 if(fsjCalendarContext)return;
 const agenda=currentPage==='folgasGestor';
 fsjCalendarContext={id:'',backup:agenda?{dates:[...personDatesOff],reasons:{...personDayReasons}}:null};
 const select=document.getElementById('fsjCalendarPerson');
 select.innerHTML='<option value="">Selecione uma pessoa</option>'+[...S.people].sort((a,b)=>a.name.localeCompare(b.name,'pt-BR')).map(p=>'<option value="'+esc(p.id)+'">'+esc(p.name)+'</option>').join('');
 select.disabled=!agenda;
 select.value=agenda?document.getElementById('folgasPessoaSelect').value:document.getElementById('pid').value;
 if(agenda)await fsjCarregarPessoaCalendario(select.value);
 else{fsjCalendarContext.id=select.value;fsjCalendarDirty=true;fsjCalendarStatus('Confira as datas e clique em Salvar datas.');}
}
function fsjCalendarStatus(text){document.getElementById('fsjCalendarStatus').textContent=text;}
function fsjCalendarSetBusy(busy){fsjCalendarBusy=busy;document.getElementById('fsjCalendarSave').disabled=busy||!fsjCalendarContext?.id;document.getElementById('fsjCalendarPerson').disabled=busy||!fsjCalendarContext?.backup;document.getElementById('fsjCalendarioFolgas').inert=busy;}
async function fsjCarregarPessoaCalendario(id){
 fsjCalendarContext.id=id;personDatesOff=[];personDayReasons={};fsjCalendarDirty=false;renderPersonDatesOff();
 fsjCalendarSetBusy(true);fsjCalendarStatus(id?'Consultando datas salvas...':'Selecione a pessoa para marcar as datas.');
 try{if(!id)return;const rows=await api('/rest/v1/pessoas?id=eq.'+encodeURIComponent(id)+'&select=id,folgas_datas,folgas_motivos');if(rows.length!==1)throw Error('Pessoa indisponível para esta sessão.');personDatesOff=[...(rows[0].folgas_datas||[])];personDayReasons={...(rows[0].folgas_motivos||{})};renderPersonDatesOff();fsjCalendarStatus('Datas carregadas da armazenagem central.');}
 catch(e){fsjCalendarContext.id='';fsjCalendarStatus('Não foi possível consultar: '+e.message);}finally{fsjCalendarSetBusy(false);}
}
async function fsjSalvarDatasCalendario(){
 if(fsjCalendarBusy)return;if(!fsjCalendarContext?.id)return fsjCalendarStatus('Selecione uma pessoa.');
 const id=fsjCalendarContext.id,dates=[...personDatesOff],reasons={...personDayReasons};
 fsjCalendarSetBusy(true);fsjCalendarStatus('Salvando datas...');
 try{
  const rows=await api('/rest/v1/pessoas?id=eq.'+encodeURIComponent(id)+'&select=id,folgas_datas,folgas_motivos',{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({folgas_datas:dates,folgas_motivos:reasons})});
  if(rows?.length!==1||rows[0].id!==id)throw Error('Gravação não confirmada. Confira sua sessão.');
  const p=S.people.find(p=>p.id===id);if(p){p.datesOff=[...(rows[0].folgas_datas||[])];p.dayOffReasons={...(rows[0].folgas_motivos||{})};}save();
  fsjCalendarDirty=false;fsjCalendarStatus('Datas salvas na armazenagem central para '+(p?.name||'a pessoa selecionada')+'.');
 }catch(e){fsjCalendarStatus('Não foi possível salvar. As marcações foram preservadas: '+e.message);}finally{fsjCalendarSetBusy(false);}
}
function fsjAbrirRelatorioFolgas(){
 let modal=document.getElementById('fsjFolgasReport');
 if(!modal){modal=document.createElement('dialog');modal.id='fsjFolgasReport';modal.style.cssText='width:min(96vw,900px);max-height:92vh;overflow:auto;border:1px solid #9bb6c3;border-radius:12px;padding:16px';
  modal.innerHTML='<h2>Relatório de folgas, feriados e compensações</h2><label>Pessoa<select id="fsjReportPerson"></select></label><div class="row"><label>Data inicial<input id="fsjReportFrom" type="date"></label><label>Data final<input id="fsjReportTo" type="date"></label></div><div class="row" style="gap:8px;flex-wrap:wrap;margin:12px 0"><button type="button" id="fsjReportQuery">Consultar relatório</button><button type="button" id="fsjReportPrint" disabled>Imprimir / Salvar PDF</button><button type="button" id="fsjReportClose">Fechar</button></div><p id="fsjReportStatus" role="status"></p><div id="fsjReportResult"></div>';
  document.body.append(modal);document.getElementById('fsjReportClose').onclick=()=>modal.close();document.getElementById('fsjReportQuery').onclick=fsjConsultarRelatorioFolgas;document.getElementById('fsjReportPrint').onclick=fsjImprimirRelatorioFolgas;
  modal.addEventListener('change',()=>{document.getElementById('fsjReportPrint').disabled=true;document.getElementById('fsjReportResult').replaceChildren();});
 }
 document.getElementById('fsjReportPerson').innerHTML='<option value="">Todas as pessoas</option>'+[...S.people].sort((a,b)=>a.name.localeCompare(b.name,'pt-BR')).map(p=>'<option value="'+esc(p.id)+'">'+esc(p.name)+'</option>').join('');
 document.getElementById('fsjReportPerson').value=document.getElementById('folgasPessoaSelect').value||document.getElementById('fsjCalendarPerson')?.value||'';
 const today=folgaHoje();document.getElementById('fsjReportFrom').value=today.slice(0,7)+'-01';const d=new Date(today+'T12:00:00Z');d.setUTCMonth(d.getUTCMonth()+1,0);document.getElementById('fsjReportTo').value=d.toISOString().slice(0,10);
 document.getElementById('fsjReportResult').replaceChildren();document.getElementById('fsjReportPrint').disabled=true;document.getElementById('fsjReportStatus').textContent='Selecione a pessoa e o período, depois consulte.';if(!modal.open)modal.showModal();
}
async function fsjReportRead(path){const rows=[];for(let offset=0;;){const page=await api(path+'&limit=500&offset='+offset);if(!Array.isArray(page))throw Error('Consulta inválida.');rows.push(...page);if(!page.length)return rows;offset+=page.length;}}
function fsjReportRows(people,weekly,holidays,decisions,from,to){
 const rows=[],inside=d=>d&&d>=from&&d<=to;const add=(p,day,type,detail,source)=>{if(inside(day))rows.push({person:p.nome,day,type,detail,source});};
 for(const p of people){
  for(const day of p.folgas_datas||[])add(p,day,p.folgas_motivos?.[day]||'Folga semanal','Marcação no calendário mensal','Calendário mensal');
  for(const f of weekly.filter(x=>x.pessoa_id===p.id))add(p,f.dia,'Folga semanal','Semana de '+fsjData(f.semana),'Agenda semanal');
  for(const h of holidays){const v=decisions.find(x=>x.pessoa_id===p.id&&x.dia===h.dia);add(p,h.dia,'Feriado',h.nome+' — '+(v?v.receber?'Recebe tarefas':'Não recebe tarefas':'Decisão pendente'),'Calendário oficial');}
  for(const v of decisions.filter(x=>x.pessoa_id===p.id&&x.folga_compensatoria))add(p,v.folga_compensatoria,'Folga compensatória','Referente ao feriado de '+fsjData(v.dia),'Compensação registrada');
 }
 return rows.sort((a,b)=>a.person.localeCompare(b.person,'pt-BR')||a.day.localeCompare(b.day)||a.type.localeCompare(b.type));
}
async function fsjConsultarRelatorioFolgas(){
 const button=document.getElementById('fsjReportQuery'),status=document.getElementById('fsjReportStatus'),result=document.getElementById('fsjReportResult');
 const from=document.getElementById('fsjReportFrom').value,to=document.getElementById('fsjReportTo').value,id=document.getElementById('fsjReportPerson').value;
 document.getElementById('fsjReportPrint').disabled=true;result.replaceChildren();if(!from||!to||from>to){status.textContent='Informe um período válido, com data inicial anterior ou igual à final.';return;}
 button.disabled=true;status.textContent='Consultando registros centrais...';
 const controls=[...document.querySelectorAll('#fsjFolgasReport input,#fsjFolgasReport select')];controls.forEach(x=>x.disabled=true);
 try{
  const pf=id?'&pessoa_id=eq.'+encodeURIComponent(id):'';
  const [people,weekly,holidays,decisions]=await Promise.all([
   fsjReportRead('/rest/v1/pessoas?select=id,nome,folgas_datas,folgas_motivos&order=id'+(id?'&id=eq.'+encodeURIComponent(id):'')),
   fsjReportRead('/rest/v1/folgas_semana?select=*&dia=gte.'+from+'&dia=lte.'+to+'&order=pessoa_id,semana'+pf),
   fsjReportRead('/rest/v1/feriados_fsj?select=*&dia=gte.'+from+'&dia=lte.'+to+'&order=dia'),
   fsjReportRead('/rest/v1/feriados_envio?select=*&or=(and(dia.gte.'+from+',dia.lte.'+to+'),and(folga_compensatoria.gte.'+from+',folga_compensatoria.lte.'+to+'))&order=pessoa_id,dia'+pf)
  ]);
  if(!people.length)throw Error('Nenhuma pessoa disponível. Confira a sessão.');
  const rows=fsjReportRows(people,weekly,holidays,decisions,from,to);
  result.innerHTML='<div class="fsj-report-header" style="display:flex;align-items:center;gap:14px;border-bottom:2px solid #176341;padding:8px 0 12px;margin-bottom:12px"><img src="https://urbanopos.github.io/Assistente.FSJ/icons/assistente-fsj-casa-180.png" alt="Ícone da Fazenda São José" style="width:58px;height:58px;object-fit:contain"><div><h2 style="margin:0;color:#176341">FAZENDA SÃO JOSÉ</h2><div style="font-size:14px;font-weight:700">RELATÓRIO DE FOLGAS, FERIADOS E COMPENSAÇÕES</div></div></div><p>Folgas, feriados e compensações — '+esc(id?people[0].nome:'Todas as pessoas')+'</p><p>Período: '+esc(fsjData(from))+' a '+esc(fsjData(to))+' (datas incluídas). Emissão: '+esc(new Date().toLocaleString('pt-BR',{timeZone:'America/Recife'}))+'</p><p>'+rows.length+' registro(s). Fontes distintas são identificadas; não representa total de dias únicos.</p><div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse"><thead><tr><th>Pessoa</th><th>Data</th><th>Tipo</th><th>Descrição</th><th>Origem</th></tr></thead><tbody>'+rows.map(r=>'<tr>'+[r.person,fsjData(r.day),r.type,r.detail,r.source].map(v=>'<td style="border:1px solid #bbb;padding:6px">'+esc(v)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>'+(rows.length?'':'<p>Nenhum registro no período.</p>');
  status.textContent='Consulta concluída. O relatório pode ser impresso ou salvo em PDF.';document.getElementById('fsjReportPrint').disabled=false;
 }catch(e){status.textContent='Não foi possível consultar: '+e.message;}finally{button.disabled=false;controls.forEach(x=>x.disabled=false);}
}
function fsjImprimirRelatorioFolgas(){
 const win=window.open('','fsjRelatorioFolgas');if(!win){document.getElementById('fsjReportStatus').textContent='Permita a abertura da janela de impressão neste navegador.';return;}
 win.document.open();win.document.write('<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Relatório de folgas — FSJ</title><style>body{font:12px Arial;color:#111;margin:20px}th,td{text-align:left}thead{display:table-header-group}tr{break-inside:avoid}@page{size:A4 landscape;margin:12mm}@media print{button{display:none}div{overflow:visible!important}}</style></head><body><button onclick="window.print()">Imprimir / Salvar PDF</button>'+document.getElementById('fsjReportResult').innerHTML+'</body></html>');win.document.close();win.focus();win.addEventListener('load',()=>win.print(),{once:true});
}

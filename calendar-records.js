// Calendário mensal: grava somente datas/motivos da pessoa, sob RLS existente.
let fsjCalendarContext=null,fsjCalendarBusy=false,fsjCalendarDirty=false,fsjCalendarPendingCompensation=null;
async function fsjPrepararCalendario(){
 const modal=document.getElementById('fsjFolgasCalendarioLateral');
 let box=document.getElementById('fsjCalendarControls');
 if(!box){
  box=document.createElement('div');box.id='fsjCalendarControls';
  box.innerHTML='<select id="fsjCalendarPerson" hidden aria-hidden="true"></select><p id="fsjCalendarStatus" role="status"></p>';
  modal.prepend(box);
  const actions=document.createElement('div');actions.className='row';actions.style.cssText='gap:8px;margin:12px 0;flex-wrap:wrap';
  actions.innerHTML='<button type="button" class="primary" id="fsjCalendarSave" hidden aria-hidden="true">Salvar datas</button><button type="button" id="fsjCalendarReport">Consultar relatório</button>';
  modal.appendChild(actions);
  document.getElementById('fsjCalendarSave').onclick=fsjSalvarDatasCalendario;
  document.getElementById('fsjCalendarReport').onclick=()=>{if(fsjCalendarDirty){fsjCalendarStatus('Salve as datas antes de consultar o relatório.');return;}fsjAbrirRelatorioFolgas();};
  document.getElementById('fsjCalendarPerson').onchange=async e=>{
   if(fsjCalendarDirty){e.target.value=fsjCalendarContext?.id||'';fsjCalendarStatus('Salve as datas antes de trocar a pessoa.');return;}
   await fsjCarregarPessoaCalendario(e.target.value);
  };

 }
 if(fsjCalendarContext){const selected=document.getElementById('folgasPessoaSelect')?.value||'';if(fsjCalendarDirty){fsjCalendarStatus('Existem alterações não salvas. Salve antes de trocar de pessoa.');return;}await fsjCarregarPessoaCalendario(selected);return;}
 const agenda=true;
 fsjCalendarContext={id:'',backup:agenda?{dates:[...personDatesOff],reasons:{...personDayReasons}}:null};
 const select=document.getElementById('fsjCalendarPerson');
 select.innerHTML='<option value="">Selecione uma pessoa</option>'+[...S.people].sort((a,b)=>a.name.localeCompare(b.name,'pt-BR')).map(p=>'<option value="'+esc(p.id)+'">'+esc(p.name)+'</option>').join('');
 select.disabled=true;box.hidden=false; // O status deve permanecer visível; somente o seletor duplicado fica oculto.
 select.value=document.getElementById('folgasPessoaSelect').value;
 if(agenda)await fsjCarregarPessoaCalendario(select.value);
 else{fsjCalendarContext.id=select.value;fsjCalendarDirty=true;fsjCalendarStatus('Confira as datas e clique em Salvar datas.');}
}
function fsjCalendarStatus(text){document.getElementById('fsjCalendarStatus').textContent=text;}
function fsjCalendarSetBusy(busy){
 fsjCalendarBusy=busy;
 const saveButton=document.getElementById('fsjCalendarSave');
 if(saveButton)saveButton.disabled=busy||!fsjCalendarContext?.id;
 const person=document.getElementById('fsjCalendarPerson');
 if(person)person.disabled=true;
 const calendar=document.getElementById('fsjCalendarioFolgas');
 if(calendar)calendar.inert=busy||!fsjCalendarContext?.id;
 const editorButton=document.getElementById('fsjConfirmarDiaMotivo');
 if(editorButton)editorButton.disabled=busy||!fsjCalendarContext?.id;
}
async function fsjCarregarPessoaCalendario(id){
 if(!fsjCalendarContext)fsjCalendarContext={id:'',backup:null};
 fsjCalendarContext.id='';
 fsjCalendarDirty=false;
 const editor=document.getElementById('fsjFolgaMotivoEditor');
 if(editor)editor.hidden=true;
 fsjCalendarSetBusy(true);
 fsjCalendarStatus(id?'Consultando datas salvas...':'Selecione uma pessoa para marcar as datas.');
 try{
  if(!id){personDatesOff=[];personDayReasons={};renderPersonDatesOff();return;}
  const rows=await api('/rest/v1/pessoas?id=eq.'+encodeURIComponent(id)+'&select=id,folgas_datas,folgas_motivos');
  if(!Array.isArray(rows)||rows.length!==1||String(rows[0].id)!==String(id))throw Error('Pessoa indisponível para esta sessão.');
  personDatesOff=[...(rows[0].folgas_datas||[])];
  personDayReasons={...(rows[0].folgas_motivos||{})};
  fsjCalendarContext.id=id;
  fsjCalendarContext.loadedDates=[...personDatesOff];
  fsjCalendarContext.loadedReasons={...personDayReasons};
  renderPersonDatesOff();
  fsjCalendarStatus('Datas carregadas da armazenagem central.');
 }catch(e){
  fsjCalendarContext.id='';
  fsjCalendarStatus('Falha na consulta. Edição bloqueada; nenhuma marcação existente foi apagada: '+e.message);
 }finally{fsjCalendarSetBusy(false);}
}
async function fsjSalvarDatasCalendario(){
 if(fsjCalendarBusy){fsjCalendarStatus('Aguarde o carregamento do calendário.');return false;}
 if(!fsjCalendarContext?.id){fsjCalendarStatus('Selecione uma pessoa e aguarde a consulta dos registros reais.');return false;}
 const id=fsjCalendarContext.id;
 const selected=typeof fsjDataFolgaAtual!=='undefined'?fsjDataFolgaAtual:null;
 if(!selected){fsjCalendarStatus('Selecione a data a incluir, alterar ou remover.');return false;}
 const oldDates=fsjCalendarContext.loadedDates||[];
 const oldReasons=fsjCalendarContext.loadedReasons||{};
 const newHas=personDatesOff.includes(selected),newReason=personDayReasons[selected]||'';
 fsjCalendarSetBusy(true);fsjCalendarStatus('Conferindo registros atuais antes de salvar...');
 try{
  const current=await api('/rest/v1/pessoas?id=eq.'+encodeURIComponent(id)+'&select=id,folgas_datas,folgas_motivos');
  if(!Array.isArray(current)||current.length!==1||String(current[0].id)!==String(id))throw Error('Não foi possível confirmar os registros atuais.');
  const actualDates=[...(current[0].folgas_datas||[])];
  const actualReasons={...(current[0].folgas_motivos||{})};
  const oldHas=oldDates.includes(selected),actualHas=actualDates.includes(selected);
  if(oldHas!==actualHas||(oldReasons[selected]||'')!==(actualReasons[selected]||''))throw Error('Esta data foi modificada por outra sessão. Atualize o calendário antes de editar.');
  const dates=actualDates.filter(d=>d!==selected);
  if(newHas)dates.push(selected);
  dates.sort();
  const reasons={...actualReasons};
  if(newHas)reasons[selected]=newReason;
  else delete reasons[selected];
  const rows=await api('/rest/v1/pessoas?id=eq.'+encodeURIComponent(id)+'&select=id,folgas_datas,folgas_motivos',{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({folgas_datas:dates,folgas_motivos:reasons})});
  if(!Array.isArray(rows)||rows.length!==1||String(rows[0].id)!==String(id))throw Error('Gravação não confirmada.');
  personDatesOff=[...(rows[0].folgas_datas||[])];
  personDayReasons={...(rows[0].folgas_motivos||{})};
  fsjCalendarContext.loadedDates=[...personDatesOff];
  fsjCalendarContext.loadedReasons={...personDayReasons};
  const p=S.people.find(p=>String(p.id)===String(id));
  if(p){p.datesOff=[...personDatesOff];p.dayOffReasons={...personDayReasons};}
  try{save();}catch(localError){console.warn('Registro central salvo; cache local não atualizado:',localError);}
  fsjCalendarPendingCompensation=null;fsjCalendarDirty=false;
  renderPersonDatesOff();
  fsjCalendarStatus('Data salva e calendário atualizado na armazenagem central.');
  return true;
 }catch(e){
  fsjCalendarStatus('Não foi possível salvar. Nenhum registro foi substituído nesta tentativa: '+e.message);
  return false;
 }finally{fsjCalendarSetBusy(false);}
}
function fsjAbrirRelatorioFolgas(){
 let modal=document.getElementById('fsjFolgasReport');
 if(!modal){
  modal=document.createElement('dialog');modal.id='fsjFolgasReport';modal.style.cssText='width:min(96vw,760px);max-height:92vh;overflow:auto;border:1px solid #9bb6c3;border-radius:12px;padding:16px';
  modal.innerHTML='<h2>Relatório mensal de folgas e férias</h2><div class="row"><label>Usuário<select id="fsjReportPerson"></select></label><label>Mês<input id="fsjReportMonth" type="month"></label></div><div class="row" style="gap:8px;flex-wrap:wrap;margin:12px 0"><button type="button" id="fsjReportQuery">Consultar relatório</button><button type="button" id="fsjReportPrint" disabled>Imprimir / Salvar PDF</button><button type="button" id="fsjReportClose">Fechar</button></div><p id="fsjReportStatus" role="status"></p><div id="fsjReportResult"></div>';
  document.body.append(modal);
  document.getElementById('fsjReportClose').onclick=()=>modal.close();
  document.getElementById('fsjReportQuery').onclick=fsjConsultarRelatorioFolgas;
  document.getElementById('fsjReportPrint').onclick=fsjImprimirRelatorioFolgas;
  modal.addEventListener('change',()=>{document.getElementById('fsjReportPrint').disabled=true;document.getElementById('fsjReportResult').replaceChildren();});
 }
 document.getElementById('fsjReportPerson').innerHTML='<option value="">Todos os usuários</option>'+[...S.people].sort((a,b)=>a.name.localeCompare(b.name,'pt-BR')).map(p=>'<option value="'+esc(p.id)+'">'+esc(p.name)+'</option>').join('');
 document.getElementById('fsjReportPerson').value=document.getElementById('folgasPessoaSelect')?.value||document.getElementById('fsjCalendarPerson')?.value||'';
 document.getElementById('fsjReportMonth').value=folgaHoje().slice(0,7);
 document.getElementById('fsjReportResult').replaceChildren();
 document.getElementById('fsjReportPrint').disabled=true;
 document.getElementById('fsjReportStatus').textContent='Selecione o usuário e o mês para consultar as folgas registradas.';
 if(!modal.open)modal.showModal();
}
async function fsjConsultarRelatorioFolgas(){
 const button=document.getElementById('fsjReportQuery'),status=document.getElementById('fsjReportStatus'),result=document.getElementById('fsjReportResult');
 const month=document.getElementById('fsjReportMonth').value,id=document.getElementById('fsjReportPerson').value;
 document.getElementById('fsjReportPrint').disabled=true;result.replaceChildren();
 if(!/^\d{4}-\d{2}$/.test(month)){status.textContent='Selecione um mês válido.';return;}
 button.disabled=true;status.textContent='Consultando registros salvos...';
 const controls=[...document.querySelectorAll('#fsjFolgasReport input,#fsjFolgasReport select')];controls.forEach(x=>x.disabled=true);
 try{
  const people=await api('/rest/v1/pessoas?select=id,nome,folgas_datas,folgas_motivos&order=nome'+(id?'&id=eq.'+encodeURIComponent(id):''));
  if(!Array.isArray(people)||(!people.length&&id))throw Error('Usuário não encontrado na base central.');
  const rows=[];
  for(const p of people){
   for(const day of p.folgas_datas||[]){
    if(typeof day!=='string'||!day.startsWith(month+'-'))continue;
    const raw=String(p.folgas_motivos?.[day]||'Folga semanal');
    const compensatoria=raw.toLowerCase().startsWith('folga compensatória');
    const feriado=compensatoria?raw.match(/feriado compensado: (\d{4}-\d{2}-\d{2})/i)?.[1]:null;
    rows.push({person:p.nome,day,type:compensatoria?'Folga Compensatória':raw,holiday:feriado});
   }
  }
  rows.sort((a,b)=>a.person.localeCompare(b.person,'pt-BR')||a.day.localeCompare(b.day));
  const period=new Date(month+'-01T12:00:00').toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
  result.innerHTML='<div class="fsj-report-header" style="border-bottom:2px solid #176341;padding:8px 0 12px;margin-bottom:12px"><h2 style="margin:0;color:#176341">FAZENDA SÃO JOSÉ</h2><strong>RELATÓRIO MENSAL DE FOLGAS E FÉRIAS</strong></div><p>Usuário: '+esc(id?people[0].nome:'Todos os usuários')+' · Mês: '+esc(period)+'</p><p>'+rows.length+' folga(s) registrada(s).</p><table style="width:100%;border-collapse:collapse"><thead><tr><th>Usuário</th><th>Data</th><th>Tipo da folga</th></tr></thead><tbody>'+rows.map(r=>'<tr>'+[r.person,fsjData(r.day),r.type].map(v=>'<td style="border:1px solid #bbb;padding:6px">'+esc(v)+'</td>').join('')+'</tr>').join('')+'</tbody></table>'+(rows.length?'':'<p>Nenhuma folga registrada neste mês.</p>');
  status.textContent='Consulta concluída com os registros do calendário mensal.';
  document.getElementById('fsjReportPrint').disabled=false;
 }catch(e){status.textContent='Não foi possível consultar: '+e.message;}
 finally{button.disabled=false;controls.forEach(x=>x.disabled=false);}
}
function fsjImprimirRelatorioFolgas(){
 const win=window.open('','fsjRelatorioFolgas');if(!win){document.getElementById('fsjReportStatus').textContent='Permita a abertura da janela de impressão neste navegador.';return;}
 win.document.open();win.document.write('<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Relatório de folgas — FSJ</title><style>body{font:12px Arial;color:#111;margin:20px}th,td{text-align:left}thead{display:table-header-group}tr{break-inside:avoid}@page{size:A4 landscape;margin:12mm}@media print{button{display:none}div{overflow:visible!important}}</style></head><body><button onclick="window.print()">Imprimir / Salvar PDF</button>'+document.getElementById('fsjReportResult').innerHTML+'</body></html>');win.document.close();win.focus();win.addEventListener('load',()=>win.print(),{once:true});
}

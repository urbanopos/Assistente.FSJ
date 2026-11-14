(function () {
 'use strict';
 const dayMs = 86400000;
 const formatDay = new Intl.DateTimeFormat('sv-SE', {timeZone:'America/Recife'});
 const formatMonth = new Intl.DateTimeFormat('pt-BR', {month:'long', year:'numeric', timeZone:'UTC'});
 const labels = {diaria:'Diária', semanal:'Semanal', quinzenal:'Quinzenal', mensal:'Mensal',
  trimestral:'Trimestral', semestral:'Semestral', anual:'Anual'};
 const monthSteps = {mensal:1, trimestral:3, semestral:6, anual:12};
 const days = value => Date.parse(value + 'T12:00:00Z') / dayMs - 0.5;
 const iso = value => new Date(value * dayMs).toISOString().slice(0,10);
 const recife = value => value && Number.isFinite(Date.parse(value)) ? formatDay.format(new Date(value)) : '';
 const date = value => value.split('-').reverse().join('/');
 const dow = day => new Date(day * dayMs).getUTCDay();
 function monthBounds(month) {
  const [y,m] = month.split('-').map(Number);
  return [days(month+'-01'), Date.UTC(y,m,1)/dayMs-1];
 }
 function advance(reference, frequency, index) {
  if (frequency === 'semanal' || frequency === 'quinzenal') return days(reference) + index * (frequency==='semanal'?7:14);
  const [year,month,day] = reference.split('-').map(Number);
  const step = month-1 + monthSteps[frequency]*index;
  const last = new Date(Date.UTC(year,step+1,0)).getUTCDate();
  return Date.UTC(year,step,Math.min(day,last))/dayMs;
 }
 function indexBy(rows,key) {
  const result = new Map();
  for (const row of rows) {
   const value = key(row);
   if (!result.has(value)) result.set(value,[]);
   result.get(value).push(row);
  }
  return result;
 }
 function schedules(base, month) {
  const [first,last] = monthBounds(month);
  const archive = new Map(base.archive.map(row=>[row.tarefa_id,recife(row.em)]));
  const assigned = indexBy(base.assigned,row=>row.tarefa_id);
  const groupMembers = indexBy(base.members,row=>row.grupo_id);
  const people = new Map(base.people.map(person=>[person.id,person]));
  const groups = new Map(base.groups.map(group=>[group.id,group.nome]));
  const schedules = [];
  for (const task of base.tasks) {
   const frequency = task.periodicidade;
   if (!Object.hasOwn(labels,frequency)||/^cancelad/i.test(task.situacao||'')) continue;
   const created = recife(task.criada_em);
   const reference = task.referencia_repeticao || created;
   const closed = archive.get(task.id);
   if (!created || !reference || (/^arquivad/i.test(task.situacao||'')&&!closed)) continue;
   const assignees = assigned.get(task.id)||[];
   const members = task.grupo_id ? (assignees.length?assignees:groupMembers.get(task.grupo_id)||[]) : assignees;
   const responsibles = [...new Set(members.map(row=>row.pessoa_id))].map(id=>people.get(id)).filter(Boolean);
   if (!responsibles.length) continue;
   let periods = [];
   if (frequency==='diaria') {
    const start = Math.max(first,days(created),days(reference));
    const end = Math.min(last,closed?days(closed):last);
    for(let day=start;day<=end;day++) periods.push([day,day]);
   } else {
    // A central cria um registro por período nas frequências acima de diária.
    const index = task.repeticao_indice||0;
    const start = advance(reference,frequency,index);
    const end = (task.proxima_repeticao ? days(task.proxima_repeticao) : advance(reference,frequency,index+1))-1;
    if (end>=first&&end<=last&&end>=start&&(!closed||end<=days(closed))) periods = [[start,end]];
   }
   if (periods.length) schedules.push({task,periods,responsibles,group:groups.get(task.grupo_id)||'Grupo'});
  }
  return schedules;
 }
 function calendarSources(base) {
  const official = new Map();
  for (const row of base.holidays) official.set(row.dia,[...(official.get(row.dia)||[]),row.nome]);
  const weekly = new Map(base.weekly.map(row=>[row.pessoa_id+'|'+row.semana,row.dia]));
  const exceptions = new Map(base.decisions.map(row=>[row.pessoa_id+'|'+row.dia,row.receber]));
  const compensation = new Set(base.decisions.filter(row=>row.folga_compensatoria)
   .map(row=>row.pessoa_id+'|'+row.folga_compensatoria));
  return (person,day) => {
   const value = iso(day), key = person.id+'|'+value;
   const picked = weekly.get(person.id+'|'+iso(day-(dow(day)+6)%7));
   const personalReason = person.folgas_motivos?.[value]||'Folga registrada';
   const isHoliday = official.has(value);
   const holiday = isHoliday ? official.get(value).join(', ') : '';
   const worksHoliday = isHoliday && exceptions.get(key)===true;
   if (person.folgas_datas?.includes(value)) return {label:personalReason, kind:/feriad/i.test(personalReason)?'holiday':/férias/i.test(personalReason)?'vacation':'leave',off:true};
   if (person.ferias_inicio&&value>=person.ferias_inicio&&value<=(person.ferias_fim||person.ferias_inicio)) return {label:'Férias',kind:'vacation',off:true};
   if (compensation.has(key)) return {label:'Folga compensatória',kind:'leave',off:true};
   if (isHoliday&&!worksHoliday) return {label:'Feriado · '+holiday,kind:'holiday',off:true};
   if (picked===value || (!picked&&person.folgas_semanais?.includes(dow(day)))) return {label:'Folga semanal',kind:'leave',off:true};
   return {label:worksHoliday?'Feriado com trabalho previsto · '+holiday:'',kind:worksHoliday?'holiday':'normal',off:false};
  };
 }
 function completionRecords(base) {
  const rows = base.returns.filter(row=>row.tipo==='sim'&&!row.cancelado_por_revisao)
   .map(row=>({task:row.tarefa_id,person:row.pessoa_id,day:row.dia_previsto||recife(row.criado_em),done:recife(row.criado_em)}));
  const cancelled = new Set(base.returns.filter(row=>row.cancelado_por_revisao||row.tipo==='sim_devolvido')
   .map(row=>row.tarefa_id+'|'+row.pessoa_id+'|'+(row.dia_previsto||recife(row.criado_em))));
  for (const row of base.executions) {
   if (row.estado==='concluida'&&row.concluido_em&&!cancelled.has(row.tarefa_id+'|'+row.pessoa_id+'|'+row.dia)) {
    rows.push({task:row.tarefa_id,person:row.pessoa_id,day:row.dia,done:recife(row.concluido_em)});
   }
  }
  return indexBy(rows.filter(row=>row.day&&row.done),row=>row.task);
 }
 function report(base, planned, personId, today) {
  const calendar = calendarSources(base), records = completionRecords(base), cutoff=days(today)-2;
  const revised = new Set(base.returns.filter(row=>row.cancelado_por_revisao||row.tipo==='sim_devolvido').map(row=>row.tarefa_id));
  const result = [];
  for (const entry of planned) {
   const {task,responsibles,periods,group}=entry;
   const groupTask=!!task.grupo_id;
   if (personId&&!responsibles.some(person=>person.id===personId)) continue;
   const answers=records.get(task.id)||[];
   const eligible=groupTask?[responsibles]:responsibles.filter(person=>!personId||person.id===personId).map(person=>[person]);
   for (const members of eligible) {
    const overdue=[];
    for (const [start,end] of periods) {
     if (end>cutoff) continue;
    const workingDay=(person,day)=>!calendar(person,day).off&&(!person.criado_em||iso(day)>=recife(person.criado_em));
    let lastWork=end;
    const firstWork=Math.max(start,days(recife(task.criada_em)));
    while(lastWork>=firstWork&&!members.some(person=>workingDay(person,lastWork)))lastWork--;
    if (lastWork<firstWork) continue;
     const from=iso(start), to=iso(end), tolerance=iso(end+1);
     const permitted=new Set(members.map(person=>person.id));
     const completions=answers.filter(row=>(groupTask||permitted.has(row.person))&&row.day>=from&&row.day<=to&&row.done>=from);
     // Conclusão central legada de tarefa com um único período.
     if(task.periodicidade!=='diaria'&&task.concluida_em&&!revised.has(task.id)){
      const done=recife(task.concluida_em);
      if(done>=from&&(groupTask||permitted.has(task.concluida_por)||(!task.concluida_por&&members.length===1)))completions.push({done});
     }
     if (!completions.some(row=>row.done<=tolerance)) overdue.push({from,to,tolerance,lastWork:iso(lastWork),regularized:completions.some(row=>row.done>tolerance)});
    }
    if (overdue.length) result.push({task,groupTask,group,members,overdue});
   }
  }
  return {calendar, entries:result.sort((a,b)=>Number(a.groupTask)-Number(b.groupTask)
   || b.overdue.at(-1).to.localeCompare(a.overdue.at(-1).to)
   || (a.task.codigo_tarefa||'').localeCompare(b.task.codigo_tarefa||'','pt-BR',{numeric:true}))};
 }

 async function readAll(path, api) {
  const result=[];
  const size=500;
  for (let offset=0;;offset+=size) {
   const rows=await api(path+'&limit='+size+'&offset='+offset);
   if (!Array.isArray(rows)) throw Error('Consulta incompleta');
   result.push(...rows);
   if (rows.length<size) return result;
  }
 }
 async function load(api, month) {
  const read = path => readAll('/rest/v1/'+path,api);
  const [tasks,assigned,people,groups,members,audit]=await Promise.all([
   read('tarefas?select=id,codigo_tarefa,descricao,grupo_id,periodicidade,criada_em,situacao,referencia_repeticao,repeticao_indice,proxima_repeticao,concluida_em,concluida_por&periodicidade=neq.pontual&order=id'),
   read('tarefa_responsaveis?select=tarefa_id,pessoa_id&order=tarefa_id,pessoa_id'),
   read('pessoas?select=id,nome,identificacao,ativo,criado_em,folgas_semanais,folgas_datas,folgas_motivos,ferias_inicio,ferias_fim&order=id'),
   read('grupos?select=id,nome&order=id'),
   read('grupo_membros?select=grupo_id,pessoa_id&order=grupo_id,pessoa_id'),
   api('/rest/v1/rpc/fsj_consultar_auditoria_proprietario',{method:'POST',body:'{}'}),
  ]);
  if (!Array.isArray(audit?.arquivamentos)) throw Error('Histórico de arquivamento indisponível');
  const base={tasks,assigned,people,groups,members,archive:audit.arquivamentos};
  const planned=schedules(base,month), [first,last]=monthBounds(month);
  const start=iso(planned.reduce((min,item)=>Math.min(min,item.periods[0][0]),first));
  const end=iso(last), weekStart=iso(days(start)-(dow(days(start))+6)%7);
  const [holidays,weekly,decisions,returns,executions]=await Promise.all([
   read('feriados_fsj?select=dia,nome&dia=gte.'+start+'&dia=lte.'+end+'&order=dia,nome'),
   read('folgas_semana?select=pessoa_id,semana,dia&semana=gte.'+weekStart+'&semana=lte.'+end+'&order=pessoa_id,semana'),
   read('feriados_envio?select=pessoa_id,dia,receber,folga_compensatoria&or=(and(dia.gte.'+start+',dia.lte.'+end+'),and(folga_compensatoria.gte.'+start+',folga_compensatoria.lte.'+end+'))&order=pessoa_id,dia'),
   read('retornos?select=id,tarefa_id,pessoa_id,tipo,dia_previsto,criado_em,cancelado_por_revisao&or=(and(dia_previsto.gte.'+start+',dia_previsto.lte.'+end+'),and(dia_previsto.is.null,criado_em.gte.'+start+'T03:00:00Z,criado_em.lt.'+iso(last+1)+'T03:00:00Z))&tipo=in.(sim,sim_devolvido)&order=id'),
   read('execucoes_tarefa?select=tarefa_id,pessoa_id,dia,estado,concluido_em&dia=gte.'+start+'&dia=lte.'+end+'&estado=eq.concluida&order=tarefa_id,pessoa_id,dia'),
  ]);
  return {base:{...base,holidays,weekly,decisions,returns,executions},planned};
 }
 const el=(tag,text='',className='')=>{
  const node=document.createElement(tag);
  node.textContent=text;
  if(className)node.className=className;
  return node;
 };
 const name=person=>person.identificacao||person.nome||'Responsável';
 function showCalendar(item, result, month, personId, trigger) {
  const dialog=el('dialog','','fsj-occurrence-calendar');
  const title=el('h2',(item.task.codigo_tarefa||'Tarefa')+' — '+item.task.descricao);
  const subtitle=el('p',labels[item.task.periodicidade]+' · '+(item.groupTask?item.group:item.members.map(name).join(', ')));
  const close=el('button','Fechar');close.type='button';close.onclick=()=>dialog.close();
  const filter=el('select');
  filter.setAttribute('aria-label','Calendário do responsável');
  for(const person of item.members)filter.add(new Option(name(person),person.id));
  filter.value=item.members.some(person=>person.id===personId)?personId:item.members[0].id;
  const monthTitle=el('h3');
  const monthPicker=el('input');monthPicker.type='month';monthPicker.value=month;monthPicker.max=month;
  monthPicker.min=item.overdue[0].from.slice(0,7);
  monthPicker.setAttribute('aria-label','Mês do calendário');
  const grid=el('div','','fsj-occurrence-grid');
  const detail=el('p','Toque em um dia para ver seu registro.');detail.setAttribute('aria-live','polite');
  const legend=el('p','Vermelho: fora do prazo. Verde claro: folga. Amarelo: feriado. Azul claro: férias.');
  function draw(){
   grid.replaceChildren();
   const person=item.members.find(member=>member.id===filter.value);
   const displayMonth=monthPicker.value||month;
   const [first,last]=monthBounds(displayMonth);
   monthTitle.textContent=formatMonth.format(new Date(first*dayMs));
   const misses=new Map(item.overdue.map(row=>[row.to,row]));
   const markers=new Map();
   for(const occurrence of item.overdue){
    let mark=days(occurrence.lastWork);
    const earliest=Math.max(days(occurrence.from),days(recife(item.task.criada_em)),
     person.criado_em?days(recife(person.criado_em)):first);
    while(mark>=earliest&&result.calendar(person,mark).off)mark--;
    if(mark>=earliest)markers.set(iso(mark),occurrence);
   }
   for(const day of ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'])grid.append(el('strong',day));
   for(let empty=0;empty<dow(first);empty++)grid.append(el('span'));
   for(let day=first;day<=last;day++){
    const value=iso(day), off=result.calendar(person,day), occurrence=markers.get(value)||misses.get(value);
    const missed=markers.has(value);
    const text=occurrence?'Período '+date(occurrence.from)+' a '+date(occurrence.to)+' · tolerância até '+date(occurrence.tolerance)
     +(occurrence.regularized?' · conclusão registrada fora do prazo':' · sem conclusão no prazo'):'';
    const reason=[off.label,text].filter(Boolean).join(' · ')||'Sem ocorrência em atraso neste dia';
    const button=el('button',value.slice(-2),'fsj-occurrence-day');
    button.type='button';button.dataset.kind=missed?'late':off.kind;
    button.setAttribute('aria-label',date(value)+' · '+reason);
    button.title=reason;button.onclick=()=>{detail.textContent=date(value)+' · '+reason;};
    if(off.label)button.append(el('small',off.label.split(' · ')[0]));
    grid.append(button);
   }
  }
  filter.onchange=draw;
  monthPicker.onchange=()=>{if(!monthPicker.checkValidity())monthPicker.value=month;draw();};
  dialog.append(title,subtitle);
  if(item.groupTask&&item.members.length>1)dialog.append(filter);
  if(monthPicker.min!==month)dialog.append(monthPicker);
  dialog.append(monthTitle,grid,detail,legend,close);
  dialog.addEventListener('close',()=>{dialog.remove();trigger.focus();});
  document.body.append(dialog);draw();dialog.showModal();
 }
 function open(box,api,authorized) {
  const month=el('input');month.type='month';month.max=month.value=formatDay.format(new Date()).slice(0,7);
  month.setAttribute('aria-label','Mês do vencimento');
  const person=el('select');person.setAttribute('aria-label','Filtrar por responsável');
  person.add(new Option('Todos os responsáveis',''));
  const fields=el('div','','fsj-occurrence-filters');
  for(const [label,field] of [['Mês do vencimento',month],['Responsável',person]]){
   const group=el('label',label);group.append(field);fields.append(group);
  }
  const status=el('p','','muted');status.setAttribute('role','status');
  const list=el('div');
  const pager=el('nav','','fsj-occurrence-pager');pager.setAttribute('aria-label','Páginas de tarefas não cumpridas');
  const prev=el('button','←'),next=el('button','→'),count=el('span');
  prev.type=next.type='button';prev.setAttribute('aria-label','Página anterior');next.setAttribute('aria-label','Próxima página');
  count.setAttribute('aria-live','polite');pager.append(prev,count,next);pager.hidden=true;
  box.replaceChildren(fields,status,list);
  const screen=box.closest('#fsjNaoCumpridas');
  screen.querySelector('.fsj-occurrence-pager')?.remove();
  screen.append(pager);
  let snapshot, monthLoaded, page=0, generation=0;
  function render(){
   if(!snapshot||!authorized())return;
   const result=report(snapshot.base,snapshot.planned,person.value,formatDay.format(new Date()));
   const total=Math.max(1,Math.ceil(result.entries.length/2));
   page=Math.min(page,total-1);
   list.replaceChildren();
   status.textContent=result.entries.length?'Tarefas ou responsáveis com atraso: '+result.entries.length:'Nenhuma ocorrência periódica fora do prazo neste mês.';
   for(const item of result.entries.slice(page*2,page*2+2)){
    const card=el('article','','fsj-occurrence-card');
    const button=el('button',(item.task.codigo_tarefa||'Tarefa')+' — '+item.task.descricao,'fsj-occurrence-open');
    button.type='button';button.onclick=()=>showCalendar(item,result,monthLoaded,person.value,button);
    const who=item.groupTask?'Grupo · '+item.group:name(item.members[0]);
    card.append(button,el('p',who+' · '+labels[item.task.periodicidade]+' · '+item.overdue.length+' em atraso'));
    list.append(card);
   }
   prev.disabled=page===0;next.disabled=page>=total-1;count.textContent=(page+1)+' / '+total;pager.hidden=false;
  }
  async function refresh(){
   const request=++generation, selected=month.value;
   snapshot=null;list.replaceChildren();pager.hidden=true;
   if(!authorized())return;
   if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(selected)||selected>month.max){status.textContent='Selecione um mês até o mês atual.';return;}
   status.textContent='Consultando ocorrências e calendário dos responsáveis…';
   try{
    const loaded=await load(api,selected);
    if(request!==generation||!box.contains(fields)||!authorized())return;
    snapshot=loaded;monthLoaded=selected;
    const selectedPerson=person.value;
    const ids=new Set(loaded.planned.flatMap(row=>row.responsibles.map(member=>member.id)));
    person.replaceChildren(new Option('Todos os responsáveis',''),...loaded.base.people.filter(member=>ids.has(member.id))
     .sort((a,b)=>name(a).localeCompare(name(b),'pt-BR')).map(member=>new Option(name(member),member.id)));
    person.value=ids.has(selectedPerson)?selectedPerson:'';
    page=0;render();
   }catch{
    if(request!==generation||!box.contains(fields)||!authorized())return;
    status.textContent='Não foi possível consultar as ocorrências e o calendário. Confira a conexão.';
    const retry=el('button','Tentar novamente');retry.type='button';retry.onclick=refresh;list.append(retry);
   }
  }
  person.onchange=()=>{page=0;render();};month.onchange=refresh;
  prev.onclick=()=>{if(!prev.disabled){page--;render();}};
  next.onclick=()=>{if(!next.disabled){page++;render();}};
  refresh();
 }
 window.fsjOpenOwnerMissedTasks=open;
})();

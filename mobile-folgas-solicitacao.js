/* Calendário mensal FSJ, preenchimento e aprovação por semana.
   NÃO ativado no aplicativo publicado: depende de API autorizada no servidor.
   Não modifica folga semanal existente nem o WhatsApp das 7h. */
(function(root){
 'use strict';
 const iso=/^\d{4}-\d{2}-\d{2}$/;
 const monthRE=/^\d{4}-(0[1-9]|1[0-2])$/;
 function validDay(day){if(!iso.test(day))return false;const d=new Date(day+'T12:00:00Z');return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===day;}
 function addDays(day,n){if(!validDay(day))throw Error('Data inválida');const d=new Date(day+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);}
 function monday(day){const d=new Date(day+'T12:00:00Z');if(!validDay(day))throw Error('Data inválida');return addDays(day,-((d.getUTCDay()+6)%7));}
 function monthDays(month){if(!monthRE.test(month))throw Error('Mês inválido');const [y,m]=month.split('-').map(Number);return new Date(Date.UTC(y,m,0)).getUTCDate();}
 function monthWeeks(month){monthDays(month);const first=monday(month+'-01'),last=month+'-'+String(monthDays(month)).padStart(2,'0'),weeks=[];for(let week=first;week<=last;week=addDays(week,7))weeks.push({semana:week,dias:Array.from({length:7},(_,i)=>addDays(week,i))});return weeks;}
 function validWeek(week,days){return validDay(week)&&monday(week)===week&&Array.isArray(days)&&days.length>0&&new Set(days).size===days.length&&days.every(d=>validDay(d)&&monday(d)===week);}
 function makeCalendar(container,adapter,options={}){
  if(!container||typeof adapter?.submit!=='function'||typeof adapter?.list!=='function')throw Error('API autenticada de solicitações é obrigatória');
  const today=options.today||new Intl.DateTimeFormat('en-CA',{timeZone:'America/Recife',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  if(!validDay(today))throw Error('Data atual inválida');
  const state={month:options.month||today.slice(0,7),busy:false,selectedWeek:monday(today),days:new Set(),records:[],message:''};
  if(!monthRE.test(state.month))throw Error('Mês inválido');
  const el=(tag,text)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;return node;};
  const names={nao_preenchida:'Não preenchida',pendente:'Aguardando aprovação',aprovada:'Aprovada',devolvida:'Devolvida para correção'};
  function record(week){return state.records.find(r=>r.semana===week);}
  function setWeek(week){state.selectedWeek=week;const r=record(week);state.days=new Set(Array.isArray(r?.dias)?r.dias:[]);render();}
  function render(){
   container.replaceChildren();
   container.append(el('h2','Calendário mensal de folgas'));
   const picker=el('input');picker.type='month';picker.value=state.month;picker.setAttribute('aria-label','Mês do calendário');picker.disabled=state.busy;
   picker.onchange=()=>{if(!monthRE.test(picker.value))return;state.month=picker.value;const weeks=monthWeeks(state.month);setWeek(weeks[0].semana);};container.append(picker);
   container.append(el('p','Visualize o mês inteiro. Selecione uma semana, marque os dias e envie a semana completa para aprovação.'));
   const grid=el('div');grid.className='fsj-calendario-mensal';grid.style.cssText='display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px';
   for(const name of ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom']){const head=el('strong',name);head.style.cssText='font-size:12px;text-align:center';grid.append(head);}
   for(const week of monthWeeks(state.month)){
    const r=record(week.semana),s=r?.situacao||'nao_preenchida';
    for(const day of week.dias){
     const b=el('button',String(Number(day.slice(-2))));b.type='button';b.disabled=state.busy;
     b.title=week.semana+' — '+(names[s]||'Não preenchida');b.setAttribute('aria-label',day+'; '+b.title);
     b.setAttribute('aria-pressed',String(state.selectedWeek===week.semana));
     b.style.cssText='min-height:38px;padding:4px 1px;border:1px solid #8ca99a;border-radius:7px;'+(day.slice(0,7)!==state.month?'opacity:.55;':'')+(state.selectedWeek===week.semana?'outline:2px solid #205b42;':'');
     if(r?.dias?.includes(day)){b.textContent+=' ✓';}
     b.onclick=()=>setWeek(week.semana);grid.append(b);
    }
   }
   container.append(grid);
   const current=record(state.selectedWeek),s=current?.situacao||'nao_preenchida';
   container.append(el('h3','Semana de '+state.selectedWeek.split('-').reverse().join('/')+' a '+addDays(state.selectedWeek,6).split('-').reverse().join('/')));
   container.append(el('p','Situação: '+(names[s]||'Não preenchida')));
   const editable=!state.busy&&s!=='pendente'&&s!=='aprovada';
   for(let i=0;i<7;i++){
    const day=addDays(state.selectedWeek,i),label=el('label'),cb=el('input');
    cb.type='checkbox';cb.checked=state.days.has(day);cb.disabled=!editable||day<today;
    cb.onchange=()=>{if(cb.checked)state.days.add(day);else state.days.delete(day);render();};
    label.append(cb,document.createTextNode(' '+day.split('-').reverse().join('/')));
    label.style.cssText='display:inline-flex;gap:3px;align-items:center;margin:5px';container.append(label);
   }
   const send=el('button','Enviar semana para aprovação');send.type='button';send.disabled=!editable||!state.days.size||state.selectedWeek>today&&options.futureWeeksAllowed===false;
   send.onclick=async()=>{
    const semana=state.selectedWeek,dias=[...state.days].sort();
    if(state.busy||!validWeek(semana,dias))return;
    state.busy=true;state.message='Enviando calendário semanal...';render();
    try{await adapter.submit({semana,dias});state.message='Semana enviada. Aguarde aprovação integral.';await refresh();}
    catch(e){state.message='Não enviado: '+(e?.message||'erro');}
    finally{state.busy=false;render();}
   };container.append(send);
   const feedback=el('p',state.message);feedback.setAttribute('role','status');container.append(feedback);
  }
  async function refresh(){
   const rows=await adapter.list();
   if(!Array.isArray(rows))throw Error('Resposta inválida da API');
   state.records=rows.filter(r=>validDay(r.semana)&&monday(r.semana)===r.semana&&Array.isArray(r.dias)&&r.dias.every(d=>validDay(d)&&monday(d)===r.semana)&&Object.hasOwn(names,r.situacao));
   const r=record(state.selectedWeek);state.days=new Set(r?.dias||[]);render();return state.records;
  }
  render();return {refresh,selectWeek:setWeek,getState:()=>({month:state.month,selectedWeek:state.selectedWeek,days:[...state.days].sort()})};
 }
 root.FSJFolgasSolicitacao={makeCalendar,validDay,addDays,monday,monthDays,monthWeeks,validWeek};
})(typeof window!=='undefined'?window:globalThis);

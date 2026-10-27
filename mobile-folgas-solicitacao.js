/* FSJ: calendário de solicitações de folga para acesso individual no celular.
   Módulo preparado, NÃO ativado até existir API autenticada com aprovação por dia.
   Nunca grava diretamente em pessoas.folgas_datas nem em folgas_semana. */
(function(root){
 'use strict';
 const datePattern=/^\d{4}-\d{2}-\d{2}$/;
 function validDay(day){if(!datePattern.test(day))return false;const d=new Date(day+'T12:00:00Z');return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===day;}
 function monthDays(month){if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))throw Error('Mês inválido');const [year,m]=month.split('-').map(Number);return new Date(Date.UTC(year,m,0)).getUTCDate();}
 function makeCalendar(container,adapter,options={}){
  if(!container||typeof adapter?.submit!=='function'||typeof adapter?.list!=='function')throw Error('A API de solicitações autenticada é obrigatória');
  const selected=new Set(),state={month:options.month||new Intl.DateTimeFormat('en-CA',{timeZone:'America/Recife',year:'numeric',month:'2-digit'}).format(new Date()).slice(0,7),busy:false};
  const el=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
  const status=el('p');status.setAttribute('role','status');
  function render(){
   container.replaceChildren();
   const title=el('h2','Solicitar folgas');container.append(title);
   const month=el('input');month.type='month';month.value=state.month;month.setAttribute('aria-label','Mês das folgas');month.onchange=()=>{if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(month.value))return;state.month=month.value;selected.clear();render();};container.append(month);
   const explanation=el('p','Marque um ou mais dias. A seleção não concede folga: cada dia depende de aprovação.');container.append(explanation);
   const grid=el('div');grid.className='fsj-solicitacao-calendario';grid.style.cssText='display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px';
   for(const d of ['D','S','T','Q','Q','S','S']){const h=el('span',d);h.style.textAlign='center';grid.append(h);}
   const [year,m]=state.month.split('-').map(Number),offset=new Date(Date.UTC(year,m-1,1)).getUTCDay();
   for(let i=0;i<offset;i++)grid.append(el('span'));
   for(let i=1;i<=monthDays(state.month);i++){
    const day=state.month+'-'+String(i).padStart(2,'0'),label=el('label');
    const checkbox=el('input');checkbox.type='checkbox';checkbox.value=day;checkbox.checked=selected.has(day);checkbox.disabled=state.busy;
    checkbox.onchange=()=>{if(checkbox.checked)selected.add(day);else selected.delete(day);send.textContent='Solicitar aprovação ('+selected.size+')';send.disabled=state.busy||!selected.size;};
    label.append(checkbox,document.createTextNode(String(i)));label.style.cssText='display:flex;align-items:center;justify-content:center;gap:2px;min-height:40px;font-size:13px';grid.append(label);
   }
   container.append(grid);
   const send=el('button','Solicitar aprovação ('+selected.size+')');send.type='button';send.disabled=state.busy||!selected.size;
   send.onclick=async()=>{
    if(!selected.size||state.busy)return;
    state.busy=true;send.disabled=true;status.textContent='Enviando solicitação...';
    try{const days=[...selected].sort();if(!days.every(validDay))throw Error('Data inválida');
     await adapter.submit(days);selected.clear();status.textContent='Solicitação encaminhada. Aguarde aprovação de cada dia.';await refresh();render();
    }catch(e){status.textContent='Solicitação não enviada: '+(e?.message||'erro de conexão');}
    finally{state.busy=false;send.disabled=!selected.size;}
   };
   container.append(send,status);
  }
  async function refresh(){
   const records=await adapter.list();if(!Array.isArray(records))throw Error('Resposta inválida');
   const old=container.querySelector('.fsj-folgas-situacao');if(old)old.remove();
   const section=el('section');section.className='fsj-folgas-situacao';
   section.append(el('h3','Situação dos pedidos'));
   for(const r of records){if(!validDay(r.dia)||!['pendente','aprovada','recusada'].includes(r.situacao))continue;
    section.append(el('p',r.dia.split('-').reverse().join('/')+' — '+({pendente:'Aguardando aprovação',aprovada:'Aprovada',recusada:'Recusada'}[r.situacao])));
   }
   container.append(section);
   return records;
  }
  render();return {refresh,selected};
 }
 root.FSJFolgasSolicitacao={makeCalendar,validDay,monthDays};
})(typeof window!=='undefined'?window:globalThis);

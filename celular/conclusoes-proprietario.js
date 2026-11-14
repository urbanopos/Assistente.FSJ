(function(){
 'use strict';

 function executors(tasks, returns, people, day, localDay){
  const byTask=new Map();
  for(const row of returns){
   if(row.tipo!=='sim'||row.cancelado_por_revisao)continue;
   if(!byTask.has(row.tarefa_id))byTask.set(row.tarefa_id,[]);
   byTask.get(row.tarefa_id).push(row);
  }
  const names=new Map(people.map(person=>[String(person.id),person.nick||person.name]));
  const entries=tasks.map(task=>{
   const valid=(byTask.get(task.id)||[]).filter(row=>!task.daily||(row.dia_previsto||localDay(row.criado_em))===day);
   valid.sort((a,b)=>Date.parse(b.criado_em)-Date.parse(a.criado_em)||String(b.id).localeCompare(String(a.id)));
   const latest=valid[0];
   const id=String(latest?.pessoa_id||task.completedBy||'');
   return {task,executor:id,executorName:names.get(id)||'Executor não identificado',
    completion:latest?.id||null,completedAt:latest?.criado_em||task.completedAt||''};
  });
  entries.sort((a,b)=>a.executorName.localeCompare(b.executorName,'pt-BR')
   ||a.executor.localeCompare(b.executor)
   ||b.completedAt.localeCompare(a.completedAt)
   ||String(a.task.code||'').localeCompare(String(b.task.code||''),'pt-BR',{numeric:true}));
  return entries;
 }

 function review(entry,{api,refresh,authorized}){
  const dialog=document.getElementById('fsj-task-detail');
  const panel=document.createElement('div');panel.className='fsj-completed-review';
  const status=document.createElement('p');status.className='muted';status.setAttribute('role','status');
  const actions=document.createElement('div');actions.className='fsj-completed-review-actions';
  const button=(label,handler)=>{
   const node=document.createElement('button');node.type='button';node.textContent=label;node.onclick=handler;
   return node;
  };
  const form=document.createElement('form');form.hidden=true;
  const label=document.createElement('label');label.textContent='Motivo da devolução';
  const reason=document.createElement('textarea');reason.required=true;reason.maxLength=1000;reason.rows=2;
  label.append(reason);
  const submit=document.createElement('button');submit.type='submit';submit.textContent='Confirmar devolução';
  const cancel=button('Cancelar',()=>{form.hidden=true;send.focus();});
  form.append(label,submit,cancel);
  let busy=false,finished=false,requestId='';
  const invoke=(action,body={})=>api('/functions/v1/supervisao',{
   method:'POST',body:JSON.stringify({action,tarefa_id:entry.task.id,...body})
  });
  function errorText(error){
   try{return JSON.parse(error.message).erro||error.message;}catch{return error.message;}
  }
  function ready(){return authorized()&&dialog.open&&panel.isConnected;}
  async function check(){
   const info=await invoke('completion-info');
   const choices=info.conclusoes||[];
   const choice=info.diaria ? choices.find(row=>row.id===entry.completion) : choices[0];
   if(info.situacao==='Arquivado'||!choice||(choice.id||null)!==entry.completion){
    throw Error('A conclusão mudou. Volte à lista e abra a tarefa novamente.');
   }
  }
  async function run(action,body){
   if(busy||finished||!ready())return;
   busy=true;status.textContent='Registrando…';
   for(const control of controls)control.disabled=true;
   const preventClose=event=>event.preventDefault();
   dialog.addEventListener('cancel',preventClose);
   const exits=[...dialog.querySelectorAll('.fsj-dialog-close,footer>.fsj-nav-arrow')];
   for(const exit of exits)exit.disabled=true;
   try{
    if(action==='archive-owner')await check();
    if(!ready())return;
    const response=await invoke(action,body);
    if(response?.ok!==true)throw Error('O servidor não confirmou a operação.');
    finished=true;form.hidden=true;
    const message=action==='archive-owner'?'Tarefa arquivada.':'Tarefa devolvida para ajustes.';
    try{
     await refresh();
     if(ready())dialog.close();
    }catch{
     status.textContent=message+' Reabra a lista para atualizar.';
     return;
    }
    window.alert(message);
   }catch(error){
    status.textContent='Não foi possível registrar. '+errorText(error);
   }finally{
    busy=false;dialog.removeEventListener('cancel',preventClose);
    for(const exit of exits)exit.disabled=false;
    for(const control of controls)control.disabled=finished;
   }
  }
  const archive=button('Arquivar',()=>{
   if(!ready()||busy||finished)return;
   const label=entry.task.daily?'Arquivar esta tarefa periódica?':'Arquivar esta tarefa concluída?';
   if(window.confirm(label+' O histórico será preservado.'))return run('archive-owner');
  });
  const send=button('Devolver para ajustes',()=>{
   if(!ready()||busy||finished)return;
   if(entry.task.daily&&!entry.completion){status.textContent='Não foi localizado um registro diário que possa ser devolvido.';return;}
   form.hidden=false;status.textContent='';reason.focus();
  });
  reason.oninput=()=>{requestId='';};
  form.onsubmit=event=>{
   event.preventDefault();
   const motive=reason.value.trim();
   if(!motive){status.textContent='Informe o motivo da devolução.';reason.focus();return;}
   if(busy||finished||!ready())return;
   requestId=requestId||crypto.randomUUID();
   return run('reopen-completion',{motivo:motive,requisicao:requestId,conclusao_id:entry.completion});
  };
  const controls=[archive,send,reason,submit,cancel];
  actions.append(archive,send);panel.append(actions,form,status);
  return panel;
 }
 window.FSJOwnerCompleted={executors,review};
})();

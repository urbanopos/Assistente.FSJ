async function fsjDetailRows(path){const rows=[];for(let offset=0;;offset+=1000){const page=await api(path+'&limit=1000&offset='+offset);rows.push(...page);if(page.length<1000)return rows;}}
function fsjDetailPerson(id){const p=person(id);return p.nick||p.name||'Responsável não identificado';}
async function fsjOpenTaskAttachment(attachment){
 const path=String(attachment.url||'');if(!path||path.includes('..')||/^https?:/i.test(path))throw Error('Anexo inválido');
 const signed=await api('/storage/v1/object/sign/respostas-tarefas/'+path.split('/').map(encodeURIComponent).join('/'),{method:'POST',body:JSON.stringify({expiresIn:300})});
 const value=signed.signedURL||signed.signedUrl;if(!value)throw Error('Anexo indisponível');
 const url=new URL(value.startsWith('/object/')?ARMAZ_URL+'/storage/v1'+value:value,ARMAZ_URL+'/storage/v1/');
 if(url.origin!==new URL(ARMAZ_URL).origin||!url.pathname.startsWith('/storage/v1/object/sign/'))throw Error('Endereço inválido');
 const link=document.createElement('a');link.href=url.href;link.target='_blank';link.rel='noopener noreferrer';link.click();
}
async function fsjLoadTaskDetails(id){
 const filter=encodeURIComponent(id),stamp=value=>value?fsjDataHora(new Date(value)):'Não registrado';
 const [tasks,answers,executions,events]=await Promise.all([
  api('/rest/v1/tarefas?id=eq.'+filter+'&select=id,descricao,codigo_tarefa,situacao,criada_em,concluida_em,concluida_por,diaria,prioridade'),
  fsjDetailRows('/rest/v1/retornos?tarefa_id=eq.'+filter+'&select=id,pessoa_id,tipo,conteudo,criado_em,itens_faltantes,tarefa_proprietario_id&order=criado_em.desc,id.desc'),
  fsjDetailRows('/rest/v1/execucoes_tarefa?tarefa_id=eq.'+filter+'&select=pessoa_id,dia,estado,iniciado_em,retomado_em,suspenso_em,concluido_em&order=iniciado_em.desc,pessoa_id.asc,dia.desc'),
  fsjDetailRows('/rest/v1/execucoes_historico?tarefa_id=eq.'+filter+'&select=id,pessoa_id,dia,acao,criado_em&order=criado_em.desc,id.desc')
 ]);
 const t=tasks[0];if(!t)throw Error('Tarefa indisponível');const day=fsjDia(new Date());
 const current=answers.filter(r=>!t.diaria||fsjDia(r.criado_em)===day),done=current.find(r=>r.tipo==='sim'),negative=current.find(r=>r.tipo==='nao');
 const completed=!!done||(!t.diaria&&t.situacao==='Concluída')||(t.diaria&&t.situacao==='Concluída'&&t.concluida_em&&fsjDia(t.concluida_em)===day);
 const relevantExecutions=executions.filter(e=>!t.diaria||e.dia===day);
 const situation=completed?'Concluída':negative?'Não concluída — justificativa registrada':relevantExecutions.some(e=>e.estado==='em_andamento')?'Em andamento':relevantExecutions.some(e=>e.estado==='suspensa')?'Suspensa':'Sem confirmação de conclusão';
 const summary=['Situação'+(t.diaria?' de hoje':'')+': '+situation,'Registro: '+stamp(t.criada_em),'Conclusão: '+(completed?'SIM — '+fsjDetailPerson(done?.pessoa_id||t.concluida_por)+' • '+stamp(done?.criado_em||t.concluida_em):negative?'NÃO — '+fsjDetailPerson(negative.pessoa_id)+' • '+stamp(negative.criado_em):'Ainda não informada')];
 const sections=[{title:'Situação da tarefa',entries:[{text:summary.join('\n')}]},{title:'Execução — histórico',entries:executions.length?executions.map(e=>({text:fsjDetailPerson(e.pessoa_id)+' • '+e.dia+'\nEstado: '+({em_andamento:'Em andamento',suspensa:'Suspensa',concluida:'Concluída'}[e.estado]||e.estado)+'\nInício: '+stamp(e.iniciado_em)+(e.retomado_em&&e.retomado_em!==e.iniciado_em?'\nRetomada: '+stamp(e.retomado_em):'')+(e.suspenso_em?'\nSuspensão: '+stamp(e.suspenso_em):'')+'\nConclusão: '+stamp(e.concluido_em)+'\nR/I: '+fsjIntervaloHoras(t.criada_em,e.iniciado_em)+' • E/C: '+fsjIntervaloHoras(e.iniciado_em,e.concluido_em)+' (tempo decorrido, incluindo pausas)'})):[{text:'Nenhum início de execução registrado.'}]}];
 sections.push({title:'Linha do tempo — inícios, pausas e retomadas',entries:events.length?events.map(e=>({text:fsjDetailPerson(e.pessoa_id)+' • '+stamp(e.criado_em)+'\n'+({iniciar:'Atividade iniciada',retomar:'Atividade retomada',suspender:'Atividade suspensa',concluir:'Atividade concluída'}[e.acao]||e.acao)})):[{text:'Nenhuma movimentação de execução registrada.'}]});
 let attachments=[],attachmentsFailed=false;
 if(answers.length){try{const ids=answers.map(r=>JSON.stringify(r.id)).join(',');attachments=await fsjDetailRows('/rest/v1/anexos?retorno_id=in.'+encodeURIComponent('('+ids+')')+'&select=id,retorno_id,nome,tipo_mime,url&order=id.asc');}catch{attachmentsFailed=true;}}
 sections.push({title:'Respostas e justificativas',entries:answers.length?answers.map(r=>({text:fsjDetailPerson(r.pessoa_id)+' • '+stamp(r.criado_em)+'\n'+({sim:'SIM — concluída',nao:'NÃO — não concluída',pergunta:'Pergunta à administração'}[r.tipo]||r.tipo)+'\n'+(r.conteudo||'Sem observação adicional.'),actions:attachments.filter(a=>a.retorno_id===r.id).map(a=>({label:'Abrir anexo: '+a.nome,run:()=>fsjOpenTaskAttachment(a)}))})):[{text:'Ainda não há resposta ou justificativa registrada.'}]});
 if(attachmentsFailed)sections.push({title:'Anexos',entries:[{text:'Não foi possível consultar os anexos. Reabra a tarefa para tentar novamente.'}]});
 const requests=answers.filter(r=>r.itens_faltantes||r.tarefa_proprietario_id);const linkedIds=[...new Set(requests.map(r=>r.tarefa_proprietario_id).filter(Boolean))];let linked=[],linkedFailed=false;
 if(linkedIds.length){try{linked=await api('/rest/v1/tarefas?id=in.'+encodeURIComponent('('+linkedIds.map(id=>JSON.stringify(id)).join(',')+')')+'&select=id,codigo_tarefa,descricao,situacao');}catch{linkedFailed=true;}}
 sections.push({title:'Pedidos à administração / proprietário',entries:requests.length?requests.map(r=>{const task=linked.find(t=>t.id===r.tarefa_proprietario_id);return {text:fsjDetailPerson(r.pessoa_id)+' • '+stamp(r.criado_em)+'\nPedido: '+(r.itens_faltantes||r.conteudo||'Consultar resposta acima.')+'\n'+(task?'Tarefa automática do proprietário: '+fsjTaskNumber(task.codigo_tarefa)+' • '+task.situacao:r.tarefa_proprietario_id?(linkedFailed?'Tarefa vinculada; não foi possível consultar sua situação.':'Tarefa vinculada indisponível para consulta.'):'Pedido sem tarefa vinculada; verificar encaminhamento.'),actions:task?[{label:fsjTaskNumber(task.codigo_tarefa),run:()=>fsjOpenTaskDetails(task.codigo_tarefa,task.descricao,'Demanda do proprietário',()=>fsjLoadTaskDetails(task.id))}]:[]};}):[{text:'Nenhum pedido de providências registrado. Pedidos informados no campo Itens Faltantes geram automaticamente uma tarefa para o proprietário.'}]});
 const questions=answers.filter(r=>r.tipo==='pergunta');if(questions.length)sections.push({title:'Perguntas à administração',entries:questions.map(r=>({text:fsjDetailPerson(r.pessoa_id)+' • '+stamp(r.criado_em)+'\n'+r.conteudo+'\nPergunta registrada; não indica, por si só, tarefa automática.'}))});
 return {description:t.descricao,sections};
}

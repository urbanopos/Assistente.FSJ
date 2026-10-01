export const PERSON_ID = 'mul7dlmfghkq';
export function localDay(now = new Date()) {
  return new Intl.DateTimeFormat('sv-SE', {timeZone:'America/Fortaleza',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
}
export function eligible(tasks, assignments, returns, pid, day) {
  const assigned = new Set(assignments.filter(a=>a.pessoa_id===pid).map(a=>a.tarefa_id));
  return tasks.filter(t=>assigned.has(t.id) && (t.diaria || t.situacao!=='Concluída') &&
    !returns.some(r=>r.tarefa_id===t.id && r.tipo==='sim' && (t.diaria ? localDay(new Date(r.criado_em))===day : true)));
}
export function normalizePhone(value) {
  let s=String(value||'').replace(/\D/g,'');
  if(s.length===10||s.length===11)s='55'+s;
  if(!/^55\d{10,11}$/.test(s))throw Error('Número de Menininha inválido no cadastro.');
  return s;
}
export async function cycle({state, previous, persist, revoke, send, record, url}) {
  // A journal written BEFORE sending prevents an automatic duplicate after a crash.
  if(state.phase==='sending')throw Error('Envio anterior com resultado incerto: conferir a conversa antes de liberar nova tentativa.');
  if(state.messageId){await record('quadro_automatico',{status:'enviado',messageId:state.messageId,ack:state.ack||0});return state;}
  if(!state.deletion){
    try {
      state.deletion = previous?.messageId ? await revoke(previous.messageId) : {status:'sem_confirmacao',reason:'Mensagem anterior sem identificador técnico; não foi apagada.'};
    } catch {
      state.deletion = {status:'falhou',reason:'Não foi possível consultar ou apagar a mensagem anterior.'};
    }
    await persist(state);
  }
  await record('apagamento_automatico',state.deletion);
  const notice=state.deletion.status==='confirmado'?'':'Aviso: a mensagem anterior não teve o apagamento confirmado.\n';
  state.phase='sending';await persist(state);
  let result;
  try{result=await send(notice+url);}catch{await record('envio_incerto',{status:'sem_confirmacao'});throw Error('Sem confirmação do envio. Nova tentativa automática bloqueada para evitar duplicação.');}
  state.messageId=result.messageId;state.ack=result.ack;state.phase='sent';await persist(state);
  await record('quadro_automatico',{status:'enviado',messageId:state.messageId,ack:state.ack});
  return state;
}

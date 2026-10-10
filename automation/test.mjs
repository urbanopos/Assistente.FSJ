import {test} from 'node:test';
import assert from 'node:assert/strict';
import {localDay,eligible,cycle} from './core.mjs';
test('datas em Igarassu e tarefas diárias retornam no dia seguinte',()=>{
  assert.equal(localDay(new Date('2026-10-02T01:00:00Z')),'2026-10-01');
  const tasks=[{id:'a',diaria:true,situacao:'Concluída'},{id:'b',diaria:false,situacao:'Concluída'},{id:'c',diaria:false,situacao:'Em aberto'}];
  assert.deepEqual(eligible(tasks,tasks.map(t=>({pessoa_id:'p',tarefa_id:t.id})),[{tarefa_id:'a',tipo:'sim',criado_em:'2026-09-30T12:00:00Z'}],'p','2026-10-01').map(t=>t.id),['a','c']);
});
test('falha na exclusão avisa, envia e registra; repetição não duplica',async()=>{
  const s={eventIds:{}},messages=[],events=[];
  const args={state:s,previous:{messageId:'old'},persist:async()=>{},record:async(t,d)=>events.push([t,d]),url:'https://example.test/quadro',revoke:async()=>({status:'falhou'}),send:async text=>{messages.push(text);return {messageId:'new',ack:1};}};
  await cycle(args);await cycle(args);
  assert.equal(messages.length,1);assert.match(messages[0],/apagamento confirmado/);assert.equal(events[0][0],'apagamento_automatico');assert.equal(s.messageId,'new');
});
test('exclusão confirmada envia link e aviso de substituição',async()=>{
  let text;
  await cycle({state:{},previous:{messageId:'old'},persist:async()=>{},record:async()=>{},url:'URL',revoke:async()=>({status:'confirmado'}),send:async t=>{text=t;return {messageId:'new'};}});
  assert.equal(text,'URL\n\nESTA MENSAGEM SUBSTITUI A DO DIA ANTERIOR');
});
test('crash entre envio e registro bloqueia duplicação',async()=>{
  let sent=false;
  await assert.rejects(cycle({state:{phase:'sending'},send:async()=>{sent=true;}}),/incerto/);
  assert.equal(sent,false);
});
test('erro de consulta da mensagem anterior não impede novo quadro com aviso',async()=>{
  let text;
  await cycle({state:{},previous:{messageId:'old'},persist:async()=>{},record:async()=>{},url:'URL',revoke:async()=>{throw Error('offline');},send:async t=>{text=t;return {messageId:'new'};}});
  assert.match(text,/Aviso/);
});

test('somente ativos selecionados recebem; folgas manuais por data bloqueiam',async()=>{
  const {recipients}=await import('./core.mjs');
  const p={id:'a',ativo:true,receber_tarefas_whatsapp:true};
  const ps=[p,{...p,id:'b',ativo:false},{...p,id:'c',receber_tarefas_whatsapp:false},{...p,id:'d',folgas_datas:['2026-10-10']},{...p,id:'e',folgas_datas:['2026-10-10']}];
  assert.deepEqual(recipients(ps,'2026-10-10').map(x=>x.id),['a']);
  assert.deepEqual(recipients(ps,'2026-10-11').map(x=>x.id),['a','d','e']);
});
test('bloqueia antes das 7h no fuso de Igarassu',async()=>{
  const {afterSeven}=await import('./core.mjs');
  assert.equal(afterSeven(new Date('2026-10-10T09:59:59Z')),false);
  assert.equal(afterSeven(new Date('2026-10-10T10:00:00Z')),true);
  assert.equal(afterSeven(new Date('2026-10-11T02:59:59Z')),true);
  assert.equal(afterSeven(new Date('2026-10-11T03:00:00Z')),false);
});

test('apaga anterior antes do envio e mantém texto obrigatório mesmo sem confirmação',async()=>{
  const order=[];let text;
  await cycle({state:{},previous:{messageId:'old'},persist:async()=>{},record:async()=>{},url:'URL',revoke:async()=>{order.push('apagar');return {status:'sem_confirmacao'};},send:async t=>{order.push('enviar');text=t;return {messageId:'new'};}});
  assert.deepEqual(order,['apagar','enviar']);
  assert.ok(text.endsWith('ESTA MENSAGEM SUBSTITUI A DO DIA ANTERIOR'));
});

test('falha no envio preserva erro original e mantém bloqueio',async()=>{
 const state={};let errorEvent;
 await assert.rejects(cycle({state,persist:async()=>{},record:async(t,d)=>{if(t==='envio_incerto')errorEvent=d;},url:'URL',send:async()=>{throw Error('send-specific-error');}}),/Erro original: send-specific-error/);
 assert.equal(state.phase,'sending');assert.equal(errorEvent.reason,'send-specific-error');
});

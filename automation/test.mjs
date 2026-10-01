import {test} from 'node:test';
import assert from 'node:assert/strict';
import {localDay,eligible,cycle} from './core.mjs';
test('datas em Fortaleza e tarefas diárias retornam no dia seguinte',()=>{
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
test('exclusão confirmada mantém somente o link',async()=>{
  let text;
  await cycle({state:{},previous:{messageId:'old'},persist:async()=>{},record:async()=>{},url:'URL',revoke:async()=>({status:'confirmado'}),send:async t=>{text=t;return {messageId:'new'};}});
  assert.equal(text,'URL');
});
test('crash entre envio e registro bloqueia duplicação',async()=>{
  let sent=false;
  await assert.rejects(cycle({state:{phase:'sending'},send:async()=>{sent=true;}}),/incerto/);
  assert.equal(sent,false);
});

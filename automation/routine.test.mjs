import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {runRoutine} from './routine.mjs';
const now=new Date('2026-10-10T10:00:00Z');
function fixture(people){
 const events=[],messages=[],links=[],boards=new Map();let connects=0,destroys=0;
 const db=async(path,opt={})=>{
   if(path==='rpc/fsj_preparar_calendario')return null;
   if(path==='rpc/fsj_link_supervisao')return null;
   if(path==='rpc/fsj_pode_enviar')return true;
   if(path.startsWith('pessoas?id=')){const id=new URLSearchParams(path).get('pessoas?id').slice(3);return people.filter(p=>p.id===id&&p.ativo&&p.receber_tarefas_whatsapp);}
   if(path.startsWith('pessoas?'))return people;
   if(path.startsWith('tarefas?'))return [{id:'task-a',situacao:'Em aberto'},{id:'task-b',situacao:'Em aberto'}];
   if(path.startsWith('tarefa_responsaveis?'))return [{pessoa_id:'a',tarefa_id:'task-a'},{pessoa_id:'b',tarefa_id:'task-b'}];
   if(path.startsWith('retornos?'))return [];
   if(path.startsWith('mensagens_whatsapp?')){if(opt.method){const e=JSON.parse(opt.body);e.criado_em=now.toISOString();const i=events.findIndex(x=>x.id===e.id);if(i<0)events.push(e);else events[i]=e;return null;}const pid=path.match(/pessoa_id=eq\.([^&]+)/)[1];return events.filter(e=>e.pessoa_id===pid&&e.tipo==='quadro_automatico');}
   if(path.startsWith('quadros_do_dia?')){if(opt.method){const b=JSON.parse(opt.body);b.token='token-'+b.pessoa_id;boards.set(b.pessoa_id,b);return [b];}const pid=path.match(/pessoa_id=eq\.([^&]+)/)[1];return boards.has(pid)?[boards.get(pid)]:[];}
   if(path.startsWith('links_resposta?')){links.push(...JSON.parse(opt.body));return null;}
   throw Error('Unexpected '+path);
 };
 const connect=async()=>{connects++;return {getNumberId:async phone=>{if(phone==='5581999999999')throw Error('lookup failed');return {_serialized:phone};},destroy:async()=>{destroys++;}};};
 const send=async(c,id,text)=>{messages.push({id,text});return {messageId:'m-'+id,ack:1};};
 return {args:{db,connect,send,revoke:async()=>({status:'confirmado'}),now},events,messages,links,counts:()=>({connects,destroys})};
}
const person=(id,extra={})=>({id,ativo:true,receber_tarefas_whatsapp:true,whatsapp:id==='a'?'5581988888888':'5581977777777',...extra});
async function withDir(fn){const d=await mkdtemp(join(tmpdir(),'fsj-test-'));try{await fn(d);}finally{await rm(d,{recursive:true,force:true});}}
test('rotina usa sessão única, tarefas e diário separados e não repete envios',()=>withDir(async stateDir=>{
 const f=fixture([person('a'),person('b')]);
 assert.equal((await runRoutine({...f.args,stateDir})).failures,0);
 assert.equal(f.messages.length,2);assert.deepEqual(f.counts(),{connects:1,destroys:1});
 assert.deepEqual(f.links.map(x=>[x.pessoa_id,x.tarefa_id]),[['a','task-a'],['b','task-b']]);
 const j=JSON.parse(await readFile(join(stateDir,'journal.json'),'utf8'));
 assert.notEqual(j['a|2026-10-10'].messageId,j['b|2026-10-10'].messageId);
 await runRoutine({...f.args,stateDir});assert.equal(f.messages.length,2);
}));
test('falha de um destinatário não impede o seguinte',()=>withDir(async stateDir=>{
 const f=fixture([person('a',{whatsapp:'5581999999999'}),person('b')]);
 assert.equal((await runRoutine({...f.args,stateDir})).failures,1);
 assert.equal(f.messages.length,1);assert.equal(f.messages[0].id,'5581977777777');
}));
test('nenhum WhatsApp para folgas, inativos ou antes das 7h',()=>withDir(async stateDir=>{
 const f=fixture([person('a',{folgas_datas:['2026-10-10']}),person('b',{folgas_datas:['2026-10-10']}),person('c',{ativo:false})]);
 await runRoutine({...f.args,stateDir});assert.equal(f.messages.length,0);assert.equal(f.counts().connects,0);
 await runRoutine({...f.args,stateDir,now:new Date('2026-10-10T09:59:59Z'),db:async()=>{throw Error('should not query');}});
}));
test('reconsulta folga antes de enviar; bloqueia execução concorrente',()=>withDir(async stateDir=>{
 const f=fixture([person('a')]);const original=f.args.db;
 f.args.db=async(path,opt)=>path.startsWith('pessoas?id=')?[person('a',{folgas_datas:['2026-10-10']})]:original(path,opt);
 await runRoutine({...f.args,stateDir});assert.equal(f.messages.length,0);
 const {mkdir}=await import('node:fs/promises');await mkdir(join(stateDir,'routine.lock'));
 await assert.rejects(runRoutine({...f.args,stateDir}),/já em execução/);
}));
test('envio confirmado no diário com banco indisponível registra sem reenviar',()=>withDir(async stateDir=>{
 const f=fixture([person('a')]);const db=f.args.db;let failing=true;
 f.args.db=async(path,opt={})=>{if(failing&&opt.method&&path.startsWith('mensagens_whatsapp?')&&JSON.parse(opt.body).tipo==='quadro_automatico')throw Error('db offline');return db(path,opt);};
 assert.equal((await runRoutine({...f.args,stateDir})).failures,1);assert.equal(f.messages.length,1);
 failing=false;await runRoutine({...f.args,stateDir});assert.equal(f.messages.length,1);
 assert.equal(f.events.filter(e=>e.tipo==='quadro_automatico').length,1);
}));
test('folga semanal ou feriado pendente bloqueia sem conectar ao WhatsApp',()=>withDir(async stateDir=>{
 const f=fixture([person('a')]);const db=f.args.db;
 f.args.db=async(path,opt)=>path==='rpc/fsj_pode_enviar'?false:db(path,opt);
 await runRoutine({...f.args,stateDir});assert.equal(f.messages.length,0);assert.equal(f.counts().connects,0);assert.equal(f.links.length,0);
}));
test('mudança de folga antes da transmissão bloqueia envio e preserva proteção contra repetição',()=>withDir(async stateDir=>{
 const f=fixture([person('a')]);const db=f.args.db;let checks=0;
 f.args.db=async(path,opt)=>path==='rpc/fsj_pode_enviar'?++checks<3:db(path,opt);
 assert.equal((await runRoutine({...f.args,stateDir})).failures,1);assert.equal(f.messages.length,0);
 const journal=JSON.parse(await readFile(join(stateDir,'journal.json'),'utf8'));assert.equal(journal['a|2026-10-10'].phase,'sending');
}));
test('link de supervisão entra apenas na mensagem do supervisor autorizado',()=>withDir(async stateDir=>{
 const f=fixture([person('a'),person('b')]);const db=f.args.db;
 f.args.db=async(path,opt)=>path==='rpc/fsj_link_supervisao'?(JSON.parse(opt.body).p_pessoa==='a'?'https://urbanopos.github.io/Assistente.FSJ/supervisor.html#token=token-a':null):db(path,opt);
 await runRoutine({...f.args,stateDir});assert.equal(f.messages.length,2);
 assert.match(f.messages[0].text,/SUPERVISAO: DEMANDAS DOS SUPERVISIONADOS/);assert.match(f.messages[0].text,/supervisor.html#token=token-a/);
 assert.doesNotMatch(f.messages[1].text,/supervisor.html/);assert.match(f.messages[1].text,/inicio-usuario.html#token=token-b/);
}));
test('novo modelo começa em 18/10, preserva links e não repete envio confirmado',()=>withDir(async stateDir=>{
 const f=fixture([person('a',{nome:'Urbano Neto'}),person('b')]);const db=f.args.db;
 f.args.db=async(path,opt)=>path==='rpc/fsj_link_supervisao'?(JSON.parse(opt.body).p_pessoa==='a'?'https://urbanopos.github.io/Assistente.FSJ/supervisor.html#token=token-a':null):db(path,opt);
 const next={...f.args,stateDir,now:new Date('2026-10-18T10:00:00Z')};
 await runRoutine(next);
 assert.match(f.messages[0].text,/GESTÃO DE TAREFAS 18\/10\/2026/);
 assert.match(f.messages[0].text,/\*CONSULTA TAREFAS\*/);
 assert.match(f.messages[0].text,/\*TAREFAS DE TERCEIROS\*/);
 assert.match(f.messages[0].text,/inicio-usuario.html#token=token-a/);
 assert.ok(f.messages[0].text.endsWith('*ESTA MENSAGEM CANCELA AS ANTERIORES*'));
 assert.doesNotMatch(f.messages[1].text,/TAREFAS DE TERCEIROS/);
 await runRoutine(next);assert.equal(f.messages.length,2);
}));

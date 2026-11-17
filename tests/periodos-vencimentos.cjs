const assert = require('node:assert/strict');
const {test} = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const original=fs.readFileSync(path.join(__dirname,'../celular/ocorrencias-proprietario.js'),'utf8');
assert.ok(original.includes('window.fsjOpenOwnerMissedTasks=open;'),'Ponto de entrada alterado');
const source=original.replace('window.fsjOpenOwnerMissedTasks=open;','window.FSJTestPeriodos={advance,schedules,report};window.fsjOpenOwnerMissedTasks=open;');
const context={window:{},Intl,Date,Map,Set,Object,Math,Number,String,Array};
vm.runInNewContext(source,context,{filename:'ocorrencias-proprietario.js'});
const {advance,schedules,report}=context.window.FSJTestPeriodos;
function base(frequency,created='2026-11-01'){
 const task={id:'t1',codigo_tarefa:'Tar-000001',descricao:'Teste',periodicidade:frequency,
  criada_em:created+'T12:00:00Z',referencia_repeticao:created,repeticao_indice:0,
  situacao:'Em aberto',grupo_id:null};
 return {tasks:[task],archive:[],assigned:[{tarefa_id:'t1',pessoa_id:'p1'}],
  people:[{id:'p1',nome:'Executor',criado_em:'2026-01-01T12:00:00Z'}],groups:[],members:[],
  holidays:[],weekly:[],decisions:[],returns:[],executions:[]};
}
test('prazo inclusivo de todas as frequências',()=>{
 const expected={semanal:'2026-11-08',quinzenal:'2026-11-15',mensal:'2026-12-01',
  trimestral:'2027-01-30',semestral:'2027-04-30',anual:'2027-11-01'};
 for(const [frequency,date] of Object.entries(expected)){
  assert.equal(new Date(advance('2026-11-01',frequency,1)*86400000).toISOString().slice(0,10),date);
 }
});
test('semanal: D+7 em vigência e D+8 em atraso',()=>{
 const b=base('semanal'),p=schedules(b,'2026-11');
 assert.equal(p.length,1);
 assert.equal(report(b,p,'','2026-11-08').entries.length,0);
 assert.equal(report(b,p,'','2026-11-09').entries.length,1);
 assert.equal(report(b,p,'','2026-11-09').entries[0].overdue[0].to,'2026-11-08');
});
test('mensal: D+30 em vigência e D+31 em atraso',()=>{
 const b=base('mensal'),p=schedules(b,'2026-12');
 assert.equal(p.length,1);
 assert.equal(report(b,p,'','2026-12-01').entries.length,0);
 assert.equal(report(b,p,'','2026-12-02').entries.length,1);
});
test('conclusão dentro do prazo evita ocorrência em atraso',()=>{
 const b=base('semanal'),p=schedules(b,'2026-11');
 b.returns.push({tarefa_id:'t1',pessoa_id:'p1',tipo:'sim',
  dia_previsto:'2026-11-05',criado_em:'2026-11-05T15:00:00Z'});
 assert.equal(report(b,p,'','2026-11-15').entries.length,0);
});
test('consulta não altera situação nem arquiva',()=>{
 const b=base('semanal'),before=JSON.stringify(b);
 report(b,schedules(b,'2026-11'),'','2026-11-09');
 assert.equal(JSON.stringify(b),before);
});

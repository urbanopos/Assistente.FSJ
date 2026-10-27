const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const ctx={};ctx.globalThis=ctx;vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..','mobile-folgas-solicitacao.js'),'utf8'),ctx);
const c=ctx.FSJFolgasSolicitacao;
test('segunda-feira identifica a semana, inclusive na virada do mês',()=>{assert.equal(c.monday('2026-10-26'),'2026-10-26');assert.equal(c.monday('2026-11-01'),'2026-10-26');});
test('calendário mensal mostra semanas inteiras, sem duplicação',()=>{const w=c.monthWeeks('2026-10');assert.equal(w.length,5);assert.equal(w[0].semana,'2026-09-28');assert.equal(w.at(-1).semana,'2026-10-26');assert.equal(w.at(-1).dias.at(-1),'2026-11-01');});
test('cada pedido contém dias de uma única semana',()=>{assert.equal(c.validWeek('2026-10-26',['2026-10-26','2026-11-01']),true);assert.equal(c.validWeek('2026-10-26',['2026-10-26','2026-11-02']),false);assert.equal(c.validWeek('2026-10-26',['2026-10-26','2026-10-26']),false);});
test('não aceita datas inválidas ou semana iniciada no domingo',()=>{assert.equal(c.validDay('2026-02-30'),false);assert.equal(c.validWeek('2026-11-01',['2026-11-01']),false);});

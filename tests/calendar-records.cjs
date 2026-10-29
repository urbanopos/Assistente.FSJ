const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const source=fs.readFileSync('calendar-records.js','utf8');
function fixture(){
 const nodes=new Map();const node=id=>{if(!nodes.has(id))nodes.set(id,{value:'',disabled:false,textContent:'',innerHTML:'',replaceChildren(){this.innerHTML='';}});return nodes.get(id);};
 const ctx={document:{getElementById:node,querySelectorAll:()=>[]},S:{people:[{id:'a',name:'Pessoa A'}]},personDatesOff:['2026-10-29'],personDayReasons:{'2026-10-29':'Folga compensatória'},save(){},renderPersonDatesOff(){},esc:x=>String(x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'),fsjData:x=>x.split('-').reverse().join('/'),console};
 vm.createContext(ctx);vm.runInContext(source,ctx);vm.runInContext("fsjCalendarContext={id:'a',backup:null};fsjCalendarDirty=true;",ctx);return {ctx,node,run:s=>vm.runInContext(s,ctx)};
}
test('salva apenas datas/motivos, confirma uma pessoa e preserva marcações após falha',async()=>{
 const {ctx,node,run}=fixture();let body;
 ctx.api=async(path,opt)=>{assert.match(path,/id=eq.a/);assert.equal(opt.method,'PATCH');body=JSON.parse(opt.body);return [{id:'a',...body}];};
 await ctx.fsjSalvarDatasCalendario();assert.deepEqual(Object.keys(body).sort(),['folgas_datas','folgas_motivos']);assert.equal(run('fsjCalendarDirty'),false);assert.match(node('fsjCalendarStatus').textContent,/Datas salvas/);
 run('fsjCalendarDirty=true');ctx.api=async()=>{throw Error('Sem rede')};await ctx.fsjSalvarDatasCalendario();assert.equal(run('fsjCalendarDirty'),true);assert.equal(ctx.personDatesOff.length,1);assert.match(node('fsjCalendarStatus').textContent,/preservadas/);
 ctx.api=async()=>[];await ctx.fsjSalvarDatasCalendario();assert.equal(run('fsjCalendarDirty'),true);assert.doesNotMatch(node('fsjCalendarStatus').textContent,/Datas salvas/);
});
test('carrega pessoa certa, limpa dados anteriores e bloqueia gravação sem acesso',async()=>{
 const {ctx,node,run}=fixture();ctx.api=async()=>[{id:'b',folgas_datas:['2026-11-01'],folgas_motivos:{'2026-11-01':'Feriado'}}];await ctx.fsjCarregarPessoaCalendario('b');assert.equal(ctx.personDatesOff[0],'2026-11-01');assert.equal(run('fsjCalendarContext.id'),'b');assert.equal(run('fsjCalendarDirty'),false);
 ctx.api=async()=>[];await ctx.fsjCarregarPessoaCalendario('c');assert.equal(run('fsjCalendarContext.id'),'');assert.equal(node('fsjCalendarSave').disabled,true);assert.equal(ctx.personDatesOff.length,0);
});
test('relatório inclui limites, origem e compensação de feriado fora do período',()=>{
 const {ctx}=fixture();const rows=ctx.fsjReportRows([{id:'a',nome:'A',folgas_datas:['2026-10-01','2026-11-01'],folgas_motivos:{'2026-10-01':'Feriado'}}],[{pessoa_id:'a',semana:'2026-10-26',dia:'2026-10-31'}],[{dia:'2026-10-12',nome:'Feriado'}],[{pessoa_id:'a',dia:'2026-09-30',folga_compensatoria:'2026-10-02'}],'2026-10-01','2026-10-31');
 assert.equal(rows.length,4);assert.ok(rows.some(x=>x.type==='Folga compensatória'&&x.detail.includes('30/09/2026')));assert.ok(rows.every(x=>x.day<='2026-10-31'));
});
test('consulta paginada não corta registros e filtra pessoa nas fontes individuais',async()=>{
 const {ctx,node}=fixture();let calls=0;ctx.api=async path=>{calls++;return path.includes('offset=0')?[{id:1},{id:2}]:path.includes('offset=2')?[{id:3}]:[]};assert.equal((await ctx.fsjReportRead('/rest/v1/pessoas?select=*')).length,3);assert.equal(calls,3);
 node('fsjReportFrom').value='2026-10-01';node('fsjReportTo').value='2026-10-31';node('fsjReportPerson').value='a';const paths=[];ctx.api=async path=>{paths.push(path);return path.includes('/pessoas?')&&path.includes('offset=0')?[{id:'a',nome:'<script>alert(1)</script>',folgas_datas:['2026-10-01']}]:[]};await ctx.fsjConsultarRelatorioFolgas();assert.ok(paths.filter(x=>/folgas_semana|feriados_envio/.test(x)).every(x=>x.includes('pessoa_id=eq.a')));assert.match(node('fsjReportResult').innerHTML,/&lt;script&gt;/);assert.equal(node('fsjReportPrint').disabled,false);
 node('fsjReportFrom').value='2026-11-01';await ctx.fsjConsultarRelatorioFolgas();assert.equal(node('fsjReportPrint').disabled,true);assert.match(node('fsjReportStatus').textContent,/período válido/);
});

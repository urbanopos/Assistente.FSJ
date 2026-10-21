const fs=require('node:fs'),assert=require('node:assert/strict'),{JSDOM}=require('jsdom');
const path=require('node:path'),root=fs.existsSync(__dirname+'/index.html')?__dirname:path.resolve(__dirname,'../..');
const source=file=>fs.readFileSync(file.endsWith('.ts')?(fs.existsSync(__dirname+'/'+file)?__dirname+'/'+file:root+'/supabase/functions/'+file.slice(0,-3)+'/index.ts'):root+'/'+file,'utf8');

(async()=>{
 const html=source('index.html'),dom=new JSDOM(html,{url:'https://urbanopos.github.io/Assistente.FSJ/',runScripts:'outside-only'}),w=dom.window;
 let calls=0;
 w.api=async()=>{calls++;return {resumos:{d:{mes:'2026-10',rotulo:'19 / 25',em_tempo:19,previstos:25}}};};
 w.eval(source('daily-progress.js'));
 const daily={id:'d',frequency:'diaria',status:'Concluída'};
 assert.equal(w.FSJDaily.text(daily,{rotulo:'19 / 25'}),'19 / 25');
 assert.equal(w.FSJDaily.text({...daily,status:'Em aberto'},{rotulo:'19 / 25'}),'Em aberto • 19 / 25');
 assert.equal(w.FSJDaily.text({...daily,frequency:'pontual'},{rotulo:'19 / 25'}),'Concluída');
 assert.equal(w.FSJDaily.text({...daily,status:'Arquivado'},{rotulo:'19 / 25'}),'Arquivado');
 await Promise.all([w.FSJDaily.load('2026-10','p'),w.FSJDaily.load('2026-10','p')]);
 assert.equal(calls,1);assert.equal(w.FSJDaily.ownerText(daily,'2026-10','p'),'19 / 25');
 assert.equal(daily.status,'Concluída');
 w.eval("window.S={tasks:[{id:'d',frequency:'diaria',status:'Concluída',created:'2026-09-01',personIds:['p']}]};");
 w.filtrarDemandas=xs=>xs;w.fsjCompareTaskPriority=()=>0;w.fsjTaskName=()=> 'Tar - 000001 D';w.esc=x=>String(x||'');w.names=()=> 'Pessoa';w.fsjFrequencyLabel=()=> 'Diária';w.fsjExecucaoCelula=()=>'';w.fsjTempoCelulas=()=>'<td>—</td><td>—</td>';w.person=()=>({name:'Pessoa'});
 w.eval(html.split('\n').find(l=>l.startsWith('function monthly()')));
 w.document.getElementById('month').value='2026-10';
 await w.FSJDaily.load('2026-10','');
 w.monthly();
 assert.match(w.document.getElementById('report').textContent,/19 \/ 25/);
 assert(!w.document.getElementById('report').textContent.includes('Sem registros'));
 w.eval(html.split('\n').find(l=>l.startsWith('function renderDemandas()')));
 const select=w.document.getElementById('demandaFuncionario');select.add(new w.Option('Pessoa','p'));select.value='p';w.document.getElementById('demandaSituacao').value='Concluída';
 const current=w.FSJDaily.month();await w.FSJDaily.load(current,'p');
 w.renderDemandas();assert.match(w.document.getElementById('taskRows').textContent,/19 \/ 25/);
 dom.window.close();
 console.log('PASS: completed/open/non-daily/archive labels, request deduplication, selected month and owner demand row');
})().catch(e=>{console.error(e);process.exitCode=1;});


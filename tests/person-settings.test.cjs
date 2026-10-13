const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const script=fs.readFileSync('index.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1];new vm.Script(script);
const elements={};for(const id of ['pid','pname','pnick','pphone','ptype','pactive','pwhatsapp7h','pworkstart','plunchstart','pdayoffdate','pdayoffdates','pworkend','pVacationStart','pVacationEnd'])elements[id]={value:'',checked:false,innerHTML:'',textContent:''};
let payload,alerts=[];
const ctx=vm.createContext({...elements,document:{getElementById:id=>elements[id]},S:{people:[]},alert:x=>alerts.push(x),api:async(p,opt)=>{payload=JSON.parse(opt.body)},save:()=>{},render:()=>{},uid:()=> 'new',navTo:()=>{},esc:x=>String(x),person:id=>ctx.S.people.find(p=>p.id===id)});
vm.runInContext(script.slice(script.indexOf('function normalizePhone'),script.indexOf('async function delPerson')),ctx);
(async()=>{
 ctx.clearPerson();elements.pname.value='Pessoa de teste';elements.pphone.value='81988888888';elements.pwhatsapp7h.checked=true;
 elements.pdayoffdate.value='2026-10-18';ctx.addPersonDayOff();elements.pdayoffdate.value='2026-10-25';ctx.addPersonDayOff();ctx.addPersonDayOff();
 elements.pVacationStart.value='2026-10-20';elements.pVacationEnd.value='2026-11-04';
 await ctx.savePerson();assert.equal(payload.ferias_inicio,'2026-10-20');assert.equal(payload.ferias_fim,'2026-11-04');assert.deepEqual(payload.folgas_datas,['2026-10-18','2026-10-25']);assert.deepEqual(payload.folgas_semanais,[]);assert.equal(payload.jornada_inicio,'07:00');assert.equal(payload.almoco_inicio,'12:00');assert.equal(payload.receber_tarefas_whatsapp,true);
 ctx.editPerson('new');assert.equal(elements.pVacationStart.value,'2026-10-20');assert.equal(elements.pVacationEnd.value,'2026-11-04');assert.equal(elements.pactive.checked,true);assert.equal(elements.pwhatsapp7h.checked,true);assert.match(elements.pworkend.textContent,/16h20/);assert.match(elements.pdayoffdates.innerHTML,/18\/10\/2026/);
 ctx.removePersonDayOff('2026-10-18');elements.pactive.checked=false;await ctx.savePerson();assert.deepEqual(payload.folgas_datas,['2026-10-25']);assert.equal(payload.ativo,false);assert.equal(payload.receber_tarefas_whatsapp,false);
 ctx.editPerson('new');elements.pactive.checked=true;elements.pwhatsapp7h.checked=true;elements.pphone.value='123';const before=payload;await ctx.savePerson();assert.equal(payload,before);assert.match(alerts.at(-1),/WhatsApp válido/);
 console.log('Cadastro: horários, folgas manuais, inclusão/remoção de datas, reedição, desativação e validação aprovados.');
})().catch(e=>{console.error(e);process.exitCode=1});

const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('fsj-hours-banner.js','utf8');
function setup(time){
 let now=time,answer={status:200,body:{proprietario_horario_livre:false}},tick;
 const nodes=new Map(),events={},winEvents={};
 function el(){const attrs=new Map(),classes=new Set();return {inert:false,hidden:false,classList:{toggle:(k,on)=>on?classes.add(k):classes.delete(k),contains:k=>classes.has(k)},setAttribute:(k,v)=>attrs.set(k,v),getAttribute:k=>attrs.get(k),hasAttribute:k=>attrs.has(k),removeAttribute:k=>attrs.delete(k)};}
 const root=el(),body=el(),protectedEl=el(),alreadyInert=el();alreadyInert.inert=true;
 const main={prepend:node=>nodes.set(node.id,node)};
 const document={documentElement:root,body,hidden:false,createElement:el,getElementById:id=>nodes.get(id),querySelector:()=>main,querySelectorAll:()=>[protectedEl,alreadyInert],addEventListener:(n,f)=>events[n]=f};
 class Clock extends Date{constructor(...args){super(...(args.length?args:[now]));}}
 const window={fetch:async()=>Response.json(answer.body,{status:answer.status}),addEventListener:(n,f)=>winEvents[n]=f,dispatchEvent:()=>{}};
 const ctx={window,document,Date:Clock,Intl,CustomEvent:class{},setInterval:f=>tick=f};vm.createContext(ctx);vm.runInContext(source,ctx);
 return {root,protectedEl,alreadyInert,nodes,events,winEvents,tick:()=>tick(),time:t=>now=t,answer:(status,body)=>answer={status,body},request:action=>window.fetch('https://awrxnzbfrsaurzpunuko.supabase.co/functions/v1/resposta-tarefa',{body:JSON.stringify({token:'test-token',action})})};
}
const closed=x=>x.root.classList.contains('fsj-afterhours');
(async()=>{
 const x=setup('2026-10-30T11:00:00Z');assert(!closed(x));await x.request('board');
 x.time('2026-10-30T15:00:01Z');x.tick();assert(closed(x));assert(x.protectedEl.inert);assert(!x.nodes.get('fsjHoursBanner').hidden);
 // A response begun before lunch must not reopen an expired screen.
 await x.request('board');assert(closed(x));
 x.time('2026-10-30T17:00:00Z');x.tick();assert(closed(x),'opening the clock alone cannot authorize access');await x.request('board');assert(!closed(x));assert(!x.protectedEl.inert);assert(x.alreadyInert.inert);
 x.time('2026-10-30T19:20:01Z');x.winEvents.pageshow();assert(closed(x));
 x.time('2026-10-30T11:00:00Z');x.answer(403,{codigo:'fora_expediente'});await x.request('board');assert(closed(x),'server denial overrides a permissive device clock');
 const owner=setup('2026-10-30T22:00:00Z');assert(closed(owner));owner.answer(200,{proprietario_horario_livre:true});await owner.request('board');owner.tick();assert(!closed(owner));assert(!owner.protectedEl.inert);
 owner.answer(200,{diagnostico:true,proprietario_horario_livre:false});await owner.request('diagnostic');owner.events.visibilitychange();assert(!closed(owner),'diagnostic response does not revoke verified owner exemption');
 const offline=setup('2026-10-30T11:00:00Z');offline.time('2026-10-30T22:00:00Z');offline.events.visibilitychange();assert(closed(offline),'resume blocks previously loaded content without waiting for network');
 const css=fs.readFileSync('fsj-hours-banner.css','utf8');assert(css.includes('main>:not(#fsjHoursBanner)'));assert(css.includes('.footnav'));assert(css.includes('[role="dialog"]'));
 console.log('PASS: início e navegação protegidos; almoço/fim, retomada e histórico; resposta atrasada; negativa do servidor; proprietário; rascunhos e inert preservados.');
})().catch(e=>{console.error(e);process.exitCode=1});

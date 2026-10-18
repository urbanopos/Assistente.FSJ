const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),{JSDOM}=require('jsdom');
async function setup(){
 const dom=new JSDOM('<main><div id="taskScreen"></div><div id="taskAnswer"></div><div id="form"></div></main>',{url:'https://fsj.test/responder.html',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window;let now=0,id=0,day=null,shows=[];const timers=new Map();
 w.Date.now=()=>now;w.setTimeout=(fn,ms)=>{timers.set(++id,{fn,at:now+ms});return id};w.clearTimeout=i=>timers.delete(i);w.setInterval=()=>0;
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true;shows.push(now)};w.HTMLDialogElement.prototype.close=function(){this.open=false;};w.token='test';w.AbortSignal=AbortSignal;
 w.fetch=async()=>({ok:true,json:async()=>({agenda:{semana:'2026-10-19',hoje:'2026-10-19',dia:day,bloqueada_gestor:!!day}})});
 w.eval(fs.readFileSync('weekly-off-employee.js','utf8'));await new Promise(setImmediate);
 return {dom,w,shows,choose:()=>day='2026-10-21',async advance(ms){const target=now+ms;while(true){const next=[...timers.entries()].filter(([,t])=>t.at<=target).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;now=next[1].at;timers.delete(next[0]);await next[1].fn();await new Promise(setImmediate);}now=target;}};
}
test('tres avisos por abertura em 0,30,60s; cada exibicao fecha apos 5s',async()=>{const f=await setup(),dialog=()=>f.w.document.getElementById('fsjFolgaAviso');assert(dialog().open);await f.advance(5000);assert(!dialog().open);await f.advance(25000);assert(dialog().open);await f.advance(5000);assert(!dialog().open);await f.advance(25000);assert(dialog().open);await f.advance(5000);assert(!dialog().open);await f.advance(120000);assert.deepEqual(f.shows,[0,30000,60000]);f.dom.window.close();});
test('folga definida pelo gestor antes da repeticao encerra os avisos e libera registros',async()=>{const f=await setup();f.choose();await f.advance(30000);assert.deepEqual(f.shows,[0]);assert(!f.w.document.getElementById('taskAnswer').inert);assert(!f.w.document.getElementById('fsjFolgaAviso').open);f.dom.window.close();});

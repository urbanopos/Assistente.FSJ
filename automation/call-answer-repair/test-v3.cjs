const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(__dirname+'/call-session-v3.js','utf8');
const tick=()=>new Promise(resolve=>setImmediate(resolve));
async function setup(initialMode='valid'){
 const listeners={},events=[],requests=[],nodes={status:{after(){}},callStatus:{}};
 let mode=initialMode,closed=0,stopped=0,heartbeat;
 const context={window:{FSJAndroid:{pendingAnswer(){throw Error('Nao consumir evento nativo');},callEnded(){closed++;}},fsjCallsStop(){stopped++;}},document:{hidden:false,getElementById:id=>nodes[id],createElement:()=>({remove(){}}),addEventListener:(name,fn)=>listeners[name]=fn,dispatchEvent:event=>{events.push(event);listeners[event.type]?.(event);}},CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail;}},AbortSignal:{timeout:()=>({})},setTimeout:fn=>{fn();},setInterval:fn=>{heartbeat=fn;},fetch:async url=>{requests.push(url);if(url.endsWith('/logout'))return{ok:true};if(mode==='network')throw Error('Sem rede');return{ok:mode!=='expired',status:mode==='expired'?401:200,json:async()=>mode==='full'?{name:'regina'}:{id:'u',call_only:true,call_room:'room-42'}};}};
 vm.runInNewContext(source,context);await tick();
 return{events,requests,context,listeners,get closed(){return closed;},get stopped(){return stopped;},set mode(value){mode=value;},heartbeat:()=>heartbeat()};
}
(async()=>{
 let t=await setup();assert.deepEqual(t.events.map(x=>x.type),['fsj:session','fsj:answer-call']);assert.equal(t.events[1].detail.id,'room-42');
 t.mode='network';await t.heartbeat();assert.equal(t.closed,0,'falha temporaria nao encerra');
 t.mode='valid';await t.heartbeat();assert.equal(t.closed,0);
 await t.listeners['fsj:call-ended']();await t.listeners['fsj:call-ended']();assert.equal(t.closed,1);assert.equal(t.stopped,1);assert.equal(t.requests.filter(x=>x.endsWith('/logout')).length,1);assert(!t.requests.some(x=>x.includes('unbind')));
 t=await setup();t.mode='expired';await t.heartbeat();assert.equal(t.closed,1,'revogacao encerra sessao');
 // Uma sessao geral nunca e convertida em atendimento por este codigo.
 t=await setup('full');assert.equal(t.events.length,0);assert.equal(t.closed,0);
 console.log('PASS: sala do servidor, sem consumir evento Android, sessao renovada, falha de rede tolerada, logout unico sem desvincular aparelho.');
})().catch(error=>{console.error(error);process.exit(1);});

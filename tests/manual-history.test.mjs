import {test} from 'node:test';import assert from 'node:assert/strict';
import {matchManualMessages,reconcileManual,runManualAwareRoutine} from '../automation/manual-history.mjs';
import {localDay} from '../automation/core.mjs';
const day=localDay(new Date(Date.now()-86400000)),timestamp=new Date(day+'T11:00:00Z').getTime()/1000;
const row={id:'row-id',pessoa_id:'person-id',whatsapp:'5581999999999',dia:day,token:'11111111-1111-4111-8111-111111111111'};
const chatId='5581999999999@c.us';
const message={id:{_serialized:'actual-whatsapp-id'},fromMe:true,to:chatId,timestamp,body:'Tarefas\nhttps://urbanopos.github.io/Assistente.FSJ/quadro.html#token='+row.token};
test('identifica somente mensagem de saída, conversa, dia e token exatos',()=>{
 assert.equal(matchManualMessages([message],row,chatId).length,1);
 for(const changed of [{fromMe:false},{to:'other@c.us'},{timestamp:timestamp-86400},{body:message.body+'fake-token'},{body:'https://other.invalid/'+row.token}])assert.equal(matchManualMessages([{...message,...changed}],row,chatId).length,0);
});
test('salva identificador real e evento disponível à exclusão automática',async()=>{
 const calls=[];await reconcileManual({row,connect:async()=>({getNumberId:async()=>({_serialized:chatId}),getChatById:async()=>({fetchMessages:async opts=>{assert.equal(opts.fromMe,true);return [message];}})}),db:async(path,opt)=>{calls.push({path,opt});return [];}});
 const inserted=calls.find(c=>c.opt?.method==='POST'),event=JSON.parse(inserted.opt.body);assert.equal(event.whatsapp_message_id,'actual-whatsapp-id');assert.equal(event.tipo,'quadro_manual_identificado');assert.equal(event.pessoa_id,row.pessoa_id);
 const patch=JSON.parse(calls.find(c=>c.opt?.method==='PATCH').opt.body);assert.equal(patch.whatsapp_message_id,'actual-whatsapp-id');
});
test('resultado ambíguo não inventa identificador e não apaga mensagens',async()=>{
 const calls=[];await reconcileManual({row,connect:async()=>({getNumberId:async()=>({_serialized:chatId}),getChatById:async()=>({fetchMessages:async()=>[message,{...message,id:{_serialized:'other'}}]})}),db:async(path,opt)=>{calls.push({path,opt});return [];}});
 assert.equal(calls.length,1);assert.equal(calls[0].opt.method,'PATCH');assert.equal(JSON.parse(calls[0].opt.body).whatsapp_message_id,undefined);
});
test('confirmação manual impede repetição automática no mesmo dia',async()=>{
 let connected=false;await runManualAwareRoutine({connect:async()=>{connected=true;},db:async path=>{assert(path.startsWith('fsj_envios_manuais?'));return [{id:'confirmed'}];},routine:async({db})=>{assert.equal(await db('rpc/fsj_pode_enviar',{body:JSON.stringify({p_pessoa:row.pessoa_id,p_dia:localDay()})}),false);return {failures:0};}});assert.equal(connected,false);
});
test('histórico inclui mensagens manuais e encerra conexão criada para identificação',async()=>{
 let destroyed=0;const calls=[];
 await runManualAwareRoutine({connect:async()=>({destroy:async()=>destroyed++,getNumberId:async()=>({_serialized:chatId}),getChatById:async()=>({fetchMessages:async()=>[message]})}),db:async(path,opt)=>{calls.push(path);if(path.startsWith('fsj_envios_manuais?')&&!opt?.method)return [row];return [];},routine:async({db})=>{await db('mensagens_whatsapp?pessoa_id=eq.person-id&tipo=eq.quadro_automatico&order=criado_em.desc&select=*');return {failures:0};}});
 assert.equal(destroyed,1);assert(calls.some(p=>p.includes('tipo=in.(quadro_automatico,quadro_manual_identificado)')));
});

import {test} from 'node:test';import assert from 'node:assert/strict';
import {replaceEmergency,identifyPrevious} from '../automation/emergency-replacement.mjs';
function options(state={},status='confirmado'){
 const calls=[];return {calls,state,previousMessageId:'old-id',chatId:'owner-chat',text:'Mensagem nova',persist:async()=>{},
 revoke:async(id,chat)=>{assert.equal(id,'old-id');assert.equal(chat,'owner-chat');calls.push('delete');return {status};},
 send:async(chat,text)=>{assert.equal(chat,'owner-chat');assert.equal(text,'Mensagem nova');calls.push('send');return {messageId:'new-id'};},record:async(type)=>calls.push(type)};
}
test('apaga e confirma antes de enviar, sem repetir ao retomar',async()=>{const o=options();await replaceEmergency(o);assert(o.calls.indexOf('delete')<o.calls.indexOf('send'));assert(o.calls.indexOf('apagamento_emergencial')<o.calls.indexOf('send'));await replaceEmergency(o);assert.equal(o.calls.filter(x=>x==='send').length,1);});
test('falha ou incerteza de apagamento bloqueiam envio',async()=>{for(const s of ['falhou','sem_confirmacao']){const o=options({},s);await assert.rejects(replaceEmergency(o));assert(!o.calls.includes('send'));}});
test('envio incerto bloqueia repetição',async()=>{const o=options();o.send=async()=>{o.calls.push('send');throw Error('timeout');};await assert.rejects(replaceEmergency(o));assert.equal(o.state.phase,'uncertain');await assert.rejects(replaceEmergency(o));assert.equal(o.calls.filter(x=>x==='send').length,1);});
test('mesmo diário não pode apagar em outra conversa',async()=>{const o=options();await replaceEmergency(o);await assert.rejects(replaceEmergency({...o,chatId:'other'}));});
test('identifica por código exato, conta remetente e conversa; rejeita ambiguidade',()=>{const code='FSJ-20261029T080000000Z-id';const m={fromMe:true,to:'owner-chat',body:'Código da mensagem: '+code,id:{_serialized:'real-id'}};assert.equal(identifyPrevious([m,{...m,fromMe:false},{...m,to:'other'}],{chatId:'owner-chat',code}),'real-id');assert.throws(()=>identifyPrevious([m,m],{chatId:'owner-chat',code}));assert.throws(()=>identifyPrevious([],{chatId:'owner-chat',code}));});

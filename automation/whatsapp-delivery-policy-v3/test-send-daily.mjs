import {mkdtemp,writeFile,copyFile,mkdir,rm} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join} from 'node:path';import {pathToFileURL} from 'node:url';import assert from 'node:assert/strict';
const dir=await mkdtemp(join(tmpdir(),'fsj-send-'));try{
 for(const n of ['fsj-send-daily.mjs','fsj-delivery-policy.mjs'])await copyFile(new URL(n,import.meta.url),join(dir,n));
 await copyFile(new URL('../emergency-v2/fsj-access-caption.mjs',import.meta.url),join(dir,'fsj-access-caption.mjs'));
 await writeFile(join(dir,'core.mjs'),"export const afterSeven=()=>true,localDay=()=> '2026-10-19';");
 await writeFile(join(dir,'card-bundle.mjs'),"import {accessCaption} from './fsj-access-caption.mjs';export const cardEnabled=()=>true;export async function prepareCard(info){globalThis.prepares++;if(globalThis.failPrepare)throw Error('arquivo ausente');return {pdf:Buffer.from('PDF'),filename:'card.pdf',caption:accessCaption(info)};}");
 await mkdir(join(dir,'node_modules/whatsapp-web.js'),{recursive:true});await writeFile(join(dir,'node_modules/whatsapp-web.js/package.json'),'{"type":"module","main":"index.js"}');await writeFile(join(dir,'node_modules/whatsapp-web.js/index.js'),"export default {MessageMedia:class{constructor(mime){this.mime=mime}}};");
 globalThis.fetch=async()=>({ok:true,json:async()=>({dia:'2026-10-19',responsavel:'Teste'})});const {sendDaily}=await import(pathToFileURL(join(dir,'fsj-send-daily.mjs')));
 const own='https://urbanopos.github.io/Assistente.FSJ/quadro.html#token=00000000-0000-4000-8000-000000000001';
 globalThis.failPrepare=false;globalThis.prepares=0;let sends=[];const client={sendMessage:async(c,p,o)=>{sends.push({p,o});return{id:{_serialized:'id-'+sends.length}}}};
 await sendDaily(client,'chat',own);assert.equal(sends.length,1);assert.equal(sends[0].p.mime,'application/pdf');assert(sends[0].o.caption.includes('CONSULTAR TAREFAS'));assert(!sends[0].o.caption.includes('TAREFAS DE TERCEIROS'));
 globalThis.failPrepare=true;globalThis.prepares=0;sends=[];await sendDaily(client,'chat',own);assert.equal(globalThis.prepares,5);assert.equal(sends.length,1);assert.equal(typeof sends[0].p,'string');const link=new URL(sends[0].p.split('\n').find(x=>x.startsWith('https:')));assert.equal(link.pathname,'/Assistente.FSJ/quadro.html');assert.equal(link.hash,new URL(own).hash);
 globalThis.failPrepare=false;let uncertain=0;await assert.rejects(()=>sendDaily({sendMessage:async()=>{uncertain++;throw Error('conexao perdida durante envio')}},'chat',own));assert.equal(uncertain,1);
 let known;try{await sendDaily(client,'chat',own,async()=>{throw Error('gravacao local falhou')})}catch(e){known=e.deliveryResult}assert(known.messageId);
 console.log('PASS: transporte com legenda, 5 preparacoes PDF antes da reserva, envio incerto sem repeticao e ID preservado.');
}finally{await rm(dir,{recursive:true,force:true})}

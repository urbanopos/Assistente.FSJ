import {localDay,normalizePhone} from './core.mjs';
export async function autocheck({db,connect,readJournal,lockExists,checkFiles,checkPages,now=new Date()}){
 const result={checkedAt:now.toISOString(),day:localDay(now),checks:[],failures:0};
 async function check(name,fn){try{const detail=await fn();result.checks.push({name,ok:true,detail});return detail;}catch{result.failures++;result.checks.push({name,ok:false});return null;}}
 await check('Arquivos e pasta privada',checkFiles);
 const busy=await lockExists();await check('Ausencia de bloqueio de execucao',()=>{if(busy)throw Error();return true;});
 const people=await check('Banco e destinatarios',()=>db('pessoas?ativo=eq.true&receber_tarefas_whatsapp=eq.true&select=id,whatsapp,folgas_datas'));
 const journal=await check('Diario de envios',readJournal);
 if(people&&journal)await check('Ausencia de envios incertos hoje',()=>{if(people.some(p=>journal[p.id+'|'+result.day]?.phase==='sending'))throw Error();return true;});
 await check('Paginas das tarefas e respostas',checkPages);
 if(!busy){let client;try{
  await check('Sessao WhatsApp Web',async()=>{const c=await connect();client=c;if(await c.getState()!=='CONNECTED')throw Error();await c.getChats();return 'CONNECTED';});
  // Do not serialize the client or account data in the report.
  const entry=result.checks.find(x=>x.name==='Sessao WhatsApp Web');if(entry?.ok)entry.detail='CONNECTED';
  if(entry?.ok&&client&&people)await check('Numeros de WhatsApp dos destinatarios',async()=>{for(const p of people){const n=await client.getNumberId(normalizePhone(p.whatsapp));if(!n?._serialized)throw Error();}return people.length;});
 }finally{if(client)await client.destroy();}}
 const entry=result.checks.find(x=>x.name==='Banco e destinatarios');if(entry?.ok)entry.detail=people.length;
 const j=result.checks.find(x=>x.name==='Diario de envios');if(j?.ok)j.detail='Legivel';
 return result;
}

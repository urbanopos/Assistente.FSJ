const fs=require('node:fs');
const file='routine.mjs';
let code=fs.readFileSync(file,'utf8');
if(code.includes('rpc/fsj_preparar_calendario')){
 console.log('Folgas semanais e feriados ja integrados.');
 process.exit(0);
}
const changes=[
 ["const [people,tasks,assignments,returns]=await Promise.all([", "await db('rpc/fsj_preparar_calendario',{method:'POST',body:JSON.stringify({p_dia:day})});\nconst [people,tasks,assignments,returns]=await Promise.all(["],
 ['async function runPerson(person){', "async function runPerson(person){\nif(await db('rpc/fsj_pode_enviar',{method:'POST',body:JSON.stringify({p_pessoa:person.id,p_dia:day})})!==true){console.log('Sem envio: folga ou feriado sem autorizacao para '+person.id);return;}"],
 ['if(current[0].whatsapp!==person.whatsapp)', "if(await db('rpc/fsj_pode_enviar',{method:'POST',body:JSON.stringify({p_pessoa:person.id,p_dia:day})})!==true){console.log('Envio cancelado por folga ou feriado: '+person.id);return;}\n  if(current[0].whatsapp!==person.whatsapp)"],
 ['send:text=>send(client,number._serialized,text)', "send:async text=>{if(await db('rpc/fsj_pode_enviar',{method:'POST',body:JSON.stringify({p_pessoa:person.id,p_dia:day})})!==true)throw Error('Envio bloqueado por folga ou feriado durante a execucao; nenhuma mensagem transmitida.');return send(client,number._serialized,text);}"]
];
for(const [old,next] of changes){
 if(code.split(old).length!==2)throw Error('Arquivo diferente do esperado. Nada alterado.');
 code=code.replace(old,next);
}
fs.copyFileSync(file,file+'.backup-'+Date.now());
fs.writeFileSync(file,code,'utf8');
console.log('Folgas semanais e feriados integrados a rotina das 7h. Backup criado.');

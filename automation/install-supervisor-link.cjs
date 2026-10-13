const fs=require('node:fs');
const p='routine.mjs';let s=fs.readFileSync(p,'utf8');
if(s.includes('rpc/fsj_link_supervisao')){console.log('Link de supervisao ja integrado.');process.exit(0);}
const old="const url='https://urbanopos.github.io/Assistente.FSJ/quadro.html#token='+boards[0].token;";
if(s.split(old).length!==2)throw Error('Arquivo diferente do esperado. Nada alterado.');
const next="const supervisionLink=await db('rpc/fsj_link_supervisao',{method:'POST',body:JSON.stringify({p_pessoa:person.id,p_token:boards[0].token})});\nconst url='https://urbanopos.github.io/Assistente.FSJ/quadro.html#token='+boards[0].token+(supervisionLink?'\\n\\nSUPERVISAO: DEMANDAS DOS SUPERVISIONADOS\\n'+supervisionLink:'');";
fs.copyFileSync(p,p+'.backup-'+Date.now());fs.writeFileSync(p,s.replace(old,next),'utf8');
console.log('Link diario de supervisao integrado. Backup criado.');

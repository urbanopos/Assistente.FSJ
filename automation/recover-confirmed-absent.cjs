const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
function recover(dir,day){
 if(!dir||day!=='2026-10-13')throw Error('Esta recuperacao exige confirmacao do Proprietario para 13/10/2026.');
 const file=path.join(dir,'journal.json'),data=JSON.parse(fs.readFileSync(file,'utf8'));const changed=[];
 for(const [key,state] of Object.entries(data)){if(!key.endsWith('|'+day)||state.phase!=='sending')continue;if(state.messageId)throw Error('Envio com identificador nao pode ser liberado por este comando.');state.phase='retryable';state.operatorVerifiedAbsentAt=new Date().toISOString();changed.push(key);}
 if(changed.length){fs.copyFileSync(file,file+'.backup-confirmacao-'+Date.now());const tmp=file+'.'+crypto.randomUUID()+'.tmp';fs.writeFileSync(tmp,JSON.stringify(data),{mode:0o600});fs.renameSync(tmp,file);}
 console.log('Registros incertos liberados com confirmacao do Proprietario: '+changed.length+'. Historico preservado.');return changed;
}
module.exports={recover};if(require.main===module)recover(process.env.FSJ_STATE_DIR,process.env.FSJ_CONFIRMED_NO_MESSAGE_DAY);

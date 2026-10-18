import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import {fileURLToPath} from 'node:url';
import wwebjs from 'whatsapp-web.js';

const root=path.dirname(fileURLToPath(import.meta.url));
const config=JSON.parse(fs.readFileSync(path.join(root,'config.json'),'utf8'));
const agent=new https.Agent({ca:Buffer.from(config.ca,'base64'),keepAlive:true});
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function api(action,data={}){
return new Promise((resolve,reject)=>{
 const body=JSON.stringify(data);
 const request=https.request(new URL('/api/password-recovery/worker/'+action,config.url),{agent,method:'POST',headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(body),'X-FSJ-Request':'1',Authorization:'Bearer '+config.secret}},response=>{
 let text='';response.setEncoding('utf8');response.on('data',chunk=>{text+=chunk;if(text.length>32768)response.destroy();});response.on('error',reject);response.on('end',()=>{try{if(response.statusCode!==200)throw Error('VM HTTP '+response.statusCode);resolve(JSON.parse(text));}catch(error){reject(error);}});
 });request.setTimeout(12000,()=>request.destroy(Error('Tempo de conexao com a VM esgotado.')));request.on('error',reject);request.end(body);
});
}
const lock=path.join(root,'worker.lock');
try{const old=JSON.parse(fs.readFileSync(lock,'utf8'));try{process.kill(old.pid,0);throw Error('Ja existe um receptor de codigos em execucao.');}catch(error){if(error.code!=='ESRCH')throw error;}fs.unlinkSync(lock);}catch(error){if(error.code!=='ENOENT')throw error;}
fs.writeFileSync(lock,JSON.stringify({pid:process.pid}),{flag:'wx',mode:0o600});
const linking=process.argv.includes('--link');
const client=new wwebjs.Client({authStrategy:new wwebjs.LocalAuth({clientId:'fsj-senhas',dataPath:path.join(root,'auth')}),puppeteer:{headless:!linking}});
let stopping=false;
async function close(code=0){if(stopping)return;stopping=true;await client.destroy().catch(()=>{});try{fs.unlinkSync(lock);}catch{};process.exit(code);}
process.on('SIGINT',()=>close());process.on('SIGTERM',()=>close());
process.on('exit',()=>{try{fs.unlinkSync(lock);}catch{}});
client.on('qr',()=>{if(linking)console.log('Escaneie o QR na janela: WhatsApp > Aparelhos conectados > Conectar aparelho.');else{console.error('WhatsApp precisa ser vinculado. Execute o instalador novamente.');close(1);}});
client.on('auth_failure',()=>{console.error('Vinculo WhatsApp expirado. Execute o instalador novamente.');close(1);});
client.on('disconnected',()=>{console.error('WhatsApp desconectado; recebimento de pedidos suspenso.');close(1);});
client.once('ready',async()=>{
console.log('WhatsApp de recuperacao conectado. Rotina das 7h independente.');
if(linking){await close();return;}
while(!stopping){
 try{
  const {job}=await api('claim');
  if(job){
   let sent=false;
   try{
    if(!/^55[1-9][0-9]{9,10}$/.test(job.phone)||!/^\d{6}$/.test(job.code)||Date.now()/1000>=job.expires-10)throw Error('Pedido invalido ou expirado.');
    const recipient=await client.getNumberId(job.phone);
    if(!recipient?._serialized)throw Error('Numero nao localizado no WhatsApp.');
    const message=await client.sendMessage(recipient._serialized,'Assistente FSJ Reserva\nSeu codigo para criar uma nova senha: '+job.code+'\nValido por 5 minutos a partir da solicitacao. Uso unico.\nSe voce nao solicitou, ignore esta mensagem. Nao compartilhe o codigo.',{linkPreview:false,sendSeen:false,waitUntilMsgSent:true});
    sent=!!message?.id?._serialized;
   }catch{console.error('Nao foi possivel confirmar o envio de um codigo. Nenhuma repeticao automatica sera feita para esse pedido.');}
   try{await api('ack',{id:job.id,lease:job.lease,sent});}catch{console.error('Confirmacao do envio pendente na VM. Solicite outro codigo se necessario.');}
  }
 }catch(error){console.error('Recuperacao: '+error.message);}
 await pause(2500);
}
});
try{await api('ping');await client.initialize();}catch(error){console.error('Nao foi possivel iniciar o WhatsApp de recuperacao: '+error.message);await close(1);}

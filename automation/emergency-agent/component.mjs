// Processo interno: o pacote inicia/encerra seu executor, sem outro botão operacional.
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
export function startEmergencyComponent({env=process.env,spawnProcess=spawn}={}){
 if(!env.FSJ_EMERGENCY_STATE_DIR||!env.SUPABASE_SERVICE_ROLE_KEY)throw Error('Configuração técnica inicial do Disparo de Emergência incompleta.');
 const child=spawnProcess(process.execPath,[fileURLToPath(new URL('./worker.mjs',import.meta.url))],{env,stdio:'inherit'});
 return {process:child,stop:()=>{if(child.exitCode===null)child.kill('SIGTERM');}};
}

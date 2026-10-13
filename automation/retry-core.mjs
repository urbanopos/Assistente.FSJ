export async function fiveAttempts({run,wait,onAttempt=()=>{},max=5,interval=180000}){
 if(!Number.isInteger(max)||max<1||max>5||interval<180000)throw Error('Configuracao de tentativas invalida');
 for(let attempt=1;attempt<=max;attempt++){
  await onAttempt(attempt,max);const code=await run();if(code===0)return {success:true,attempts:attempt};
  if(attempt<max)await wait(interval);
 }
 return {success:false,attempts:max};
}

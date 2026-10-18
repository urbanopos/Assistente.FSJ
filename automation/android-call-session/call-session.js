/* FSJ_CALL_ONLY_ANDROID12 */
;(async()=>{
try{
const response=await fetch('/api/me',{cache:'no-store'});const user=await response.json();if(!response.ok||!user.call_only)throw Error('Chamada encerrada.');
window.fsjCurrentUser=user;
document.dispatchEvent(new CustomEvent('fsj:session',{detail:user}));
let attempts=0;
const start=()=>{if(!window.FSJAndroid)return;const id=FSJAndroid.pendingAnswer();if(id){document.dispatchEvent(new CustomEvent('fsj:answer-call',{detail:{id}}));return;}if(++attempts<20)setTimeout(start,200);};
setTimeout(start,150);
}catch(error){document.getElementById('status').textContent=error.message;setTimeout(()=>window.FSJAndroid?.callEnded(),2000);}
})();
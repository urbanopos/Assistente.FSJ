let fsjProprietario=null;
window.fsjOwnerVerified=false;
function fsjOwnerBadges(){
 document.querySelectorAll('#people [data-owner-person]').forEach(e=>{e.textContent=e.dataset.ownerPerson===fsjProprietario?.pessoa_id?'Proprietário do Assistente FSJ':'';});
 const status=document.getElementById('ownerPersonStatus');if(!status)return;
 const owner=document.getElementById('pid').value===fsjProprietario?.pessoa_id;
 status.hidden=!owner;status.textContent=owner?'Proprietário do Assistente FSJ — titular da gestão do software. Essa condição é independente das tarefas e da função de supervisor.':'';
}
async function fsjLoadOwnership(){
 try{const rows=await api('/rest/v1/fsj_titularidade?select=pessoa_id,nome_titular,papel,registrado_em');fsjProprietario=rows[0]||null;document.getElementById('ownerAccount').textContent=fsjProprietario?fsjProprietario.papel+': '+fsjProprietario.nome_titular.split(' ')[0]:'Titularidade administrativa não disponível.';fsjOwnerBadges();}catch{fsjProprietario=null;document.getElementById('ownerAccount').textContent='Não foi possível consultar a identificação do Proprietário.';fsjOwnerBadges();}finally{window.fsjOwnerVerified=!!fsjProprietario;document.dispatchEvent(new CustomEvent('fsj:ownership-updated'));}
}
if(typeof fsjPainelPronto!=='undefined'&&fsjPainelPronto)fsjLoadOwnership();

let fsjSupervisors=new Map(),fsjSupervisorsReady=false,fsjSupervisorPeople=[],fsjSupervisorGroups=[];
async function fsjSupervisorPost(body){return api('/functions/v1/supervisao',{method:'POST',body:JSON.stringify(body)});}
async function fsjLoadSupervisors(){
 const status=document.getElementById('pSupervisorStatus');fsjSupervisorsReady=false;document.getElementById('pSupervisor').disabled=true;const retry=document.getElementById('pSupervisorRetry');if(retry)retry.hidden=true;status.textContent='Consultando atribuições de supervisão...';
 try{const data=await fsjSupervisorPost({action:'manager-list'});fsjSupervisors=new Map(data.supervisores.map(s=>[s.pessoa_id,s]));fsjSupervisorsReady=true;document.getElementById('pSupervisor').disabled=false;fsjSupervisorEdit(document.getElementById('pid').value);status.textContent='Acesso pelo link pessoal do WhatsApp. Somente consulta às demandas selecionadas.';fsjSupervisorBadges();}catch(e){status.textContent='Não foi possível carregar a supervisão. Clique em Tentar novamente.';if(retry)retry.hidden=false;}
}
function fsjSupervisorEdit(id){const c=fsjSupervisors.get(id);document.getElementById('pSupervisor').checked=c?.ativo===true;fsjSupervisorPeople=[...(c?.pessoas||[])];fsjSupervisorGroups=[...(c?.grupos||[])];fsjRenderSupervisorTargets();}
function fsjRenderSupervisorTargets(){
 const enabled=fsjSupervisorsReady&&document.getElementById('pSupervisor').checked;const box=document.getElementById('pSupervisorScopes');box.hidden=!enabled;
 document.getElementById('pSupervisedPeople').innerHTML=S.people.map(p=>'<label><input type="checkbox" class="supervised-person" value="'+esc(p.id)+'"'+(fsjSupervisorPeople.includes(p.id)?' checked':'')+'> '+esc(p.nick||p.name)+(p.active?'':' (inativo)')+'</label>').join('')||'<p>Nenhuma pessoa ativa cadastrada.</p>';
 document.getElementById('pSupervisedGroups').innerHTML=S.groups.map(g=>'<label><input type="checkbox" class="supervised-group" value="'+esc(g.id)+'"'+(fsjSupervisorGroups.includes(g.id)?' checked':'')+'> '+esc(g.name)+'</label>').join('')||'<p>Nenhum grupo cadastrado.</p>';
}
function fsjSupervisorPrepare(id,active){
 if(!fsjSupervisorsReady)throw Error('Aguarde a consulta das atribuições de supervisão e tente novamente.');
 const enabled=document.getElementById('pSupervisor').checked&&active;
 if(enabled&&!fsjSupervisorPeople.length&&!fsjSupervisorGroups.length)throw Error('Selecione ao menos um integrante ou grupo para supervisionar.');
 return {action:'manager-set',pessoa_id:id,ativo:enabled,pessoas:fsjSupervisorPeople,grupos:fsjSupervisorGroups};
}
async function fsjSupervisorSave(config){await fsjSupervisorPost(config);fsjSupervisors.set(config.pessoa_id,{pessoa_id:config.pessoa_id,ativo:config.ativo,pessoas:[...config.pessoas],grupos:[...config.grupos]});}
function fsjSupervisorBadges(){document.querySelectorAll('#people [data-supervisor-person]').forEach(e=>{e.textContent=fsjSupervisors.get(e.dataset.supervisorPerson)?.ativo?'Supervisor • acesso restrito':'';});}
document.getElementById('pSupervisor').addEventListener('change',fsjRenderSupervisorTargets);
document.getElementById('pSupervisedPeople').addEventListener('change',()=>{fsjSupervisorPeople=[...document.querySelectorAll('.supervised-person:checked')].map(x=>x.value);});
document.getElementById('pSupervisedGroups').addEventListener('change',()=>{fsjSupervisorGroups=[...document.querySelectorAll('.supervised-group:checked')].map(x=>x.value);});

if(typeof fsjPainelPronto!=='undefined'&&fsjPainelPronto)fsjLoadSupervisors();

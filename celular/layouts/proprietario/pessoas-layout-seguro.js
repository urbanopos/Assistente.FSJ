/* Prévia isolada — somente aba Pessoas no Celular Proprietário.
   Não altera handlers, valores, registros, autenticação nem outros módulos. */
(function(){
  'use strict';
  const css=document.createElement('style');
  css.textContent=`
  @media(max-width:900px){
    #cadPessoas.fsj-pessoas-mobile{max-width:100%;margin-inline:auto;padding:12px!important}\n    #cadPessoas.fsj-pessoas-mobile .fsj-pessoas-tabs,#cadPessoas.fsj-pessoas-mobile .fsj-pessoas-rodape{display:flex!important}\n    #cadPessoas.fsj-pessoas-mobile .fsj-pessoas-tabs button{flex:1 1 0}\n    #cadPessoas.fsj-pessoas-mobile .fsj-pessoas-secao-0,#cadPessoas.fsj-pessoas-mobile .fsj-pessoas-secao-1,#cadPessoas.fsj-pessoas-mobile .fsj-pessoas-secao-2{visibility:visible}
    #cadPessoas.fsj-pessoas-mobile>h2{text-align:center;font-size:1.12rem;margin:0 0 7px}
    #cadPessoas .fsj-pessoas-tabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px;margin:8px 0 12px}
    #cadPessoas .fsj-pessoas-tabs button{min-width:0!important;padding:7px 2px!important;font-size:.8rem}
    #cadPessoas .fsj-pessoas-tabs button[aria-selected=true]{background:#205e45;color:#fff}
    #cadPessoas .fsj-pessoas-rodape{display:flex;justify-content:space-between;align-items:center;margin-top:12px;border-top:1px solid #d6e1e3;padding-top:9px}
    #cadPessoas .fsj-pessoas-rodape button{min-width:64px!important;background:#205e45;color:white}
    #cadPessoas .fsj-pessoas-rodape button:disabled{opacity:.35}
    #cadPessoas.fsj-pessoas-mobile[data-fsj-tab="0"] .fsj-pessoas-secao-1,
    #cadPessoas.fsj-pessoas-mobile[data-fsj-tab="0"] .fsj-pessoas-secao-2,
    #cadPessoas.fsj-pessoas-mobile[data-fsj-tab="1"] .fsj-pessoas-secao-0,
    #cadPessoas.fsj-pessoas-mobile[data-fsj-tab="1"] .fsj-pessoas-secao-2,
    #cadPessoas.fsj-pessoas-mobile[data-fsj-tab="2"] .fsj-pessoas-secao-0,
    #cadPessoas.fsj-pessoas-mobile[data-fsj-tab="2"] .fsj-pessoas-secao-1{display:none!important}
    #cadPessoas.fsj-pessoas-mobile #personBasicFields .person-fields{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;gap:6px 8px!important}
    #cadPessoas.fsj-pessoas-mobile #personBasicFields .person-fields>div{min-width:0!important}
    #cadPessoas.fsj-pessoas-mobile #personBasicFields .person-fields>div:has(#pphone),#cadPessoas.fsj-pessoas-mobile #personBasicFields .person-fields>div:has(#pemail){grid-column:1/-1}
    #cadPessoas.fsj-pessoas-mobile #personBasicFields .person-fields>div{width:100%!important;margin-bottom:2px}
    #cadPessoas.fsj-pessoas-mobile #personBasicFields label{margin-bottom:2px}
    #cadPessoas.fsj-pessoas-mobile #fsjOwnerAccessInPeople{display:block!important;margin:3px 0 8px!important}
    #cadPessoas.fsj-pessoas-mobile #fsjOwnerAccessInPeople .muted:not([role=status]){display:none!important}
    #cadPessoas.fsj-pessoas-mobile #personBasicFields input,#cadPessoas.fsj-pessoas-mobile #personBasicFields select{min-width:0!important}
    #cadPessoas.fsj-pessoas-mobile .fsj-pessoas-rodape{position:relative;z-index:1}
    #cadPessoas.fsj-pessoas-mobile #fsjOwnerAccessInPeople>button{width:100%}
  }`;
  document.head.appendChild(css);
  function init(){
    if(!window.matchMedia('(max-width:900px)').matches)return;
    const host=document.getElementById('cadPessoas');
    if(!host||host.dataset.fsjTabsReady)return;
    const basic=document.getElementById('personBasicHome');
    const owner=document.getElementById('fsjOwnerAccessInPeople');
    const groups=document.getElementById('fsjGruposNaPessoas');
    const person=document.getElementById('personSelect');
    if(!basic||!owner||!groups||!person)return;
    const selector=person.parentElement;
    if(!selector||selector===host)return;
    host.dataset.fsjTabsReady='1';
    host.classList.add('fsj-pessoas-mobile');
    basic.classList.add('fsj-pessoas-secao-0');
    owner.classList.add('fsj-pessoas-secao-1');
    /* O link de acesso é uma ação da pessoa, não do formulário de novo cadastro. */
    selector.before(owner);
    selector.classList.add('fsj-pessoas-secao-1');
    groups.classList.add('fsj-pessoas-secao-2');
    const tabs=document.createElement('div');tabs.className='fsj-pessoas-tabs';
    const names=['1. Cadastro','2. Pessoas','3. Grupos'];
    const buttons=names.map((name,i)=>{
      const b=document.createElement('button');b.type='button';b.textContent=name;
      b.addEventListener('click',()=>show(i));tabs.appendChild(b);return b;
    });
    const foot=document.createElement('div');foot.className='fsj-pessoas-rodape';
    const back=document.createElement('button');back.type='button';back.textContent='←';
    const count=document.createElement('span');
    const next=document.createElement('button');next.type='button';next.textContent='→';
    foot.append(back,count,next);
    back.addEventListener('click',()=>show(Math.max(0,Number(host.dataset.fsjTab||0)-1)));
    next.addEventListener('click',()=>show(Math.min(2,Number(host.dataset.fsjTab||0)+1)));
    host.querySelector('h2')?.after(tabs);host.appendChild(foot);
    function show(i){\n      host.scrollIntoView({block:'start',behavior:'instant'});
      host.dataset.fsjTab=String(i);
      buttons.forEach((b,j)=>b.setAttribute('aria-selected',String(j===i)));
      count.textContent=(i+1)+' / 3 — '+['Cadastro','Pessoas','Grupos'][i];
      back.disabled=i===0;next.disabled=i===2;
    }
    show(0);
    /* Oculta apenas o paginador legado 1/2 da aba Cadastro.
       Mantém seu DOM e handlers originais intactos para restauração. */
    function ocultarPaginadorLegado(){
      const root=document.getElementById('cadPessoas');
      if(!root)return;
      for(const el of root.querySelectorAll('*')){
        if(el.children.length || !/^\\s*\\d+\\s*\\/\\s*2\\s*$/.test(el.textContent||''))continue;
        let parent=el.parentElement;
        for(let depth=0;parent&&parent!==root&&depth<4;depth++,parent=parent.parentElement){
          if(parent.classList.contains('fsj-pessoas-rodape'))break;
          const btns=parent.querySelectorAll('button');
          if(btns.length===2){
            parent.style.setProperty('display','none','important');
            parent.dataset.fsjPaginadorLegadoOculto='1';
            break;
          }
        }
      }
    }
    ocultarPaginadorLegado();
    document.addEventListener('fsj:entry-validated',ocultarPaginadorLegado);
    const obs=new MutationObserver(()=>ocultarPaginadorLegado());
    obs.observe(host,{childList:true,subtree:true,characterData:true});
    /* Ficha selecionada continua no fluxo oficial, sem interceptar selectPerson. */
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
  window.addEventListener('pageshow',init);
  document.addEventListener('fsj:entry-validated',init);
})();

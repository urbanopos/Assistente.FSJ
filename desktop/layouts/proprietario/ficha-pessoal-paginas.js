(() => {
'use strict';
if (window.FSJ_PLATFORM?.platform !== 'desktop') return;
const ficha = document.getElementById('fichaPessoa');
const settings = document.getElementById('personSettings');
const fichaHeader = ficha?.querySelector('.fsj-ficha-cabecalho');
const settingsTitle = document.getElementById('personSettingsTitle');
if (!ficha || !settings || document.getElementById('fsjFichaPaginas')) return;
const fieldsets = [...settings.children].filter(x => x.tagName === 'FIELDSET');
const supervisor = fieldsets.find(x => x.querySelector('#pSupervisor'));
const jornada = fieldsets.find(x => x.querySelector('#pRegimeJornada'));
if (!supervisor || !jornada) return;
const style=document.createElement('style');
style.textContent=`
  body.fsj-owner-sidebar-active #fichaPessoa .fsj-ficha-cabecalho[hidden],
  #fichaPessoa .fsj-ficha-cabecalho[hidden],
  #fichaPessoa #personSettings > fieldset[hidden] { display:none !important; }
`;

// Uniformidade visual exclusiva da ficha cadastral do Proprietário no Desktop.
style.textContent += `
  #fichaPessoa.fsj-ficha-editando #personBasicFields .person-fields > div {
    align-self: end !important;
  }
  #fichaPessoa.fsj-ficha-editando #personBasicFields .person-fields > div > label {
    display: block;
    min-height: 20px;
    line-height: 20px;
    margin-bottom: 5px;
  }
  #fichaPessoa.fsj-ficha-editando #personBasicFields .person-fields input:not([type="hidden"]):not([type="checkbox"]),
  #fichaPessoa.fsj-ficha-editando #personBasicFields .person-fields select {
    height: 42px !important;
    min-height: 42px !important;
    box-sizing: border-box !important;
    margin-top: 0 !important;
    margin-bottom: 0 !important;
    vertical-align: middle;
  }
  #fichaPessoa.fsj-ficha-editando #personBasicFields .person-fields button {
    min-height: 42px !important;
    box-sizing: border-box !important;
  }
`;

// Uniformidade de altura no quadro Jornada de trabalho (página 2).
style.textContent += `
  #fichaPessoa #personSettings fieldset:has(#pRegimeJornada) > .row {
    align-items: end !important;
  }
  #fichaPessoa #personSettings fieldset:has(#pRegimeJornada) > .row > div {
    min-width: 0;
  }
  #fichaPessoa #personSettings #pRegimeJornada,
  #fichaPessoa #personSettings #pJornadaVigencia,
  #fichaPessoa #personSettings #pworkstart,
  #fichaPessoa #personSettings #plunchstart,
  #fichaPessoa #personSettings #plunchreturn,
  #fichaPessoa #personSettings #pworkfinish {
    height: 42px !important;
    min-height: 42px !important;
    box-sizing: border-box !important;
    margin-top: 0 !important;
    margin-bottom: 0 !important;
    width: 100%;
  }
  #fichaPessoa #personSettings fieldset:has(#pRegimeJornada) > .row > div > label {
    display:block;
    min-height:20px;
    line-height:20px;
    margin-bottom:5px;
  }
`;
document.head.append(style);
const nav = document.createElement('div');
nav.id = 'fsjFichaPaginas';
nav.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin:12px 0;padding:10px;border:1px solid #c8d8d8;border-radius:9px';
const anterior = document.createElement('button');
anterior.type='button'; anterior.textContent='← Anterior';
const indicador = document.createElement('strong');
const proxima = document.createElement('button');
proxima.type='button'; proxima.textContent='Próxima →';
nav.append(anterior,indicador,proxima);
// Navegação ao final da ficha, abaixo dos campos e ações existentes.
ficha.append(nav);
let pagina = 1;
function exibir(numero) {
  pagina=numero;
  // O cabeçalho com identificação, resumo e ações pertence só à página cadastral.
  if (fichaHeader) fichaHeader.hidden = numero!==1;
  if (settingsTitle) {
    if (numero===1) settingsTitle.textContent='Cadastro e supervisão de demandas';
    else settingsTitle.textContent='Jornada de trabalho, férias e folgas';
  }
  supervisor.hidden = numero!==1;
  for (const el of fieldsets) if (el!==supervisor) el.hidden=numero!==2;
  // Ações de salvar/cancelar existentes permanecem acessíveis nas duas páginas.
  const basic=document.getElementById('personBasicFields');
  if (basic && ficha.contains(basic)) basic.style.display=numero===1?'':'none';
  anterior.disabled=numero===1; proxima.disabled=numero===2;
  indicador.textContent=numero===1?'1/2 — Cadastro e supervisão':'2/2 — Jornada, férias e calendário';
}
anterior.addEventListener('click',()=>exibir(1));
proxima.addEventListener('click',()=>exibir(2));
document.getElementById('personSelect')?.addEventListener('change',()=>exibir(1));
document.addEventListener('click',event=>{
  if (event.target.closest?.('#fsjOwnerSidebar button') && document.getElementById('fichaPessoa')?.classList.contains('hidden')) {
    exibir(1);
  }
},true);
new MutationObserver(() => {
  const basic=document.getElementById('personBasicFields');
  if (basic && !ficha.contains(basic)) basic.style.display='';
}).observe(document.getElementById('cadPessoas'),{childList:true,subtree:true});
exibir(1);
})();
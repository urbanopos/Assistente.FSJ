(() => {
'use strict';
if (window.FSJ_PLATFORM?.platform !== 'desktop') return;
const ficha = document.getElementById('fichaPessoa');
const settings = document.getElementById('personSettings');
if (!ficha || !settings || document.getElementById('fsjFichaPaginas')) return;
const fieldsets = [...settings.children].filter(x => x.tagName === 'FIELDSET');
const supervisor = fieldsets.find(x => x.querySelector('#pSupervisor'));
const jornada = fieldsets.find(x => x.querySelector('#pRegimeJornada'));
if (!supervisor || !jornada) return;
const nav = document.createElement('div');
nav.id = 'fsjFichaPaginas';
nav.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin:12px 0;padding:10px;border:1px solid #c8d8d8;border-radius:9px';
const anterior = document.createElement('button');
anterior.type='button'; anterior.textContent='← Anterior';
const indicador = document.createElement('strong');
const proxima = document.createElement('button');
proxima.type='button'; proxima.textContent='Próxima →';
nav.append(anterior,indicador,proxima);
ficha.querySelector('.fsj-ficha-cabecalho')?.after(nav);
let pagina = 1;
function exibir(numero) {
  pagina=numero;
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
exibir(1);
})();
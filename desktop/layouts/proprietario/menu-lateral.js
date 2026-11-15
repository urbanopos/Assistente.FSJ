(() => {
  'use strict';

  if (window.FSJ_PLATFORM?.platform !== 'desktop') return;

  const body = document.body;
  const header = document.querySelector('body > header');
  const main = document.querySelector('body > main');
  const panel = document.getElementById('gestor');
  const menu = document.getElementById('fsjSimpleSelect');
  if (!header || !main || !panel || !menu) return;

  const style = document.createElement('style');
  style.textContent = `
    #fsjOwnerSidebar[hidden], #fsjOwnerSidebarRestore[hidden],
    body.fsj-owner-sidebar-active > :is(.topnav, #fsjSimpleBar, #fsjModoRestaurar) {
      display: none !important;
    }
    body.fsj-owner-sidebar-active { --fsj-sidebar-width: 248px; }
    body.fsj-owner-sidebar-active.fsj-owner-sidebar-collapsed { --fsj-sidebar-width: 64px; }
    body.fsj-owner-sidebar-active > main {
      width: calc(100% - var(--fsj-sidebar-width));
      max-width: none;
      margin-inline: var(--fsj-sidebar-width) 0;
    }
    #fsjOwnerSidebar {
      position: fixed;
      inset: var(--fsj-sidebar-top, 72px) auto 0 0;
      z-index: 19;
      width: var(--fsj-sidebar-width);
      padding: 12px;
      overflow: auto;
      background: #083450;
      color: white;
      font: 14px Arial, sans-serif;
    }
    #fsjOwnerSidebar button {
      display: flex;
      align-items: center;
      gap: 6px;
      width: 100%;
      min-height: 42px;
      margin: 0 0 4px;
      padding: 10px 12px;
      border: 0;
      border-radius: 7px;
      background: transparent;
      color: inherit;
      text-align: left;
    }
    #fsjOwnerSidebar button:hover, #fsjOwnerSidebar button[aria-current="page"] {
      background: #b7dfff;
      color: #063450;
    }
    #fsjOwnerSidebar button:focus-visible { outline: 2px solid #b7dfff; outline-offset: 2px; }
    #fsjOwnerSidebar button:disabled { opacity: .6; cursor: default; }
    .fsj-owner-sidebar-collapsed #fsjOwnerSidebar button { justify-content: center; padding-inline: 0; }
    .fsj-owner-sidebar-collapsed #fsjOwnerSidebar .fsj-sidebar-label { display: none; }
    #fsjOwnerSidebarRestore:not([hidden]) { display: block; margin: 6px 12px; }
  `;
  document.head.append(style);

  const preference = 'fsj_proprietario_menu_desktop_v1';
  let useSidebar = true;
  try {
    useSidebar = localStorage.getItem(preference) !== 'anterior';
  } catch {}
  let expanded = true;
  let signature;
  const pages = new Map();
  const diagnosticView = document.createElement('section');
  diagnosticView.id = 'fsjOwnerEmbeddedDiagnostic';
  diagnosticView.hidden = true;
  diagnosticView.style.cssText = 'width:100%;min-width:0;box-sizing:border-box;padding:8px';
  const diagnosticFrame = document.createElement('iframe');
  diagnosticFrame.title = 'Diagnóstico — Fazenda São José';
  diagnosticFrame.style.cssText = 'display:block;width:100%;height:calc(100dvh - 120px);min-height:520px;border:0;border-radius:10px;background:#fff';
  diagnosticView.append(diagnosticFrame);
  panel.append(diagnosticView);
  function closeDiagnostic() {
    if (diagnosticView.hidden) return;
    diagnosticView.hidden = true;
    diagnosticFrame.removeAttribute('src');
  }
  function openDiagnostic() {
    if (window.fsjOwnerVerified !== true) return;
    try { sessionStorage.setItem('fsj_diagnostico_acesso', String(Date.now())); } catch {}
    for (const child of panel.children) {
      if (child !== diagnosticView) {
        child.hidden = true;
        child.classList.add('hidden');
      }
    }
    diagnosticView.hidden = false;
    diagnosticFrame.src = './diagnostico-navegacao.html?v=20261102-02';
  }

  const maintenanceView = document.createElement('section');
  maintenanceView.id = 'fsjOwnerEmbeddedMaintenance';
  maintenanceView.hidden = true;
  maintenanceView.style.cssText = 'width:100%;min-width:0;box-sizing:border-box;padding:8px';
  const maintenanceNotice = document.createElement('p');
  maintenanceNotice.textContent = 'Painel de manutenção da máquina virtual. Se a rede ou o servidor impedir a incorporação, use o acesso externo abaixo.';
  const maintenanceLink = document.createElement('a');
  maintenanceLink.href = 'https://10.203.77.1:9443/';
  maintenanceLink.target = '_blank';
  maintenanceLink.rel = 'noopener noreferrer';
  maintenanceLink.textContent = 'Abrir painel de manutenção em aba separada (alternativa)';
  const maintenanceFrame = document.createElement('iframe');
  maintenanceFrame.title = 'Painel de manutenção — Fazenda São José';
  maintenanceFrame.referrerPolicy = 'no-referrer';
  maintenanceFrame.style.cssText = 'display:block;width:100%;height:calc(100dvh - 160px);min-height:520px;border:0;border-radius:10px;background:#fff;margin-top:12px';
  maintenanceView.append(maintenanceNotice, maintenanceLink, maintenanceFrame);
  panel.append(maintenanceView);
  function closeMaintenance() {
    if (maintenanceView.hidden) return;
    maintenanceView.hidden = true;
    maintenanceFrame.removeAttribute('src');
  }
  function openMaintenance() {
    if (window.fsjOwnerVerified !== true) return;
    closeDiagnostic();
    for (const child of panel.children) {
      if (child !== maintenanceView) {
        child.hidden = true;
        child.classList.add('hidden');
      }
    }
    maintenanceView.hidden = false;
    maintenanceFrame.src = maintenanceLink.href;
  }

  // Ponte única para todos os acessos (menu lateral, seletor e atalhos).
  window.fsjOwnerOpenEmbeddedModule = function(module) {
    if (!eligible() || !useSidebar) return false;
    if (module === '__diagnostico') {
      closeMaintenance();
      openDiagnostic();
    } else if (module === '__manutencao') {
      openMaintenance();
    } else return false;
    sync();
    return true;
  };

  const sidebar = document.createElement('nav');
  sidebar.id = 'fsjOwnerSidebar';
  sidebar.hidden = true;
  sidebar.setAttribute('aria-label', 'Menu Principal');

  function createButton(label, icon, action) {
    const button = document.createElement('button');
    const symbol = document.createElement('span');
    const text = document.createElement('span');
    button.type = 'button';
    button.title = label;
    button.setAttribute('aria-label', label);
    symbol.setAttribute('aria-hidden', 'true');
    symbol.textContent = icon;
    text.className = 'fsj-sidebar-label';
    text.textContent = label;
    button.append(symbol, text);
    button.addEventListener('click', action);
    return button;
  }

  const entries = document.createElement('div');
  entries.id = 'fsjOwnerSidebarEntries';
  const toggle = createButton('Recolher menu', '☰', () => {
    expanded = !expanded;
    const label = expanded ? 'Recolher menu' : 'Expandir menu';
    toggle.title = label;
    toggle.setAttribute('aria-label', label);
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.querySelector('.fsj-sidebar-label').textContent = label;
    sync();
  });
  toggle.setAttribute('aria-expanded', 'true');
  toggle.setAttribute('aria-controls', entries.id);

  const restore = document.createElement('button');
  restore.type = 'button';
  restore.id = 'fsjOwnerSidebarRestore';
  restore.textContent = 'Ativar menu lateral';
  restore.hidden = true;
  restore.addEventListener('click', () => {
    setPreference(true);
    toggle.focus();
  });
  sidebar.append(toggle, entries, createButton('Usar menu anterior', '↶', () => {
    setPreference(false);
    restore.focus();
  }));
  main.before(sidebar, restore);

  function setPreference(active) {
    useSidebar = active;
    try {
      localStorage.setItem(preference, active ? 'lateral' : 'anterior');
    } catch {}
    sync();
  }

  function eligible() {
    return window.fsjOwnerVerified === true && !window.fsjExited &&
      !panel.hidden && !panel.classList.contains('hidden') &&
      !body.classList.contains('fsj-booting') &&
      typeof window.fsjSimpleSelectGo === 'function' &&
      !(typeof fsjAcessoEmergencial === 'function' && fsjAcessoEmergencial());
  }

  function renderOptions(options) {
    const next = JSON.stringify(options.map(option => [option.value, option.textContent]));
    if (next === signature) return;
    signature = next;
    pages.clear();
    entries.replaceChildren();
    const home = options.find(option => option.value === 'dashboard');
    const ordered = home ? [home, ...options.filter(option => option !== home)] : options;
    for (const { value, textContent } of ordered) {
      const button = createButton(value === 'cadPessoas' ? 'Pessoas e Grupos' : textContent, '▸', () => {
        const option = [...menu.options].find(option => option.value === value);
        if (!eligible() || !useSidebar || !option || option.hidden || option.disabled || menu.disabled) return;
        if (value === 'cadPessoas' && window.fsjOwnerPeopleGo) {
          closeDiagnostic(); closeMaintenance();
          window.fsjOwnerPeopleGo('cadastro');
        } else if (value === '__diagnostico') {
          closeMaintenance();
          openDiagnostic();
        } else if (value === '__manutencao') {
          openMaintenance();
        } else {
          closeDiagnostic();
          closeMaintenance();
          if (value === 'videosChamadas' && typeof window.abrirVideosReserva === 'function') {
            window.abrirVideosReserva(button);
          } else {
            window.fsjSimpleSelectGo(value);
          }
          // As telas internas podem ter recebido o atributo hidden ao abrir módulos incorporados.
          // A navegação original remove a classe hidden, mas não esse atributo.
          const target = document.getElementById(value);
          if (target && !target.classList.contains('hidden')) target.hidden = false;
        }
        sync();
      });
      pages.set(value, button);
      entries.append(button);
    }
  }

  function sync() {
    const options = [...menu.options].filter(option => !option.hidden && option.value !== '__diagnostico' && option.value !== 'cadGrupos');
    const available = eligible() && options.some(option => option.value === 'dashboard');
    const active = available && useSidebar;
    sidebar.hidden = !active;
    restore.hidden = !available || active;
    body.classList.toggle('fsj-owner-sidebar-active', active);
    body.classList.toggle('fsj-owner-sidebar-collapsed', active && !expanded);
    if (!active) return;

    renderOptions(options);
    const page = typeof currentPage === 'undefined' ? menu.value : currentPage;
    const aliases = { fichaPessoa: 'cadPessoas', demandasGrupos: 'demandas', tarefasPorSituacao: 'demandas' };
    const current = !maintenanceView.hidden ? '__manutencao' : (!diagnosticView.hidden ? '__diagnostico' : (aliases[page] || page));
    for (const option of options) {
      const button = pages.get(option.value);
      button.disabled = menu.disabled || option.disabled;
      if (option.value === current) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    }
  }

  // Navegação agrupada do Proprietário: reutiliza os formulários originais.
  let peopleMode = 'cadastro';
  const peoplePage = document.getElementById('cadPessoas');
  const groupsPage = document.getElementById('cadGrupos');
  if (peoplePage && groupsPage) {
    const tabs = [];
    function choosePeopleMode(mode) {
      peopleMode = mode;
      if (mode === 'grupos') {
        window.navTo?.('cadGrupos');
      } else {
        window.navTo?.('cadPessoas');
        if (mode === 'cadastro') window.clearPerson?.();
      }
      updatePeopleTabs();
    }
    function updatePeopleTabs() {
      for (const {button, mode} of tabs) {
        button.setAttribute('aria-pressed', String(mode === peopleMode));
        button.style.background = mode === peopleMode ? '#176341' : '#e5f2f7';
        button.style.color = mode === peopleMode ? '#fff' : '#123c50';
      }
      const select = document.getElementById('personSelect');
      const selectContainer = select?.parentElement;
      if (selectContainer) selectContainer.style.display = peopleMode === 'edicao' ? '' : 'none';
      const refresh = document.getElementById('refreshPeopleBtn');
      if (refresh) refresh.style.display = 'none';
      const embeddedGroups = document.getElementById('fsjGruposNaPessoas');
      if (embeddedGroups) embeddedGroups.style.display = 'none';
      const title = peoplePage.querySelector('h2');
      if (title) title.textContent = peopleMode === 'edicao' ? 'Edição de pessoas' : 'Cadastro central de pessoas';
    }
    for (const host of [peoplePage, groupsPage]) {
      const bar = document.createElement('div');
      bar.className = 'fsj-people-tabs';
      bar.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;margin:0 0 16px';
      for (const [mode, label] of [['cadastro','Cadastro'],['edicao','Edição'],['grupos','Grupos']]) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = label;
        button.style.cssText = 'border:1px solid #a9cbd7;border-radius:8px;padding:10px 18px;font-weight:700';
        button.addEventListener('click', () => choosePeopleMode(mode));
        bar.append(button);
        tabs.push({button,mode});
      }
      host.prepend(bar);
    }
    updatePeopleTabs();
    window.fsjOwnerPeopleGo = choosePeopleMode;
  }

  const positionSidebar = () => {
    sidebar.style.setProperty('--fsj-sidebar-top', `${header.getBoundingClientRect().height}px`);
  };
  positionSidebar();
  new ResizeObserver(positionSidebar).observe(header);
  new MutationObserver(sync).observe(menu, {
    childList: true, subtree: true, characterData: true,
    attributes: true, attributeFilter: ['disabled', 'hidden']
  });
  const views = new MutationObserver(sync);
  function observeViews() {
    views.disconnect();
    for (const view of panel.children) views.observe(view, {
      attributes: true, attributeFilter: ['class', 'hidden']
    });
    sync();
  }
  new MutationObserver(observeViews).observe(panel, {
    childList: true, attributes: true, attributeFilter: ['class', 'hidden']
  });
  document.addEventListener('fsj:ownership-updated', sync);
  document.addEventListener('fsj:entry-settled', sync);
  window.addEventListener('pageshow', sync);
  observeViews();
})();

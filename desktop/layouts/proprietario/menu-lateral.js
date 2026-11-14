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
      const button = createButton(textContent, '▸', () => {
        const option = [...menu.options].find(option => option.value === value);
        if (!eligible() || !useSidebar || !option || option.hidden || option.disabled || menu.disabled) return;
        window.fsjSimpleSelectGo(value);
        sync();
      });
      pages.set(value, button);
      entries.append(button);
    }
  }

  function sync() {
    const options = [...menu.options].filter(option => !option.hidden);
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
    const current = aliases[page] || page;
    for (const option of options) {
      const button = pages.get(option.value);
      button.disabled = menu.disabled || option.disabled;
      if (option.value === current) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    }
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

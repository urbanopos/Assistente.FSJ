const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const { chromium } = require('playwright');

const root = path.join(__dirname, '..');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const menu = fs.readFileSync(path.join(root, 'desktop/layouts/proprietario/menu-lateral.js'), 'utf8');
const supervision = fs.readFileSync(path.join(root, 'compartilhado/supervisao.min.js'), 'utf8');
const styles = Array.from(index.matchAll(/<style(?:\s[^>]*)?>[\s\S]*?<\/style>/g), match => match[0]).join('\n');
const executionPanel = index.match(/<div id="tarefasEmExecucao"[\s\S]*?<\/div><\/div>/)[0];
const pageMarkup = `<!doctype html><html lang="pt-BR"><head><meta name="viewport" content="width=device-width,initial-scale=1">${styles}</head><body>
  <header></header><main><div id="gestor"><div id="dashboard"><label>Texto de teste<input id="campoComVoz" type="text"></label></div>${executionPanel}</div></main>
  <select id="fsjSimpleSelect">
    <option value="dashboard">Início</option>
    <option value="tarefasEmExecucao">Tarefas em Execução</option>
  </select>
  <button id="brisaFab" class="brisa-fab" type="button">MarIA</button>
</body></html>`;

function sourceBetween(start, end) {
  const from = index.indexOf(start);
  const to = index.indexOf(end, from + start.length);
  assert.ok(from >= 0 && to > from, start);
  return index.slice(from, to);
}

const application = [
  sourceBetween('function navTo(id,b,record=true){', 'function fsjLimparSelecoesAoSair('),
  sourceBetween('function fsjTaskClass(', '\n'),
  sourceBetween('function fsjRestaurarFiltroExecucao(', '\nfunction fsjRenderTarefasEmExecucao('),
  sourceBetween('function fsjRenderTarefasEmExecucao(){', '\n}\n') + '\n}'
].join('\n');

const statuses = [
  ['Em aberto', 'normal', 'rgb(0, 0, 0)'],
  ['Em aberto', 'prioritaria', 'rgb(185, 28, 28)'],
  ['Em aberto', 'urgente', 'rgb(185, 28, 28)'],
  ['Pendente', 'normal', 'rgb(181, 138, 0)'],
  ['Concluída', 'normal', 'rgb(20, 83, 45)'],
  ['Em aberto', 'normal', 'rgb(21, 101, 192)'],
  ['Arquivado', 'urgente', 'rgb(255, 255, 255)']
];

async function openFixture(page, desktop) {
  await page.route('**/*', route => route.abort());
  await page.setContent(pageMarkup);
  await page.evaluate(({ desktop, statuses }) => {
    Object.assign(window, {
      FSJ_PLATFORM: { platform: desktop ? 'desktop' : 'celular' },
      fsjOwnerVerified: true,
      fsjPainelPronto: true,
      fsjFonteOperacionalConfirmada: true,
      fsjNavSequence: 0,
      currentPage: 'dashboard',
      fsjTemposExecucoes: [{ tarefa_id: '6', estado: 'em_andamento', iniciado_em: 'agora' }],
      ids: task => task.personIds,
      names: () => 'Pessoa fictícia',
      fsjFrequency: task => task.frequency,
      fsjFrequencyLabel: () => 'Pontual',
      fsjTarefaPeriodica: () => false,
      fsjDataHora: () => 'hoje',
      fsjOpenTaskDetails: code => { window.consultada = code; },
      editTask: id => { window.editada = id; },
      fsjSimpleSelectGo: id => window.navTo(id),
      fsjNavToShow(id) {
        window.currentPage = id;
        document.querySelectorAll('#gestor > div').forEach(view => {
          view.classList.toggle('hidden', view.id !== id);
        });
        if (id === 'tarefasEmExecucao') window.fsjRenderTarefasEmExecucao();
      },
      S: {
        people: [{ id: '1', name: 'Pessoa fictícia' }],
        groups: [],
        tasks: statuses.map(([status, priority], i) => ({
          id: String(i + 1), code: 'Tar-' + (i === 6 ? 17 : i + 1),
          text: 'Tarefa fictícia ' + (i + 1), frequency: 'pontual', status, priority, personIds: ['1']
        }))
      }
    });
    // O painel pode receber display inline durante a navegação. O rodapé continua no lugar.
    document.getElementById('tarefasEmExecucao').style.display = 'block';
  }, { desktop, statuses });
  await page.addScriptTag({ content: application });
  await page.addScriptTag({ content: menu });
  await page.addScriptTag({ content: supervision });
}

test('Desktop Proprietário usa o menu real, as cores vigentes e o centro do rodapé', async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1914, height: 912 } });
    await openFixture(page, true);
    const sidebar = page.locator('#fsjOwnerSidebar');
    const open = sidebar.getByRole('button', { name: 'Tarefas em Execução' });
    const status = page.locator('#fsjExecucaoStatus');
    const pager = page.locator('#fsjExecucaoPaginador');
    const count = pager.locator('strong');
    await open.click();
    assert.equal(await status.inputValue(), 'Em aberto');
    assert.equal(await count.textContent(), '1 / 2');
    await status.selectOption('');
    assert.equal(await count.textContent(), '1 / 4');
    await pager.getByRole('button', { name: '→' }).click();
    assert.equal(await count.textContent(), '2 / 4');

    const links = page.locator('#fsjExecucaoLista .fsj-task-number');
    const colors = await links.evaluateAll(nodes => nodes.map(node => getComputedStyle(node).color));
    assert.deepEqual(colors, statuses.map(([, , color]) => color));
    assert.equal(await links.nth(2).evaluate(node => getComputedStyle(node).animationName), 'fsjUrgentPulse');
    assert.equal(await links.last().evaluate(node => getComputedStyle(node).animationName), 'none');
    assert.equal(await links.last().evaluate(node => getComputedStyle(node).backgroundColor), 'rgb(107, 33, 168)');

    await open.click();
    assert.equal(await status.inputValue(), 'Em aberto');
    assert.equal(await count.textContent(), '1 / 2');
    await status.selectOption('');
    await sidebar.getByRole('button', { name: 'Início' }).click();
    await open.click();
    assert.equal(await status.inputValue(), 'Em aberto');

    const number = page.getByLabel('Número da tarefa',{exact:true});
    const list = page.locator('#fsjExecucaoLista');
    const numberLabel = page.locator('#fsjExecucaoNumeroLabel');
    assert.equal(await numberLabel.locator('.fsj-voice-button, .fsj-voice-field').count(), 0);
    assert.equal(await page.locator('#campoComVoz + .fsj-voice-button').count(), 1);
    const controlStyle = node => {
      const { height, padding, border, borderRadius } = getComputedStyle(node);
      return { height, padding, border, borderRadius };
    };
    assert.deepEqual(await number.evaluate(controlStyle), await page.locator('#fsjArquivoPessoa').evaluate(controlStyle));
    const person = page.locator('#fsjArquivoPessoa');
    await person.selectOption('1');
    await page.locator('#fsjExecucaoCategorias button[value="grupo"]').click();
    assert.equal(await number.locator('xpath=..').evaluate(el => el.nextElementSibling.querySelector('select').id), 'fsjArquivoPessoa');
    const suggestions = await page.locator('#fsjExecucaoNumeros option').evaluateAll(options => options.map(option => option.value));
    assert.deepEqual(suggestions, ['Tar-17', 'Tar-6', 'Tar-5', 'Tar-4', 'Tar-3', 'Tar-2', 'Tar-1']);
    await number.fill('0017');
    assert.equal(await list.locator('article').count(), 1);
    assert.ok(await list.locator('.fsj-task-archived').isVisible());
    assert.equal(await list.getByText('ARQUIVADA', { exact: true }).count(), 0);
    await list.locator('.fsj-task-number').click();
    assert.equal(await page.evaluate(() => window.consultada), 'Tar-17');
    assert.equal(await list.getByRole('button', { name: 'Editar' }).count(), 0);
    await number.fill('Tar-000002 P');
    assert.equal(await list.locator('article').count(), 1);
    await list.getByRole('button', { name: 'Editar' }).click();
    assert.equal(await page.evaluate(() => window.editada), '2');
    await number.fill('9999');
    assert.match(await list.textContent(), /Nenhuma tarefa encontrada para esse número/);
    await open.click();
    assert.equal(await number.inputValue(), '');
    assert.equal(await status.inputValue(), 'Em aberto');
    await page.locator('#fsjExecucaoCategorias button[value="grupo"]').click();

    for (const viewport of [{ width: 1914, height: 912 }, { width: 1280, height: 720 }]) {
      await page.setViewportSize(viewport);
      const controls = await page.locator('#fsjArquivoFiltros select, #fsjExecucaoNumero, #fsjExecucaoCategorias button').evaluateAll(nodes =>
        nodes.map(node => node.getBoundingClientRect().bottom));
      assert.equal(controls.length, 6);
      assert.ok(Math.max(...controls) - Math.min(...controls) < 2, 'Filtros e categorias devem ficar na mesma linha');
      const panel = await page.locator('#tarefasEmExecucao').boundingBox();
      const avatar = await page.locator('#brisaFab').boundingBox();
      const footer = await pager.boundingBox();
      const back = await pager.getByRole('button', { name: '←' }).boundingBox();
      const indicator = await count.boundingBox();
      const next = await pager.getByRole('button', { name: '→' }).boundingBox();
      assert.ok(Math.abs(panel.x + panel.width / 2 - footer.x - footer.width / 2) < 2, 'Paginador deve ficar centralizado');
      const bottomGap = panel.y + panel.height - footer.y - footer.height;
      assert.ok(bottomGap >= 0 && bottomGap < 35, 'Paginador deve ficar no rodapé');
      assert.ok(back.x + back.width < indicator.x && indicator.x + indicator.width < next.x);
      assert.ok(Math.abs(back.y - next.y) < 2 && next.x + next.width < avatar.x);
    }
    await status.evaluate(select => {
      [...select.options].find(option => option.value === 'Pendente').value = 'Sem resultados';
      select.value = 'Sem resultados';
      select.dispatchEvent(new Event('change'));
    });
    assert.equal(await pager.isVisible(), false);
  } finally {
    await browser.close();
  }
});

test('Celular conserva seus seletores de executor e grupo', async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 393, height: 800 }, isMobile: true });
    await openFixture(page, false);
    await page.evaluate(() => window.navTo('tarefasEmExecucao'));
    assert.equal(await page.locator('#fsjArquivoPessoa').count(), 1);
    assert.equal(await page.locator('#fsjArquivoGrupo').count(), 1);
    assert.equal(await page.locator('#fsjExecucaoStatus').count(), 0);
    assert.equal(await page.locator('#fsjExecucaoNumero').count(), 0);
    assert.equal(await page.locator('.fsj-owner-execution-desktop').count(), 0);
  } finally {
    await browser.close();
  }
});

test('ficha da tarefa mostra situação, ações e pausas no Desktop e no Celular', async () => {
  const browser = await chromium.launch();
  try {
    for (const viewport of [{ width: 1440, height: 900 }, { width: 393, height: 800 }]) {
      const page = await browser.newPage({ viewport });
      await page.route('**/*', route => route.abort());
      await page.setContent('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1">');
      await page.evaluate(() => {
        const day = '2026-11-17';
        Object.assign(window, {
          withPause: true,
          person: () => ({ name: 'Pessoa fictícia' }),
          fsjDia: () => day,
          fsjDataHora: value => value.toISOString(),
          fsjIntervaloHoras: () => '',
          api(path) {
            if (path.startsWith('/rest/v1/tarefas?')) {
              return [{ descricao: 'Descrição integral da tarefa', situacao: 'Em aberto' }];
            }
            if (!window.withPause) return [];
            if (path.startsWith('/rest/v1/execucoes_tarefa?')) {
              return [{ pessoa_id: '1', dia: day, estado: 'suspensa', suspenso_em: day + 'T13:00:00Z' }];
            }
            if (path.startsWith('/rest/v1/execucoes_historico?')) {
              return [
                { pessoa_id: '1', dia: day, acao: 'suspender', criado_em: day + 'T13:00:00Z' },
                { pessoa_id: '1', dia: day, acao: 'suspender', criado_em: day + 'T11:00:00Z' }
              ];
            }
            return [];
          },
          editTask(id) { window.editada = id; },
          delTask(id) { window.excluida = id; },
          windowOwnerActions() {
            return window.fsjAcoesPontuaisProprietario({ id: 'ficticia', frequency: 'pontual' });
          },
          fsjOwnerVerified: true,
          fsjTarefaPeriodica: () => false
        });
      });
      const ownerActions = sourceBetween('function fsjAcoesPontuaisProprietario(t){', '\nfunction fsjRestaurarFiltroExecucao(');
      await page.addScriptTag({ path: path.join(root, 'task-list-ui.js') });
      await page.addScriptTag({ path: path.join(root, 'task-detail-manager.js') });
      await page.addScriptTag({ content: ownerActions });
      const open = () => page.evaluate(() => window.fsjOpenTaskDetails(
        'Tar-000015', 'Descrição inicial', 'Responsável fictício',
        () => window.fsjLoadTaskDetails('ficticia'), 'pontual', window.windowOwnerActions
      ));
      await open();
      const dialog = page.locator('#fsj-task-detail');
      const status = dialog.locator('#fsj-task-detail-current-status');
      assert.equal(await dialog.locator('#fsj-task-detail-description').textContent(), 'Descrição integral da tarefa');
      assert.equal(await status.textContent(), 'Situação: Suspensa');
      assert.equal(await dialog.locator('#fsj-task-detail-history > ul li').count(), 2);
      assert.equal(await dialog.getByText('Execução — histórico', { exact: true }).isVisible(), false);
      await dialog.getByText('Histórico e registros', { exact: true }).click();
      assert.equal(await dialog.getByText('Execução — histórico', { exact: true }).isVisible(), true);
      for (const label of ['Editar', 'Concluir', 'Excluir']) {
        assert.equal(await dialog.getByRole('button', { name: label, exact: true }).count(), 1);
      }
      await dialog.getByRole('button', { name: 'Editar', exact: true }).click();
      assert.equal(await page.evaluate(() => window.editada), 'ficticia');
      await page.evaluate(() => { window.withPause = false; });
      await open();
      assert.equal(await status.textContent(), 'Situação: Em aberto');
      assert.equal(await dialog.getByText('Pausas', { exact: true }).count(), 0);
      assert.equal(await dialog.locator('#fsj-task-detail-history > details').evaluate(el => el.open), false);
      await page.close();
    }
  } finally {
    await browser.close();
  }
});

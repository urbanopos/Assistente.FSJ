// FSJ-ACESSO-001 — verificação estática de invariantes de acesso.
// Execute: node --test tests/fsj-acesso.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = p => readFileSync(new URL('../' + p, import.meta.url), 'utf8');

test('regra oficial permanece no repositório', () => {
 const rule = read('REGRAS_PERMANENTES_FSJ.md');
 for(const term of ['FSJ-ACESSO-001','data de envio','autorização','Celular','Desktop','revogad']) assert.ok(rule.includes(term), 'Regra ausente: '+term);
});
test('entrada móvel consulta identidade central antes de escolher INDEX', () => {
 const entry = read('entrada-index-celular.html');
 assert.match(entry, /post\('fsj-index-identidade',\{token\}\)/);
 assert.match(entry, /d\.supervisao===true\?'supervisor'/);
 assert.doesNotMatch(entry, /\/supervisor\/\.test\(role\)\?'supervisor'/);
 assert.match(entry, /\.\/celular\/layouts\/.*index\.html/);
});
test('executor não habilita supervisão por nome de perfil', () => {
 const executor = read('celular/layouts/executor/index.html');
 assert.match(executor, /identity\.supervisao===true/);
 assert.match(executor, /if\(false\)\{el\('supervision'\)/);
});
test('supervisor exige autorização central mesmo com rótulo Supervisor', () => {
 const supervisor = read('celular/layouts/supervisor/index.html');
 assert.match(supervisor, /const canSupervise=identity\.supervisao===true/);
 assert.match(supervisor, /if\(!canSupervise\)throw Error/);
 assert.match(supervisor, /if\(canSupervise\)\{el\('supervision'\)/);
 assert.doesNotMatch(supervisor, /if\(canSupervise\|\|isSupervisor\)/);
});

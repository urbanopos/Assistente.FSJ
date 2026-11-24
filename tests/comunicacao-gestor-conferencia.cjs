'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const file = 'desktop/layouts/proprietario/menu-lateral.js';
const source = fs.readFileSync(file,'utf8');

test('script de menu lateral compila', () => {
  new vm.Script(source,{filename:file});
});
test('Comunicacao Gestor somente no menu do proprietario desktop', () => {
  assert.match(source,/FSJ_PLATFORM\?\.platform !== 'desktop'/);
  assert.match(source,/function eligible\(\)/);
  assert.match(source,/fsjOwnerVerified === true/);
  assert.match(source,/value === 'whatsapp' \? 'Comunicação Gestor'/);
});
test('confere destino exato e nao armazena token', () => {
  assert.match(source,/url\.origin !== 'https:\/\/urbanopos\.github\.io'/);
  assert.match(source,/celular\/layouts\/gestor\/index\.html/);
  assert.match(source,/URLSearchParams\(url\.hash/);
  assert.match(source,/gestorLinkInput\.value = ''/);
  assert.match(source,/gestorFrame\.removeAttribute\('src'\)/);
  assert.doesNotMatch(source,/localStorage\.setItem\(['"]fsjGestor/);
});
test('nao altera disparo emergencial nem navegacao historica', () => {
  assert.match(source,/window\.fsjSimpleSelectGo\(value\)/);
  assert.match(source,/window\.fsjOwnerPeopleGo\('edicao'\)/);
  assert.match(source,/__manutencao/);
});

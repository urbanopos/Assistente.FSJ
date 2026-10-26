const fs = require('node:fs');
const assert = require('node:assert/strict');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const bar = html.match(/<div[^>]*id="fsjSimpleBar"[^>]*>([\s\S]*?)<\/div>/);
assert.ok(bar, 'Barra simplificada ausente');
const nav = bar[1];
const markers = [
  'onclick="fsjSimpleStep(-1)"',
  "onclick=\"fsjSimpleGo('dashboard')\"",
  'onclick="fsjSimpleStep(1)"',
  'Menu Principal:'
];
const indexes = markers.map(x => nav.indexOf(x));
assert.ok(indexes.every(x => x >= 0), 'Botão ou rótulo ausente');
assert.ok(indexes.every((x, i) => i === 0 || x > indexes[i - 1]), 'Ordem de navegação alterada');
assert.equal((nav.match(/<svg\b/g) || []).length, 3, 'Esperados três ícones SVG');
assert.match(html, /#fsjSimpleBar \.fsj-simple-icon\{[^}]*#102f69/i, 'Estilo dos ícones alterado');
console.log('Contrato de navegação FSJ preservado.');

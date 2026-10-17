import {test} from 'node:test';import assert from 'node:assert/strict';
import {renderDailyCard,dailyCardHtml} from './daily-message.mjs';
test('cartão tem data e fecha página mesmo se renderização falhar',async()=>{
 assert.match(dailyCardHtml('18/10/2026'),/GESTÃO DE TAREFAS 18\/10\/2026/);
 assert.throws(()=>dailyCardHtml('<script>'));
 let closed=false;
 const browser={newPage:async()=>({setViewport:async()=>{},setJavaScriptEnabled:async()=>{},setContent:async()=>{throw Error('render failed');},close:async()=>{closed=true;}})};
 await assert.rejects(renderDailyCard(browser,'18/10/2026'),/render failed/);assert.ok(closed);
});

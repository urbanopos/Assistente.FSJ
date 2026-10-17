export const DAILY_LAYOUT_START = '2026-10-18';
export function dailyMessage({day,name='',boardUrl,supervisionUrl}) {
 const date=day.split('-').reverse().join('/');
 const safeName=String(name).replace(/[\r\n*_~`]/g,' ').trim();
 return ['*Fazenda São José*',`GESTÃO DE TAREFAS ${date}`,'',safeName?`Bom dia, ${safeName}!`:'Bom dia!','','*CONSULTA TAREFAS*',boardUrl,'Consulte e atualize suas tarefas.',...(supervisionUrl?['','*TAREFAS DE TERCEIROS*',supervisionUrl,'Acompanhe as tarefas dos seus supervisionados.']:[])].join('\n');
}
export function dailyCardHtml(date) {
 if(!/^\d{2}\/\d{2}\/\d{4}$/.test(date))throw Error('Data do cartão inválida.');
 return `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><style>body{margin:0;background:#efeae2;font-family:Arial,sans-serif;color:#213c29;padding:20px}.card{background:#eaf3e7;border-radius:16px;overflow:hidden}header{padding:30px}h1{font-size:30px;margin:0 0 12px}p{font-size:19px;margin:0}.stripe{background:#dfc477;padding:20px 30px;font-size:22px;font-weight:bold}</style><div class="card"><header><h1>Fazenda São José</h1><p>GESTÃO DE TAREFAS ${date}</p></header><div class="stripe">SUAS TAREFAS DO DIA</div></div></html>`;
}
export async function renderDailyCard(browser,date) {
 const page=await browser.newPage();
 try {
  await page.setViewport({width:640,height:240,deviceScaleFactor:1});
  await page.setJavaScriptEnabled(false);
  await page.setContent(dailyCardHtml(date),{waitUntil:'domcontentloaded',timeout:10000});
  return await page.screenshot({type:'png',fullPage:true});
 } finally {await page.close();}
}

$ErrorActionPreference = 'Stop'
$pastaFSJ = 'C:\Users\urban\Assistente.fsj\automation'
$nodeFSJ = 'C:\Program Files\nodejs\node.exe'
$utf8FSJ = New-Object System.Text.UTF8Encoding($false)
foreach($variavelFSJ in @('FSJ_STATE_DIR','SUPABASE_SERVICE_ROLE_KEY')) {
 if (![Environment]::GetEnvironmentVariable($variavelFSJ,'Process')) {
  $valorFSJ = [Environment]::GetEnvironmentVariable($variavelFSJ,'User')
  if (!$valorFSJ) { $valorFSJ = [Environment]::GetEnvironmentVariable($variavelFSJ,'Machine') }
  if (!$valorFSJ) { throw "Configuracao $variavelFSJ ausente. Nada enviado. Nao publique senhas nem chaves." }
  [Environment]::SetEnvironmentVariable($variavelFSJ,$valorFSJ,'Process')
 }
}
if(Test-Path (Join-Path $env:FSJ_STATE_DIR 'routine.lock')) { throw 'Outra rotina pode estar em execucao. Nao alterei os modulos nem enviei mensagens.' }
$moduloFSJ = Join-Path $pastaFSJ 'card-bundle.mjs'
$pdfFSJ = Join-Path $pastaFSJ 'compact-card-pdf.mjs'
$configFSJ = Join-Path $pastaFSJ 'fsj-card-mode.json'
$textoFSJ = [IO.File]::ReadAllText($moduloFSJ)
$geradorFSJ = [IO.File]::ReadAllText($pdfFSJ)
if (!$textoFSJ.Contains('export async function transmitCard(') -or !$textoFSJ.Contains('prepareCard')) { throw 'Modulo diferente do esperado. Nada alterado.' }
if (!$geradorFSJ.Contains("urlFor(boardUrl, 'quadro.html')") -or !$geradorFSJ.Contains("urlFor(supervisionUrl, 'supervisor.html')")) { throw 'Destinos diferentes do esperado. Nada alterado.' }
foreach($nomeFSJ in @('card-bundle.mjs','fsj-access-caption.mjs','fsj-emergencia-legenda.mjs')) {
 & $nodeFSJ --check (Join-Path $PSScriptRoot $nomeFSJ)
 if($LASTEXITCODE -ne 0) { throw 'Pacote com erro de sintaxe. Nada alterado.' }
}
$backupFSJ = Join-Path $pastaFSJ ('backup-legenda-web-' + (Get-Date -Format 'yyyyMMdd-HHmmss'))
New-Item -ItemType Directory -Path $backupFSJ | Out-Null
foreach($nomeFSJ in @('card-bundle.mjs','compact-card-pdf.mjs','fsj-card-mode.json','fsj-access-caption.mjs','fsj-emergencia-legenda.mjs')) { $origemFSJ=Join-Path $pastaFSJ $nomeFSJ; if(Test-Path $origemFSJ){Copy-Item $origemFSJ $backupFSJ} }
$geradorFSJ = $geradorFSJ.Replace("label: 'CONSULTA TAREFAS'", "label: 'CONSULTAR TAREFAS'")
foreach($nomeFSJ in @('card-bundle.mjs','fsj-access-caption.mjs','fsj-emergencia-legenda.mjs')) { Copy-Item (Join-Path $PSScriptRoot $nomeFSJ) (Join-Path $pastaFSJ $nomeFSJ) -Force }
[IO.File]::WriteAllText($pdfFSJ,$geradorFSJ,$utf8FSJ)
[IO.File]::WriteAllText($configFSJ,'{"enabled":true,"daily":true,"days":[],"layout":"pdf-legenda-web-v2"}',$utf8FSJ)
Write-Host "PDF unico com links diretos na legenda instalado para os disparos diarios. Backup: $backupFSJ"
Write-Host 'Iniciando substituicao de hoje. Os envios desta nova rodada serao registrados individualmente.'
Push-Location $pastaFSJ
try { & $nodeFSJ '.\fsj-emergencia-legenda.mjs'; if($LASTEXITCODE -ne 0){throw 'Substituicao parcial ou bloqueada. Envie o resultado exibido, sem chaves.'} } finally { Pop-Location }

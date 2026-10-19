$ErrorActionPreference='Stop'
$pastaFSJ='C:\Users\urban\Assistente.fsj\automation'
$nodeFSJ='C:\Program Files\nodejs\node.exe'
$utf8FSJ=New-Object System.Text.UTF8Encoding($false)
foreach($nomeFSJ in @('FSJ_STATE_DIR','SUPABASE_SERVICE_ROLE_KEY')) {
 if(![Environment]::GetEnvironmentVariable($nomeFSJ,'Process')) {
  $valorFSJ=[Environment]::GetEnvironmentVariable($nomeFSJ,'User');if(!$valorFSJ){$valorFSJ=[Environment]::GetEnvironmentVariable($nomeFSJ,'Machine')}
  if(!$valorFSJ){throw "Configuracao $nomeFSJ ausente; nada enviado. Nao publique seu valor."}
  [Environment]::SetEnvironmentVariable($nomeFSJ,$valorFSJ,'Process')
 }
}
if(Test-Path (Join-Path $env:FSJ_STATE_DIR 'routine.lock')){throw 'Outra rotina pode estar em execucao. Nada alterado.'}
$coreFSJ=[IO.File]::ReadAllText((Join-Path $pastaFSJ 'core.mjs'))
$waFSJ=[IO.File]::ReadAllText((Join-Path $pastaFSJ 'wa.mjs'))
$rotinaFSJ=[IO.File]::ReadAllText((Join-Path $pastaFSJ 'routine.mjs'))
$inicioFSJ=$coreFSJ.IndexOf('export async function cycle(')
$fimFSJ=$coreFSJ.IndexOf('export function isDayOff(')
if($inicioFSJ -lt 0 -or $fimFSJ -le $inicioFSJ){throw 'Core diferente do esperado. Nada alterado.'}
if(([regex]::Matches($coreFSJ.Substring($inicioFSJ,$fimFSJ-$inicioFSJ),'(?m)^export ')).Count -ne 1){throw 'Funcoes adicionais no core; nada alterado.'}
$coreFSJ=$coreFSJ.Substring(0,$inicioFSJ)+[IO.File]::ReadAllText((Join-Path $PSScriptRoot 'core-cycle.txt'))+$coreFSJ.Substring($fimFSJ)
if(!$coreFSJ.Contains('import {cycleWithFollowup as fsjCycleWithFollowup}')){$coreFSJ="import {cycleWithFollowup as fsjCycleWithFollowup} from './fsj-delivery-policy.mjs';`n"+$coreFSJ}
$alvoFSJ='await cycle({state,previous,persist,record,url,'
$novoFSJ='await cycle({state,previous,persist,record,url,personId:person.id,day,'
if($rotinaFSJ.Contains($novoFSJ)){}elseif(([regex]::Matches($rotinaFSJ,[regex]::Escape($alvoFSJ))).Count -eq 1){$rotinaFSJ=$rotinaFSJ.Replace($alvoFSJ,$novoFSJ)}else{throw 'Rotina diferente do esperado. Nada alterado.'}
$inicioSendFSJ=$waFSJ.IndexOf('export async function send(')
if($inicioSendFSJ -lt 0 -or ([regex]::Matches($waFSJ.Substring($inicioSendFSJ),'(?m)^export ')).Count -ne 1){throw 'Transporte diferente do esperado. Nada alterado.'}
$waFSJ=$waFSJ.Substring(0,$inicioSendFSJ)+"export async function send(client,chatId,text,onPart){return await fsjSendDaily(client,chatId,text,onPart);}`n"
if(!$waFSJ.Contains('import {sendDaily as fsjSendDaily}')){$waFSJ="import {sendDaily as fsjSendDaily} from './fsj-send-daily.mjs';`n"+$waFSJ}
# Retira a dependencia do transporte PDF; os arquivos ficam preservados ate confirmar a rodada.
$waFSJ=[regex]::Replace($waFSJ,'(?m)^import[^\r\n]*from [''"]\./card-bundle\.mjs[''"];?\r?\n','')
$alteracoesFSJ=@{'core.mjs'=$coreFSJ;'wa.mjs'=$waFSJ;'routine.mjs'=$rotinaFSJ}
foreach($nomeFSJ in $alteracoesFSJ.Keys){$tempFSJ=Join-Path $pastaFSJ ('verificar-'+$nomeFSJ);[IO.File]::WriteAllText($tempFSJ,$alteracoesFSJ[$nomeFSJ],$utf8FSJ);& $nodeFSJ --check $tempFSJ;if($LASTEXITCODE -ne 0){throw 'Erro de sintaxe; originais preservados.'}}
foreach($nomeFSJ in @('fsj-delivery-policy.mjs','fsj-send-daily.mjs','fsj-emergencia-legenda.mjs','fsj-access-caption.mjs')){& $nodeFSJ --check (Join-Path $PSScriptRoot $nomeFSJ);if($LASTEXITCODE -ne 0){throw 'Pacote invalido; originais preservados.'}}
$backupFSJ=Join-Path $pastaFSJ ('backup-retorno-web-'+(Get-Date -Format 'yyyyMMdd-HHmmss'));New-Item -ItemType Directory $backupFSJ|Out-Null
foreach($nomeFSJ in @('core.mjs','wa.mjs','routine.mjs','fsj-delivery-policy.mjs','fsj-send-daily.mjs','fsj-emergencia-legenda.mjs','fsj-access-caption.mjs')){if(Test-Path (Join-Path $pastaFSJ $nomeFSJ)){Copy-Item (Join-Path $pastaFSJ $nomeFSJ) $backupFSJ}}
foreach($nomeFSJ in $alteracoesFSJ.Keys){Move-Item (Join-Path $pastaFSJ ('verificar-'+$nomeFSJ)) (Join-Path $pastaFSJ $nomeFSJ) -Force}
foreach($nomeFSJ in @('fsj-delivery-policy.mjs','fsj-send-daily.mjs','fsj-emergencia-legenda.mjs','fsj-access-caption.mjs')){Copy-Item (Join-Path $PSScriptRoot $nomeFSJ) (Join-Path $pastaFSJ $nomeFSJ) -Force}
Write-Host "Formato web sem PDF instalado: ate 5 tentativas de apagamento; falha gera tarefa do proprietario e nao impede o envio. Backup: $backupFSJ"
Write-Host 'Nova rodada web para os participantes habilitados, incluindo novos integrantes. Reexecucao nao repete os confirmados.'
Push-Location $pastaFSJ
try{& $nodeFSJ '.\fsj-emergencia-legenda.mjs';if($LASTEXITCODE -ne 0){throw 'Ha pendencias; envie o resultado, sem chaves.'}}finally{Pop-Location}
# Somente apos sucesso integral da substituicao, arquivar definitivamente os modulos PDF.
[IO.File]::WriteAllText((Join-Path $pastaFSJ 'fsj-card-mode.json'),'{"enabled":false,"daily":false,"days":[],"layout":"web-sem-pdf"}',$utf8FSJ)
foreach($nomeFSJ in @('card-bundle.mjs','compact-card-pdf.mjs')){if(Test-Path (Join-Path $pastaFSJ $nomeFSJ)){Move-Item (Join-Path $pastaFSJ $nomeFSJ) (Join-Path $backupFSJ $nomeFSJ) -Force}}
Write-Host 'Substituicao confirmada para todos os participantes elegiveis. Modulos PDF retirados do envio diario e preservados somente no backup.'

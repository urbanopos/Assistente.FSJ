$ErrorActionPreference='Stop'
$pastaFSJ='C:\Users\urban\Assistente.fsj\automation'
$utf8FSJ=New-Object System.Text.UTF8Encoding($false)
if(Test-Path (Join-Path $env:FSJ_STATE_DIR 'routine.lock')){throw 'Rotina em andamento. Aguarde antes de atualizar os backups.'}
$nomesFSJ=@('wa.mjs','core.mjs','routine.mjs','fsj-send-daily.mjs','fsj-delivery-policy.mjs','fsj-access-caption.mjs','fsj-emergencia-legenda.mjs')
foreach($nomeFSJ in $nomesFSJ){if(!(Test-Path (Join-Path $pastaFSJ $nomeFSJ))){throw "Arquivo atual ausente: $nomeFSJ. Nada alterado."}}
$transporteFSJ=[IO.File]::ReadAllText((Join-Path $pastaFSJ 'fsj-send-daily.mjs'))
if($transporteFSJ.Contains('application/pdf') -or $transporteFSJ.Contains('prepareCard') -or $transporteFSJ.Contains('cardEnabled')){throw 'Transporte atual ainda referencia PDF. Nada alterado.'}
$backupsFSJ=@(Get-ChildItem -LiteralPath $pastaFSJ -Directory -Filter 'backup*')
# Os backups conservam os demais arquivos. Somente o transporte antigo e substituido.
foreach($backupFSJ in $backupsFSJ){
 foreach($nomeFSJ in $nomesFSJ){Copy-Item -LiteralPath (Join-Path $pastaFSJ $nomeFSJ) -Destination (Join-Path $backupFSJ.FullName $nomeFSJ) -Force}
 [IO.File]::WriteAllText((Join-Path $backupFSJ.FullName 'fsj-card-mode.json'),'{"enabled":false,"daily":false,"days":[],"layout":"web-sem-pdf"}',$utf8FSJ)
 foreach($arquivoFSJ in @(Get-ChildItem -LiteralPath $backupFSJ.FullName -Recurse -File | Where-Object {$_.Name -in @('card-bundle.mjs','compact-card-pdf.mjs')})){Remove-Item -LiteralPath $arquivoFSJ.FullName -Force}
 [IO.File]::WriteAllText((Join-Path $backupFSJ.FullName 'RESTAURACAO-WEB.txt'),'Transporte atualizado para web sem PDF em '+(Get-Date -Format s)+'. Os demais arquivos deste backup foram preservados.',$utf8FSJ)
 Write-Host ('Backup atualizado: '+$backupFSJ.Name)
}
foreach($nomeFSJ in @('card-bundle.mjs','compact-card-pdf.mjs')){if(Test-Path (Join-Path $pastaFSJ $nomeFSJ)){Remove-Item -LiteralPath (Join-Path $pastaFSJ $nomeFSJ) -Force}}
[IO.File]::WriteAllText((Join-Path $pastaFSJ 'fsj-card-mode.json'),'{"enabled":false,"daily":false,"days":[],"layout":"web-sem-pdf"}',$utf8FSJ)
Write-Host ('Concluido: '+$backupsFSJ.Count+' backups locais atualizados para envio web. Nenhuma mensagem enviada.')
Write-Host 'Pacotes ZIP antigos, copias fora desta pasta e historico Git nao foram alterados. Nao reinstale os antigos pacotes PDF.'

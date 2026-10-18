$ErrorActionPreference = 'Stop'
$pastaSenhasFSJ = Join-Path $env:LOCALAPPDATA 'FSJ-Recuperacao-Senha'
$urlSenhasFSJ = 'https://raw.githubusercontent.com/urbanopos/Assistente.FSJ/main/automation/password-recovery/'
$nodeSenhasFSJ = (Get-Command node -ErrorAction Stop).Source
$npmSenhasFSJ = (Get-Command npm.cmd -ErrorAction Stop).Source
if ([int]((& $nodeSenhasFSJ -p 'process.versions.node.split(String.fromCharCode(46))[0]') | Select-Object -Last 1) -lt 22) { throw 'Necessario Node 22 ou superior.' }
New-Item -ItemType Directory -Path $pastaSenhasFSJ -Force | Out-Null
$contaSenhasFSJ = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
& icacls.exe $pastaSenhasFSJ /inheritance:r /grant:r "${contaSenhasFSJ}:(OI)(CI)F" '*S-1-5-18:(OI)(CI)F' | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'Nao foi possivel proteger a pasta privada.' }

# Atualizar somente o processo dedicado de recuperacao.
$tarefaSenhasFSJ = Get-ScheduledTask -TaskName 'FSJ-Recuperacao-Senha' -ErrorAction SilentlyContinue
if ($tarefaSenhasFSJ) { Stop-ScheduledTask -TaskName 'FSJ-Recuperacao-Senha' -ErrorAction SilentlyContinue }
Start-Sleep -Seconds 2
$hashesSenhasFSJ = @{'worker.mjs'='2e387961be01a0a77b8fcfbfba04970b318fac8c9262ee53917fe3eb7c7d934a';'package.json'='e93e59fdd60982c1543597955ddcd2c4a3e11f22d2398d25613cd46cddd6bbf2'}
foreach ($nomeSenhasFSJ in @('worker.mjs','package.json')) {
    Invoke-WebRequest -UseBasicParsing -Uri ($urlSenhasFSJ + $nomeSenhasFSJ) -OutFile (Join-Path $pastaSenhasFSJ $nomeSenhasFSJ)
    if ((Get-FileHash (Join-Path $pastaSenhasFSJ $nomeSenhasFSJ) -Algorithm SHA256).Hash.ToLowerInvariant() -ne $hashesSenhasFSJ[$nomeSenhasFSJ]) { throw 'Arquivo de recuperacao nao validado.' }
}
$configSenhasFSJ = & ssh.exe urbano@192.168.77.2 "cd /home/urbano/fsj-video-v001 && python3 -c 'import recovery,server,json; print(json.dumps(recovery.export_config(server)))'"
if ($LASTEXITCODE -ne 0) { throw 'Instale primeiro o ajuste de recuperacao na VM.' }
$jsonSenhasFSJ = ($configSenhasFSJ -join "`n") | ConvertFrom-Json
if (-not $jsonSenhasFSJ.secret -or -not $jsonSenhasFSJ.ca) { throw 'Configuracao da VM incompleta.' }
[IO.File]::WriteAllText((Join-Path $pastaSenhasFSJ 'config.json'), ($jsonSenhasFSJ | ConvertTo-Json), [Text.UTF8Encoding]::new($false))
$configSenhasFSJ = $null
$jsonSenhasFSJ = $null
Push-Location $pastaSenhasFSJ
try {
    & $npmSenhasFSJ install --omit=dev --no-audit --no-fund
    if ($LASTEXITCODE -ne 0) { throw 'Falha ao instalar dependencias do WhatsApp de recuperacao.' }
    Write-Host 'Na janela que abrira, vincule o WhatsApp que enviara os codigos.'
    Write-Host 'No celular: WhatsApp > Aparelhos conectados > Conectar aparelho.'
    & $nodeSenhasFSJ (Join-Path $pastaSenhasFSJ 'worker.mjs') --link
    if ($LASTEXITCODE -ne 0) { throw 'Vinculo WhatsApp nao concluido.' }
} finally { Pop-Location }
$acaoSenhasFSJ = New-ScheduledTaskAction -Execute $nodeSenhasFSJ -Argument ('"' + (Join-Path $pastaSenhasFSJ 'worker.mjs') + '"') -WorkingDirectory $pastaSenhasFSJ
$gatilhoSenhasFSJ = New-ScheduledTaskTrigger -AtLogOn -User $contaSenhasFSJ
$principalSenhasFSJ = New-ScheduledTaskPrincipal -UserId $contaSenhasFSJ -LogonType Interactive -RunLevel Limited
$opcoesSenhasFSJ = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit ([TimeSpan]::Zero) -MultipleInstances IgnoreNew -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1)
Register-ScheduledTask -TaskName 'FSJ-Recuperacao-Senha' -Action $acaoSenhasFSJ -Trigger $gatilhoSenhasFSJ -Principal $principalSenhasFSJ -Settings $opcoesSenhasFSJ -Force | Out-Null
Start-ScheduledTask -TaskName 'FSJ-Recuperacao-Senha'
Write-Host 'INSTALADO: envio automatico de codigos pelo WhatsApp, independente da rotina das 7h.'
Write-Host 'No Reserva, como Proprietario: selecione Regina e use Confirmar WhatsApp de recuperacao.'
Write-Host 'O Windows deve permanecer ligado, com sua sessao iniciada e o WhatsApp vinculado.'
Write-Host 'O primeiro envio real ainda precisa ser testado no celular destinatario.'

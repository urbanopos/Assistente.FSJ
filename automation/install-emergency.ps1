$ErrorActionPreference = 'Stop'
$automation = $PSScriptRoot
$stateDir = $env:FSJ_STATE_DIR
if (-not $stateDir) { throw 'FSJ_STATE_DIR nao configurada neste usuario.' }
$secretFile = Join-Path $stateDir 'chave-agendamento.xml'
if (-not (Test-Path $secretFile)) { throw 'Chave protegida do executor nao localizada.' }
$existing = Get-ScheduledTask -TaskName 'FSJ-Tarefas-07h'
$userId = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
if ($existing.Principal.UserId -ne $userId -and $existing.Principal.UserId -ne [System.Security.Principal.WindowsIdentity]::GetCurrent().User.Value) { throw 'Execute no mesmo usuario Windows da tarefa das 7h.' }
$runner = Join-Path $stateDir 'fsj-7h.ps1'
if (-not ((Get-Content $runner -Raw) -match 'run-retries\.mjs')) { throw 'A rotina de cinco tentativas precisa estar instalada antes da emergencia.' }
$nodePath = (Get-Command node.exe).Source
foreach ($name in @('emergency-worker.mjs','run-retries.mjs')) { if (-not (Test-Path (Join-Path $automation $name))) { throw "Arquivo ausente: $name" } }
$scriptPath = Join-Path $stateDir 'fsj-emergencia.ps1'
if (Test-Path $scriptPath) { Copy-Item $scriptPath ($scriptPath + '.backup-' + (Get-Date -Format yyyyMMddHHmmss)) }
@'
param([string]$NodePath,[string]$AutomationDir)
$ErrorActionPreference = 'Stop'
try {
 $env:FSJ_STATE_DIR = $PSScriptRoot
 $secret = Import-Clixml (Join-Path $PSScriptRoot 'chave-agendamento.xml')
 $cred = New-Object System.Management.Automation.PSCredential('fsj',$secret)
 $env:SUPABASE_SERVICE_ROLE_KEY = $cred.GetNetworkCredential().Password
 Set-Location $AutomationDir
 $ErrorActionPreference = 'Continue'
 & $NodePath .\emergency-worker.mjs *>> (Join-Path $PSScriptRoot 'emergencia.log')
 exit $LASTEXITCODE
} catch { exit 1 }
'@ | Set-Content -Path $scriptPath -Encoding UTF8
$argsTask = '-NoProfile -NonInteractive -ExecutionPolicy Bypass -File "{0}" -NodePath "{1}" -AutomationDir "{2}"' -f $scriptPath,$nodePath,$automation
$action = New-ScheduledTaskAction -Execute "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe" -Argument $argsTask -WorkingDirectory $automation
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $userId
$principal = New-ScheduledTaskPrincipal -UserId $userId -LogonType Interactive -RunLevel Limited
$settings = New-ScheduledTaskSettingsSet -MultipleInstances IgnoreNew -ExecutionTimeLimit ([TimeSpan]::Zero) -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1) -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
Register-ScheduledTask -TaskName 'FSJ-Emergencia' -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Force | Out-Null
Start-ScheduledTask -TaskName 'FSJ-Emergencia'
Write-Output 'Ligacao de emergencia iniciada. A tarefa FSJ-Tarefas-07h e suas cinco tentativas nao foram modificadas. Nenhum pedido de envio foi criado pelo instalador.'

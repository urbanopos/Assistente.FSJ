$ErrorActionPreference = 'Stop'
$automation = $PSScriptRoot
$stateDir = $env:FSJ_STATE_DIR
if (-not $stateDir) { throw 'FSJ_STATE_DIR nao configurada.' }
if (-not (Test-Path (Join-Path $stateDir 'chave-agendamento.xml'))) { throw 'Chave protegida nao localizada.' }
foreach ($name in @('autocheck.mjs','autocheck-core.mjs')) { if (-not (Test-Path (Join-Path $automation $name))) { throw "Arquivo ausente: $name" } }
$nodePath = (Get-Command node.exe).Source
$task = Get-ScheduledTask -TaskName 'FSJ-Tarefas-07h'
if ($task.State -eq 'Disabled') { throw 'Tarefa das 7h esta desativada.' }
$scriptPath = Join-Path $stateDir 'fsj-autocheck-6h.ps1'
if (Test-Path $scriptPath) { Copy-Item $scriptPath ($scriptPath + '.backup-' + (Get-Date -Format yyyyMMdd-HHmmss)) }
@'
param([string]$NodePath,[string]$AutomationDir)
$ErrorActionPreference = 'Stop'
$log = Join-Path $PSScriptRoot 'autocheck.log'
try {
 $env:FSJ_STATE_DIR = $PSScriptRoot
 $secret = Import-Clixml (Join-Path $PSScriptRoot 'chave-agendamento.xml')
 $cred = New-Object System.Management.Automation.PSCredential('fsj',$secret)
 $env:SUPABASE_SERVICE_ROLE_KEY = $cred.GetNetworkCredential().Password
 Set-Location $AutomationDir
 Get-Date -Format o | Out-File $log -Append
 $task = Get-ScheduledTask -TaskName 'FSJ-Tarefas-07h'
 $info = Get-ScheduledTaskInfo -TaskName 'FSJ-Tarefas-07h'
 $scheduleOk = $task.State -ne 'Disabled' -and $info.NextRunTime.Date -eq (Get-Date).Date -and $info.NextRunTime.Hour -eq 7 -and $info.NextRunTime.Minute -eq 0
 if (-not $scheduleOk) { 'FALHA: agendamento das 7h' | Out-File $log -Append }
 & $NodePath .\autocheck.mjs *>> $log
 $nodeResult = $LASTEXITCODE
 if (-not $scheduleOk) { exit 1 }
 exit $nodeResult
} catch {
 'FALHA: autocheck nao concluido; conferir configuracao do executor.' | Out-File $log -Append
 exit 1
}
'@ | Set-Content -Path $scriptPath -Encoding UTF8
$argsTask = '-NoProfile -NonInteractive -ExecutionPolicy Bypass -File "{0}" -NodePath "{1}" -AutomationDir "{2}"' -f $scriptPath,$nodePath,$automation
$action = New-ScheduledTaskAction -Execute "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe" -Argument $argsTask -WorkingDirectory $automation
$trigger = New-ScheduledTaskTrigger -Daily -At (Get-Date).Date.AddHours(6)
$userId = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
$principal = New-ScheduledTaskPrincipal -UserId $userId -LogonType Interactive -RunLevel Limited
$settings = New-ScheduledTaskSettingsSet -WakeToRun -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Minutes 10)
Register-ScheduledTask -TaskName 'FSJ-Autocheck-06h' -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Force | Out-Null
Get-ScheduledTaskInfo -TaskName 'FSJ-Autocheck-06h' | Select-Object NextRunTime
Write-Output 'Autocheck das 6h instalado. A tarefa FSJ-Tarefas-07h foi preservada. SMS pendente de configuracao.'

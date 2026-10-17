$ErrorActionPreference = "Stop"
$pacoteFSJ = Join-Path $env:TEMP "FSJ-Reserva-Publico.zip"
Invoke-WebRequest -UseBasicParsing -Uri "https://urbanopos.github.io/Assistente.FSJ/downloads/FSJ-Reserva-Instalacao-Publica.zip" -OutFile $pacoteFSJ
if ((Get-FileHash -LiteralPath $pacoteFSJ -Algorithm SHA256).Hash -ne "67b1ff3f75e80d6627b5d8b50740736ce543cbece0c2467325489b24321a404b") { throw "Arquivo diferente do validado. Nada foi instalado." }
& "$env:WINDIR\System32\OpenSSH\scp.exe" $pacoteFSJ urbano@192.168.77.2:/home/urbano/FSJ-Reserva-Publico.zip
if ($LASTEXITCODE -ne 0) { throw "Transferencia incompleta." }
& "$env:WINDIR\System32\OpenSSH\ssh.exe" -t urbano@192.168.77.2 "python3 -m zipfile -e /home/urbano/FSJ-Reserva-Publico.zip /home/urbano/fsj-publico-v10 && python3 /home/urbano/fsj-publico-v10/instalar.py /home/urbano/fsj-video-v001"
if ($LASTEXITCODE -ne 0) { throw "Ativacao nao concluida. Copie a mensagem exibida." }
Write-Host "Reserva ativado. Link dos participantes: https://urbanopos.github.io/Assistente.FSJ/instalar-reserva.html"

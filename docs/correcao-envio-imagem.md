# Correção do envio de imagem e do wrapper PowerShell

O erro do dia 13/10/2026 coincidiu com a falha de mídia documentada pelo projeto whatsapp-web.js na versão 1.34.7: MediaData espalha __x_id no objeto da mensagem e invalida o MsgKey. A correção remove apenas esse campo no objeto final. Fonte: https://github.com/wwebjs/whatsapp-web.js/issues/201922

install-send-repair.cjs valida o formato da biblioteca local e de fsj-7h.ps1 antes de qualquer escrita; faz backup e aplica o patch sem substituir as adaptações locais dos identificadores $1/_serialized. No wrapper, usa ErrorActionPreference Continue apenas durante Node e preserva LASTEXITCODE. Isso evita que stderr seja convertido em erro terminante que interrompe o loop dos demais destinatários no Windows PowerShell 5.1. Não modifica journal.json nem libera um envio incerto.

diagnose-today.mjs consulta o diário e até 50 mensagens de cada conversa selecionada, procurando o token do quadro de hoje. Um resultado vazio é apenas evidência limitada: consulta falha/ausência de token é reportada como não confirmada e nunca libera automaticamente reenvio. As duas operações não enviam mensagens. Após instalar, testar mídia e conferir os resultados no executor antes de liberar a recuperação.

Testes locais: patch de mídia sobre código da versão 1.34.7, sintaxe, idempotência, preservação de ID público e validação antes da escrita. O wrapper precisa de validação final no Windows executor.

## Cinco tentativas

run-retries.mjs executa run.mjs até cinco vezes, esperando 180000 ms entre execuções com falha. Encerra imediatamente no resultado zero. A rotina principal mantém a checagem de registros já enviados e o bloqueio de estado incerto. install-five-retries.cjs também marca falhas ocorridas em wa.send antes de chamar client.sendMessage como notTransmitted; o ciclo permite nova tentativa somente dessas falhas. Erros após entrar no método de transmissão continuam incertos. A conexão malsucedida é compartilhada entre os destinatários da mesma tentativa para evitar seis timeouts de conexão seguidos. O instalador valida a sintaxe dos módulos antes de alterar qualquer arquivo. O limite da tarefa Windows deve ser ampliado para 45 minutos, preservando as demais configurações.

O caso incerto anterior à instalação não é automaticamente desbloqueado. diagnose-today.mjs deve ser executado e sua saída analisada antes de liberar a recuperação de Urbano. Nenhum desses instaladores apaga respostas de tarefas.

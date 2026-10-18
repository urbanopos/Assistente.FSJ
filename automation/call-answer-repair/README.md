# Reparo de entrada e atendimento de chamadas

Base: calls.js e app.js enviados pelo proprietario em 18/10/2026. O instalador confere os hashes exatos antes de alterar a VM e faz backup de calls.js, app.js e version.json. Uma versao diferente exige nova conferencia. Nao altera contas, senhas, vinculos de aparelho, servico Android nem autorizacoes.

Libera captura se a admissao ou a preparacao da interface falhar; cancela admissoes tardias; repete uma unica vez a captura em NotReadableError/AbortError, sem repetir permissao negada. Suspende o toque da pagina antes de capturar audio. Protege contra recarga de atualizacao enquanto o atendimento inicia e substitui alertas bloqueantes por mensagens com a etapa da falha.

A consulta do app.js enviado nao confirmou uso automatico de fsjCallsPause. A causa definitiva da queda no Android ainda depende de teste real e da mensagem produzida pela versao corrigida.

Validacao: node --test automation/call-answer-repair/test.cjs; sintaxe dos dois arquivos finais verificada; instalacao e idempotencia exercitadas em pasta temporaria. Instalar na VM com python3 install.py, sem chamadas em andamento. Nao reinicia o servidor: arquivos estaticos recebem nova identificacao web e sao carregados ao abrir/retomar a interface quando seguro. Reverter: restaurar os tres arquivos do backup indicado pelo instalador.

## Reparo complementar: aceite unico

install-v2.py aceita tanto os arquivos originais quanto a saida do primeiro instalador. Impede o dialogo de convite durante uma entrada em andamento e em sessao restrita aberta pelo Android, preservando o aceite no navegador comum. O botao de reproduzir audio permanece disponivel quando o navegador ainda rejeita play(). Isso nao comprova, sozinho, que a causa da falta de audio nos aparelhos foi resolvida. Testes de captura, dialogo e instalacao passaram; requer teste real com audio nos dois sentidos.

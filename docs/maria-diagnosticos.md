# MarIA — gravação local de diagnóstico

Versão `20261024-maria-diagnostico-06`, decisão do Proprietário em 24/10/2026. Finalidade: mostrar à Brisa no ChatGPT o comportamento da MarIA, incluindo movimentos e áudio. Não altera a biblioteca da TV FSJ.

## Operação

No painel MarIA, abrir “Gravar diagnóstico · até 5 vídeos”. Se desejar registrar a própria voz, marcar Incluir minha voz. Clicar Iniciar gravação e escolher a tela/janela/aba no seletor do navegador. Habilitar o áudio compartilhado quando disponível. A captura exige autorização a cada sessão e não começa silenciosamente.

Demonstrar o problema e clicar Parar e salvar, ou usar o controle de encerramento de compartilhamento do navegador. Há parada automática em um minuto. Se a fonte não fornecer áudio da tela, o aplicativo avisa; microfone pessoal não substitui necessariamente o som emitido pela MarIA. A disponibilidade varia por navegador e plataforma.

Baixar o arquivo pela posição numerada e anexá-lo manualmente ao chat. Nenhum envio ocorre automaticamente. A reprodução usa os formatos disponibilizados pelo MediaRecorder (WebM, com alternativa MP4 quando suportada).

## Retenção e proteção

Banco IndexedDB exclusivo `fsj_maria_diagnostics_v1`, posições 1 a 5. Uma sequência interna determina a posição cíclica: gravação 6 substitui 1; 7 substitui 2. Uma transação única grava vídeo e contador. Falha/limite de espaço aborta a operação e preserva o registro antigo. Não há exclusão prévia para tentar abrir espaço.

Máximo de 12 MB por vídeo; total nominal até 60 MB neste navegador, além dos buffers temporários de captura. Captura cancelada, vazia, excessiva ou com erro não substitui vídeo anterior. Duas abas usam transações de escrita serializadas pelo IndexedDB.

Os diagnósticos não são salvos na VM, no Supabase ou na videoteca. Cópias baixadas em Downloads e vídeos produzidos pelo gravador do Windows ficam fora desta rotação e não são apagados pelo aplicativo. As cópias anexadas ao ChatGPT também não são geridas pelo FSJ. Não registrar credenciais ou informações que não queira compartilhar.

Atualizações da página aguardam captura/salvamento. Fechar o navegador à força pode perder uma captura ainda não salva; os vídeos anteriores permanecem sujeitos ao armazenamento do navegador. Limpeza dos dados do site e descarte por falta de espaço podem removê-los.

## Validação e recuperação

Teste `node tests/maria-diagnostic.cjs` cobre rotação e falhas usando um adaptador transacional simulado. O contrato de atualização, identidade, expressões e ponte documental permanece testado. A API real de captura e armazenamento no navegador exige validação do usuário.

Recuperação de código: reverter somente maria-diagnostic.js e a inclusão/proteção de gravação em index.html, com versão coerente. Não apagar o IndexedDB para corrigir uma falha de captura. Nenhum banco operacional ou serviço da VM deve ser restaurado/reiniciado por esta mudança.

Fontes: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia e https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB .

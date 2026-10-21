# TV FSJ: biblioteca por tema

Atualização aditiva do servidor Debian que serve a aba Vídeos e Chamadas do Assistente FSJ - Tarefa. Não cria aplicativo ou login separado.

- A tela inicial permanece TV FSJ, sem reprodução automática.
- O menu mantém Tarefas, Assistir vídeos da biblioteca e Chamadas de vídeo. Enviar vídeo institucional e Autorização de contas - Aprovação de novos integrantes aparecem apenas ao proprietário.
- O tema é obrigatório para filtrar os vídeos, adicionar arquivos e registrar links do YouTube: Campo, Aviário, Limpeza, Máquinas, Serviços ou Outros.
- O proprietário e o autor do envio podem alterar o tema sem reenviar o arquivo. Registros antigos sem categoria reconhecida aparecem em Outros até revisão pelo proprietário.
- Participantes autorizados podem adicionar vídeos à biblioteca compartilhada. Definir ou substituir o institucional continua restrito ao proprietário no servidor, incluindo tentativas diretas às APIs.
- Upload MP4/WebM até 500 MB. Links HTTPS do YouTube são validados sem consultar endereços externos.
- Tarefas retorna ao quadro pessoal no sistema principal; chamadas continuam na tela própria. A TV não recebe bloqueio de horário.

## Instalação

Execute `python3 install.py /home/urbano/fsj-video-v001` na VM. O instalador exige a versão com SSO, biblioteca por temas e poster de duas páginas anteriormente instalada. Confere a saúde HTTPS, recusa chamadas/envios em andamento, salva os arquivos anteriores e uma cópia consistente do SQLite, grava arquivos atomicamente, reinicia o serviço e restaura os arquivos se a verificação falhar. Não modifica registros de pessoas ou vídeos existentes. As novas tabelas são criadas pelo módulo com transação na inicialização.

O instalador é autocontido: `build.py` incorpora o módulo Python e os arquivos JS/CSS. Os scripts do principal `board-videos.js` e `videos-sso.js` atendem somente a mensagem de retorno a tarefas da origem e iframe verificados.

## Verificações

`python3 test_backend.py` testa tema obrigatório, edição sem modificar arquivo, permissões de institucional, bloqueio de sessões de chamada, origem da requisição e entrega dos novos arquivos estáticos.

Com jsdom disponível, `node test_frontend.cjs` testa tema obrigatório, seleção por tema, controles do executor e ausência de reprodução automática do institucional YouTube. O instalador também foi ensaiado com os arquivos atuais revisados e a transformação de duas páginas instalada, verificando sintaxe e repetição segura. O teste de reprodução nos celulares permanece necessário.

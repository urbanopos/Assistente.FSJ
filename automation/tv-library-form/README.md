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


## Atualização de nomes e temas — 22/10/2026

Para uma instalação existente, execute `python3 update-library.py /home/urbano/fsj-video-v001`.
O atualizador exige fontes de versões revisadas, confere ausência de chamadas/envios, bloqueia novos POSTs durante a troca, cria backup dos arquivos e um snapshot consistente do SQLite. Atualiza apenas os arquivos da biblioteca, a referência do script e a versão Web. O serviço é reiniciado automaticamente e verificado por HTTPS. A VM não precisa reiniciar.

- Nome do vídeo obrigatório ao adicionar arquivo ou link YouTube; o nome do arquivo é sugerido e pode ser substituído. O campo também aparece no envio institucional por arquivo/link.
- Vídeos antigos sem metadados, sem tema ou com marcador “Sem tema” são classificados em Outros. Descrições e classificações existentes são preservadas.
- O Proprietário ou autor do envio pode selecionar um vídeo e editar o tema, sem reenviar o arquivo.
- Cada ID de vídeo/link YouTube aparece uma única vez por tema na seleção. Vídeos diferentes com títulos iguais são mantidos e diferenciados na lista.
- Os controles existentes de institucional e exclusão pelo Proprietário são preservados. Nenhum vídeo é excluído pelo atualizador.

Se uma gravação de arquivo falhar, os arquivos e a transação dos temas são restaurados. Se o novo serviço não passar na verificação, os arquivos anteriores são restaurados; a classificação de vídeos antigos em Outros, que é compatível com a versão anterior, permanece. O backup SQLite fica disponível para revisão, sem substituir automaticamente dados mais recentes.

`build_update.py` gera o atualizador autocontido. `build.py` gera o instalador completo para novas instalações.
`test_named_videos.cjs` testa nomes, duplicidades, edição dos vídeos antigos e preservação dos controles existentes.
`test_library_update.py` testa migração, snapshot, idempotência, recusa de fonte desconhecida e restauração após erro de gravação.


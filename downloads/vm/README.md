# FSJ Reserva — atualização automática

Instalação inicial na VM Debian, usuário urbano, /home/urbano/fsj-video-v001. Não altera GitHub/Supabase operacionais nem os dados da videoteca. As mudanças de layout ainda em prévia não fazem parte deste pacote.

Execute bash instalar.sh dentro da pasta extraída. A senha solicitada por sudo é a senha do usuário urbano. Essa etapa habilita os serviços de usuário para iniciarem mesmo sem uma sessão SSH aberta.

O servidor HTTPS passa a iniciar com a VM. O canal de atualização é verificado ao entrar no aplicativo e a cada dois minutos. Somente pacotes publicados e assinados pelo Proprietário são aceitos. Se o canal estiver indisponível, a cópia instalada continua funcionando.

O aplicativo Android consulta somente a VM. Apenas o atualizador da VM consulta o GitHub para buscar os pacotes de distribuição; os registros dos participantes não são enviados ao GitHub por essa rotina. Essa rotina não implementa espelhamento de registros com o Supabase.

Instale uma vez o APK Android versão 6 pelo botão de instalação do principal. A partir dessa versão, o próprio aplicativo consulta a VM e oferece novas versões. A primeira instalação de atualização pelo app pode pedir “Permitir desta fonte”. O Android exige confirmação para instalar APKs: um aplicativo comum não pode fazer instalação silenciosa. O APK recebido é conferido por pacote, versão e assinatura do Proprietário antes de abrir o instalador.

A atualização aguarda chamadas ou gravações ao vivo e requisições de escrita em andamento. Um bloqueio breve impede novas escritas durante a aplicação. Atualizações só de interface/instalador não reiniciam o servidor. Se código do servidor mudar, o serviço reinicia e pode ser necessário entrar novamente. Arquivos e banco são copiados para fsj-contingencia/backups/antes-auto-*. Vídeos não são duplicados porque ficam preservados em dados/videos. A integridade/saúde do servidor é conferida; uma falha restaura os arquivos e, quando houve mudança do servidor, o banco anterior.

Os testes cobrem assinatura e adulteração, aplicação de interface sem reinício, reversão de falha do servidor e bloqueio de escrita. A ativação real do serviço e a tela do instalador precisam ser conferidas na VM e no celular do Proprietário.

## Consultar

systemctl --user status fsj-reserva.service fsj-update.timer fsj-update.path
journalctl --user -u fsj-update.service -n 30 --no-pager

## Desativar somente a atualização automática

systemctl --user disable --now fsj-update.timer fsj-update.path

## Publicação de futuras atualizações

Canal fixo: https://urbanopos.github.io/Assistente.FSJ/downloads/vm/
O manifesto é assinado em bytes exatos com a chave privada do Proprietário (a chave nunca vai para a VM nem para o GitHub). A chave pública está em update-public.pem. O arquivo release-N.zip contém exatamente server.py, calls.py, version.json, static/index.html, static/app.js, static/calls.js, static/style.css, static/logo.webp e releases/FSJ-Reserva-VM-V001-Simples.apk. Cada arquivo e o ZIP têm SHA-256 no manifesto. A versão inteira deve crescer e coincidir com version.json.release. Publique primeiro o ZIP, depois manifesto e assinatura juntos em um commit; confirme a implantação do Pages. Mantenha código de servidor inalterado em atualizações apenas de interface para preservar sessões e evitar reinício. Teste cada versão antes de assinar. Nunca inclua dados, senhas, certificados privados ou vídeos no canal.

## Release 2 / Android 7

Inclui telas fixas, RESERVA sem R, formulário de acesso salvo com Android Keystore, botão Tarefas funcional e espelhamento de leitura. O arquivo privado de conexão deve ser entregue exclusivamente ao Proprietário e ficar em dados/sync.json; nunca deve ser publicado. Cadastros de pessoas do principal não liberam autenticação automaticamente: é necessário aprovar a conta local e vinculá-la explicitamente à pessoa correta. O APK deve manter a assinatura do Proprietário.


## Release 3 / Android 7

Listas de vídeos e participantes preservam seleção durante consultas de fundo. Atualizações de opções aguardam o fechamento da lista. Pessoas do cadastro principal aparecem uma vez por identificador; contas locais sem vínculo permanecem em Contas para vinculação explícita. Nenhum registro é apagado. Interface atualizada sem reiniciar o servidor; APK permanece versão 7.


## Release 4 / Android 7

Preparação de chamadas salva por usuário neste aparelho, com título e convidados. Atualizar participantes preserva a seleção; avisos de chamada aparecem no rodapé visível. A edição do título não é interrompida pelo redimensionamento do teclado. Ao entrar, a navegação exibe o quadro da chamada. Somente contas ativas explicitamente vinculadas podem ser convidadas quando existe cadastro principal. O teste usa câmera simulada; mídia entre aparelhos requer verificação na rede local.


## Release 5 / Android 7

Todos os cadastros ativos do principal entram automaticamente na lista de convidados, uma vez por ID da pessoa. Podem receber convites antes de criar conta local. Aceitar o convite exige entrar com conta autorizada vinculada à pessoa correta; não há associação automática por nome nem importação de senhas. Pessoas inativas e contas vinculadas bloqueadas não podem participar. A atualização altera o servidor e reinicia o serviço quando não há chamada ou gravação; pode ser necessário entrar novamente. Inclui as correções de preparação, título salvo e avisos visíveis da release 4.


## Release 6 / Android 8

O principal oferece Vídeos e chamadas na tela inicial e na navegação. No Android, o link fsjreservavm://videos abre o aplicativo exclusivo da VM; se indisponível, oferece o APK8. No desktop, abre HTTPS da VM. O APK8 registra somente essa rota e continua aceitando rede exclusivamente do endereço fixo da VM, com a CA embarcada. A chave de assinatura é preservada. Um aplicativo Android comum exige confirmação para instalar a atualização nativa; as atualizações da interface da VM continuam automáticas. Abertura do link no aparelho e permissões de câmera precisam de conferência real.

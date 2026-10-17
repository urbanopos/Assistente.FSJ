# Chamadas do Assistente FSJ Reserva — Android 11

## Preparar a VM

Execute no terminal Debian da VM, com o usuário urbano:

```sh
curl -fL https://raw.githubusercontent.com/urbanopos/Assistente.FSJ/main/automation/corrigir-chamadas-reserva.py -o /tmp/fsj-chamadas.py && python3 /tmp/fsj-chamadas.py ~/fsj-video-v001
```

O instalador verifica a versão reconhecida de calls.js e o SHA-256 do APK antes de alterar arquivos. Guarda backup e reverte alterações em caso de falha na substituição. Ajusta somente calls.js, o APK distribuído pela VM e android_version em version.json. Não aprova pessoas, não apaga dados, não troca o servidor e não altera a rotina das 7h. O servidor não precisa ser reiniciado.

## Preparar os celulares

1. Instale a versão 11 nos dois aparelhos, sem desinstalar a anterior: https://urbanopos.github.io/Assistente.FSJ/instalar-reserva.html .
2. Entre no Reserva com contas diferentes. Regina deve ter conta autorizada e vinculada ao cadastro dela; entrar com a conta do proprietário nos dois aparelhos não recebe convite dirigido a Regina.
3. Permita notificações. Ao iniciar chamadas, permita microfone e câmera quando solicitados.
4. Confira a notificação **FSJ Reserva · recebimento de chamadas — Pronto para receber chamadas FSJ**.

## Fazer e atender

1. Proprietário: abra a área de chamadas, selecione Regina e escolha **Somente voz** ou **Vídeo**.
2. Toque em **Iniciar chamada**. Aguarde o atendimento; selecionar uma pessoa ou salvar a preparação não liga.
3. Regina: o toque é próprio do FSJ. Toque em **Atender** na notificação ou **Atender chamada** na tela.
4. Autorize as permissões solicitadas. Aguarde a indicação de conexão e confira áudio e, no modo vídeo, imagem nos dois aparelhos.
5. Use **Finalizar chamada** para encerrar para todos.

## Disponibilidade e limites

O serviço de recebimento consulta somente o servidor da fazenda, usando a sessão autenticada. Não usa Firebase nem outro serviço de push, não grava áudio e não liga câmera ou microfone em segundo plano. O toque original está no APK. O Android controla volume, modo silencioso, Não perturbe e permissões de notificações.

Para continuar disponível, minimize o aplicativo. **Sair** encerra a sessão e o serviço. **Pausar recebimento**, na notificação, também o interrompe. Sessão expirada pede nova entrada. Se o sistema encerrar o processo, o usuário forçar parada ou o aparelho reiniciar, abra o Reserva novamente. Economia de bateria e restrições do fabricante podem atrasar o recebimento; não há garantia de chamada com o app forçado a parar.

O APK aponta para o endereço público configurado da fazenda. Isso permite tentar acesso por dados móveis e outro Wi-Fi, mas a disponibilidade depende da conexão externa da VM. O toque é independente da conexão de mídia. Áudio/vídeo entre redes distintas podem precisar de STUN/TURN e encaminhamento de portas; este instalador não configura esse retransmissor. Faça primeiro um teste com os dois celulares no Wi-Fi da fazenda, depois entre redes diferentes.

## Validação realizada

Compilação Android 35, verificação de assinatura igual à versão 10 e versão de pacote 11; testes de convites, atendimento e isolamento entre participantes com dados simulados; testes de instalador contra APK inválido e aplicação repetida. O toque nativo, as notificações em segundo plano e o áudio/vídeo entre dois celulares físicos ainda precisam ser conferidos nos aparelhos.

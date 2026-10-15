# FSJ Reserva Android — protótipo 0.1

Aplicativo independente (pacote `br.com.fazendasaojose.reserva`), Android 8 ou superior, ícone do ramo com R. Carrega exclusivamente a Reserva hospedada no FSJ usando WebView. A aplicação principal e a rotina WhatsApp não são substituídas.

## Primeiro acesso

1. Instale o APK do protótipo publicado na release `fsj-reserva-android-prototipo-v1`.
2. Na tela de acesso da Reserva, abra o principal e solicite seu link de acesso ao e-mail.
3. No e-mail, copie o endereço do botão de acesso. Volte ao Android Reserva e toque em **Colar link de acesso**. Não compartilhe esse link.
4. Após autenticar, toque em **Abrir Reserva**. A sessão fica no armazenamento privado do WebView, separada do Chrome.
5. **Sair** encerra a atividade e remove sua janela dos recentes, preservando a sessão. Não fecha outras janelas do Chrome.

## Escopo e limites

Protótipo restrito ao Proprietário, usando a autorização já validada no servidor. Requer internet. Arquivos podem ser selecionados pelo seletor do Android, sem permissão de acesso irrestrito ao armazenamento. Voz depende da compatibilidade do WebView e ainda precisa de validação no aparelho. Notificações automáticas das 7h com o app fechado não são implementadas nesta versão.

APK com assinatura de desenvolvimento e sem depuração WebView habilitada. A chave de teste é preservada pelo cache do build enquanto disponível; para distribuição estável, preparar uma chave de produção privada do Proprietário. Se a chave de teste mudar, será necessário reinstalar o protótipo.

Build: Gradle 8.9, Android Gradle Plugin 8.7.3, Java 17, SDK 35. Pipeline executa assembleDebug, lintDebug e apksigner verify, publica APK e checksum. Nenhuma chave de acesso ao banco ou token de usuário é incorporado ao APK.

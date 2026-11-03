# FSJ Tarefas — Android nativo (piloto seguro)

Aplicativo Java/Android nativo, sem WebView, que acessa a base Supabase já existente. Sem alterações na base, no GitHub Pages ou no fluxo WhatsApp. A primeira versão permite autenticação por e-mail OTP (exige template de e-mail que envie token numérico) e leitura de tarefas conforme RLS. Atualmente as políticas da base permitem consulta apenas à conta do proprietário; não é seguro distribuir para funcionários até criar identidade e políticas por responsável. Nenhuma escrita está implementada nesta etapa. A compilação gera um APK debug em GitHub Actions; não equivale a um pacote de produção assinado. Testar em dispositivo antes de disponibilizar na seção Comunicação.


## Piloto web Android (branch feature/apk-web-proprietario-piloto-20261103)

O APK nao inclui token individual nem tela de colagem. Recebe `fsj://vincular?token=...` por intent Android; armazena link no armazenamento privado e abre a interface web. Sem vinculo, abre pagina inicial web sem privilegios. Para usar o link WhatsApp antigo, sera necessario publicar um controle de instalacao/vinculacao na entrada web e disponibilizar o APK em endereco HTTPS acessivel; nao se considera essa integracao publicada nesta branch. O Android solicita confirmacao de instalacao; o app nao instala silenciosamente. APK debug apenas para teste, nao para distribuicao final. Validar seguranca do token e identidade titular no servidor antes de uso operacional. Nenhuma mudanca na VM ou nos registros.

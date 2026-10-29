# Agente Android FSJ — Galaxy S23

Projeto Android nativo (Kotlin). Abrir a pasta em Android Studio, sincronizar Gradle e gerar APK de teste.

## Fluxo
1. Configure a URL **HTTPS** do servidor que executa `automation/disparo-automatico/api.mjs` e o token privado `FSJ_DISPARO_API_TOKEN`.
2. Toque em **Consultar disparos pendentes**.
3. Confirme o número do destinatário e toque em **Abrir WhatsApp**.
4. Confira a mensagem e envie manualmente pelo WhatsApp normal.

**Importante:** a API existente retorna ID da pessoa, mas não o telefone. Por segurança, esta versão pede o número e não presume que o ID seja telefone. Não existe envio silencioso ou confirmação automática de entrega. A tela atual é uma primeira etapa de integração, não a rotina final sem intervenção.

Não exponha a API sem TLS, autenticação forte, controle de dispositivos e validação de destinatários cadastrados no servidor. Não inclua token no repositório ou APK. Não exponha a porta diretamente à Internet sem uma camada segura de acesso.

A rotina GitHub Actions atual valida programação, mas ainda não publica jobs nesta API. Testar somente com o Proprietário antes de qualquer disparo coletivo.

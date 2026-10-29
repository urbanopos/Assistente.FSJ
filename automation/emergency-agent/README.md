# Disparo Emergencial FSJ no GitHub Actions

Ação: https://github.com/urbanopos/Assistente.FSJ/actions/workflows/disparo-emergencial.yml

A interface pode ser acessada pelo laptop ou celular em https://urbanopos.github.io/Assistente.FSJ/?fsj_acao=disparo-emergencial . O proprietário seleciona o destinatário; o executor apaga a anterior e prepara a conversa. O envio final é manual. Não é necessário acessar a rede da fazenda quando o runner GitHub estiver configurado e em execução.


## GitHub Actions — implementação vigente em 29/10/2026

A ação **Disparo Emergencial FSJ**, arquivo .github/workflows/disparo-emergencial.yml, executa em runner hospedado no GitHub, sem usar a rede da fazenda. workflow_dispatch restrito ao proprietário, concorrência única, modo padrão validar sem exclusão/envio. O modo executar tem duração de 5 a 60 minutos e não é um serviço permanente. O envio final é manual no WhatsApp do proprietário, para a pessoa explicitamente selecionada.

A execução exige SUPABASE_SERVICE_ROLE_KEY em secret, FSJ_EMERGENCY_CONFIG_VERSION=manual-final-v1 em variável somente após configuração validada, e sessão já vinculada em arquivo executor.tar.gz no bucket privado fsj-emergency-state (ou nome definido em FSJ_EMERGENCY_STATE_BUCKET). O arquivo de sessão não é publicado no repositório, cache ou artefatos GitHub. O serviço de armazenamento deve permanecer privado; chave somente no runner/servidor. Não criar ou guardar sessão por dispositivo do proprietário: o executor é central e a interface Desktop/Celular comanda o mesmo pacote. Vínculo inicial pode exigir autorização no WhatsApp.

O worker foi alterado para preparar/apagar e nunca executar send. Após confirmação do apagamento, registra pronto_para_envio, permitindo ao navegador abrir o número e a mensagem preparados. O usuário pressiona Enviar. O worker pode identificar depois o envio manual pelo código exato, remetente, conversa e horário, sem declarar envio apenas pela abertura do link.

Estado: workflow e código publicados; seis testes da ação/preparação e contrato de atualização passaram. A ação NÃO foi disparada nesta entrega. Credencial, bucket privado e sessão vinculada NÃO configurados nem comprovados. Banco em produção ainda precisa receber database/emergency-agent-manual-send.sql para admitir pronto_para_envio; a trava manual-final-v1 impede executar antes dessa configuração. A publicação da função emergency-agent v2 já admite retornar o preparo. O início da ação pelo botão da página ainda depende de configurar um mecanismo autenticado de acionamento GitHub; nenhum token GitHub foi criado ou exposto nesta sessão. O link da página está disponível pela internet, mas isso não comprova executor online.

A regra atual substitui a intenção anterior de envio integralmente automático: o envio final é SEMPRE manual. O teste real deve limitar-se a Urbano após configurar e vincular o executor. Rotina das 7h e pastas isoladas da VM não foram alteradas. Recuperação: desativar a ação e reverter o commit; conservar fila/diários para analisar qualquer operação incerta.

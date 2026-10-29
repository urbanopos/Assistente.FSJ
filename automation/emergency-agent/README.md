# Pacote Disparo de Emergência — executor integrado

O proprietário usa um único botão, pelo Desktop ou Celular. O executor é componente interno do pacote: nenhuma tarefa operacional adicional, nenhum comando por disparo e nenhuma necessidade de manter o celular com um executor aberto.

## Componentes e separação

- automation/emergency-agent/component.mjs: ciclo de vida interno do executor.
- automation/emergency-agent/worker.mjs: sessão exclusiva do WhatsApp do proprietário e processamento da fila.
- supabase/functions/emergency-agent/index.ts: pedidos autenticados exclusivamente pela titularidade; não aceita texto ou telefone fornecidos pelo navegador.
- database/emergency-agent.sql: fila privada e presença do executor, sem leitura/escrita por anon/authenticated.
- disparo-emergencial/executor-client.js: comando único e acompanhamento do resultado.
- desktop/disparo-emergencial.js: adaptador para /home/urbano/fsj-instalacoes-isoladas/desktop.
- celular/disparo-emergencial.js: adaptador para /home/urbano/fsj-instalacoes-isoladas/celular.

Os adaptadores não substituem as interfaces existentes. Carregar o cliente comum antes do adaptador correto e ligar o botão da respectiva instalação à função correspondente. Não copiar index.html público sobre o Desktop da VM. A sessão do proprietário na página é obrigatória e a autorização é novamente verificada no servidor.

## Sequência

1. Validar sessão do proprietário, destinatário, calendário e executor conectado.
2. Registrar pedido idempotente e específico para uma pessoa/dia.
3. O executor verifica que sua conta é a do proprietário; reconcilia mensagem anterior e exige identificador real.
4. Usar o revoke existente, com confirmação de Apagar para todos.
5. Somente após confirmação, enviar a mensagem diária preparada pelo serviço existente.
6. Registrar ID da mensagem nova e confirmação; retornar o resultado à mesma tela.

Mensagem anterior não localizada, ambiguidade ou exclusão sem confirmação bloqueiam o novo envio. Timeout de envio gera estado incerto; não repetir automaticamente. Se não houver mensagem anterior identificável, não presumir primeiro envio. A consulta das tarefas continua bloqueada antes das 7h de Pernambuco.

## Configuração técnica inicial e funcionamento

A instalação técnica do pacote aplica o SQL, publica a função, configura uma pasta privada FSJ_EMERGENCY_STATE_DIR distinta do executor diário, a chave protegida e as dependências já fixadas em automation/package.json. O WhatsApp do proprietário precisa ser vinculado uma vez a esta sessão dedicada. Não usar a pasta de autenticação da rotina diária.

O processo que hospeda o pacote chama startEmergencyComponent ao iniciar e stop ao encerrar. Deve ser iniciado pelo serviço que hospeda o pacote, sem exigir outra ação do proprietário. O computador hospedeiro deve permanecer ligado e conectado à internet; celular e laptop apenas comandam a fila pela internet, sem VPN. A chave privilegiada permanece no servidor/computador executor, nunca no navegador.

Não ativar o novo transporte nos botões até verificar presença conectada, instalação nas duas pastas e teste real restrito ao proprietário. O front-end observa o resultado por até três minutos; expirar essa observação não cancela nem reenvia o pedido.

## Estado desta entrega

Código e pacote preparados no GitHub. Testes do núcleo de substituição passaram. SQL, nova função e executor dedicado NÃO instalados/ativados nesta sessão; VM inacessível e sem executor conectado. Os adaptadores NÃO foram aplicados às pastas da VM nem aos botões em produção. A instalação é pendência técnica do pacote, não tarefa operacional do proprietário. Nenhuma mensagem foi apagada/enviada por estes testes.

Recuperação: parar o componente integrado e manter o fluxo manual existente; conservar fila/diário para analisar pedidos incertos. Não apagar logs nem reiniciar envios incertos automaticamente. Não alterar agendamentos da rotina diária.

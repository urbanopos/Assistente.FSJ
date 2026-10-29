# Envio individual e confirmação

Nas abas Pessoas e WhatsApp, use **Enviar tarefas pelo WhatsApp** para preparar a mensagem com o link individual. Confirme o envio no WhatsApp e, ao voltar ao FSJ, toque em **Confirmar envio** junto à pessoa correspondente. Esse botão também serve para declarar um envio que já ocorreu hoje, desde que exista o quadro do dia. O proprietário precisa confirmar cada destinatário que efetivamente recebeu sua mensagem; abrir o WhatsApp não registra um envio.

A declaração é salva no Supabase por pessoa e dia e no histórico de mensagens como `quadro_manual_confirmado`. O botão principal passa a **Envio Confirmado** pelo restante daquele dia, inclusive após reabrir o aplicativo em outro aparelho. Isso significa confirmação pelo proprietário, sem presumir entrega, leitura ou identificação técnica pelo WhatsApp. No dia seguinte, o botão volta ao estado de envio.

## Reconhecimento pela rotina automática

Atualizar o repositório no computador executor é necessário para ativar essa integração:

```powershell
Set-Location "$env:USERPROFILE\Assistente.FSJ"
git pull --ff-only
```

O `run.mjs` passa a envolver a rotina local existente com `manual-history.mjs`. O agendamento, o número de tentativas e os arquivos locais de envio, imagem e diário são preservados. Um envio manual confirmado impede a repetição automática naquele dia. Antes do envio em dia posterior, o executor tenta identificar a última mensagem manual confirmada entre até 200 mensagens recentes da conversa registrada, exigindo saída pela própria conta, destinatário, dia e URL/token exatos. Nenhuma mensagem é escolhida apenas pelo nome da pessoa ou por conter texto genérico de tarefas.

Uma correspondência única é registrada com o identificador real em `mensagens_whatsapp` como `quadro_manual_identificado`. A rotina existente então considera essa mensagem no histórico e solicita sua exclusão antes do novo quadro. Correspondências inexistentes ou ambíguas não geram identificadores fictícios. A exclusão depende da sincronização, disponibilidade da mensagem e permissão do WhatsApp; o resultado efetivo continua registrado pela rotina. Sem atualizar o executor, a integração automática não estará ativa.

## Folga semanal

Depois de salvar a folga, o quadro do empregado exibe apenas a data escolhida. As demais datas reaparecem somente ao tocar em Alterar minha folga. Se a folga foi definida e bloqueada pelo gestor, esse controle não aparece. A regra de escolha e a autoridade do gestor permanecem as mesmas.

Verificação: `node --test tests/manual-send.cjs tests/individual-send.cjs tests/manual-history.test.mjs tests/folga-selected.cjs`.


## Emergência para Urbano no laptop — 29/10/2026

Na tela Disparo de Emergência, usar **Preparar disparo para Urbano — Proprietário**. A rotina consulta a titularidade oficial e seleciona a pessoa pelo identificador, sem presumir identidade pelo nome ou gravar telefone no código. Se a identificação falhar, interrompe. Reutiliza o envio individual autenticado e suas proteções contra duplicidade; não amplia permissões. No laptop, a mensagem é copiada para colar e enviar na conversa de Urbano no WhatsApp Web ativo. Confirmar no FSJ somente depois de enviar. Publicação não comprova envio, entrega ou instalação na VM. Nenhuma rotina das 7h é alterada. Versão: 20261029-emergencia-proprietario-01. Recuperação: reverter o commit desta entrega. Validação local: contrato de atualização e sintaxe; seleção vinculada ao ID da titularidade; envio real pendente no laptop.


## Regra vigente — envio antecipado e consulta às 7h (29/10/2026)

Substitui a exigência de esperar até 7h para preparar o envio individual. O proprietário pode preparar e enviar mensagens antes das 7h. O destinatário somente consulta tarefas a partir das 7h, horário America/Recife. As funções resposta-tarefa e supervisao bloqueiam no servidor as consultas por token e ações operacionais antes desse horário, sem retornar conteúdo de tarefas. A administração autenticada e as regras existentes de cadastro, folgas, férias, feriados, duplicidade e confirmação continuam vigentes. Agendamentos não foram alterados. Implantado no Supabase: envio-manual v6, resposta-tarefa v27, supervisao v12. Verificado localmente: envio às 6h59, bloqueio das consultas e ações, liberação às 7h e autenticação preservada. Envio real no WhatsApp depende do laptop. Recuperação: reimplantar as funções do commit anterior a esta mudança. Teste: node tests/horario-consulta.cjs (Node 24).


## WhatsApp Web no laptop — 29/10/2026, versão 20261029-whatsapp-web-02

O envio individual agora abre uma aba nomeada do WhatsApp Web, com telefone e mensagem retornados pelo serviço autenticado. A sessão já conectada no mesmo navegador é reutilizada. Conferir o destinatário e pressionar Enviar no WhatsApp; só então confirmar no FSJ. Se o navegador bloquear a abertura, usar **Abrir mensagem no WhatsApp**, disponível abaixo do botão. Cancelamento ou erro fecha a aba reservada. Não há confirmação automática nem comprovação de envio/entrega. Celular mantém o acesso ao WhatsApp pelo link móvel. Sem alteração de agendamentos. Verificação: contrato de atualização e teste whatsapp-web-open.cjs (abertura, URL, bloqueio de pop-up, cancelamento e falha). Validação na sessão real do laptop pendente. Recuperação: reverter o commit desta versão.


### WhatsApp em nova aba — 29/10/2026

Versão 20261029-whatsapp-nova-aba-03: a abertura automática e o link alternativo usam `_blank`, mantendo o FSJ na aba original. Substitui a reutilização de aba nomeada descrita acima. Contrato de atualização, sintaxe e teste de abertura passaram. O navegador pode exigir permissão para pop-ups; o link alternativo permanece disponível. Recuperação por reversão deste commit.


### Botão de emergência abre diretamente o destinatário — 29/10/2026

Versão 20261029-emergencia-destino-04. O botão do proprietário reserva uma nova aba no próprio clique, antes de consultar a titularidade, e encaminha essa mesma aba à conversa do número oficial retornado pelo envio individual. Evita perder a ativação do usuário durante a consulta assíncrona. Não busca contato apenas pelo nome; Urbano é identificado pela titularidade central. A mensagem fica preenchida e o proprietário confere e envia no WhatsApp. Falha na titularidade fecha a aba; pop-up bloqueado mantém o link alternativo. Validações locais: contrato de atualização, whatsapp-web-open.cjs e emergencia-destino.cjs. Sessão real do laptop ainda depende da conferência do usuário. Recuperação: reverter este commit.


## Disparo Emergencial — rotina permanente do proprietário (29/10/2026)

Versão 20261029-disparo-emergencial-05. Acesso direto: https://urbanopos.github.io/Assistente.FSJ/?fsj_acao=disparo-emergencial . O endereço abre a tela após a autenticação existente do proprietário, inclusive após recuperar a sessão, sem enviar nada ao abrir a página. Funciona pela internet, sem VPN ou acesso à VM. É necessário estar conectado ao WhatsApp no navegador utilizado (ou no aplicativo no celular). A conta conectada é mantida; o destinatário é identificado no cadastro central, nunca apenas pelo nome.

Fluxo: abrir o acesso direto, autenticar como proprietário, acionar **Disparar mensagem do dia para Urbano — Proprietário**, conferir destinatário e mensagem na outra aba e pressionar Enviar no WhatsApp. Voltar ao FSJ para confirmar o envio real. Para outros destinatários, selecionar a pessoa no quadro de Disparo Emergencial e usar o envio individual existente. O proprietário continua sendo a única identidade autorizada pelo servidor a preparar e confirmar mensagens. Nenhum telefone ou token diário é fixado no acesso permanente.

A mensagem usa a data atual, CONSULTA TAREFAS, TAREFAS DE TERCEIROS quando autorizadas e o aviso em negrito ESTA MENSAGEM CANCELA AS ANTERIORES. O aviso não comprova exclusão automática de mensagens antigas. Mensagens podem ser enviadas antes das 7h; consultas e ações por token permanecem bloqueadas até 7h, America/Recife. Permanecem as regras de cadastro, folgas, férias, feriados e duplicidade. Nenhum agendamento ou serviço da VM foi alterado.

Estado: implementação e manual publicados no GitHub; texto diário atualizado no envio-manual do Supabase. Validação local: sintaxe, contrato de atualização, abertura com destinatário e mensagem, alternativa para pop-up bloqueado, cancelamento/falha, aba reservada antes da consulta, envio antecipado e liberação de consulta às 7h. O proprietário já confirmou a abertura do acesso individual e o bloqueio antes das 7h; essa evidência não confirma envio real pelo botão desta versão. Recuperação: reverter o commit no GitHub e reimplantar a versão anterior do envio-manual. Operação não exige instalar executores, copiar tokens nem repetir comandos.

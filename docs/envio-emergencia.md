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


### Botões Desktop e Celular apontam para o acesso público — 29/10/2026

Versão 20261029-botoes-emergencial-06. Decisão do proprietário: substituir nos dois ambientes o destino anterior do botão Disparo Emergencial pelo endereço https://urbanopos.github.io/Assistente.FSJ/?fsj_acao=disparo-emergencial . Na interface responsiva publicada, botão inicial e menu abrem esse endereço absoluto em outra aba, preservando a tela de origem. A chegada pelo endereço abre a tela autenticada, sem enviar mensagens automaticamente e sem redirecionamento circular. WhatsApp usa a sessão do dispositivo; autenticação do proprietário permanece exigida pelo serviço.

Validação: contrato de atualização e tests/emergencia-acesso-publico.cjs. Publicado no GitHub para as visualizações Desktop/Celular. Não equivale a comprovar instalação nas pastas isoladas da VM/Windows; essas cópias não estão acessíveis nesta sessão. Ao atualizá-las, manter exatamente o mesmo endereço absoluto, sem substituir pelo endereço local ou VPN. Recuperação: reverter o commit desta versão. Agendamentos preservados.


### Correção da abertura no celular — 29/10/2026

Versão 20261029-emergencia-celular-07. O botão do proprietário e os controles individuais passam a reservar a abertura no próprio toque também em Android/iPhone, antes da preparação assíncrona. O mesmo fluxo do laptop encaminha essa aba ao link móvel do WhatsApp com telefone oficial e mensagem codificados. Não substitui a aba do FSJ por uma navegação tardia. Se o navegador ou sistema impedir a abertura, o link visível **Abrir conversa de [destinatário] com a mensagem** permite um toque direto. Esse toque é necessário quando o dispositivo bloqueia a transferência automática para o aplicativo; não é possível garantir troca de conta conectada. Confirmação continua manual após envio real. Validação local simula Windows, Android, iPhone, bloqueio, cancelamento e erro; confirmação no aparelho real pendente. Contrato de atualização passou. Recuperação: reverter o commit desta versão. Consulta às 7h e agendamentos preservados.


## Código temporal da mensagem — 29/10/2026

A mensagem diária preparada para Desktop e Celular passa a incluir `Código da mensagem: FSJ-<instante UTC do quadro>-<identificador único do quadro>`. O instante identifica a criação do quadro, não comprova o horário do envio no WhatsApp. O código permanece estável ao preparar novamente o mesmo quadro e muda entre quadros; tentativas repetidas podem gerar cópias com o mesmo código. A API também retorna codigo_mensagem e o inclui no histórico quadro_manual_confirmado quando o proprietário confirma o envio. Publicado no GitHub e implantado em envio-manual v8. Nenhuma mensagem já enviada é modificada retroativamente.

O código prepara uma identificação exata para eventual executor de exclusão: exigir conta remetente, destinatário e código correspondentes e obter o identificador real do WhatsApp; em caso de duplicidade/ambiguidade, não apagar automaticamente. O código não concede ao link web acesso à conversa nem aciona Apagar para todos. A exclusão automática não foi implantada nesta entrega. Não registrar mensagem como apagada sem confirmação efetiva do WhatsApp. Mantém lembrete de exclusão manual e as regras de envio/consulta existentes.

Validações: sintaxe, estabilidade do código, diferenciação por quadro, presença na mensagem e no histórico da confirmação; fluxo de envio antecipado e bloqueio de consulta preservado. Recuperação: reverter este commit e reimplantar a versão anterior de envio-manual. Agendamentos e pastas isoladas da VM não alterados.


## Substituição emergencial estrita — ordem do proprietário em 29/10/2026

Sequência solicitada: identificar a mensagem anterior da mesma conta e conversa; solicitar Apagar para todos; aguardar confirmação do WhatsApp; somente então enviar a mensagem nova e registrar seu identificador real. Para esta operação, falha ou incerteza no apagamento bloqueia a nova mensagem. A decisão de continuidade após falha de 19/10 permanece histórica e aplicável à rotina diária existente; não alterar essa rotina para ativar a nova operação emergencial.

Preparação publicada: automation/emergency-replacement.mjs exporta identifyPrevious (código exato, fromMe e conversa; bloqueia ausência/ambiguidade) e replaceEmergency (apagamento confirmado antes do envio, diário associado a destinatário/texto/mensagem anterior, proteção contra repetição em envio incerto e retomada sem reenviar). Usar o revoke existente em automation/wa.mjs, que solicita message.delete(true) e espera message_revoke_everyone. O chamador deve manter lock exclusivo por conta WhatsApp, persistência durável do diário, autenticação exclusiva do proprietário e seleção explícita de um destinatário; nunca disparar para todos como efeito de uma solicitação individual. Não iniciar outro cliente sobre a mesma sessão.

Validação: cinco testes em tests/emergency-replacement.test.mjs passaram para ordem de exclusão/envio, bloqueio em falha ou incerteza, impedimento de repetição e seleção da mensagem correta. Esses testes usam executor simulado; não comprovam exclusão real.

Estado real: código complementar preparado no GitHub, NÃO integrado aos botões nem instalado/ativado no executor. A consulta ao fsj_executor_emergencia não retornou heartbeat; VM inacessível nesta sessão. Nenhuma mensagem apagada ou enviada por esta entrega. As rotinas de abertura manual Desktop/Celular continuam funcionando. Pendente: conectar o executor autenticado já existente, instalar o complemento respeitando as pastas separadas, ligar a solicitação individual autenticada do botão ao executor e validar com o proprietário. O GitHub por si só não controla a sessão de WhatsApp do laptop ou celular. Recuperação: remover a integração futura ou reverter o commit deste complemento; não modificar agendamentos existentes.


## Executor integrado ao pacote — determinação do proprietário em 29/10/2026

O Executor de Emergência é componente interno do pacote Disparo de Emergência; não criar outra tarefa operacional para o proprietário, botão de iniciar executor nem comando diário. Uma única solicitação do Desktop/Celular deve executar e acompanhar a substituição. Configuração técnica inicial e vínculo da sessão continuam necessários uma vez no computador hospedeiro.

Pacote preparado: automation/emergency-agent/{component.mjs,worker.mjs,README.md}; database/emergency-agent.sql; supabase/functions/emergency-agent/index.ts; disparo-emergencial/executor-client.js; adaptadores separados desktop/disparo-emergencial.js e celular/disparo-emergencial.js. Preservar as interfaces próprias das pastas /home/urbano/fsj-instalacoes-isoladas/desktop e /home/urbano/fsj-instalacoes-isoladas/celular. O processo hospedeiro inicia/encerra o componente automaticamente; cliente usa apenas a API autenticada e nunca recebe a chave privilegiada. Fila dedicada não é consumida pela rotina geral antiga.

Validação: nove testes locais passaram para ciclo de vida do componente, configuração, desconexão, comando único, ordem apagar-confirmar-enviar, ausência/ambiguidade, falha e resultado incerto. Sintaxe do worker, cliente e função validada. Não houve envio real nos testes.

Estado: publicado como código preparado; NÃO aplicar SQL ou ativar botões antes da instalação e vínculo do executor no hospedeiro. SQL, nova função, executor e adaptadores ainda não implantados. VM inacessível. Não afirmar funcionamento automático em produção. O fluxo manual existente permanece. Recuperação: desativar o componente futuro sem apagar diários nem repetir pedidos incertos. Não alterar os agendamentos diários como parte desta preparação.

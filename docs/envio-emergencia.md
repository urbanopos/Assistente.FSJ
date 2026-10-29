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


## Botões ligados ao executor integrado — 29/10/2026

Versão 20261029-emergencia-integrada-08. Na interface pública responsiva Desktop/Celular, o botão do proprietário e o envio individual dentro da seção Disparo Emergencial chamam emergency-agent via executor-client.js. Não abrem aba WhatsApp, não pedem envio manual nem confirmação manual. A preparação do pedido é autenticada pela titularidade, e só aceita pessoa cadastrada. Mensagem/telefone vêm do serviço envio-manual. Os controles manuais de Pessoas/Comunicação permanecem fora deste fluxo.

Fila e presença dedicadas fsj_emergency_jobs/fsj_emergency_agent foram implantadas no Supabase; RLS ativa, sem privilégios para anon/authenticated, claim permitido apenas a service_role. Função emergency-agent v1 publicada com autenticação própria por validação do usuário e titularidade no servidor. Se não houver executor conectado com presença recente, a solicitação é bloqueada. Repetição de clique é protegida no cliente, por request_id e pelo índice de pedido ativo por pessoa/dia.

Estado real: servidor e ligação dos botões publicados; executor do computador não instalado/vinculado, presença conectada ausente. Não afirmar que o apagamento está operacional. Pastas isoladas da VM continuam pendentes de receber a integração, preservando seus layouts. Teste real determinado pelo proprietário: exclusivamente Urbano, após comprovar conexão do executor. Nenhum outro destinatário autorizado para o teste.

Verificação: contrato de atualização, testes do botão integrado e nove testes de componente/substituição passaram. Checagem HTTP ao endpoint real foi bloqueada pela revisão automática por possível efeito de apagamento/envio; não repetida nem usada como evidência de funcionamento. Sem exclusão/envio real nesta entrega. Para recuperação, reverter o front-end ao fluxo anterior; manter diários e fila para investigar qualquer estado incerto. Não repetir pedidos em execução/incertos automaticamente.


## GitHub Actions — implementação vigente em 29/10/2026

A ação **Disparo Emergencial FSJ**, arquivo .github/workflows/disparo-emergencial.yml, executa em runner hospedado no GitHub, sem usar a rede da fazenda. workflow_dispatch restrito ao proprietário, concorrência única, modo padrão validar sem exclusão/envio. O modo executar tem duração de 5 a 60 minutos e não é um serviço permanente. O envio final é manual no WhatsApp do proprietário, para a pessoa explicitamente selecionada.

A execução exige SUPABASE_SERVICE_ROLE_KEY em secret, FSJ_EMERGENCY_CONFIG_VERSION=manual-final-v1 em variável somente após configuração validada, e sessão já vinculada em arquivo executor.tar.gz no bucket privado fsj-emergency-state (ou nome definido em FSJ_EMERGENCY_STATE_BUCKET). O arquivo de sessão não é publicado no repositório, cache ou artefatos GitHub. O serviço de armazenamento deve permanecer privado; chave somente no runner/servidor. Não criar ou guardar sessão por dispositivo do proprietário: o executor é central e a interface Desktop/Celular comanda o mesmo pacote. Vínculo inicial pode exigir autorização no WhatsApp.

O worker foi alterado para preparar/apagar e nunca executar send. Após confirmação do apagamento, registra pronto_para_envio, permitindo ao navegador abrir o número e a mensagem preparados. O usuário pressiona Enviar. O worker pode identificar depois o envio manual pelo código exato, remetente, conversa e horário, sem declarar envio apenas pela abertura do link.

Estado: workflow e código publicados; seis testes da ação/preparação e contrato de atualização passaram. A ação NÃO foi disparada nesta entrega. Credencial, bucket privado e sessão vinculada NÃO configurados nem comprovados. Banco em produção ainda precisa receber database/emergency-agent-manual-send.sql para admitir pronto_para_envio; a trava manual-final-v1 impede executar antes dessa configuração. A publicação da função emergency-agent v2 já admite retornar o preparo. O início da ação pelo botão da página ainda depende de configurar um mecanismo autenticado de acionamento GitHub; nenhum token GitHub foi criado ou exposto nesta sessão. O link da página está disponível pela internet, mas isso não comprova executor online.

A regra atual substitui a intenção anterior de envio integralmente automático: o envio final é SEMPRE manual. O teste real deve limitar-se a Urbano após configurar e vincular o executor. Rotina das 7h e pastas isoladas da VM não foram alteradas. Recuperação: desativar a ação e reverter o commit; conservar fila/diários para analisar qualquer operação incerta.


## Correção urgente — abertura direta do destinatário (29/10/2026)

Versão 20261029-emergencia-abertura-direta-11. Por determinação do proprietário, o botão operacional de emergência volta a preparar a mensagem por envio-manual e abrir diretamente o WhatsApp do destinatário explicitamente selecionado, com texto preenchido. Reserva a abertura no próprio clique em Desktop/Android/iPhone e mostra link direto se o navegador bloquear. Não depende do heartbeat do executor ainda desconectado. A identidade do proprietário e o telefone permanecem conferidos pelo serviço existente; nenhum telefone é fornecido pelo cliente nem fixado no botão.

O envio final é manual no WhatsApp; confirmar no Assistente somente após envio real. Registro prévio é informado para evitar duplicidade. O apagamento automático NÃO é executado por este fluxo; permanece pendente da ativação real do executor. Corrige a ligação prematura ao executor não configurado, que impedia abrir a conversa. A ação GitHub preparada permanece separada e não foi executada nesta entrega. Permissões, calendário e bloqueios dos demais perfis não alterados. Pastas da VM não atualizadas nesta sessão.

Validação: contrato de atualização e teste emergency-direct-open.cjs passaram em simulações Windows/Android/iPhone com destinatário, mensagem, abertura antes da consulta e alternativa para pop-up bloqueado. Nenhum envio ou apagamento real. Recuperação: reverter este commit se necessário, sem repetir mensagens já enviadas.


### Verificação de liberação no expediente e correção da ação — 29/10/2026

Revalidado o código publicado e as funções implantadas: os demais usuários têm consulta liberada nas faixas 07:00–12:00 e 14:00–16:20, America/Recife; proprietário titular ativo permanece dispensado. O teste expediente-banner.cjs passou contra cópias atuais das duas funções e quatro páginas. A tela inicial consulta novamente a cada 30 segundos e ao retomar, retirando o banner em resposta autorizada; não depende da ação de disparo. Às 06:54 de Pernambuco, o servidor ainda indicava bloqueio dos demais perfis, como esperado. Esse teste determinístico não equivale a confirmação manual no aparelho às 7h.

Corrigida causa de rejeição do workflow Disparo Emergencial FSJ: runner.temp não é permitido no env do job. A pasta privada passa a ser definida por RUNNER_TEMP dentro da etapa do runner, via GITHUB_ENV. Adicionada validação automática em push apenas para arquivos deste pacote, sem iniciar WhatsApp, apagar ou enviar mensagens. Entradas ausentes em push assumem validar/15 minutos. A execução real continua exigindo configuração protegida, sessão vinculada e trava manual-final-v1. O fluxo manual operacional do botão foi preservado; não religar o botão ao executor enquanto a configuração real não estiver concluída.

Validação local: YAML, contextos e Python da etapa aprovados. A execução GitHub de validação será acompanhada após a publicação. Credenciais e sessão do executor ainda não configuradas nesta sessão; não declarar implantação definitiva concluída nem apagamento ativo. Nenhuma mensagem real enviada/apagada nesta verificação. Recuperação por reversão deste commit; nenhuma mudança nos agendamentos diários.


## Aba única do WhatsApp no Disparo Emergencial — 29/10/2026

Versão 20261029-emergencia-aba-unica-12. A cada acionamento, reutilizar a referência da aba de WhatsApp aberta pelo Assistente; usar o nome fixo fsjWhatsAppEmergencial também no link alternativo. Atualizar destinatário e mensagem nessa aba e trazê-la à frente, sem abrir uma nova aba sem nome em cada disparo. Se a aba foi fechada, abrir outra para retomar a operação. Não fechar abas antigas ou independentes do usuário. Não recarregar a aba reutilizada em branco durante a preparação; falha de preparação não fecha uma conversa que já estava aberta. Browser isolation/encerramento de contexto pode impedir reaproveitamento de uma aba externa; a referência é mantida durante a operação do Assistente e não se promete localizar qualquer aba pré-existente do navegador.

Preservar envio final manual, confirmação posterior, seleção explícita de destinatário, sessão pessoal do WhatsApp, calendário e permissões. O vínculo da conta não é recriado pelo código. O apagamento automático permanece pendente do executor, separado desta correção de navegação. O fluxo fora da seção de emergência não foi alterado.

Validações: contrato de atualização, destinatário/mensagem em Windows/Android/iPhone, dois disparos reutilizando uma aba, abertura após fechamento e destino fixo no link alternativo. Testes simulados; validar no navegador do proprietário. Recuperação: reverter este commit. Cópias isoladas da VM não atualizadas nem promovidas a backup nesta sessão.

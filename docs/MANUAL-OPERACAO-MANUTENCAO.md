# Assistente FSJ — Manual de operação e manutenção

Revisão operacional: 26/10/2026 (complementa histórico de 22–24/10/2026). Responsável pelo sistema: Urbano. Nome de uso: Assistente FSJ — Tarefa.
Este é o ponto de entrada vigente para operação e manutenção. Os documentos vinculados detalham cada módulo. Decisões antigas permanecem como histórico; não devem ser usadas isoladamente para restaurar funcionalidades substituídas.

## Manuais por tipo de usuário — regra vigente (26/10/2026)

**Consultar primeiro o [índice de manuais por perfil](manuais/README.md):** [Proprietário](manuais/PROPRIETARIO.md), [Gestor](manuais/GESTOR.md), [Funcionário](manuais/FUNCIONARIO.md), [Visitante](manuais/VISITANTE.md), [Outros](manuais/OUTROS.md).

**Regra prevalente sobre propostas antigas deste histórico:** Proprietário e Gestor compartilham a mesma configuração **operacional**, no escopo delegado. **Somente o Proprietário** tem acesso a manutenção, VM, arquitetura, código-fonte, repositórios, segredos e implantação. Funcionário, Visitante e Outros entram por **link pessoal** com as limitações configuradas pelo Proprietário/Gestor, sem senha administrativa. Visitante não tem supervisão. Outros é um visitante com facilidades específicas explicitamente concedidas. Essas regras precisam ser implementadas e testadas no servidor; o manual não é comprovação de implantação.

Cada seção dos manuais individuais deve começar com **captura real atual** da tela; as imagens ainda estão pendentes de incorporação, e não devem ser inventadas nem expor dados privados.

## Guia visual vigente — desktop e celular (26/10/2026)

**Ordem obrigatória da documentação de cada tela:** (1) captura real da tela na versão publicada, identificada como **Desktop** ou **Celular**; (2) finalidade e caminho de acesso; (3) campos e botões; (4) permissões por perfil; (5) origem e atualização dos dados; (6) testes e recuperação. **As capturas reais ainda não foram incorporadas ao repositório**: não utilizar imagens fictícias, telas antigas nem afirmar que existe um print atualizado. Após capturar e conferir, inserir imagem Markdown no início da seção correspondente, por exemplo `![Página Pessoas — desktop](imagens/pessoas-desktop.png)` e `![Página Pessoas — celular](imagens/pessoas-celular.png)`. Os caminhos são **exemplos de organização, não arquivos já existentes**. Não publicar prints com telefone, token de WhatsApp, senha, nomes privados ou dados pessoais sem ocultação.

### 1. Menu Principal e Pessoas
**Print inicial:** captura real da página Pessoas desktop e celular — **pendente**.

No desktop, Menu Principal → Pessoas → selecionar pessoa → ficha. O botão **Salvar alterações** foi acrescentado logo após os dados cadastrais da pessoa selecionada; mantém o salvamento da ficha. A seleção da pessoa e da página deve ser preservada. A página não deve ficar bloqueada em “Atualizando dados da Armazenagem”. A versão de navegação leve **20261026-nav-light-04** abre a página imediatamente, usa dados já disponíveis e atualiza apenas recursos relevantes em segundo plano. Não exigir Ctrl + F5 como rotina. **Publicação confirmada; validação final no navegador pendente.**

Categorias e regras: Proprietário administra; Funcionário executa tarefas próprias e pode ter acompanhamento autorizado; Gestor acompanha e orienta sem criar tarefas; Visitante **não possui supervisão**. O checkbox “Atua como supervisor” não deve ser oferecido nem aceito para Visitante, inclusive em cadastros antigos. A imagem enviada em 26/10 mostrou um Visitante ainda marcado como supervisor; **essa correção específica na ficha e no servidor permanece pendente de validação/implementação completa**. Não confundir decisão de produto com permissão já comprovada.

### 2. Demandas e retornos — painel administrativo
**Print inicial:** captura real do filtro por responsável e dos dois quadros — **pendente**.

Selecionar funcionário/responsável e situação. A lista de **tarefas individuais** aparece primeiro. As **tarefas de grupo** atribuídas ao responsável aparecem em quadro próprio abaixo, com nome do grupo e participantes, sem duplicar as individuais. Manter colunas de situação, retorno, R/I, E/C, conclusão, edição/exclusão e supervisão conforme autorização. A separação foi publicada no `index.html`, commit `64832cbf1bbaf0768afef805abeceb3ba12f3e73`; **teste visual e funcional pendente**. A tela “Demandas e retornos — Grupos” continua disponível para filtrar por grupo. Não usar o filtro administrativo como prova de que o link do WhatsApp está atualizado.

### 3. Quadro diário recebido pelo WhatsApp
**Print inicial:** captura real de `quadro.html#token=...` com token e dados privados ocultados, no desktop e celular — **pendente**.

O usuário abre o link diário e vê **Tarefas individuais** primeiro e **Tarefas de grupo** abaixo. Para cada tarefa coletiva, exibir **grupo e participantes**, mantendo código Tar, cores, prioridade e andamento. O quadro não deve repetir uma tarefa na seção individual. O front-end `quadro.html` foi publicado nos commits `0607f333cbf609892cfa4689f842f61117f93ca7` e `4d1e78e9131090f2363e3c05758d149ecf4ae6da`; a função Supabase `resposta-tarefa` foi implantada na versão **23** para retornar `grupo_id`, `grupo_nome` e `participantes`. **Conferência em link real e ambos os dispositivos pendente**. Não alterar por isso a rotina de disparo das 7h.

### 4. Resposta individual da tarefa
**Print inicial:** captura real de `responder.html` com tarefa válida, no desktop e celular — **pendente**.

O formulário vigente tem **três botões verdes**: **Iniciar tarefa**, **Dúvidas sobre a tarefa**, **Sugestão de tarefas**. Abaixo, o botão **← Página anterior**, centralizado, retorna pela navegação do navegador quando existe histórico; link direto pode não ter página anterior. A versão antiga com apenas dois botões **não é padrão válido**. Em link sem token, mostrar apenas erro de link inválido, sem formulário de tarefa ou controles de sugestão soltos. Correções publicadas em `responder.html` e `task-suggestions.js`; conferir o comportamento real antes de dar a remoção por validada. Não restaurar telas antigas para resolver incidentes.

**Visitante — demonstração sem gravação:** os controles apresentam apenas estas mensagens:
- Iniciar: “Se executor, iniciaria a tarefa.”
- Concluir — SIM: “Se executor, concluiria a tarefa.”
- Concluir — NÃO: “Se executor, justificaria a não execução.”
- Finalizar: “Se executor, informaria a conclusão.”

Nenhuma dessas ações deve alterar situação, execução, conclusão, justificativa, anexo ou envio de WhatsApp. O bloqueio de escrita foi acrescentado à função `resposta-tarefa`; validar com link de visitante real. Os quatro botões demonstrativos e a autorização no servidor são regras complementares.

### 5. Painel de Manutenção e acesso à VM
**Print inicial:** captura da autenticação sem credenciais nem informações sensíveis — **pendente**.

O acesso de manutenção é exclusivo do Proprietário autenticado. A tela HTTPS da VM (porta 9443) **não deve ser aberta automaticamente** por navegação ou atualização do aplicativo: o caminho previsto é o botão **Manutenção da VM**, dentro do **Painel de Manutenção**. Acesso direto por URL continua sujeito à VPN e autenticação no servidor; ocultar botão não é controle suficiente. **Restrição de abertura exclusiva pelo botão ainda não foi implementada/validada.** Não remover a senha nem expor credenciais.

### 6. Atualização, preservação da tela e manutenção de versões
Não recarregar todas as tabelas a cada seleção de página. Priorizar atualização seletiva e assíncrona dos elementos funcionais, sem bloquear a página. Preservar página, pessoa selecionada e posição de leitura durante atualização automática. Não apagar dados de formulários não salvos. As correções intermediárias `20261026-nav-stay-auto-01`, `nav-fix-02` e `nav-unblock-03` foram substituídas pelo padrão leve `20261026-nav-light-04`; **não restaurar a espera geral bloqueante**. Validar especialmente seleção de Pessoas, filtros, mudanças de versão e ausência de Ctrl + F5.

### 7. Matriz de apresentação e testes
| Recurso | Desktop | Celular | Estado |
| --- | --- | --- | --- |
| Pessoas e Salvar alterações | Ficha com botão sob cadastro | Mesma função com layout adaptado | Publicado; teste pendente |
| Demandas individuais e de grupo | Quadros separados | Mesma separação, layout responsivo | Publicado; teste pendente |
| Link diário WhatsApp | Individuais e grupos com participantes | Mesmo conteúdo com adaptação móvel | Publicado; teste pendente |
| Resposta individual | Três ações + Página anterior | Três ações + Página anterior | Publicado; teste pendente |
| Visitante | Simulação, sem escrita | Simulação, sem escrita | Parcialmente publicado; validar bloqueios e cadastro |
| Manutenção VM | Autenticação exclusiva | Acesso somente se autorizado | Acesso pelo botão ainda pendente |

**Regra de recuperação:** preservar backup, sessão WhatsApp, banco e histórico. Antes de restaurar, comparar a versão com este guia; não ressuscitar PDF de cartões, telas antigas de dois botões, navegação bloqueante ou permissões antigas de Visitante. Publicação no GitHub/Supabase não comprova validação em todos os aparelhos.

## Controle de versão e implantação

Toda melhoria, correção ou mudança de fluxo deve atualizar este manual e o documento do módulo na mesma entrega. Registrar comportamento, perfis autorizados, versão/commit, validação, aplicação necessária e recuperação. Diferenciar: solicitado, publicado, instalado e validado no aparelho. Publicar no GitHub não comprova instalação na VM, no Windows ou no Android.

| Melhoria | Situação conhecida nesta revisão |
| --- | --- |
| Finalização SIM/NÃO no desktop do proprietário | Publicada no commit aed1dab5487a0e43d8710e045f176c5c95c3b8ed; teste real pendente |
| Indicador mensal de tarefas diárias | Migração e APIs implantadas; testes controlados concluídos |
| Cancelar conclusão insatisfatória | Migração e APIs implantadas; nenhuma conclusão real cancelada nos testes |
| Nome do vídeo, classificação legada em Outros e seleção sem repetição por ID | Atualizador publicado; aplicação na VM ainda não confirmada |
| Ponte SSH Desktop → VM | Verificação manual publicada; conexão ainda não confirmada |
| VPN/canal virtual permanente | Planejado; não instalado por esta entrega |
| Chamadas, áudio, vídeo e toque com aplicativo fechado | Funcionamento integral ainda não confirmado nos aparelhos |

## Pessoas, responsabilidades e acesso

O Proprietário administra o sistema e também pode ser responsável por tarefas pessoais. A atividade não precisa representar uma ordem para funcionário. Uma tarefa deve ter o responsável correto no cadastro.

Funcionários acessam as próprias tarefas pelo link individual do WhatsApp e registram execução conforme autorização; podem consultar tarefas de terceiros se expressamente autorizados como supervisores, sem modificá-las. **Visitantes não são supervisores:** apenas consultam as tarefas autorizadas e experimentam os botões demonstrativos, sem qualquer gravação. **Gestores:** definição vigente solicitada pelo Proprietário é acompanhar e orientar a execução, **sem criar tarefas**; a implementação integral e as permissões efetivas precisam de validação. O Proprietário mantém a administração técnica e as decisões exclusivas. O documento [perfil Gestor](decisoes/perfil-gestor.md) pode conter propostas anteriores e não prevalece sobre esta regra. Toda permissão precisa ser verificada no servidor, não apenas ocultada na tela.

A autorização de Vídeos e Chamadas é controlada em Pessoas e não amplia as permissões de tarefas. Não compartilhar links pessoais nem credenciais.

## Consultar e finalizar tarefas, inclusive pessoais

Em Demandas e retornos, selecione o responsável e a situação desejada. A lista mostra o código Tar, a periodicidade e um trecho curto da descrição; a descrição completa fica na tela da tarefa.

Ao clicar em tarefa não arquivada na lista de demandas do painel, abre-se o formulário de resposta tanto no desktop quanto no celular. O registro fica vinculado ao responsável selecionado. Para tarefas pessoais do Proprietário, selecionar seu próprio cadastro. O acesso administrativo já existente é validado pelo servidor; esta alteração não delega administração aos participantes.

- SIM registra a conclusão pelo fluxo de respostas existente e, após confirmação do servidor, retorna automaticamente à lista com o responsável e o filtro preservados.
- NÃO abre a justificativa, com texto/voz conforme o aparelho, anexos opcionais e pedidos à administração quando disponíveis. Depois de enviar e receber confirmação do servidor, retorna à mesma lista. Se houver erro ou falha parcial de anexos, permanece na tela com o aviso; não oculta a falha.
- A execução conserva os registros de início, suspensão, retomada e conclusão.
- Tarefas arquivadas permanecem somente para consulta.
- Resposta já registrada, calendário, prazo do link e restrições de expediente continuam sujeitos às regras existentes. A correção de desktop não libera automaticamente tarefas pessoais fora dessas condições.

Preto indica em aberto; azul, em andamento; amarelo, pendente; vermelho, prioritária. Urgência pulsa somente no rótulo. Conclusão elimina a pulsação. O detalhe mantém leitura convencional.

R/I informa horas entre registro e início; E/C, entre início e conclusão, como tempo decorrido incluindo pausas. Ausência de informação não equivale a zero.

## Tarefas diárias e periódicas

As periodicidades são pontual, diária, semanal, mensal, trimestral, semestral e anual; consultar [decisão de periodicidade](decisoes/tarefas-periodicas.md).

Para tarefa diária, X / Y significa dias previstos com conclusão no prazo sobre dias de trabalho previstos no mês. A conclusão é pontual até o final do dia imediatamente seguinte ao previsto, em America/Recife. Cada dia conta uma vez; o mês é o da ocorrência. Calendário salvo, folgas, férias e feriados afetam o denominador. O indicador não substitui a situação operacional nem arquiva tarefas automaticamente.

Detalhes e testes: [indicador mensal](../automation/daily-progress/README.md).

## Revisar conclusão e arquivar

Na edição da demanda, o Proprietário usa Revisar conclusão, identifica o registro/dia e informa o motivo. O cancelamento devolve a ocorrência a Pendente, permite nova resposta válida e ajusta o indicador mensal. Respostas, anexos e auditoria são preservados; o SIM cancelado deixa de valer como conclusão.

O cancelamento não estende a validade de links vencidos. Tarefas arquivadas não podem ser revistas por essa edição. Após análise, usar Aprovar e arquivar quando a conclusão estiver válida. Não presumir que permissão de consulta inclui essa ação.

Detalhes: [revisão de conclusão](../automation/completion-review/README.md).

## Dúvidas, sugestões e pedidos

A dúvida deve identificar a tarefa e descrever a pergunta. O encaminhamento deve alcançar os responsáveis pela supervisão e o Proprietário conforme as permissões do sistema. Sugestões têm identificação própria, tema e descrição. Pedidos em Itens faltantes podem gerar tarefa vinculada ao Proprietário. Conferir o histórico e o vínculo antes de criar uma segunda demanda.

Referências: [itens faltantes](itens-faltantes.md), [execução e suspensão](inicio-suspensao-tarefas.md).

## TV FSJ e biblioteca

Vídeos e Chamadas é uma aba do sistema; não tratar Reserva como novo aplicativo independente. Os nomes antigos de diretórios e serviços são identificadores técnicos legados.

A TV inicia no cartaz com logotipo e botão de reprodução; ao terminar o institucional, retorna à tela estática. A TV pode ser assistida a qualquer horário por participante autorizado. Essa permissão não elimina automaticamente restrições de chamadas.

Na biblioteca, selecionar tema: Campo, Aviário, Limpeza, Máquinas, Serviços ou Outros. O tema vale para seleção e inclusão. O novo atualizador exige Nome do vídeo para arquivo ou YouTube; sugere o nome do arquivo e permite alteração. Vídeos antigos sem classificação são migrados para Outros. Proprietário ou autor autorizado pode editar o tema sem reenviar.

A seleção elimina repetição do mesmo ID de vídeo/YouTube por tema; vídeos distintos com o mesmo nome são preservados. Isso não é exclusão de arquivos duplicados por conteúdo. Institucional e exclusão seguem as permissões do Proprietário e confirmação existente.

Aplicação da atualização na VM ainda precisa ser confirmada. Consultar [biblioteca, instalador, validações e recuperação](../automation/tv-library-form/README.md).

## Chamadas

Selecionar até três convidados e iniciar a chamada; o destinatário aceita ou recusa. Controles de microfone, câmera e encerramento pertencem à tela da chamada. Som de espera no originador não comprova toque nem conexão do destinatário.

Testar nos dois aparelhos: convite, aceite, áudio bidirecional, vídeo bidirecional, recusa, encerramento e liberação de câmera/microfone. Recebimento com aplicativo fechado depende do cliente Android e permissões reais; não prometer funcionamento sem teste. Permissões exigidas pelo Android dependem de confirmação do usuário.

Encerrar uma chamada não deve provocar encerramento da sessão administrativa geral do sistema. Regras antigas de logout do aplicativo separado não devem ser reaplicadas sem verificar o fluxo integrado.

## Rotina WhatsApp das 7h

Preservar o executor, a sessão vinculada, o agendamento e o diário persistente. Somente um executor de disparo deve atuar. Não iniciar rotina real para testar telas, conexão ou documentação.

O padrão vigente é Web, sem cartões PDF, inclusive em recuperação. A decisão substituída de PDF não autoriza sua restauração. Referência: [retorno Web sem PDF](decisao-retorno-web-sem-pdf-20261019.md).

Cabeçalho com data, CONSULTA/CONSULTAR TAREFAS conforme o modelo instalado, TAREFAS DE TERCEIROS somente quando autorizado e aviso em negrito ESTA MENSAGEM CANCELA AS ANTERIORES. Conferir o formato instalado antes de trocar arquivos locais.

Envio confirmado é diferente de entrega/leitura. Resultado incerto exige conferência antes de repetir. Nunca apagar recibos, diário ou trava para forçar reenvio. Envio manual confirmado segue o [procedimento de emergência](envio-emergencia.md).

A política de tentativas descrita no [manual específico das 7h](MANUAL-ROTINA-WHATSAPP-7H.md) está identificada nesse documento como aprovada e pendente de implantação/testes. Não convertê-la em “instalada” sem evidência.

## Atualização habitual

A decisão permanente exige busca de atualizações ao abrir/retomar, aplicação segura e preservação de dados, sessão, rascunhos e chamadas. Android pode exigir confirmação de instalação. Não instruir recarga manual como procedimento habitual nem confundir configuração inicial com atualização recorrente.

Referência obrigatória: [atualização automática](decisoes/atualizacao-automatica.md). Falha de atualização deve ser diagnosticada; a existência da decisão não comprova atualização em todos os dispositivos.

## Manutenção, backup e recuperação

1. Identificar versão, serviço real e arquivos alterados antes de instalar; conferir alterações locais.
2. Confirmar ausência de chamada, edição e envio de tarefas em andamento.
3. Criar backup de código/configuração e snapshot consistente do banco; proteger credenciais e permissões.
4. Usar instalador revisado e commit fixo, preservando contas, respostas, vídeos, autorizações e recibos.
5. Validar saúde do serviço e o fluxo alterado. Testes devem usar dados isolados ou transação com rollback; não enviar mensagens ou iniciar chamadas reais sem autorização.
6. Se falhar, seguir recuperação do módulo. Não sobrescrever banco com registros mais recentes usando backup antigo.
7. Registrar resultado, backup, versão aplicada e validação real no histórico desta documentação.

VM conhecida: /home/urbano/fsj-video-v001; serviço legado fsj-reserva.service. Windows: tarefa conhecida FSJ-Tarefas-07h. Confirmar esses identificadores no ambiente antes de atuar. Não reiniciar VM, Windows ou sessão do WhatsApp por simples mudança de interface.

GitHub Actions depende do executor conectado. A verificação verificar-ponte-vm.yml é manual, não cria VPN e bloqueia antes das 8h de Recife e quando detecta a tarefa local em execução. Não colocar senha ou chave privada no código/log. Configurar acesso remoto autenticado somente após confirmar os pré-requisitos.

## Histórico desta revisão

22/10/2026: consolidação dos fluxos pessoais e administrativos, SIM/NÃO no desktop, indicador diário, revisão de conclusão, biblioteca por nome/tema e estado real do canal remoto. Instituída atualização obrigatória do manual a cada melhoria. Esta revisão documental não executa rotinas, instala pacotes ou altera dados operacionais.

22/10/2026: corrigido retorno à lista do Proprietário após resposta confirmada SIM ou NÃO, preservando responsável/filtro e mantendo erros e falhas de anexos visíveis. Testes de interface usam respostas simuladas; validação no aparelho permanece necessária.

22/10/2026: registrada nova definição do Gestor operacional, substituindo acompanhamento/orientação apenas. Administração técnica e titularidade exclusivas do Proprietário. Ampliação de permissões pendente de implantação; limites de confidencialidade do repositório público e do código cliente documentados.



## Identidade da assistente — MarIA (24/10/2026)

Nome vigente no Assistente: **MarIA**, sem o sufixo FSJ. Brisa continua sendo o nome usado pelo Proprietário em sua conversa no ChatGPT, da OpenAI. As escolhas anteriores Zelia e MarIA FSJ estão substituídas.

A interface, apresentação por voz, rótulos de acessibilidade e contexto preparado para o ChatGPT passam a usar MarIA na versão `20261024-maria-01`. O avatar instalado permanece nesta entrega. Identificadores técnicos legados `brisa*`, arquivos de imagem e preferências de voz são preservados para compatibilidade. Chamadas por “MarIA” são reconhecidas e “Brisa” permanece como alias legado. A voz Microsoft Maria é um nome do sistema operacional e não foi renomeada.

Esta mudança de identidade não instala inteligência local, acesso de manutenção ou sincronização da VM. Ollama e o modelo pequeno foram testados separadamente na VM e não estão integrados às respostas do aplicativo. A assistente deverá respeitar dados e permissões existentes. Melhorias novas devem ser encaminhadas ao Proprietário para desenvolvimento com a Brisa no ChatGPT.

Validação da entrega: contrato de atualização automática, sintaxe dos scripts e testes de identidade/comandos por voz com dados simulados. Publicação do código, disponibilização pelo Pages e atualização da cópia na VM são estados distintos; a VM ainda depende de sincronização confirmada. Detalhes: [identidade MarIA](maria-identidade.md).

Recuperação: reverter apenas as alterações de identidade e versão deste commit, respeitando o contrato de atualização; nenhum banco, credencial, registro, imagem, sessão ou arquivo de preferências é substituído por esta mudança.


### Atualização visual de 24/10/2026 — `20261024-maria-avatar-02`

Substitui a indicação anterior de avatar preservado: o painel, o ícone de abertura e a miniatura do cabeçalho passam a usar a identidade morena apresentada para MarIA. `maria-avatar.webp` contém o retrato e `maria-expressoes.webp` quatro expressões para a animação existente (repouso, piscar, fala aberta e fala arredondada). Os arquivos antigos permanecem no histórico para recuperação. Novos nomes de arquivo evitam reutilização indevida das imagens anteriores no cache. A animação visual não representa uma implementação de reconhecimento de fala local.

Validado: identidade das imagens, dimensões da folha de expressões, referências dos três pontos de exibição, sintaxe e contrato de atualização automática. Publicar não comprova atualização da cópia na VM. Recuperação: reverter somente referências e imagens da alteração visual pelo Git, mantendo as regras de versão, sem apagar preferências, sessões ou registros.


### Expressões ampliadas — `20261024-maria-expressoes-03`

Substitui a folha de quatro expressões da preparação anterior por um atlas de 12 quadros em quatro colunas e três linhas: neutra, piscar, atenta, reflexiva, quatro posições de fala (A, E/I, O e U), preocupada, triste, séria/sizuda e repouso. “Ouvindo” usa atenção; “Preparando resposta” usa reflexão. Expressões de preocupação, tristeza e seriedade são selecionadas por frases explícitas de erro, lamento ou restrição da resposta, sem atribuir sentimentos reais à assistente.

A boca acompanha eventos de palavras da voz quando o navegador os oferece, com duração aproximada por palavra e retorno ao repouso. Sem esses eventos, há sequência visual aproximada. Não se promete sincronização fonética exata; o atlas não contém todas as combinações de emoção e posição labial. A preferência de movimento reduzido é respeitada. Interromper a fala cancela os temporizadores da animação.

Validações: coordenadas dos 12 quadros, vogais e repouso, escolha de expressão em erros/restrições/lamento, cancelamento de temporizadores, bloqueio de movimento reduzido e voz interrompida, contrato de atualização e comandos existentes. Microfone e vozes reais permanecem sujeitos ao teste no dispositivo.


### Destinação oficial das imagens — decisão do Proprietário em 24/10/2026

Por determinação de Urbano Possidônio de Carvalho Junior, titular do Assistente FSJ, o retrato moreno da MarIA e o atlas correspondente de expressões passam a integrar o patrimônio visual e a identidade oficial do sistema. Arquivos vigentes: `maria-avatar.webp` e `maria-expressoes.webp`. A destinação abrange o painel da assistente, o botão de acesso e a miniatura do cabeçalho. A imagem não identifica a Brisa usada pelo Proprietário no ChatGPT.

Origem: imagem de personagem fictícia gerada por IA nesta colaboração e suas variações de expressão. Esta anotação registra a adoção e a destinação do ativo no projeto; os termos gerais já documentados em LICENSE e COPYRIGHT.md continuam aplicáveis conforme os direitos existentes sobre cada componente. Não constitui registro no INPI ou certificação de exclusividade. Preservar os arquivos originais e o histórico Git como documentação de origem e uso.

Estado: designação aprovada pelo Proprietário; os arquivos e a integração visual foram publicados no commit `520b95bea4a514480e892e8d55ce5d34b29679d5`. A atualização das cópias locais depende do mecanismo de atualização de cada instalação. Esta anotação não altera permissões, dados, serviços ou agendamentos.


## Base documental local da MarIA — preparação V1 em 24/10/2026

Instalador: [MarIA — base documental privada](../automation/maria-knowledge/README.md). Esta entrega prepara a leitura periódica dos manuais e de fatos locais (versão do código, RAM, disco e estados dos serviços), com atualização a cada quinze minutos e uma única versão anterior. A pasta `~/maria-fsj` é privada do usuário urbano. Não lê arquivos de credenciais nem registros do banco e não altera serviços operacionais. A base é destinada ao atendimento técnico do Proprietário; sua consulta pela aplicação ainda depende de integração autenticada. Não disponibilizar este arquivo aos participantes.

As regras aprovadas para MarIA são documentadas: usar informações verificadas, reconhecer limitações e distinguir solicitado/publicado/instalado/validado; manutenção somente de funções implantadas sob autorização; novas funcionalidades encaminhadas ao Proprietário para avaliação com a Brisa no ChatGPT. A instalação desta base não concede poderes de manutenção, não integra Ollama e não aprova o modelo testado anteriormente.

Estado desta entrega: código e testes preparados para publicação; instalação real e conexão ao chat ainda pendentes. Validações e recuperação estão no manual do módulo. Nenhuma pasta do Dell foi montada por esta etapa; a referência origin/main registra somente a última busca já efetuada, sem confirmar a versão remota atual.


## MarIA — ponte documental HTTPS, preparação V1 em 24/10/2026

[Instalador, limites e recuperação da ponte](../automation/maria-knowledge-bridge/README.md). Usa o HTTPS existente da VM na porta 8443 e a autenticação central de titularidade do Proprietário. Não publica knowledge.json, não concede acesso técnico a participantes e não ativa Ollama. Consulta somente fatos documentados, recusa base técnica com mais de uma hora e pede esclarecimento diante de assunto desconhecido.

Instalação inicial faz backup do código e requer estado ocioso verificado; bloqueia novas escritas brevemente, instala o módulo e reinicia somente o serviço HTTPS. Gatilhos do atualizador são restaurados ao terminar. Nenhum banco ou mídia é substituído. Pacotes assinados posteriores devem preservar a ponte.

Estado desta entrega: módulo e instalador preparados e testados em isolamento para publicação; execução na VM e autenticação pelo navegador pendentes. A conexão da interface web à ponte ainda não foi implantada. Esta etapa não é uma IA generativa integrada e não concede execução de manutenção.


## MarIA — conexão web documental V1, 24/10/2026

Confirmado pelo Proprietário: base documental instalada com quatro documentos e timer ativo; ponte HTTPS instalada com verificação de autenticação e backup `maria-documental-20261024T212723297786Z`. A versão web `20261024-maria-vm-04` encaminha perguntas técnicas à ponte autenticada e preserva as respostas locais já verificadas de tarefas. Modelo de linguagem livre continua desativado; a conexão documental não é uma implantação de IA generativa nem de execução autônoma de manutenção.

O painel deve informar conexão ou limitação de acesso à VM, sem presumir funcionamento. Respostas técnicas trazem fatos medidos ou regras aprovadas; dúvida desconhecida pede esclarecimento. Acesso técnico é exclusivo do Proprietário. Não amplia os perfis dos participantes. Endereços de rede são restritos aos existentes no sistema; certificados continuam sujeitos à validação normal do navegador.

Validação: autenticação ausente/negada, cancelamento, resposta sem execução de ações, prioridade da consulta local de tarefas, identidade, expressões e contrato de atualização. O teste real de memória/tarefas no navegador permanece pendente. Detalhes e recuperação: [ponte documental](../automation/maria-knowledge-bridge/README.md).


### Movimento facial discreto — `20261024-maria-suave-05`

Ajuste após relato do Proprietário de expressões mecânicas: desativados os ciclos automáticos de boca, piscar e balanço do retrato. A alternância dos quadros passa a usar duas camadas com transição curta de opacidade, sem deslizar pela folha de imagens. A fala usa no máximo duas posições de boca por palavra, com pausa e repouso, em lugar de uma mudança por letra. As expressões contextuais permanecem disponíveis e o movimento reduzido continua respeitado.

Sem eventos de palavra fornecidos pela voz do navegador, a assistente mantém uma expressão discreta, sem simular sincronização labial por um ciclo repetitivo. A suavização é uma aproximação visual, não animação facial contínua nem sincronização fonética exata. Não corrige por si só problemas de captação do microfone ou reprodução do áudio. O relato de voz continua dependendo do teste de pergunta digitada no dispositivo.

Validados em código: limite de movimentos por palavra, cancelamento de temporizadores, pausa/repouso, movimento reduzido, identidade, consulta documental e contrato de atualização. Avaliação visual e teste de microfone/voz no dispositivo permanecem pendentes. Recuperação: reverter as mudanças de apresentação e versão, sem alterar dados, credenciais ou arquivos da VM.


## Diagnósticos em vídeo da MarIA — `20261024-maria-diagnostico-06`

O Proprietário determinou limite de cinco vídeos de diagnóstico, com rotação: sexto substitui a posição 1, sétimo a 2, e assim sucessivamente. O controle fica no painel MarIA em “Gravar diagnóstico · até 5 vídeos”, separado da videoteca operacional. Usa captura de tela autorizada pelo navegador e armazenamento local deste navegador, sem upload à VM. Gravações externas da Xbox Game Bar e cópias baixadas na pasta Downloads não são gerenciadas por esta rotação.

Cada gravação dura até um minuto e tem limite de 12 MB. A seleção de tela e o áudio dependem da confirmação e dos recursos do navegador. Microfone pessoal é opcional. A substituição só ocorre na mesma transação que salva o novo vídeo; falha de armazenamento preserva as posições anteriores. Captura cancelada ou com erro não elimina o vídeo antigo. A atualização automática da página é adiada durante gravação/salvamento.

Usar Baixar vídeo e anexar manualmente no chat da Brisa. O aplicativo não envia mensagens nem detecta sozinho a conclusão do compartilhamento no ChatGPT. Limpar dados do navegador ou descarte pelo navegador pode remover diagnósticos; não são backups dos registros do negócio.

Validação: rotação repetida até 30 gravações simuladas, substituição correta das posições 1 e 2, falha atômica sem perda dos anteriores, rejeição de vazio/tamanho excessivo, ausência de upload no módulo e contrato de atualização. Captura real, áudio e anexação no dispositivo dependem de teste do Proprietário. Instalação de serviços na VM não é necessária. Detalhes: [diagnósticos da MarIA](maria-diagnosticos.md).


### Controle visível — `20261024-maria-gravar-visivel-07`

Após relato de dificuldade para localizar a seção recolhida, adicionado botão fixo “Gravar diagnóstico” imediatamente abaixo do cabeçalho MarIA, antes do retrato e fora da área rolável. O botão abre a seção de gravação e leva os controles à vista. Durante a gravação, muda para “Parar e salvar”; preparação/salvamento impedem cliques concorrentes. A seleção/autorização de tela continua pertencendo ao navegador, ao clicar Iniciar gravação. A rotação de cinco posições permanece inalterada.

Se o módulo não carregar, o botão exibe aviso em vez de ficar sem efeito. Validar botão visível no desktop/celular e abertura da seção; a captura real ainda requer confirmação do usuário. Nenhum serviço na VM foi alterado.


## Gravação direta — 20261024-maria-gravar-direto-08
O botão superior Gravar diagnóstico abre diretamente a seleção de captura do navegador. Depois da autorização com áudio compartilhado, informa que está gravando e inicia a apresentação falada da MarIA como amostra. O evento de término da fala (ou falha de voz) encerra e salva a gravação, exibindo o link para download. A seleção e autorização do navegador são obrigatórias. Sem áudio compartilhado, interrompe com orientação e preserva os cinco vídeos anteriores. Parar e salvar permanece como saída manual; limite de um minuto e 12 MB preservados. Nenhum upload automático nem gravação na VM.
Validação: sintaxe, rotação local e contrato de atualização; captura real com voz do Windows depende da verificação no dispositivo. Publicação web não representa instalação no aparelho. Recuperação: reverter o módulo e HTML juntos para a versão anterior, preservando IndexedDB e registros operacionais.


### Decisão vigente: gravar a pergunta e a resposta — versão 20261024-maria-gravar-pergunta-09
Substitui a apresentação automática descrita na versão 08. Acione Gravar diagnóstico, confirme a seleção de tela com áudio no navegador e, após aparecer Gravando, faça a pergunta por voz ou texto. Nenhuma apresentação é disparada automaticamente. A gravação termina ao final da primeira resposta falada da MarIA e mostra o download. Limites de um minuto/12 MB, cinco posições locais e saída manual preservados. Captura real de áudio permanece dependente do navegador e da validação no dispositivo; não se promete captura da voz do sistema sem essa verificação. Testes: término e erro de fala, armazenamento e atualização automática. Publicação web não confirma atualização em cada aparelho.


## Filtro de tarefas — 20261024-maria-filtro-tarefas-10
Corrigida consulta em aberto, incluindo abertas/abertos: exige situação Em aberto. Pendentes exige Pendente; em andamento exige Em andamento; concluídas exige Concluída. Arquivadas só aparecem se solicitadas explicitamente. Consultas comuns excluem Arquivado. Contagem da resposta usa a lista filtrada. Não altera tarefas, permissões ou banco. Validação com situações distintas e nomes flexionados; teste de atualização. Publicação não equivale à validação no dispositivo. Recuperação: reverter interface e versão em conjunto, sem restaurar registros.


## Publicador independente de arquivos — entrega 2026-10-28

Adicionado [publicador de arquivos](../publicar.html), com logotipo original, para o Proprietário escolher o arquivo recebido e substituir o caminho correspondente em urbanopos/Assistente.FSJ pela API do GitHub. O caminho é conferido antes da escrita e a substituição usa o SHA atual; o token não é armazenado. Não altera VM, páginas operacionais ou mecanismo de atualização. A versão anterior fica no histórico Git, sem criação de backups parciais. Arquivo salvo no GitHub não comprova conclusão do GitHub Pages. Testes simulados de substituição, criação, cancelamento e bytes aprovados; uso real com token ainda não validado. O contrato de atualização do index atual foi executado e apresenta divergência de versão preexistente, registrada no documento do módulo; não houve alteração desse index. Instruções, limites e recuperação: [publicador](publicador.md).

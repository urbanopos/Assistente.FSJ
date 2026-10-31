# Assistente FSJ — Manual de operação e manutenção

## Critérios permanentes de acesso — 30/10/2026

Consultar a decisão [Destinatário e perfil da sessão](decisoes/acesso-destinatario-sessao.md). O link individual determina o perfil destinatário; o Proprietário pode conferi-lo com as restrições daquele usuário. Em seu próprio link, destinatário e perfil coincidem como Proprietário, mediante identidade titular validada. Usuários comuns não podem obter titularidade por link encaminhado, URL, token isolado, estado local ou sessão salva. A autorização deve ser validada no servidor.

Estado: critérios registrados; esta entrega é documental. A correção de precedência do destinatário já foi publicada no commit `5f12ec6`; a exigência de comprovação da identidade de quem abre um link do titular ainda demanda revisão de autenticação no servidor. Não declarar segurança integral validada somente com base neste registro. Sem alteração de banco, sessões, tarefas, disparos ou instalação. Recuperação: reverter o commit documental preservando as correções anteriores.


## Identidade do destinatário no link individual — 30/10/2026

Correção `20261030-destinatario-01`: a entrada `inicio-usuario.html#token=...` preserva o perfil associado ao token recebido. Uma sessão de proprietário no mesmo aparelho não redireciona esse acesso para o painel administrativo; token inválido ou vazio também não causa promoção para proprietário. A entrada sem token mantém o reconhecimento autenticado do titular. O bloqueio de 07:00–12:00 e 14:00–16:20 (America/Recife) e a exceção para links do próprio titular continuam validados pelo servidor.

Validação: testes de entrada com sessão titular, sessão expirada, link individual válido, inválido e vazio; testes de expediente e contrato de atualização. Publicação no GitHub não comprova atualização de aba antiga, instalação na VM ou validação do link real da Menininha. Não há alteração no banco, nas tarefas, nos disparos ou nas sessões salvas. Instalação web: recurso versionado na página inicial. Recuperação: reverter apenas o commit desta correção; preservar as demais melhorias. Validação no aparelho com o link recebido permanece pendente.



## Correção do bloqueio visual no celular — 30/10/2026

Versão dos recursos: `20261030-expediente-tela-03`. A tela inicial (`inicio-usuario.html`) tinha painéis e navegação fora dos seletores ocultados pelo bloqueio anterior. O aviso agora fica diretamente no `main`, separado dos quadros protegidos; as quatro páginas individuais ocultam todo o conteúdo do `main`, navegação inferior e diálogos ao bloquear. Os controles ficam inertes durante o bloqueio, restaurando seu estado anterior ao liberar; rascunhos não são apagados. A conferência ocorre a cada segundo, ao retomar a tela e ao restaurar o histórico. Uma resposta iniciada antes do fim do expediente não reabre a tela depois do limite; o retorno ao horário permitido depende de uma nova resposta autorizada do servidor.

Mantidas as faixas 07:00–12:00 e 14:00–16:20, America/Recife, e a exceção do Proprietário confirmada pelo servidor. O diagnóstico administrativo não altera essa exceção. A negativa do servidor prevalece mesmo com relógio local dentro do expediente. Não houve alteração de folgas, disparos, perfis, banco ou funções implantadas.

Validações desta entrega: `node tests/expediente-screen.cjs`, `node tests/expediente-banner.cjs`, `node tests/owner-hours-access.cjs`, `node tests/automatic-update-contract.cjs` e `git diff --check`, aprovados. Consulta real confirmou a regra SQL; chamada HTTP sem token real de usuário recebeu 403/fora_expediente no período fechado. Não havia quadros vigentes para validar uma sessão individual real nesta checagem. Teste visual no aparelho do usuário e validação de seu link específico permanecem pendentes.

Instalação: recursos publicados no GitHub Pages das páginas individuais, sem nova instalação de APK ou atualização da VM. Publicação do repositório e resposta dos arquivos servidos devem ser conferidas antes do encerramento; isso não comprova atualização de uma aba antiga ainda aberta. Recuperação: reverter somente o commit desta correção visual, preservando o controle já existente no servidor e as demais melhorias. Histórico anterior permanece no Git.


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


## Banner aprovado e controle de acesso por expediente — 29/10/2026

Publicado o modelo aprovado: banner verde com detalhe dourado, título CONSULTA DE TAREFAS e texto contínuo justificado, com tamanho uniforme: **A partir das 7:00h, disponível para consulta, exceto nos horários de descanso e após o expediente.** Rodapé: Horário de Pernambuco. Substitui o aviso de horário em texto vermelho nas páginas inicio-usuario.html, quadro.html, responder.html e supervisor.html.

O bloqueio agora consulta no servidor a regra já vigente public.fsj_horario_resposta: 07:00–12:00 e 14:00–16:20, America/Recife. Resposta-tarefa v28 e supervisao v13 implantadas; não basta alterar o relógio do navegador para receber dados. Fora do horário, as respostas retornam codigo=fora_expediente sem conteúdo das tarefas. Dentro do horário, seguem as mesmas validações de token, vínculo, perfil, supervisão, validade e autorização, sem ampliar permissões. Diagnóstico administrativo autenticado permanece separado. Não foram alteradas folgas, feriados, cadastros nem direitos de cada perfil.

Os recursos do banner preservam formulários e rascunhos ao ocultar o conteúdo protegido fora de horário. A tela inicial revalida o acesso a cada 30 segundos e ao retomar; o quadro mantém sua revalidação existente. O banner também é exibido se o período encerrar com uma página já aberta, sem gravar respostas nem reenviar operações. Erros de link/sessão diferentes de expediente continuam usando o tratamento existente.

Separação determinada pelo proprietário: envio antecipado entre 6:30 e 7:00 é independente do horário de consulta. Esta entrega publica o banner e o bloqueio de consulta; NÃO configura nem comprova mudança dos agendamentos de envio, executor online ou disparos para todos. O transporte emergencial no GitHub Actions ainda depende de credenciais, sessão vinculada e configuração inicial. Publicação do banner não deve ser apresentada como validação do apagamento/envio emergencial.

Verificações: testes em oito limites de horário para board/detail/start/submit/reminders e ações de supervisão, sem leitura de tarefas fora do expediente; consulta real à regra SQL em nove limites; sintaxe e inclusão dos recursos em quatro páginas; contrato de atualização passou. Sem mensagens enviadas/apagadas. Recuperação: reverter o commit dos recursos visuais e reimplantar as versões anteriores das duas funções, mediante decisão do proprietário; não promover esta alteração como backup completo das instalações isoladas da VM.


## Correção urgente — abertura direta do destinatário (29/10/2026)

Versão 20261029-emergencia-abertura-direta-11. Por determinação do proprietário, o botão operacional de emergência volta a preparar a mensagem por envio-manual e abrir diretamente o WhatsApp do destinatário explicitamente selecionado, com texto preenchido. Reserva a abertura no próprio clique em Desktop/Android/iPhone e mostra link direto se o navegador bloquear. Não depende do heartbeat do executor ainda desconectado. A identidade do proprietário e o telefone permanecem conferidos pelo serviço existente; nenhum telefone é fornecido pelo cliente nem fixado no botão.

O envio final é manual no WhatsApp; confirmar no Assistente somente após envio real. Registro prévio é informado para evitar duplicidade. O apagamento automático NÃO é executado por este fluxo; permanece pendente da ativação real do executor. Corrige a ligação prematura ao executor não configurado, que impedia abrir a conversa. A ação GitHub preparada permanece separada e não foi executada nesta entrega. Permissões, calendário e bloqueios dos demais perfis não alterados. Pastas da VM não atualizadas nesta sessão.

Validação: contrato de atualização e teste emergency-direct-open.cjs passaram em simulações Windows/Android/iPhone com destinatário, mensagem, abertura antes da consulta e alternativa para pop-up bloqueado. Nenhum envio ou apagamento real. Recuperação: reverter este commit se necessário, sem repetir mensagens já enviadas.


### Exceção permanente do proprietário — 29/10/2026

O proprietário está dispensado do bloqueio de expediente. O servidor reconhece a identidade pela titularidade oficial e por sessão autenticada válida ou token válido vinculado à pessoa titular ativa; não confia em nome, parâmetro de URL ou sinalizador enviado pelo cliente. Outros perfis continuam sujeitos às faixas de expediente. Validade dos tokens, atribuições e âmbito de supervisão são preservados.

Resposta-tarefa v29 e supervisao v14 implantadas com o indicador de horário livre retornado pelo servidor. O banner respeita esse indicador e não bloqueia o proprietário por relógio local. O banco já possuía exceção do proprietário em fsj_registrar_resposta; nenhuma função SQL ou permissão foi alterada nesta correção. Testes cobrem titular ativo, outro usuário, inativo, link inválido e expirado. O painel autenticado do proprietário continua podendo preparar o disparo antes das 7h.


### Verificação de liberação no expediente e correção da ação — 29/10/2026

Revalidado o código publicado e as funções implantadas: os demais usuários têm consulta liberada nas faixas 07:00–12:00 e 14:00–16:20, America/Recife; proprietário titular ativo permanece dispensado. O teste expediente-banner.cjs passou contra cópias atuais das duas funções e quatro páginas. A tela inicial consulta novamente a cada 30 segundos e ao retomar, retirando o banner em resposta autorizada; não depende da ação de disparo. Às 06:54 de Pernambuco, o servidor ainda indicava bloqueio dos demais perfis, como esperado. Esse teste determinístico não equivale a confirmação manual no aparelho às 7h.

Corrigida causa de rejeição do workflow Disparo Emergencial FSJ: runner.temp não é permitido no env do job. A pasta privada passa a ser definida por RUNNER_TEMP dentro da etapa do runner, via GITHUB_ENV. Adicionada validação automática em push apenas para arquivos deste pacote, sem iniciar WhatsApp, apagar ou enviar mensagens. Entradas ausentes em push assumem validar/15 minutos. A execução real continua exigindo configuração protegida, sessão vinculada e trava manual-final-v1. O fluxo manual operacional do botão foi preservado; não religar o botão ao executor enquanto a configuração real não estiver concluída.

Validação local: YAML, contextos e Python da etapa aprovados. A execução GitHub de validação será acompanhada após a publicação. Credenciais e sessão do executor ainda não configuradas nesta sessão; não declarar implantação definitiva concluída nem apagamento ativo. Nenhuma mensagem real enviada/apagada nesta verificação. Recuperação por reversão deste commit; nenhuma mudança nos agendamentos diários.


## Aba única do WhatsApp no Disparo Emergencial — 29/10/2026

Correção adicional de tarefas, tela 20261029-acoes-tarefas-13: consultar docs/inicio-suspensao-tarefas.md. Corrige conclusão SIM bloqueada pelo botão oculto/desabilitado de justificativa, interferência de sessão administrativa antiga e mensagem de folga pendente no envio; acrescenta suspensão explícita com auditoria e retomada pelo token. NÃO mantém justificativa obrigatória e preserva rascunho após erro. Mantidos expediente, exceção do Proprietário e permissões de servidor. Validação com DOM/API simulados e contrato de atualização; sem gravar tarefas reais. Publicação web/API não equivale a instalação na VM. Recuperação por reversão dos arquivos/função, sem apagar histórico. Não criar backup parcial.

Decisão adicional do Proprietário: operação acessível pelo GitHub, desenvolvimento/manutenção na VM e proteção do material reservado em repositórios privados. Ver docs/decisoes/operacao-github-manutencao-vm.md. Privacidade por pasta não existe em repositório público. Migração de visibilidade/hospedagem e instalação na VM permanecem pendentes; dados e segredos de servidor não devem ser publicados.

Versão 20261029-emergencia-aba-unica-12. A cada acionamento, reutilizar a referência da aba de WhatsApp aberta pelo Assistente; usar o nome fixo fsjWhatsAppEmergencial também no link alternativo. Atualizar destinatário e mensagem nessa aba e trazê-la à frente, sem abrir uma nova aba sem nome em cada disparo. Se a aba foi fechada, abrir outra para retomar a operação. Não fechar abas antigas ou independentes do usuário. Não recarregar a aba reutilizada em branco durante a preparação; falha de preparação não fecha uma conversa que já estava aberta. Browser isolation/encerramento de contexto pode impedir reaproveitamento de uma aba externa; a referência é mantida durante a operação do Assistente e não se promete localizar qualquer aba pré-existente do navegador.

Preservar envio final manual, confirmação posterior, seleção explícita de destinatário, sessão pessoal do WhatsApp, calendário e permissões. O vínculo da conta não é recriado pelo código. O apagamento automático permanece pendente do executor, separado desta correção de navegação. O fluxo fora da seção de emergência não foi alterado.

Validações: contrato de atualização, destinatário/mensagem em Windows/Android/iPhone, dois disparos reutilizando uma aba, abertura após fechamento e destino fixo no link alternativo. Testes simulados; validar no navegador do proprietário. Recuperação: reverter este commit. Cópias isoladas da VM não atualizadas nem promovidas a backup nesta sessão.



## Correção da execução própria do Proprietário — 29/10/2026

Versão 20261029-titular-executor-14. Urbano estava cadastrado como Visitante; o desbloqueio do diagnóstico não permitia gravar suas tarefas. A API e a RPC de suspensão reconhecem a titularidade persistida no servidor e o token da própria pessoa antes da limitação de Visitante. Outros visitantes permanecem sem gravação. Não altera cadastro, folgas, responsabilidades, expediente ou auditoria. Detalhes, testes e recuperação em docs/inicio-suspensao-tarefas.md. Consulta de produção sem concluir/iniciar tarefas reais; nenhuma instalação na VM nesta entrega.


Complemento 20261029-proprietario-acesso-15: entrada individual reconhece automaticamente a sessão do titular por RLS e abre o painel completo. O menu do Proprietário mantém todas as abas originais em celular e desktop, inclusive após mudar de módulo. Validação de identidade vem do servidor, sem promoção por nome, categoria ou parâmetro. Sem sessão autenticada não se concede administração; instalação na VM permanece fora desta publicação. Testes de propriedade, menu em 390/1280 pixels, entrada automática e negação a não titular em tests/owner-mobile-access.cjs.


Nas tarefas próprias do titular, o reconhecimento autenticado libera automaticamente as ações; inspeção de terceiros preserva desbloqueio explícito. O diagnóstico retorna apenas a confirmação do vínculo, sem credenciais ou dados administrativos.



## Calendário mensal: salvar e consultar relatórios — 29/10/2026

Versão 20261029-calendario-relatorios-16. Em Folgas e feriados, abrir o calendário, selecionar a pessoa, tocar na data, escolher Folga semanal, Feriado ou Folga compensatória e clicar em Salvar datas. A tela confirma a gravação central. Sem pessoa selecionada ou durante a consulta, a edição fica indisponível. Datas existentes são carregadas do servidor. O salvamento atualiza somente folgas_datas e folgas_motivos da pessoa escolhida, preservando os demais campos cadastrais. Falha mantém as marcações pendentes. É necessário salvar antes de trocar pessoa ou fechar. Marcar um Feriado no calendário mensal registra uma data de folga individual; não cria feriado oficial nem altera a decisão de recebimento no módulo oficial.

Consultar / Imprimir relatório está disponível na seção Folgas e feriados e dentro do calendário. Escolher uma pessoa ou Todas as pessoas e informar data inicial/final inclusivas. Consultar relatório busca novamente a armazenagem central com paginação. Reúne marcações mensais, folgas semanais, feriados oficiais com decisão individual de envio e compensações cuja data esteja no período, inclusive quando o feriado de origem estiver fora dele. Informa origem, tipo, data e pessoa; fontes distintas podem registrar o mesmo dia, por isso a contagem é de registros, não de dias únicos. O relatório retrata registros atualmente salvos, não versões anteriores de marcações excluídas. Imprimir / Salvar PDF usa a impressão do navegador, em A4 paisagem, com cabeçalho repetido. Permitir a janela de impressão se bloqueada no celular.

Permissões: utiliza sessão e RLS existentes de pessoas, folgas_semana, feriados_fsj e feriados_envio. Nenhuma chave privilegiada no cliente, nenhuma alteração de políticas, tabelas ou Edge Functions. A consulta SQL sob papel authenticated confirmou acesso do e-mail proprietário e zero linhas para outro e-mail. A escolha de pessoa no navegador não concede acesso administrativo.

Validações: quatro testes em tests/calendar-records.cjs para gravação restrita de campos, falha e rascunho, troca de pessoa, filtros inclusivos, compensação fora do feriado, paginação, escape de conteúdo e erro de período. Contrato tests/automatic-update-contract.cjs aprovado. Testes usam DOM/API simulados, sem alteração de datas reais; impressão e layout no aparelho do proprietário aguardam validação. O navegador de teste local não possui Chromium instalado.

Instalação: publicação da interface index.html e calendar-records.js no GitHub Pages; atualização automática existente protegida durante edição/gravação do calendário. Nenhuma instalação na VM ou nas pastas isoladas foi executada. Preservados expediente, disparos WhatsApp e permissões dos demais perfis. Não gerar backup parcial nem promover a tela ainda não validada no celular a versão de recuperação aprovada. Recuperação por reversão do commit desta interface; não apagar dados centrais já salvos e não restaurar cartões PDF.


### Mesma operação no Desktop — 29/10/2026

Versão 20261029-calendario-desktop-17. O painel web do Desktop também oferece Salvar datas e Consultar / Imprimir relatório, com pessoa e período inclusivo, usando os mesmos registros centrais do celular. Clicar normalmente na data abre a escolha de motivo no computador; clique direito e teclado continuam disponíveis. A versão anterior exigia clique direito com mouse. Não altera o layout próprio do Desktop nem cria cópia independente dos dados. Publicação GitHub Pages; cópias isoladas da VM não foram atualizadas nesta sessão. Contrato de atualização e quatro testes do calendário aprovados. Conferência visual e impressão no computador do proprietário pendentes. Recuperação: reverter somente esta alteração de interface, preservando datas centrais.



## Disparo emergencial após envio confirmado — 30/10/2026

Versão `20261030-emergencia-reenvio-18`. Corrigida a aplicação indevida do bloqueio diário dos controles comuns ao Disparo Emergencial. A confirmação de envio de hoje continua visível no histórico e impede repetição pelo botão comum; o botão emergencial permite preparar novamente a mensagem da pessoa selecionada, avisando quando o serviço informa envio anterior. Trocar de destinatário não herda bloqueio de outra pessoa. O link alternativo e a orientação de envio permanecem visíveis após a consulta das confirmações. O botão Confirmar envio aparece após preparar a emergência, apenas se ainda faltar a confirmação do dia.

Operação: Proprietário → Disparo Emergencial → selecionar Carlos ou outra pessoa → Preparar mensagem → conferir conversa e pressionar Enviar no WhatsApp. O servidor continua validando titularidade, cadastro, recebimento, calendário e telefone; o cliente não amplia permissões nem altera destinatários. A confirmação repetida não apaga nem substitui o registro original. Corrigida também referência inexistente a preparedTab ao confirmar envio já confirmado/em andamento.

Validação: regressão com envio confirmado, troca de pessoa, atualização de estado durante preparação, confirmação, cadastros bloqueados e envio comum; testes de abertura/reuso de aba e contrato de atualização. Testes simulados, sem envio ou apagamento de mensagens reais. Entrega destinada ao GitHub Pages; o commit e a implantação devem ser conferidos separadamente. Validação no celular do Proprietário pendente. Nenhuma instalação na VM ou alteração de função/banco/agendamento. Histórico Git preservado; recuperação por reversão apenas deste commit, sem apagar confirmações ou restaurar cartões PDF.


## Alerta de condições no Disparo Emergencial — 30/10/2026

Versão `20261030-emergencia-folga-19`. Quando a preparação individual retorna envio bloqueado, o painel consulta os registros centrais da pessoa e mostra alerta e texto persistente com nome, data e condições registradas: folga semanal, calendário mensal com motivo, compensação e feriado de origem, férias, feriado sem recebimento autorizado ou condição cadastral. Não presume folga se a consulta falhar ou não identificar motivo. A preparação continua sob decisão do servidor; não amplia permissões, não libera envio e não altera registros ou agendamentos. Confirmar envio fica oculto e a alternativa anterior não pode ser usada após falha. Fecha a aba em branco antes do alerta.

Operação: Proprietário → Disparo Emergencial → pessoa → preparar. No bloqueio, ler e dispensar o alerta; consultar Folgas e feriados se necessário. As consultas usam a sessão e as políticas existentes. Instalação: publicação no GitHub Pages com atualização automática do painel; não modifica função Supabase ou VM. Testes simulados aprovados: folga semanal, mensal, compensatória, indisponibilidade da consulta; regressões de reenvio confirmado e reuso de aba; contrato de atualização e sintaxe. Nenhuma mensagem real enviada. Verificação no celular e dos registros reais de Carlos pendente. Recuperação: reverter este commit, preservando o calendário central e confirmações.


## Tela de aviso de folga no Disparo Emergencial — 30/10/2026

Versão `20261030-emergencia-tela-folga-20`. Substitui o alerta nativo do navegador pela tela do FSJ no padrão verde e dourado do aviso de expediente. Quando os registros indicam descanso, apresenta “O destinatário executor (nome) está de folga”, seguido dos motivos e datas consultados no servidor. Condição cadastral ou falha de consulta não afirma folga sem evidência. Nenhuma mensagem é preparada ou enviada no bloqueio.

O botão “← Voltar ao Disparo Emergencial” fica no rodapé fixo, inclusive no celular, e fecha a tela, devolvendo o foco ao botão da pessoa selecionada. Voltar não repete a preparação nem abre o WhatsApp. O aviso usa texto seguro e não interpreta nomes ou motivos como HTML. Mantidos perfil Proprietário, consultas autenticadas, decisões do servidor, calendário, confirmações e reuso da aba do WhatsApp.

Validação: contrato de atualização, cenários de folga semanal/mensal/compensação e falha de consulta, reenvio confirmado e abertura/reuso de aba passaram em simulações. Sem envio real. Publicação destinada ao GitHub Pages; implantação e conferência visual no aparelho devem ser distinguidas. Nenhuma instalação na VM, alteração de banco, serviço ou agendamento. Recuperação por reversão deste commit, preservando dados centrais e histórico Git; não promover esta tela a backup validado antes da conferência do proprietário.


## Aviso de folga com fonte dourada — 30/10/2026

Versão `20261030-emergencia-aviso-dourado-21`. No Disparo Emergencial, o aviso usa fundo verde e fonte dourada no título, nome, motivos e datas, conforme a minuta aprovada. O botão “← Voltar ao Disparo Emergencial” permanece fixo no rodapé, com texto dourado e espaço reservado no celular para não cobrir a mensagem. A consulta dos motivos, o bloqueio do envio e as permissões existentes permanecem preservados.

Operação: Proprietário → Disparo Emergencial → selecionar destinatário → preparar mensagem. Se houver bloqueio por folga, ler o aviso e voltar pelo botão do rodapé. Validação local: contrato de atualização, testes de folga, reenvio confirmado e abertura/reuso da aba, sem envio real. Publicação no GitHub Pages; conferência no aparelho do proprietário pendente. Sem instalação na VM ou alteração de registros/agendamentos. Código anterior preservado no histórico Git; recuperação por reversão deste commit, sem restaurar cartões PDF.


## Publicação do layout Desktop — 30/10/2026

Versão `20261030-desktop-inicio-22`. No desktop/laptop, números de consulta antes das ações, Tarefas em Execução ao lado de Responder dúvidas e sugestões, aplicativos nativos e agenda depois dos botões. Celular mantém o layout anterior. Ver [operação, instalação, validações e recuperação](layout-inicial-desktop.md). Distribuição pelo endereço habitual com atualização automática; sem instalação na VM ou alteração de dados/permissões. Conferência visual na sessão real permanece pendente.


## Interface Celular 0.2.1 — 30/10/2026

FSJ-CELULAR, build 20261030-celular-operacional-24. Nos celulares Android e iPhone reconhecidos, o menu individual mostra os módulos autorizados e encaminha as tarefas aos formulários operacionais existentes. O botão casa retorna ao início do destinatário. TV FSJ aparece após autorização e continua dependente do servidor da fazenda disponível. Acesso do Proprietário mantém todas as funções anteriores.

Folgas e férias contém Marcar datas e Consultar solicitações, com calendário mensal e gravação central da folga semanal permitida pelo serviço. Férias, feriados, compensações e alterações de folga já registrada continuam com o Proprietário. Não há nova solicitação de férias do executor nesta entrega. Sugestões requerem link de tarefa vigente; texto é preservado em falha e atualização adiada durante edição. Visitante não envia por estes controles. Não alterados os endpoints, a autorização, os registros, as sessões ou os disparos.

O adaptador não modifica Desktop, laptop, tablet Android ou iPad. As duas linhas de interface mantêm códigos e versões independentes; não há instalador nativo novo. Fontes originais novos permanecem na pasta Celular do repositório privado. Neste repositório é distribuído somente o adaptador compilado, sem mapa de fontes; código servido ao navegador continua inspecionável.

Testes locais de navegação, identidade dos links, calendário por contrato, erro de gravação, permissões, rascunho, expediente e atualização passaram sem escrita/envio real. Conferência visual e gravação pelo usuário no aparelho real permanecem pendentes. A disponibilidade depende de conclusão do Pages e conferência HTTP. Para recuperar, reverter somente este commit de adaptação, preservando Desktop e dados centrais. Não restaurar cartões PDF. Nenhuma VM, banco, serviço ou APK foi instalado por esta entrega.

Atualização adiada também durante ditado, TV aberta ou data não salva. Revisão 0.2.1 substitui a preparação 0.2.0.


## Celular 0.2.2 — painel do Proprietário — 30/10/2026

Build `20261030-celular-proprietario-25`. Menu celular com TV primeiro, tarefas, responder dúvidas e sugestões, folgas e férias, registro, disparo e pessoas. Os botões originais permanecem montados com seus eventos. Comunicação, grupos, informações, armazenagem e manutenção são acrescentados a partir do menu permitido somente após confirmação de titularidade; os atalhos são ocultados e revalidados se essa condição for retirada. A montagem tardia do botão Responder dúvidas também é incorporada ao menu. Casa retorna ao início e reinicia a paginação existente. Botões não quebram entre páginas, com numeração e setas do paginador operacional. Fotografia, autenticação e permissões do servidor permanecem existentes; a apresentação não concede perfil administrativo.

Verificação de versão celular acrescentada ao painel: ao abrir/retomar e periodicamente, com proteção de edição já existente; adiada enquanto TV/chamadas estão abertas. Desktops, laptops, tablets Android e iPad continuam fora do adaptador. Não alterados backend, banco, tarefas, sessões, chamadas, WhatsApp nem agendamento das 7h. TV e YouTube continuam dependendo do serviço da fazenda; não se declara recuperação da VM ou reprodução validada. Férias mantêm o fluxo do Proprietário existente.

Validação: testes locais do adaptador fonte e compilado para Android/iPhone, exclusão de computadores/tablets, casa, controle titular e revogação, montagem tardia e eventos originais; contratos de calendário, falhas, rascunhos, expediente e atualização; sintaxe das cinco entradas. Sem gravações ou mensagens reais. Publicação web deve ser distinguida de teste visual/funcional na sessão real do Proprietário, ainda pendente. Não há novo APK/iOS instalado. Recuperação: reverter somente a entrega 0.2.2, sem apagar registros, trocar a versão Desktop ou restaurar cartões PDF.


## Celular 0.2.3 — menu inicial do Proprietário — 30/10/2026

Build `20261030-celular-proprietario-26`. Interface verde compacta em duas colunas, com TV FSJ primeiro, Minhas tarefas, Criar tarefa, Tarefas de terceiros, Responder dúvidas, Sugestões, Folgas e férias, Relatórios, Pessoas e perfis, Comunicação, Disparo emergencial, Disparo automático e Painel de manutenção. Grupos e Armazenagem continuam acessíveis. Casa retorna ao menu; numeração e setas seguem o paginador existente, sem partir botões. A entrada inicial autenticada mostra o menu quando seguro; preservar edição e entrada emergencial.

Minhas tarefas seleciona a pessoa vinculada à titularidade consultada pelo mecanismo existente; se ausente no cadastro, informa a falha e não escolhe outra pessoa. Tarefas de terceiros conserva o seletor original. Dúvidas e Sugestões abrem filtros do módulo operacional já existente. Relatórios recebe filtro por situação, inclusive Arquivada (valor interno Arquivado), sobre o relatório mensal existente; não foi implantado novo relatório por intervalo ou API. Manutenção utiliza o endereço VPN já configurado e depende da VM disponível. Disparo automático informa que ainda não está ativado nesta instalação; não agenda nem envia mensagens. Sua presença no menu não comprova automação Android instalada.

Permissões, autenticação e validações no servidor permanecem existentes. Atalhos adicionais exigem o estado de titularidade existente e revalidam esse estado no clique; revogação os oculta. Isto não constitui nova auditoria de autenticação. Nenhum endpoint, dado central, disparo, agendamento, sessão ou versão Desktop foi alterado. Fontes novos ficam exclusivamente na pasta privada Assistente FSJ - Celular; distribuição pública recebe apenas o adaptador minificado e referências de versão celular. O build geral e o adaptador Desktop permanecem intactos.

Validação local: contrato obrigatório de atualização nas bases privada e pública; sintaxe das cinco entradas; testes do fonte e do compilado de Android/iPhone, exclusão de computadores/tablets, titularidade e revogação, eventos originais, montagem tardia, seleção da pessoa titular, filtro Arquivada, casa e proteção de atualizações durante edição/TV. Somente respostas simuladas; nenhuma gravação ou mensagem real. Teste visual e funcional na sessão real do celular permanece pendente. Publicação deve ser confirmada por Pages e verificação do adaptador servido antes de anunciar disponibilidade.

Instalação web: endereço habitual e atualização automática segura, sem exigir APK ou recarga manual. Backup e recuperação: versão anterior preservada no histórico Git; reverter exclusivamente esta entrega de menu/bundle/referências, preservando Desktop, registros, rascunhos, autenticação e rotina das 7h. Não restaurar cartões PDF nem executar automações copiadas.



## Celular 0.2.4 — SUPERVISÃO no menu inicial — 31/10/2026

Build `20261031-celular-supervisao-27`. O menu inicial do executor recebe exatamente um atalho SUPERVISÃO, somente após resposta `ativo: true` do serviço central para o token do próprio quadro. O atalho abre supervisor.html com esse mesmo token e relaciona as tarefas das pessoas e grupos autorizados. O acesso equivalente antes aninhado no Informativo de tarefas foi movido para a primeira tela, sem duplicação. Perfis comuns, falha de consulta e respostas sem autorização positiva não exibem o botão. As permissões são consultadas novamente ao abrir/retomar; respostas antigas não substituem uma consulta mais recente e uma falha do acesso individual invalida consultas pendentes.

A consulta de tarefas continua protegida no servidor: supervisor e pessoa ativos, quadro válido do dia, prazo e escopos de pessoas/grupos. Nenhuma atribuição de supervisão, autenticação, tabela, política ou função foi modificada por esta entrega. O menu não concede novos poderes sobre tarefas. Desktop/tablets, serviços centrais, chamadas, registros, sessões e rotina das 7h permanecem nos fluxos existentes.

Validação: contrato obrigatório de atualização automática nas entradas privada e pública; testes de DOM do fonte e do minificado, Android/iPhone, exclusão de computadores/tablets, permissões positivas/negativas, falha negando acesso, perfil local sem efeito, token do quadro preservado e revogação ao retomar; regressões do Proprietário, rascunhos, calendário, expediente e atualização segura aprovadas. Conferência somente de leitura das definições operacionais e teste no banco confirmaram rejeição de vínculo/token inválido. Nenhuma tarefa, mensagem ou cadastro real foi alterado. Validação visual na sessão real do usuário permanece pendente.

Instalação web: atualização automática segura no endereço e nos links individuais habituais. Não há novo instalador nativo. Fontes novos somente na pasta privada Assistente FSJ - Celular; distribuição recebe bundle minificado sem mapa e referências de versão. Estado de publicação e commits constam de PUBLICACAO-CELULAR.json. Backup: versão anterior preservada no histórico Git; recuperação por reversão exclusiva desta entrega, sem restaurar cartões PDF nem apagar registros centrais.

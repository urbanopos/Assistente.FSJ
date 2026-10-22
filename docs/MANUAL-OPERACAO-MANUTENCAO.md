# Assistente FSJ — Manual de operação e manutenção

Revisão: 22/10/2026. Responsável pelo sistema: Urbano. Nome de uso: Assistente FSJ — Tarefa.
Este é o ponto de entrada vigente para operação e manutenção. Os documentos vinculados detalham cada módulo. Decisões antigas permanecem como histórico; não devem ser usadas isoladamente para restaurar funcionalidades substituídas.

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

Funcionários e visitantes usam seu acesso pessoal para consultar e responder às tarefas permitidas. Supervisão permite acompanhar tarefas de terceiros dentro do escopo autorizado, sem presumir poder de execução, cadastro ou administração. A nova definição do Proprietário amplia o Gestor para atuação operacional, inclusive criação de tarefas, preservando a administração técnica exclusiva. Essa ampliação ainda depende de implantação e testes; consultar [perfil Gestor](decisoes/perfil-gestor.md). As permissões existentes não foram ampliadas por esta revisão documental. Delegações dependem de autorização explícita e validação no servidor.

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

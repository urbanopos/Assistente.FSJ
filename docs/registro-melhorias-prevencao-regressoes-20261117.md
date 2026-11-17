# Assistente FSJ — Registro de melhorias e prevenção de regressões

## Folgas e feriados nos calendários de tarefas

Os calendários de consulta e de registro de tarefas usam as dispensas do calendário individual oficial antes de classificar atrasos. O botão-dia da tarefa em **Tarefas em Execução** leva a pessoa selecionada ao calendário. Folgas, férias e feriados gozados têm marcação própria e bloqueiam a conclusão naquele dia. O feriado trabalhado por autorização ou compensação é elegível, e a data da folga compensatória fica dispensada. Em consulta consolidada, o dia só é dispensado quando todos os responsáveis estão dispensados. O teste verifica a consulta individual, as marcas de folga, feriado e férias e a ausência de ação nos botões dispensados.

## Conclusão pelo calendário

Na tarefa diária, concluir o botão do dia marca apenas aquela ocorrência. O dia fica vermelho em D+1 se estiver sem conclusão. O executor ou supervisor ainda pode registrar durante D+1. A regularização posterior é exclusiva do Proprietário. Nas demais frequências, o registro é D0. O período pintado começa em D+1, com a conclusão já permitida em D0. Uma conclusão no prazo pinta em verde-escuro todos os dias da vigência. O verde-claro indica vigência aberta. Sem conclusão no prazo, o intervalo fica vermelho após o vencimento. Prazos acima de 30 dias exibem a ocorrência até o mês da conclusão e retomam a exibição com a próxima ocorrência, após o fim do ciclo. O arquivamento continua reservado à decisão do Proprietário. A regressão cobre cliques sucessivos, virada de mês, período vencido e interrupção por arquivamento.

## Decisão vigente — prazos por período (17/11/2026)

Esta regra substitui os meses/anos civis da descrição histórica de periodicidade. O dia do registro em America/Recife é D (dia zero). **Até o vencimento, inclusive, todos os dias do período vigente aparecem verdes. Se não houver conclusão válida até o vencimento, no dia seguinte todos os dias daquele período passam a vermelho.** O dia previsto ainda pode receber uma marca de conclusão verde quando houver registro válido.

| Frequência | Último dia em vigência | Primeiro dia em atraso |
| --- | --- | --- |
| Semanal | D+7 | D+8 |
| Quinzenal | D+14 | D+15 |
| Mensal | D+30 | D+31 |
| Trimestral | D+90 | D+91 |
| Semestral | D+180 | D+181 |
| Anual | D+365 | D+366 |

A diária mantém sua contagem e tolerância própria. O calendário e o relatório de tarefas não cumpridas do Proprietário (Desktop e Celular) devem ter o mesmo critério. O vencimento não arquiva tarefa automaticamente. **Somente o Proprietário pode decidir arquivar**, mediante autenticação e auditoria; Supervisor, Gestor e Executor não podem arquivar. Uma nova ocorrência só pode nascer após o vencimento da anterior e quando o fluxo de conclusão/arquivamento permitir; ela conta novo período desde o próprio registro.

Implementação: os calendários do painel usam index.html e celular/ocorrencias-proprietario.js. A geração de ocorrências e seu cálculo no banco foram atualizados pelas migrações fsj_periodos_fixos_contagem_dia_registro e fsj_nova_ocorrencia_conta_do_proprio_registro. A exclusividade de arquivamento está protegida por fsj_arquivamento_exclusivo_proprietario e fsj_arquivamento_decisao_na_mesma_transacao. Não executar envios nem gravar respostas em testes; preservar históricos e versões. Publicação não equivale a conferência na sessão real.

Atualização: 17/11/2026. Complemento técnico ao Manual_Assistente_FSJ_Web_VM_Minuta.docx da Biblioteca (Caderno 2 — Técnica). Este arquivo não substitui o manual nem seus históricos.

## Regra obrigatória de manutenção

1. Identificar a plataforma (Desktop, Celular Android/iOS ou VM), perfil e **componente efetivamente acionado** antes de modificar código. O mesmo nome de menu pode ter implementações distintas.
2. Localizar todos os pontos de entrada e arquivos associados: evento de clique, função de navegação, renderização, paginação, CSS e persistência. Não pressupor que editar a navegação genérica corrige um menu específico.
3. Restringir o patch ao arquivo e plataforma solicitados; preservar registros, perfis, permissões, calendário, cores, filtros, layouts e paginação aprovados.
4. Registrar antes/depois: arquivo, commit, cenário reproduzido, resultado de teste técnico e **validação do proprietário**. Publicado não significa validado.
5. Testar retorno à página inicial tanto a partir de outra seção quanto clicando novamente no mesmo item do menu; testar também após aplicar filtros e avançar páginas.
6. Não apagar a versão anterior ou seu ponto de restauração antes da validação. Evitar backups redundantes após a aprovação.

## Incidente: Relatórios no menu lateral Desktop do Proprietário

**Sintoma:** ao selecionar filtros e páginas do relatório e clicar novamente em Relatórios no menu lateral, a mesma página de resultados permanecia visível.

**Causa técnica identificada:** o menu lateral do proprietário é construído em `desktop/layouts/proprietario/menu-lateral.js`, com seu próprio tratamento de clique. A primeira tentativa alterou somente `navTo` em `index.html`; isso não garantiu a reinicialização pelo componente efetivamente utilizado.

**Correção publicada para teste:** commit `c5ff9048a3fed4a236856e30df861b4876143395`, arquivo `desktop/layouts/proprietario/menu-lateral.js`. O clique em Relatórios agora solicita reinicialização do mês, pessoa, situação, tipo e página, reabre a seção e renderiza o relatório.

**Estado:** PUBLICADO, AGUARDANDO VALIDAÇÃO FUNCIONAL do proprietário. Não marcar como concluído sem confirmação.

**Teste de aceitação:** selecionar Carlos, outubro, Tarefas Pontuais e avançar a página; clicar novamente em Relatórios no menu lateral. Esperado: página 1, mês atual, todas as pessoas, Em aberto, Tarefas Periódicas. Conferir que outros menus e o modo celular não foram alterados.

## Tarefas em Execução no Desktop do Proprietário

O menu lateral abre a consulta com **Tarefas Periódicas** selecionado, situação **Em aberto**, na página 1, inclusive quando o item já está ativo. Cada clique em Periódicas, Pontuais ou Grupo volta à situação **Em aberto** e à página 1. O retorno de uma edição recupera a consulta anterior. Os links seguem as cores vigentes por situação e prioridade. O rodapé agrupa as duas setas e o indicador no centro do painel. O teste `tests/desktop-proprietario-regressao.cjs` abre a tela com dados fictícios, aciona o menu lateral e confere as cores, a geometria e o isolamento do Celular. O GitHub Actions executa o teste quando a entrada operacional ou o layout Desktop do Proprietário é alterado. A confirmação na sessão do Proprietário é registrada após o teste de uso.

O teste também verifica a ordem decrescente das sugestões e a busca direta por número com filtros aplicados, a consulta de arquivadas pelo código roxo, a abertura da edição para itens editáveis e a posição do novo campo à esquerda do seletor de executor.

O teste carrega também o adaptador compartilhado de voz. O campo **Número da tarefa** usa `data-fsj-sem-voz` para evitar que esse adaptador adicione o botão e altere o alinhamento. A regressão confere a mesma altura, borda e espaçamento interno do seletor de executor, além de verificar o ditado em um campo comum.

## Ficha da tarefa no Desktop e no Celular

Aprovado por Urbano em 17/11/2026, para Desktop e Celular. Versão aprovada: `20261117-ficha-historico-aberto-01`, commit `a4f9e54`. O padrão vale em todas as abas do painel operacional que abriam a ficha anterior, incluindo Tarefas em Execução, consultas por situação, Minhas Tarefas e demandas individuais ou de grupo. Quando a aba abre calendário de ocorrências, o calendário conserva o fluxo próprio.

A ficha apresenta a descrição, as ações existentes, a situação logo abaixo dos botões e as pausas registradas. O teste no navegador verifica as duas larguras, a posição da situação abaixo das ações, a ausência da seção de pausas quando vazia, o histórico aberto por padrão com responsáveis, situação, registro e conclusão, e a possibilidade de recolhê-lo e o acionamento de **Editar**. O teste também simula uma consulta pendente e uma falha de histórico. A situação da lista continua abaixo dos botões nessas duas condições.

## Incidente relacionado: calendário e conclusões periódicas

O calendário de consulta do Proprietário Desktop foi validado visualmente com código de cores. **Não equivale à validação de gravação** dos botões dia do celular Executor/Supervisor.

**Pendente:** testar no celular de Carlos a conclusão em dia permitido, a mudança visual para Concluída (verde), persistência após reabrir e sincronização com o calendário do Proprietário. Preservar tolerância de um dia e as restrições de dias futuros e de alteração de status.

## Orientação de documentação

Consolidar estas ocorrências na próxima revisão do Caderno 2 do manual existente, mantendo identidade, versão e histórico. Não confundir proposta, publicado, aplicado e validado.

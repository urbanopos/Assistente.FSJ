# Layout Celular — Proprietário

Pasta oficial criada. O Index real ainda precisa ser migrado e validado; o arquivo `celular/proprietario/index.html` existente é apenas um redirecionador para a raiz e não deve ser tratado como layout móvel homologado.

## Tela inicial web

O redirecionamento abre o painel operacional em [index.html](../../../index.html). A versão `20261113-inicio-proprietario-compacto-01` remove o atalho verde de **Diagnóstico** acima dos indicadores no Celular. O botão da linha de **Avisos de devolução** usa a mesma validação da sessão do Proprietário. A compactação aplica-se ao painel inicial, incluindo o espaço antes dos indicadores. Desktop, dados e permissões conservam o fluxo existente.

Entrega pelo GitHub Pages, com atualização ao abrir ou retomar a sessão. O contrato de atualização e a simulação do atalho no Celular e Desktop passaram. A conferência visual no Galaxy fica pendente. Para restaurar a versão anterior, reverta o commit deste ajuste no repositório e aguarde o GitHub Pages servir a revisão.

## Ficha da tarefa

Aprovado por Urbano em 17/11/2026, para Desktop e Celular. Versão aprovada: `20261117-ficha-historico-aberto-01`, commit `a4f9e54`. O padrão vale em todas as abas do painel operacional que abriam a ficha anterior, incluindo Tarefas em Execução, consultas por situação, Minhas Tarefas e demandas individuais ou de grupo. Quando a aba abre calendário de ocorrências, o calendário conserva o fluxo próprio.

O código abre a ficha com descrição integral, ações existentes e situação atual abaixo dos botões. A situação aparece ao abrir a ficha com o valor da lista e é atualizada após a consulta. As pausas aparecem quando registradas. **Histórico e registros** abre por padrão, pode ser recolhido e mostra responsáveis, situação, data do registro e conclusão. **Editar** continua usando o formulário operacional.

## Tarefas em aberto

No build `20261113-tarefas-abertas-proprietario-01`, a lista aberta pelo contador **Em aberto** no Celular do Proprietário mostra duas tarefas por página, com setas e numeração em um único rodapé. As tarefas individuais precedem as de grupo. A contagem total continua refletindo o filtro de responsável. O título longo é resumido na lista, e o texto completo continua disponível ao abrir a tarefa. A mudança se aplica ao painel web e é entregue pela atualização habitual do GitHub Pages.

Os testes locais simularam páginas cheias, a última página, filtro vazio e abertura de detalhes. No Galaxy, o build `20261113-tarefas-abertas-proprietario-01` mostrou as duas tarefas por página e revelou um rodapé geral adicional. O build `20261113-tarefas-abertas-proprietario-02` retira esse rodapé em **Em aberto** e o recoloca ao trocar de situação. O teste de layout verificou a troca e a ausência do rodapé geral após novas medições. A conferência desta revisão no Galaxy segue pendente. Para recuperar o comportamento anterior, reverta o commit deste ajuste e aguarde o GitHub Pages servir a revisão.

## Tarefas Não Cumpridas

Build `20261113-ocorrencias-periodicas-proprietario-01`. Na tela inicial móvel, **Tarefas Não Cumpridas** consulta tarefas periódicas por mês do vencimento e responsável, em páginas de duas tarefas. O calendário da tarefa mostra os botões dos dias com atraso em vermelho, as folgas em verde claro, feriados em amarelo e férias em azul claro. O toque mostra o período, o dia de tolerância e a eventual regularização. Para grupo, selecione o integrante para ver seu calendário.

A consulta usa dados centrais autorizados e preserva os registros. Os testes locais verificaram o vencimento, folgas, férias, feriados, compensações, conclusões em tempo, atrasos e ocorrências coletivas. A confirmação no Galaxy segue pendente. Para recuperar a interface anterior, reverta o commit e aguarde o GitHub Pages servir a revisão.

## Tarefas concluídas

Build `20261113-concluidas-proprietario-01`. No painel inicial do Proprietário, o contador **Concluídas** abre as tarefas por executor da conclusão, com filtro e duas tarefas por página. O detalhe oferece **Arquivar** e **Devolver para ajustes**. A devolução exige motivo e reabre a conclusão selecionada. O arquivamento incide sobre a tarefa e preserva os registros. O Desktop mantém o fluxo anterior.

Entrega pelo GitHub Pages. Testes locais com dados simulados passaram e a conferência no Galaxy está pendente. Para recuperar a interface anterior, reverta o commit deste ajuste e aguarde o GitHub Pages. Uma reversão da interface preserva as operações já registradas no servidor.

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


## Conclusão pelo calendário

Na tarefa diária, concluir o botão do dia marca apenas aquela ocorrência. O dia fica vermelho em D+1 se estiver sem conclusão. O executor ou supervisor ainda pode registrar durante D+1. A regularização posterior é exclusiva do Proprietário. Nas demais frequências, uma conclusão no prazo pinta em verde-escuro todos os dias da vigência. O verde-claro indica vigência aberta. Sem conclusão no prazo, o intervalo fica vermelho após o vencimento. Prazos acima de 30 dias exibem a ocorrência até o mês da conclusão e retomam a exibição com a próxima ocorrência, após o fim do ciclo. O arquivamento continua reservado à decisão do Proprietário.

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

Na tarefa diária, concluir o botão do dia marca apenas aquela ocorrência. O dia fica vermelho em D+1 se estiver sem conclusão. O executor ou supervisor ainda pode registrar durante D+1. A regularização posterior é exclusiva do Proprietário. Nas demais frequências, o registro é D0. O período pintado começa em D+1, com a conclusão já permitida em D0. Uma conclusão no prazo pinta em verde-escuro todos os dias da vigência. O verde-claro indica vigência aberta. Sem conclusão no prazo, o intervalo fica vermelho após o vencimento. Prazos acima de 30 dias exibem a ocorrência até o mês da conclusão e retomam a exibição com a próxima ocorrência, após o fim do ciclo. O arquivamento continua reservado à decisão do Proprietário.

## Folgas e feriados nos calendários de tarefas

Os calendários de consulta e de registro de tarefas usam as dispensas do calendário individual oficial antes de classificar atrasos. O botão-dia da tarefa em **Tarefas em Execução** leva a pessoa selecionada ao calendário. Folgas, férias e feriados gozados têm marcação própria e bloqueiam a conclusão naquele dia. O feriado trabalhado por autorização ou compensação é elegível, e a data da folga compensatória fica dispensada. Em consulta consolidada, o dia só é dispensado quando todos os responsáveis estão dispensados.


## Ajuste de consulta de demandas no celular — 22/11/2026

Solicitado: na tela Demandas e retornos — Individuais, perfil Proprietário no celular, exibir os botões Tarefas Periódicas, Tarefas Pontuais e Tarefas de Grupo acima do filtro de pessoa, remover aviso duplicado e corrigir a paginação.

Publicado no GitHub: commit `3a090b3af67a5d38c0fb2a4291082b58717db283` em `index.html`. O componente de categorias foi reposicionado antes dos filtros; a chave de reinicialização da paginação considera pessoa, situação e mês/ano; a mensagem duplicada do componente foi removida. Os registros operacionais não foram alterados. Instalação no aparelho e validação funcional com registros reais: **pendentes**. É obrigatório verificar a consulta do José Carlos, as três categorias, os filtros e as setas antes de marcar como validado. Recuperação: reverter o commit identificado após preservar o estado vigente.


## Ajuste de cores, prioridade e navegação — 22/11/2026
Publicado em `index.html` no commit `decab4852e68c4f900d9d12583c2e0580f2e120f`: cartões móveis de Demandas e Retornos passam a receber classes oficiais de cor; ordenação por urgentes, prioritárias, em andamento e demais; ocultação da paginação externa duplicada. Escopo: celular proprietário. Dados e desktop preservados. Teste visual e funcional no aparelho, inclusive navegação e classificação de José Carlos, ainda pendente. Recuperação por reversão do commit, preservando alterações posteriores.


## Supressão da navegação geral na consulta — 22/11/2026
Publicado no commit `bed07173004513e53e7350199ebb032a4fd67259`: CSS restrito ao modo celular proprietário e à tela Demandas e Retornos ativa, ocultando a navegação geral `.fsj-page-navigation` e mantendo a navegação própria `.fsj-dm-nav`. Não altera registros, filtros nem desktop. Validação visual e funcional no celular pendente; conferir que resta um paginador e que as setas trocam os registros. Recuperação: reverter o commit mantendo histórico.


## Causa da dupla navegação e correção estrutural — 22/11/2026
Commit publicado: `1b2409d1dd2ac357535a32ffe8796823820de62f`. A rotina geral `fsjDesktopTaskPaginationDefault` aplicava paginação também a `taskRows` da consulta celular, criando o segundo paginador. No celular com cartões de demandas ativos, a rotina agora remove seu paginador anterior e deixa a paginação própria dos cartões controlar os registros. O contêiner de cartões foi reposicionado depois dos filtros e as abas de categoria antes dos filtros. Preservados dados, desktop e outras telas. Testes no aparelho ainda pendentes. Recuperação: reverter o commit se necessário, preservando alterações posteriores.


## VALIDAÇÃO DO PROPRIETÁRIO — 22/11/2026 — CONSULTA CELULAR
O proprietário confirmou expressamente que a navegação duplicada foi corrigida e que a coloração das tarefas está correta. Considerar VALIDADA a tela Demandas e Retornos — Individuais no modo celular, perfil Proprietário, quanto à navegação única e cores. Versão-base de correção: commit `bf8b72e9c6b83d67650ebfa7855dfaf77593b539` em `index.html`, juntamente com as alterações anteriores de categorias e cartões. Não restaurar paginador geral de `taskRows` nesta tela, não alterar a navegação própria dos cartões nem as regras de cores. Preservar filtros, registros e isolamento entre desktop/celular. Quaisquer alterações futuras devem preservar esse comportamento aprovado e passar por teste antes de substituir a versão validada.


## Compactação da consulta celular — 22/11/2026
Commit `0f012b02fa2d07958a2873edd3686118e5be889b`: ocultada exclusivamente no celular proprietário a legenda explicativa das cores imediatamente abaixo do título Demandas e retornos — Individuais, liberando altura para os controles e cartões. As regras de cores continuam ativas; navegação, filtros e registros preservados. Teste visual pendente. A redução de quantidade de tarefas por página e a retirada de botão de voz não foram realizadas neste commit.


## Altura uniforme dos filtros da consulta celular — 22/11/2026
Commit `6cc772abcb6c7d0bc2bdcb4de88e8b0bd542661b`: no celular proprietário, tela Demandas e Retornos, os controles visuais de Pessoas, Situação e Mês/Ano e os botões Relatório de ações/Limpar seleção passam a ter 44 px de altura; espaçamento vertical dos filtros reduzido. Não modifica o funcionamento dos seletores, dados, cores ou navegação validada. Validação visual no aparelho pendente.


## VALIDAÇÃO EXPRESSA — 22/11/2026 — ALTURA DOS FILTROS
Proprietário validou a alteração do commit `e6731c3392d7481bb35f696bd39d0544485e207b`: na tela Demandas e Retornos, modo Celular, perfil Proprietário, os filtros Pessoas, Situação e Mês/Ano e botões Relatório de ações/Limpar seleção adotam altura uniforme de 40 px e espaçamento vertical compacto. Esta é a versão de referência APROVADA, substituindo a tentativa anterior de 44 px (`6cc772a`). Preservar a navegação única e o código de cores já validados, bem como os registros e as demais funcionalidades. Não restaurar estilos antigos sem autorização e nova validação.


## Ajuste de paginação da consulta celular — 22/11/2026 (aguardando validação)
Commit `433b0bd2ba6c858d31f9e8d9b78c5fe2d57e76aa`: na consulta Demandas e Retornos, modo Celular, perfil Proprietário, limite de cartões reduzido de 5 para 2 por página para diminuir a rolagem vertical. A navegação por setas mantém acesso a todas as tarefas; cores, filtros, ordenação e registros não foram alterados. A ausência completa de rolagem ainda depende de teste visual, pois descrições podem ter comprimentos variados. Não marcar como validado antes da confirmação do proprietário.

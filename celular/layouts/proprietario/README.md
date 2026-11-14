# Layout Celular — Proprietário

Pasta oficial criada. O Index real ainda precisa ser migrado e validado; o arquivo `celular/proprietario/index.html` existente é apenas um redirecionador para a raiz e não deve ser tratado como layout móvel homologado.

## Tela inicial web

O redirecionamento abre o painel operacional em [index.html](../../../index.html). A versão `20261113-inicio-proprietario-compacto-01` remove o atalho verde de **Diagnóstico** acima dos indicadores no Celular. O botão da linha de **Avisos de devolução** usa a mesma validação da sessão do Proprietário. A compactação aplica-se ao painel inicial, incluindo o espaço antes dos indicadores. Desktop, dados e permissões conservam o fluxo existente.

Entrega pelo GitHub Pages, com atualização ao abrir ou retomar a sessão. O contrato de atualização e a simulação do atalho no Celular e Desktop passaram. A conferência visual no Galaxy fica pendente. Para restaurar a versão anterior, reverta o commit deste ajuste no repositório e aguarde o GitHub Pages servir a revisão.

## Tarefas em aberto

No build `20261113-tarefas-abertas-proprietario-01`, a lista aberta pelo contador **Em aberto** no Celular do Proprietário mostra duas tarefas por página, com setas e numeração em um único rodapé. As tarefas individuais precedem as de grupo. A contagem total continua refletindo o filtro de responsável. O título longo é resumido na lista, e o texto completo continua disponível ao abrir a tarefa. A mudança se aplica ao painel web e é entregue pela atualização habitual do GitHub Pages.

Os testes locais simularam páginas cheias, a última página, filtro vazio e abertura de detalhes. No Galaxy, o build `20261113-tarefas-abertas-proprietario-01` mostrou as duas tarefas por página e revelou um rodapé geral adicional. O build `20261113-tarefas-abertas-proprietario-02` retira esse rodapé em **Em aberto** e o recoloca ao trocar de situação. O teste de layout verificou a troca e a ausência do rodapé geral após novas medições. A conferência desta revisão no Galaxy segue pendente. Para recuperar o comportamento anterior, reverta o commit deste ajuste e aguarde o GitHub Pages servir a revisão.

## Tarefas Não Cumpridas

Build `20261113-ocorrencias-periodicas-proprietario-01`. Na tela inicial móvel, **Tarefas Não Cumpridas** consulta tarefas periódicas por mês do vencimento e responsável, em páginas de duas tarefas. O calendário da tarefa mostra os botões dos dias com atraso em vermelho, as folgas em verde claro, feriados em amarelo e férias em azul claro. O toque mostra o período, o dia de tolerância e a eventual regularização. Para grupo, selecione o integrante para ver seu calendário.

A consulta usa dados centrais autorizados e preserva os registros. Os testes locais verificaram o vencimento, folgas, férias, feriados, compensações, conclusões em tempo, atrasos e ocorrências coletivas. A confirmação no Galaxy segue pendente. Para recuperar a interface anterior, reverta o commit e aguarde o GitHub Pages servir a revisão.

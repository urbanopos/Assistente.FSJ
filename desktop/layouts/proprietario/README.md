# Layout Desktop — Proprietário

Pendente de consolidação do Index Desktop autenticado a partir da interface existente. Não remover o código legado antes da homologação.

## Menu lateral do Proprietário

O build `20261114-menu-lateral-desktop-01` aplica a barra azul do protótipo [Desktop Lateral](../../../desktop-lateral/) ao painel operacional da entrada normal. **Início** fica no alto. Os outros rótulos e destinos vêm do Menu Principal da aplicação. A barra usa o comando de navegação já existente e destaca a tela ativa.

A entrada carrega o adaptador apenas quando a plataforma é Desktop. A barra depende da titularidade verificada e do painel pronto. A entrada direta de emergência, o Celular e os demais perfis continuam com o fluxo original. O adaptador usa os controles do painel existente e consulta apenas o seletor de navegação já carregado.

**Recolher menu** compacta a barra. **Usar menu anterior** recupera no próprio navegador a navegação anteriormente escolhida. **Ativar menu lateral** volta ao novo visual. A troca preserva a tela aberta e os controles existentes. Para restaurar a publicação, reverta apenas o commit deste build.

Validação local: contrato de atualização automática e simulação dos 14 destinos, titularidade, entrada de emergência, destaque, recolhimento, retorno ao menu anterior e isolamento Celular. A conferência visual e de navegação com sessão real fica para o Dell.

## Tarefas em Execução

No build `20261115-execucao-categorias-desktop-01`, a lista do Proprietário oferece **Tarefas Periódicas**, **Tarefas Pontuais** e **Tarefas de Grupo** abaixo dos seletores. Para consultar a atribuição de supervisão, escolha a entrada com sufixo **(Supervisão)**. Para consultar apenas as atribuições como executor, escolha o nome sem o sufixo. A categoria de grupo inclui tarefas coletivas pontuais e periódicas. O filtro de categoria conserva a seleção de pessoa ou grupo e a listagem inicia na primeira página quando o filtro muda. Ao voltar da edição, a seleção e a página anteriores são recuperadas quando disponíveis.

O teste local em DOM usou dados fictícios e exercitou as seleções, a ordem dos códigos, as duas tarefas por página, a abertura de detalhes e a restauração dos filtros. O contrato de atualização automática foi executado com sucesso. A conferência com uma sessão real do Proprietário fica pendente. A atualização web segue o mecanismo existente ao abrir ou retomar o uso. Para recuperação, reverta o commit deste build pelo histórico Git.

No build `20261115-execucao-categorias-desktop-02`, **Tarefas de Grupo** passa a ser o acesso às tarefas coletivas no Desktop. O seletor **Grupo Executor** do build 01 foi retirado. Use **Todas as pessoas** para ver as tarefas coletivas de todos os grupos, ou selecione um executor ou supervisor para consultar suas atribuições. O teste local confirmou a ausência do seletor no Desktop, a listagem coletiva com e sem pessoa selecionada e a presença e o funcionamento do seletor no Celular. O contrato de atualização automática passou. Para recuperação, reverta o commit deste build.

# Layout Desktop — Proprietário

Pendente de consolidação do Index Desktop autenticado a partir da interface existente. Não remover o código legado antes da homologação.

## Menu lateral do Proprietário

O build `20261114-menu-lateral-desktop-01` aplica a barra azul do protótipo [Desktop Lateral](../../../desktop-lateral/) ao painel operacional da entrada normal. **Início** fica no alto. Os outros rótulos e destinos vêm do Menu Principal da aplicação. A barra usa o comando de navegação já existente e destaca a tela ativa.

A entrada carrega o adaptador apenas quando a plataforma é Desktop. A barra depende da titularidade verificada e do painel pronto. A entrada direta de emergência, o Celular e os demais perfis continuam com o fluxo original. O adaptador usa os controles do painel existente e consulta apenas o seletor de navegação já carregado.

**Recolher menu** compacta a barra. **Usar menu anterior** recupera no próprio navegador a navegação anteriormente escolhida. **Ativar menu lateral** volta ao novo visual. A troca preserva a tela aberta e os controles existentes. Para restaurar a publicação, reverta apenas o commit deste build.

Validação local: contrato de atualização automática e simulação dos 14 destinos, titularidade, entrada de emergência, destaque, recolhimento, retorno ao menu anterior e isolamento Celular. A conferência visual e de navegação com sessão real fica para o Dell.

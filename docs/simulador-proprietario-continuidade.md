# Simulador Assistente FSJ — Celular / Proprietário

## Área de continuidade (não operacional)

Esta área registra as melhorias acordadas para o simulador do perfil Proprietário, **sem substituir o layout aprovado nem alterar a produção**.

### Referência obrigatória

- Interface móvel existente: `celular/interface.min.js`.
- Tela de supervisão existente: `celular/supervisor-view.min.js`.
- Layout do GitHub é a referência oficial. Não reconstruir do zero.
- Desktop e Celular mantêm interfaces independentes e dados compartilhados.
- Somente aplicar em produção após testes e autorização expressa do Proprietário.

### Critérios de simulação aprovados

1. Preservar o menu principal e a disposição de botões dois a dois, com **TV FSJ na primeira posição, ocupando a largura total**.
2. Preservar cabeçalho, botão Casa e rodapé numerado com setas de navegação.
3. O Proprietário dispõe das funcionalidades de executor, supervisor e gestão autorizadas ao perfil.
4. **Minhas tarefas** deve abrir primeiro a lista de tarefas reais atribuídas ao Proprietário; selecionar um número de tarefa abre os detalhes e os comandos de execução.
5. Em modo de simulação, comandos como **Iniciar, Suspender, Concluir e Não concluir** devem exibir a ação que o sistema executaria; **Concluir deve sempre apresentar retorno visível**. Não persistir mudanças de teste nos dados reais.
6. Manter relatórios gerenciais exclusivamente no perfil Proprietário; no perfil Supervisor, manter as ações de aceite e acompanhamento pertinentes.
7. Formulários com campo de texto e opção de voz ao lado, conforme o layout já aprovado.
8. Perfil Visitante: acesso somente ao simulador fictício, nunca à operação real.

### Próximas verificações antes de alterar qualquer código

- Conferir o comportamento atual da tela do Proprietário em `celular/interface.min.js`, inclusive os botões e a navegação.
- Confirmar se o botão Concluir já possui mensagem de retorno e corrigir apenas no ambiente experimental, se necessário.
- Comparar visualmente com a interface aprovada; não substituir por protótipos novos.
- Validar acesso, permissões, navegação e isolamento de dados antes de propor integração.

**Estado:** especificação de continuidade preservada; nenhuma melhoria operacional implantada nesta etapa.

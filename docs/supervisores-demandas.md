# Supervisores e demandas autorizadas

Em **Pessoas → Editar**, o gestor pode marcar **Atua como supervisor**, selecionar integrantes e/ou grupos e salvar. Não é necessário cadastrar e-mail ou outro login. Para receber o acesso diário, a pessoa deve permanecer ativa e selecionada para receber tarefas pelo WhatsApp.

A mensagem diária acrescenta **SUPERVISÃO: DEMANDAS DOS SUPERVISIONADOS** e um link pessoal apenas para supervisores ativos. O quadro do dia também apresenta esse acesso. Selecionar um integrante concede consulta às tarefas dele; selecionar um grupo concede consulta às tarefas do grupo e dos seus integrantes atuais. As duas seleções são combinadas, sem duplicar demandas.

O painel permite filtrar integrante, grupo e situação, e mostra a última resposta autorizada com justificativa. Não permite alterar cadastros, concluir tarefas, modificar folgas ou conceder permissões. Nomes, telefones e respostas de terceiros não supervisionados não são enviados ao navegador. O estado de uma tarefa compartilhada considera sua conclusão geral, mas a resposta privada de outro responsável não é exposta.

O link usa o token pessoal do quadro e expira junto com ele, no fim do dia em Pernambuco. Retirar a função ou desativar a pessoa impede novas consultas, mesmo com o link ainda em mãos. Mudanças de integrantes do grupo são consideradas na consulta seguinte. O painel atualiza a cada 30 segundos e ao voltar à tela; uma consulta sem autorização ou sem conexão limpa as demandas anteriores.

## Implementação

- As tabelas `supervisores_fsj`, `supervisores_pessoas` e `supervisores_grupos` têm RLS e nenhuma escrita pública.
- A Edge Function `supervisao` valida a sessão e o e-mail do gestor para alterar atribuições. A consulta do supervisor determina pessoa e escopo pelo token no banco, ignorando identificadores fornecidos pelo navegador.
- RPCs são `SECURITY INVOKER`, executáveis apenas pelo serviço no servidor. A atualização das atribuições é atômica, incluindo seus vínculos.
- A rotina das 7h consulta `fsj_link_supervisao` ao preparar a mensagem. O instalador `automation/install-supervisor-link.cjs` altera apenas esse trecho de `routine.mjs`, com backup. `wa.mjs`, `core.mjs`, as folgas, os feriados e o agendamento são preservados.
- Nenhuma pessoa foi designada automaticamente como supervisora; essa escolha pertence ao gestor.

## Validação

- `supabase/tests/supervisors.sql`: dados sintéticos em transação com rollback; escopo individual e de grupo, privacidade em tarefa compartilhada, remoção de integrante, tarefa diária, falha atômica, token de outro dia, desativação e retirada da função.
- `node --test tests/supervisor-edge.mjs automation/routine.test.mjs`: identidade determinada pelo token, ausência de autoridade de gestor, revogação e link somente para o destinatário autorizado.
- `node --test tests/supervisor-ui.cjs`: requer jsdom 26.1.0 na instalação de desenvolvimento; reedição das atribuições, filtros, conteúdo escapado e remoção de dados após perda de acesso.
- Testes existentes de cadastro, envio, folgas, bloqueio por resultado incerto e conexão passaram. Os dois testes antigos de Brisa que já falhavam no commit base não foram alterados.

O envio real do link depende de executar o instalador no computador Windows e de o gestor atribuir a função e os supervisionados antes da próxima mensagem diária.

# Revisão de conclusão pelo Proprietário

Na edição da demanda, a seção Revisar conclusão permite selecionar uma conclusão e informar o motivo antes de cancelar. Em tarefas diárias, o dia é explícito. O cancelamento devolve a ocorrência a Pendente, libera a nova execução/resposta e invalida a conclusão no indicador mensal. Uma nova conclusão válida conta novamente uma única vez.

A ação é exclusiva do Proprietário, validado por Auth e por fsj_titularidade com pessoa ativa. As funções de consulta e alteração são SECURITY INVOKER e disponíveis somente para service_role. Supervisores e executores não têm essa ação. Demandas arquivadas não podem ser revistas por esta edição.

A tabela conclusoes_revisoes registra autor, data/hora, motivo, dia previsto e cópias dos retornos/execuções anteriores. Respostas e anexos não são apagados. O SIM invalidado recebe o tipo sim_cancelado para que clientes e rotinas antigas que procuram tipo=sim também deixem de considerá-lo concluído. O tipo original está preservado na revisão. Retornos da ocorrência recebem cancelado_por_revisao e são ignorados no estado atual e no bloqueio de uma nova resposta.

A trava de links precede a trava da tarefa. O identificador de requisição torna as repetições idempotentes: um retry não cancela uma nova conclusão feita após a primeira revisão. Uma escolha desatualizada é rejeitada. Em tarefas compartilhadas, os links e respostas da ocorrência são liberados para todos os responsáveis.

O histórico de detalhes mostra respostas anteriores e cancelamentos com motivo. O formulário do executor mostra a última revisão. No caso diário, o cancelamento de um dia histórico não invalida conclusões de outros dias nem amplia o prazo de registro de links expirados. O indicador mantém o limite de até 23h59 do dia seguinte ao previsto.

## Validação
- test-owner-reopen.sql: executar em BEGIN/ROLLBACK após a migração; exclusividade do proprietário, motivo obrigatório, histórico preservado, links de grupo liberados, bloqueio de arquivamento sem conclusão válida, retomada, efeito no indicador, nova resposta e retry.
- test-review-ui.cjs (jsdom): edição, dia, confirmação, motivo, atualização e escape do histórico.
- test-review-edge.cjs: sintaxe e autenticação da API.
Nenhuma conclusão real foi cancelada na implantação.


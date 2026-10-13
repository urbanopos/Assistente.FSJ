# Início, suspensão e retomada

O formulário individual oferece Iniciar tarefa. A chamada usa apenas o token vigente, não aceita pessoa/tarefa do cliente. O servidor verifica cadastro ativo, responsabilidade e disponibilidade da tarefa. Um lock transacional por empregado e um índice único parcial garantem no máximo uma execução em andamento por empregado. Pessoas distintas podem trabalhar simultaneamente.

Iniciar outra tarefa suspende a anterior com data/hora; retomar preserva o primeiro início e registra novo horário de retomada. Eventos iniciar/retomar/suspender/concluir ficam em execucoes_historico. Resposta SIM conclui a execução; NÃO suspende uma execução ainda em andamento e preserva a justificativa. Não se exige início para gravar respostas já suportadas pelo sistema. Uma tarefa respondida não pode ser reiniciada pelo mesmo link.

A aba Demandas mostra o estado da execução por responsável junto da situação geral da tarefa. Supervisores veem somente as execuções dos integrantes autorizados. O empregado atualiza o estado ao voltar ao formulário e a cada 15 segundos; o Proprietário e o supervisor usam suas consultas automáticas existentes. A ação não envia WhatsApp nem altera a rotina das 7h.

O banco mantém todas as datas em timestamptz e a interface apresenta America/Recife. A atividade só é conhecida quando o empregado pressiona o botão; não é rastreamento automático. Os registros ficam preservados ao apagar mensagens do WhatsApp.

Validação: testes SQL em transações revertidas para idempotência, alternância, retomada, limite único, independência entre empregados e conclusão/NAO; testes de formulário/painel/serviço; regressões de respostas, itens faltantes, supervisão, folgas e férias. Nenhuma tarefa real foi iniciada por teste.

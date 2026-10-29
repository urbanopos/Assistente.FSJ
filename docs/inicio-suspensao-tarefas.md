# Início, suspensão e retomada

## Correção operacional de 29/10/2026

Tela 20261029-acoes-tarefas-13: SIM chama diretamente o envio validado, sem tentar clicar no botão de justificativa desabilitado. NÃO abre a justificativa obrigatória, preserva o texto em caso de erro e permite nova tentativa. Enquanto uma resposta está em envio, os controles de conclusão permanecem bloqueados contra duplicação.

Uma sessão administrativa antiga ou que não foi reconhecida como Proprietário não bloqueia mais os botões do token individual: a API continua validando pessoa, responsabilidade, vigência, perfil e expediente. Proprietário reconhecido permanece em diagnóstico até Desbloquear ações. Visitante não grava.

Suspender tarefa tem botão explícito e RPC fsj_suspender_tarefa, restrito a service_role e chamado pelo servidor com o token validado. A suspensão valida tarefa em andamento, vínculo, cadastro ativo e link vigente; preserva o início e registra histórico transacional. Retomar usa o fluxo de início existente. Folga pendente tem mensagem específica também no envio de SIM/NÃO; a exigência não é removida.

Validação desta correção: tests/task-controls-regression.cjs (DOM com dados fictícios), tests/task-controls-edge.mjs (API com banco simulado) e contrato de atualização automática. Nenhuma tarefa real é usada nos testes de gravação. Atualização da tela preserva token e parâmetros de retorno, adia recarga com justificativa/anexos e evita ciclos por versão. Instalações isoladas da VM não são atualizadas por esta publicação.

Banco: aplicar database/suspender-tarefa.sql antes de publicar a função resposta-tarefa e a tela. Recuperação: reverter os arquivos da entrega e a função de servidor; a RPC adicional pode permanecer sem chamadas, sem excluir execuções/histórico. Esta correção não cria backup parcial nem promove uma versão a backup antes do período de observação aprovado.

## Fluxo anterior preservado

O formulário individual oferece Iniciar tarefa. A chamada usa apenas o token vigente, não aceita pessoa/tarefa do cliente. O servidor verifica cadastro ativo, responsabilidade e disponibilidade da tarefa. Um lock transacional por empregado e um índice único parcial garantem no máximo uma execução em andamento por empregado. Pessoas distintas podem trabalhar simultaneamente.

Iniciar outra tarefa suspende a anterior com data/hora; retomar preserva o primeiro início e registra novo horário de retomada. Eventos iniciar/retomar/suspender/concluir ficam em execucoes_historico. Resposta SIM conclui a execução; NÃO suspende uma execução ainda em andamento e preserva a justificativa. Não se exige início para gravar respostas já suportadas pelo sistema. Uma tarefa respondida não pode ser reiniciada pelo mesmo link.

A aba Demandas mostra o estado da execução por responsável junto da situação geral da tarefa. Supervisores veem somente as execuções dos integrantes autorizados. O empregado atualiza o estado ao voltar ao formulário e a cada 15 segundos; o Proprietário e o supervisor usam suas consultas automáticas existentes. A ação não envia WhatsApp nem altera a rotina das 7h.

O banco mantém todas as datas em timestamptz e a interface apresenta America/Recife. A atividade só é conhecida quando o empregado pressiona o botão; não é rastreamento automático. Os registros ficam preservados ao apagar mensagens do WhatsApp.

Validação: testes SQL em transações revertidas para idempotência, alternância, retomada, limite único, independência entre empregados e conclusão/NAO; testes de formulário/painel/serviço; regressões de respostas, itens faltantes, supervisão, folgas e férias. Nenhuma tarefa real foi iniciada por teste.


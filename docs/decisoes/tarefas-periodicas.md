# Periodicidade das tarefas

A lista no cadastro substitui a marcacao diaria e permite pontual, diaria, semanal, mensal, trimestral, semestral e anual. A selecao e preservada no rascunho e na edicao, e exibida nas demandas e relatorios. Cadastros anteriores mantem sua classificacao diaria ou pontual.

A diaria conserva o comportamento anterior. Para as outras repeticoes, o cadastro e a primeira ocorrencia, imediatamente disponivel. A referencia e a data do cadastro no horario de Pernambuco. A proxima ocorrencia nasce quando o prazo vencer e a anterior estiver concluida. Pendencias permanecem abertas sem acumulacao de copias; periodos inteiros ja passados sao saltados. Meses e anos usam calendario, preservando a data de referencia nos limites dos meses e anos bissextos.

Cada nova ocorrencia recebe seu proprio numero, responsaveis e prioridade. A anterior continua no historico, com seus registros de execucao e respostas. Editar a ocorrencia atual altera suas proximas repeticoes; mudar para pontual interrompe a serie. Excluir a ocorrencia atual tambem interrompe a serie. A rotina privada no banco verifica vencimentos a cada minuto, mesmo com os aplicativos fechados. Ela nao envia mensagens nem muda os criterios existentes de acesso e envio.

Validacao: testes de interface para salvar, editar e restaurar todas as opcoes e rascunho legado; teste transacional no banco de calendario, tarefa pendente, geracao unica e copia dos responsaveis (revertido); tarefa agendada confirmada ativa e com execucao bem-sucedida; contrato de atualizacao automatica aprovado.

O teste antigo task-priority-ui.cjs continua com uma fixture desatualizada: executa fsjTaskName sem fornecer fsjExecucoes. A funcao ja depende desse estado na versao publicada antes desta alteracao. Os testes atuais task-list-number-only e task-frequency passaram.


## Correção do calendário periódico no celular — 12/11/2026

Commit `a420938a7b7aee62dc081b6a13ede7bf1603be92` (GitHub, publicação web sujeita à propagação do Pages). No `responder.html`, o bloqueio visual por estado `readonly/checking` foi retirado somente dos botões de dias do calendário. Permanecem bloqueados dias futuros, indisponíveis, concluídos, visitantes e datas anteriores à tolerância sem autorização do Proprietário. O servidor `resposta-tarefa` continua sendo a autoridade para validar o token, a data e a autorização, recusando duplicidade. A seta de próximo mês agora consulta o mês solicitado antes de exibir as marcações. Nenhuma mudança no Desktop ou na função Supabase foi feita. Teste operacional ainda pendente no link do executor/supervisor; confirmar hoje, ontem, atraso, duplicidade e mês seguinte. O commit anterior permite recuperação via histórico do GitHub.

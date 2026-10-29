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



## Titularidade nas tarefas próprias — 29/10/2026

Correção 20261029-titular-executor-14: o servidor identifica o Proprietário pela fsj_titularidade e pelo token vigente da própria pessoa antes de aplicar a limitação demonstrativa de Visitante. O cadastro de Urbano estava como Visitante; desbloquear o diagnóstico não removia essa limitação. A exceção vale somente para a pessoa titular vinculada ao token, sem usar nome ou dados enviados pelo navegador como prova de titularidade. Não altera categorias de pessoas nem libera outros visitantes. A inspeção de tarefas de terceiros continua exigindo desbloqueio; vigência, responsabilidade, folga e demais validações são preservadas.

A RPC de suspensão aplica a mesma precedência da titularidade. A tela remove a demonstração anterior quando a consulta seguinte reconhece execução autorizada. Testes de API incluem titular cadastrado como Visitante e tentativa com token de outra pessoa; a verificação de produção usa apenas consulta, sem iniciar/concluir tarefas reais. Publicação web/API não instala versões na VM. Recuperação por reversão desta entrega, sem apagar tarefas nem auditoria.


Menu e entrada do Proprietário, versão 20261029-proprietario-acesso-15: proprietario.js reconhece a sessão pela consulta fsj_titularidade, cuja RLS exige auth.uid()=auth_user_id. Após validação, o menu mantém todas as opções originais em qualquer aba e tamanho de tela, sem reduzi-las ao módulo atual. Outros perfis não recebem essa ampliação. A entrada inicio-usuario.html encaminha automaticamente a sessão validada do titular para index.html; token individual, nome Urbano ou parâmetro de URL não concedem administração. Sem sessão válida, permanece o acesso individual; a recuperação usa apenas o refresh token já salvo. A interface continua sujeita às autorizações de servidor e às restrições técnicas de serviços externos/VPN.


Nas tarefas da própria pessoa titular, o diagnóstico autenticado informa propria_tarefa e habilita as ações automaticamente após verificar identidade e vínculo no servidor. A inspeção de tarefas de terceiros conserva o modo diagnóstico com desbloqueio explícito. Não se decide titularidade apenas pelo token ou pelo nome no navegador.

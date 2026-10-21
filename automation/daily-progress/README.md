# Indicador mensal das tarefas diárias

As tarefas diárias mostram X / Y no lugar da situação Concluída. X é o número de dias previstos com uma resposta SIM recebida até o final do dia seguinte em America/Recife. Y é o total de dias de trabalho previstos no mês conforme o calendário salvo. Uma resposta tardia permanece no histórico e não aumenta X. Repetições da mesma resposta/dia não aumentam a contagem.

A referência mensal é o dia previsto, nunca o dia em que o registro chegou. Outubro pode receber a conclusão do dia 31 em 1º de novembro. Antes da criação da tarefa/pessoa e depois de seu arquivamento não há dias previstos. Folgas por data e semana, férias, folgas compensatórias e feriados sem trabalho autorizado são descontados. O calendário pode ser revisto pelo Proprietário, recalculando o denominador; semanas futuras sem folga definida ainda dependem da escolha. O recebimento de WhatsApp não define se uma pessoa trabalha.

Nas tarefas compartilhadas, uma conclusão vale para a atividade e conta uma única vez. O filtro de responsável usa o calendário dessa pessoa. A supervisão recebe apenas os indicadores de pessoas de seu próprio escopo.

O indicador é de apresentação; a situação operacional, os filtros, a conclusão do dia, as cores e a aprovação de arquivamento são preservados. Em aberto e Pendente podem mostrar o indicador ao lado. Tarefas arquivadas continuam identificadas como Arquivado.

## Persistência e prazo

retornos.dia_previsto preserva a data da ocorrência. O histórico anterior é preenchido a partir do link confirmado quando disponível, ou pela data local do registro (a regra anterior exigia link do mesmo dia). As novas respostas usam diretamente a data do link.

O link diário pode registrar a ocorrência até o fim do dia seguinte. Pessoas inativas, tarefas sem atribuição, arquivadas ou já respondidas continuam bloqueadas. A confirmação SIM de tarefa diária pode ser recebida até 23h59 do dia seguinte, inclusive fora da janela ordinária. As demais respostas conservam a restrição de expediente. A rotina automática de WhatsApp das 7h não é alterada.

fsj_progresso_diario e fsj_link_resposta_vigente são SECURITY INVOKER e executáveis apenas por service_role. As Edge Functions validam o acesso antes de consultar o indicador. A API do Proprietário também exige vínculo em fsj_titularidade. Não há chave de serviço no cliente.

## Implantação

Migração aplicada: daily_task_monthly_progress.
Edge Functions atualizadas: resposta-tarefa e supervisao.
Interface Web: index.html, quadro.html, responder.html, supervisor.html, supervisor-view.js e daily-progress.js.
Nenhum instalador da VM é necessário.

## Validação

- test-progress.sql: executar em BEGIN/ROLLBACK após a migração; calendário 19 / 25, duplicatas, prazo inclusivo até 23h59:59.999, corte da meia-noite seguinte, mês de origem, escopo, data do link anterior e encerramento da execução correta.
- test-ui.cjs: jsdom; rótulos, situação preservada, relatório do mês e tabela de demandas.
- test-edge.cjs: autenticação, vínculo do Proprietário, origem, mês inválido, situação por dia previsto.
- check-syntax.cjs: scripts HTML/JS e TypeScript das Edge Functions.
Os testes SQL não deixam pessoas, tarefas, respostas ou chamadas de teste.


# Assistente FSJ — Manual de Operação e Manutenção: identificação de envios

Atualizado em 24/10/2026. Documento de preparação; não altera a automação em produção.

## Regra de segurança
Preservar a tarefa agendada `FSJ-Tarefas-07h` e a sessão atual. Não iniciar outra instância do WhatsApp nem modificar a rotina em produção antes de validar testes isolados e obter backup.

## Identificadores de origem
- `FSJ-AUTO`: quadro disparado pela rotina diária.
- `FSJ-MANUAL`: quadro enviado manualmente e confirmado pelo proprietário; exige conciliação técnica quando possível.
- `FSJ-TESTE`: mensagem de teste a uma única pessoa; nunca substitui o quadro diário, nunca apaga mensagens e não satisfaz o envio automático.
- `FSJ-REENVIO`: reenvio explícito autorizado, com justificativa.

Cada operação deve registrar identificador único, pessoa, data e hora em America/Recife, origem, estado e ID técnico da mensagem quando retornado pelo WhatsApp. Não confundir `enviado`, `entregue` e `lido`.

## Rotina diária
Antes de enviar, consultar a confirmação manual do dia e os registros técnicos do quadro automático. Evitar duplicação por destinatário. Um envio manual confirmado pode dispensar o automático para aquela pessoa, mas não altera o agendamento geral. Registrar dispensa por envio manual como resultado normal, não como falha.

O código de saída do processo deve ser zero quando todas as pessoas foram processadas ou legitimamente dispensadas; erros reais de autenticação, envio, banco de dados ou estados incertos devem permanecer visíveis, sem serem mascarados por confirmações manuais.

## Teste individual
Apenas proprietário autenticado; escolher uma pessoa cadastrada; exibir aviso e solicitar confirmação. Enviar mensagem marcada `FSJ-TESTE` apenas ao destinatário selecionado, sem excluir mensagens e sem escrever confirmação de quadro do dia. Informar resultado técnico e pedir confirmação visual no telefone. Testar antes da migração do emissor.

## Observações do diagnóstico em 24/10/2026
O Agendador do Windows informou a tarefa `FSJ-Tarefas-07h` como `Ready`; execução anterior em 23/10/2026 às 07:00:01 com `LastTaskResult=1`, próxima execução em 24/10/2026 às 07:00. Esse código significa erro do processo, não prova que nenhum destinatário recebeu mensagem. O usuário informou que houve envio manual no dia anterior.

O repositório já contém conciliação de envio manual em `automation/manual-history.mjs`: a função `runManualAwareRoutine` consulta `fsj_envios_manuais` e dispensa envio automático para destinatários com `confirmado_em`. A existência desse código não comprova que a versão implantada no Windows esteja atualizada nem que a execução tenha terminado corretamente.

## Próxima verificação sem alterações
Consultar a ação da tarefa agendada, a versão local de `automation/manual-history.mjs`, os registros do Agendador e o estado de autenticação do executor. Não executar `npm start` nem `npm run link` antes da verificação de concorrência.

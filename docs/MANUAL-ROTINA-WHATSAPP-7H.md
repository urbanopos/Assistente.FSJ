# Assistente FSJ — Manual da rotina automática das 7h

**Estado desta especificação:** aprovada pelo proprietário, **pendente de implementação e testes**. Este documento é normativo para futuras instalações, mas **não afirma que o código em produção já cumpre os critérios abaixo**.

## 1. Horário padrão
- A rotina automática começa às **07:00**, fuso **America/Recife**.
- Antes das 07:00, não executar o disparo automático. A inexistência de envio do dia antes desse horário não constitui falha.
- O envio manual de emergência é independente e não altera a programação das 07:00.
- Deve haver **somente um executor ativo de disparo**; o espelhamento GitHub → VM não autoriza disparos duplicados.

## 2. Política padrão de tentativas
### Etapa 1 — apagamento e envio
- Executar até **5 tentativas** do procedimento de apagar a mensagem anterior e enviar a mensagem do dia.
- Espaçar as tentativas em **20 segundos**.
- Se o envio do dia for confirmado, encerrar imediatamente o procedimento e não repetir o script para o mesmo destinatário e dia.

### Etapa 2 — priorização do envio
- Se a primeira etapa não conseguir confirmar o envio, realizar até **10 tentativas adicionais**, espaçadas em **20 segundos**.
- Nesta etapa, **priorizar exclusivamente o envio da mensagem do dia, sem exigir novo apagamento da anterior**.
- Assim que houver confirmação de envio, encerrar imediatamente todas as tentativas.

### Falha definitiva
- Se as duas etapas terminarem sem envio confirmado, **criar uma tarefa urgente dirigida ao proprietário**, com identificação do destinatário, data, número de tentativas, horário e diagnóstico da falha.
- Não criar tarefas urgentes duplicadas para a mesma ocorrência.

## 3. Prevenção de duplicidades e rastreabilidade
- Registrar por destinatário e dia: tentativas, solicitações de apagamento, confirmações, erros e identificadores de mensagem.
- Antes de repetir um envio, verificar se já existe mensagem do dia confirmada.
- **Resultado incerto não equivale a envio não realizado.** Em falhas de comunicação após a solicitação de envio, verificar a conversa e o identificador da mensagem antes de tentar novamente. Se a ausência de envio não puder ser comprovada, interromper a repetição automática e sinalizar a ocorrência ao proprietário, em vez de arriscar duplicação.
- Uma vez confirmado o primeiro envio do dia, não repetir o procedimento padrão naquele dia para o mesmo destinatário.

## 4. Aplicação a todas as instalações
- Estas regras são o padrão obrigatório do Assistente FSJ, seja no GitHub, na VM ou em instalações futuras.
- Espelhar versões e preservar dados, credenciais e estado local; nunca habilitar dois executores simultâneos da rotina.
- Antes da implantação, executar testes controlados, inclusive falhas de apagamento, falhas seguras antes de transmitir, resultado incerto, confirmação tardia, sucesso e geração da tarefa urgente.

## 5. Controle de implantação
- **Registro no manual:** 20/10/2026.
- **Alteração da rotina em produção:** adiada por decisão do proprietário até **depois do disparo das 07:00 de 20/10/2026**.
- **Estado operacional atual:** permanece inalterado. A publicação deste manual não ativa novas tentativas nem altera o WhatsApp.
- **Próximo passo:** após o disparo, implementar, testar e validar a política antes de ativá-la, mantendo o espelhamento seguro para a VM.

# Envio do dia apos falha no apagamento

Decisão do proprietário em 19/10/2026: depois das tentativas convencionadas de apagamento e envio, a rotina não deve impedir o trabalho do dia porque não conseguiu apagar a mensagem anterior. Deve enviar o conteúdo atual e registrar tarefa urgente para o proprietário conferir e apagar manualmente.

Implementação: automation/whatsapp-delivery-policy-v3/. Até cinco tentativas por mensagem anterior; resultado real preservado como falha/sem confirmação. Cria uma única tarefa urgente por participante e data, atribuída ao proprietário vigente em fsj_titularidade. Registro protegido por service_role. A função fsj_pendencia_apagamento_whatsapp foi implantada e validada com testes transacionais revertidos e verificação de privilégios. Caso concreto de Urbano registrado como tarefa real após a recusa de apagar para todos informada pelo executor.

Transporte: até cinco tentativas de cartão e depois cinco da reserva convencional quando a falha comprova que não houve transmissão. Falha com resultado incerto exige conferir a conversa, para não transformar retentativa em duplicação. IDs conhecidos são persistidos e recuperados sem reenviar. A rotina sempre encerra no primeiro resultado de envio conhecido.

O novo instalador preserva as outras funções do core e o vínculo WhatsApp, substitui somente o ciclo e o transporte e acrescenta contexto de pessoa/dia na chamada do ciclo. Requer o modelo de legenda web instalado anteriormente. Retoma os pendentes da mesma rodada, sem repetir os oito já concluídos.

Estado deste registro: código publicado, banco implantado e testes aprovados. A mudança do executor Windows e a retomada do envio pendente dependem da execução do instalador pelo proprietário. A janela normal permanece às 7h. A confirmação do Windows deve ser registrada antes de declarar o envio real concluído.

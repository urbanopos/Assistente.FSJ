# Envio individual de emergência pelo celular

Nas abas **Pessoas** e **WhatsApp**, cada cadastro tem o botão **Enviar tarefas pelo WhatsApp**. Ele prepara o quadro individual de hoje e abre o WhatsApp do proprietário com a mensagem pronta. O proprietário confirma o envio no WhatsApp, uma pessoa por vez. Funciona sem o computador executor.

O servidor valida a sessão do proprietário, o cadastro atual, o telefone e as regras existentes de recebimento, horário, folgas, férias e feriados. O quadro existente é reutilizado sem trocar seu token. Se não existir, é criado para o dia atual. O link de supervisão só é incluído para o próprio destinatário quando seu perfil está habilitado. A abertura do quadro gera os links de tarefas pelo fluxo existente.

Se houver um envio automático registrado naquele dia, o aplicativo solicita conferência da conversa antes de abrir a mensagem novamente. Há um link alternativo para abrir a mensagem caso o redirecionamento seja bloqueado.

Este envio exige a confirmação manual no WhatsApp. Não apaga a mensagem anterior e não registra abertura de conversa como envio confirmado. As respostas dos funcionários continuam sendo registradas pelo quadro e formulários existentes. A tarefa das 7h, suas cinco tentativas e seu diário são preservados.

A infraestrutura de pedidos para o executor permanece disponível no servidor, mas a interface individual não depende dela nem cria pedidos em lote.

Verificação: `node --test tests/manual-send.cjs tests/individual-send.cjs`.

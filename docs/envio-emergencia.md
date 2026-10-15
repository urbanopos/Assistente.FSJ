# Envio de emergência

O proprietário aciona WhatsApp → Enviar tarefas para todos — emergência. O servidor valida sua sessão no Supabase e cria um único pedido pendente por dia. O executor conectado consulta os pedidos a cada 15 segundos e executa **o mesmo `run-retries.mjs` local** usado pelo agendamento das 7h. Não existe cópia da lógica de envio. O botão não altera a tarefa das 7h, as cinco tentativas, o diário, o bloqueio de concorrência ou os perfis dos destinatários.

A rotina mantém seus registros individuais de apagamento, envio, falhas, quadros e links de resposta, incluindo supervisão. Os destinatários são processados em sequência para compartilhar a mesma sessão WhatsApp. Um envio já registrado hoje não é repetido; um envio incerto exige conferência no executor. O WhatsApp pode impedir a exclusão de mensagens; o resultado efetivo segue registrado pela rotina existente.

Pedidos do dia anterior pendentes expiram. Um pedido em execução nunca é retomado automaticamente após interrupção: conferir o diário e histórico antes de qualquer recuperação. Estado `concluido` significa que o script retornou sem falhas; destinatários podem ter sido dispensados por folga/férias ou envio já registrado. Não significa leitura ou entrega de todas as mensagens.

## Ativação única no computador executor

No mesmo usuário Windows usado pela tarefa das 7h, atualizar o repositório e executar:

```powershell
Set-Location "$env:USERPROFILE\Assistente.FSJ"
git pull --ff-only
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\automation\install-emergency.ps1
```

O instalador exige que a rotina de cinco tentativas já esteja instalada e usa a mesma chave protegida e a mesma pasta de estado. Cria uma tarefa independente `FSJ-Emergencia`, iniciada imediatamente e no login do usuário; não registra um pedido de envio. O computador precisa permanecer ligado, conectado e com o usuário conectado. Nenhuma nova plataforma ou plano pago é necessário.

Até essa ativação, o painel informa executor indisponível e bloqueia o botão. As credenciais não são enviadas ao celular nem ao GitHub. Nenhum clique no painel abre o WhatsApp pessoal ou marca um envio sem confirmação do executor.

# Auditoria da rotina das 7h — 10/10/2026

## Resultado

A rotina não está validada de ponta a ponta. Há dois problemas independentes: disparo pontual e transporte WhatsApp. Acrescentar cadastro, folgas, horários ou avatar não resolve esses problemas. Conexão pronta, testes simulados e workflow verde não comprovam envio real.

## Evidências

- Agendamento: cron `0 10 * * *` corresponde a 7h em Igarassu/PE; o fuso não causou a falha.
- Execuções agendadas de 02 a 09/10 foram criadas entre 11h35 e 16h06 locais. Em 09/10, criada às 13h51; o job envio foi ignorado, apesar de o workflow terminar com sucesso.
- Execução manual 38044502259: checkout e instalação concluíram. A etapa de envio falhou porque o WhatsApp não ficou pronto em 90 segundos. A rejeição não tratada encerrou o Node e deixou routine.lock. O tratamento foi corrigido no commit 00c8fd3.
- Posteriormente, vínculo e conexão automática foram demonstrados pelo PowerShell do usuário. Isso testa conexão, não transporte.
- Tentativa de 10/10 às 7h41: eventos apagamento_automatico sem confirmação, envio_incerto e falha_rotina. Nenhum quadro_automatico com identificador. Usuário conferiu a conversa e informou que não apareceu mensagem.
- O erro original de sendMessage era ocultado. A correção para preservá-lo foi publicada, mas não há ainda resultado de nova tentativa com essa instrumentação. A causa exata do transporte continua desconhecida.
- Banco: acesso HTTP 200 confirmado no executor; cadastro de Menininha ativo, recebimento habilitado, sem folga registrada na auditoria.

## Diagnóstico por etapa

| Etapa | Situação | Consequência |
|---|---|---|
| Cadastro e folgas | Disponíveis no banco | Não são a causa comprovada |
| Agendamento GitHub | Atrasos reais de horas | Inadequado como relógio da rotina das 7h |
| Executor | Executa manualmente; depende de terminal aberto | Fechar a janela interrompe disponibilidade |
| Instalação diária | npm ci a cada disparo | Acrescenta rede, instalação e tempo no momento do envio |
| Conexão WhatsApp | Funcionou em teste posterior | Não demonstra que sendMessage funciona |
| Envio | Falhou sem causa original preservada na tentativa observada | Bloqueio de repetição correto, diagnóstico insuficiente |
| Apagamento anterior | Sem identificador de mensagem anterior | Não pode apagar testes antigos com segurança |
| Confirmação no painel | Inicialmente baseada apenas no ID | Corrigida: ID é registro; ACK de servidor é confirmação |
| Testes | Simulados | Úteis para regressão; não substituem teste real |

## Correções já feitas

- Captura concorrente da inicialização e do evento ready, para tratar timeout sem encerramento abrupto.
- Registro do erro original do envio; preservação dele mesmo se o registro no banco falhar.
- Bloqueio de duplicação permanece ativo em estado incerto; diário não deve ser apagado.
- Painel separa ID registrado de reconhecimento do servidor. ACK ausente, zero ou erro não vira confirmação positiva.
- Apagamento só confirmado por evento de revogação; solicitar exclusão não é provar exclusão.

## Metodologia corrigida

1. Congelar novas funcionalidades até validar o transporte. Nenhuma nova tentativa automática de mensagem incerta.
2. Obter o erro original em UMA tentativa controlada, somente após reconciliação da conversa e cópia do diário. Não mudar várias opções do WhatsApp ao mesmo tempo.
3. Validar a sequência real: identificar mensagem anterior da rotina; tentar apagar; enviar link e aviso obrigatório; persistir ID; conferir ACK e conversa. Primeiro envio não tem identificador anterior para apagar.
4. Repetir a rotina no mesmo dia e provar que não envia outra mensagem. Testar uma data de folga sem envio.
5. Depois do transporte validado, usar o Agendador de Tarefas do Windows às 7h, sob o mesmo usuário urban e com acesso à mesma sessão privada. Instalar dependências previamente; não baixar projeto nem instalar pacotes às 7h. Capturar log por execução.
6. Na migração, manter UM agendador diário. Desabilitar o cron GitHub apenas depois de verificar a tarefa Windows registrada. GitHub continua como repositório/publicação; não como relógio pontual.
7. Provar uma execução real às 7h com PC ligado, internet, usuário/sessão disponíveis e suspensão desabilitada. Nem agendador local garante entrega se WhatsApp ou internet estiver indisponível.
8. Só então habilitar Carlos e Irmão, com telefones e folgas conferidos. Cada pessoa conserva diário e histórico próprios.

Não foi instalada tarefa Windows nesta revisão: não temos controle remoto do PC, e seria prematuro migrar antes de validar o transporte. Não foi realizado envio durante a auditoria. O resultado real permanece pendente.

## Limitações adicionais

whatsapp-web.js automatiza o WhatsApp Web e depende de suas mudanças internas. O código oficial executa uma operação de marcar conversa como vista antes do envio por padrão, e não aguarda resultado de envio por padrão. Essas são possibilidades a investigar após obter o erro original, não causas demonstradas deste caso. Não atualizar biblioteca, trocar navegador ou contornar leitura indiscriminadamente.

A prévia do link não equivale ao envio garantido de uma imagem/post. Atualmente o transporte envia texto com URL do quadro e aviso, solicita prévia, e a lista de tarefas fica no quadro web. Respostas automáticas por áudio/WhatsApp não fazem parte do transporte implementado; as respostas de tarefas usam o formulário.

## Fontes e registros

- Agendamento: https://docs.github.com/en/actions/how-tos/troubleshoot-workflows
- Execução agendada analisada: https://github.com/urbanopos/Assistente.FSJ/actions/runs/37962096771
- Execução manual com timeout: https://github.com/urbanopos/Assistente.FSJ/actions/runs/38044502259
- Biblioteca e opções reais: https://docs.wwebjs.dev/Client.js.html
- Estados ACK: https://docs.wwebjs.dev/global.html#MessageAck
- Agendamento diário Windows: https://learn.microsoft.com/en-us/powershell/module/scheduledtasks/new-scheduledtasktrigger

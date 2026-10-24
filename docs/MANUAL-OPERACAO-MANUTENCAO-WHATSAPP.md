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

## Arquitetura Windows Desktop + VM Debian (24/10/2026)

### Operação e responsabilidades
- O Windows Desktop continua sendo a interface de operação e administração do Assistente FSJ, normalmente pelo Chrome. Não é necessário migrar a operação cotidiana do usuário para uma área de trabalho Linux.
- O aplicativo FSJ já hospedado na VM Debian permanece na VM, independente do executor WhatsApp.
- **Estado atual em produção:** o agendamento `FSJ-Tarefas-07h` e o executor de WhatsApp continuam no Windows. Não desativar nem transferir essa tarefa enquanto a VM não estiver vinculada, testada e aprovada.
- **Estado futuro planejado:** apenas a automação de envio do WhatsApp passa para a VM; a administração permanece no Windows, com uma página própria de vinculação e estado de conexão, acessível de forma autenticada pela VPN. Essa página ainda não está implementada.
- Windows e VM estão no mesmo computador físico, mas são sistemas operacionais isolados: fechar a sessão do Windows não implica desligar a VM; desligar ou suspender o computador físico interrompe ambos. Verificar energia, suspensão e reinicialização antes de declarar autonomia 24h.

### Preparação da VM concluída
- Host Debian `urbano@192.168.77.2`; diretório isolado `/home/urbano/fsj-whatsapp/automation`.
- Pacote de automação copiado e extraído; dependências instaladas com `npm ci` (193 pacotes).
- Node.js `v24.13.0` instalado separadamente em `/home/urbano/fsj-whatsapp/node24`, sem substituir `/usr/bin/node` (v20.19.2), usado por outros serviços.
- Chromium disponível em `/usr/bin/chromium`. A VM possui Xorg/XFCE, mas ainda não há interface remota do WhatsApp configurada.
- **Pendente:** configurar o Chromium headless/pareamento gráfico seguro, vincular e persistir sessão WhatsApp na VM, provisionar credenciais de forma privada, realizar teste individual com confirmação do proprietário e implantar agendamento. A cópia de arquivos não transfere automaticamente a sessão autenticada.
- Não modificar `fsj-reserva.service` ou outros serviços do aplicativo principal para concluir a migração do executor.

### Evidência da execução de 24/10/2026
- No Windows, `agendamento.log` registra início às 07:00:01 (America/Recife), **oito mensagens enviadas e registradas**, um destinatário dispensado por folga/feriado e encerramento da rotina **sem falhas**.
- O proprietário confirmou o recebimento das tarefas. A confirmação visual é distinta do registro técnico; o registro sozinho não prova entrega ou leitura.
- `auth`, `routine.lock` e `journal.json` do Windows devem ser preservados. Não repetir o disparo desse dia sem auditoria e autorização explícita.

### Procedimento de transição e prevenção de duplicidade
1. Manter o Windows como único emissor de produção até validar a VM. Não executar duas rotinas simultaneamente.
2. Vincular o WhatsApp na VM e testar uma única mensagem marcada `FSJ-TESTE` ao proprietário, sem alterar o quadro diário nem revogar mensagens.
3. Verificar logs, estado persistente, credenciais, fuso `America/Recife`, regras de folga e idempotência por destinatário e data; realizar teste de reinicialização e reconexão.
4. Em janela controlada, desativar o agendamento Windows e **somente depois** habilitar o da VM. Registrar hora da troca e garantir que não haja envio em andamento.
5. Confirmar um ciclo diário completo na VM e manter plano de reversão: desativar primeiro o emissor da VM, reconciliar envios registrados e só então reativar o Windows.
6. Usar VPN e autenticação para supervisão; nunca expor QR Code, sessão, chaves Supabase ou porta administrativa à internet pública. Manter backups privados e logs de auditoria.

### Comandos de verificação (sem disparo)
No PowerShell: `Get-ScheduledTaskInfo -TaskName "FSJ-Tarefas-07h"` e `Get-Content "$env:LOCALAPPDATA\\FSJ\\whatsapp\\agendamento.log" -Tail 35`. Na VM, via SSH, consultar processos e registros do futuro executor antes de qualquer alteração. Não usar `Start-ScheduledTask` como teste de conectividade.

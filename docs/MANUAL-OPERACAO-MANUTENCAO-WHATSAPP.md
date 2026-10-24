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
- **Estado futuro planejado:** apenas a automação de envio do WhatsApp passa para a VM; a administração permanece no Windows, com uma página própria de vinculação e estado de conexão, acessível de forma autenticada pela VPN. O painel web foi preparado e extraído na VM, mas ainda não foi iniciado nem testado no navegador.
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

## Recuperação após falta de energia ou reinicialização do Desktop

- O Desktop Windows e a VM Debian compartilham o hardware físico. Falta de energia interrompe ambos. Em geral, discos virtuais e configurações persistem após reinicialização; interrupção durante gravação pode corromper arquivos ou bancos, portanto não há garantia absoluta.
- Reiniciar o Windows **não garante** que a VM será iniciada automaticamente: verificar e configurar o hipervisor, o início automático da VM e a política de desligamento seguro. O tipo de hipervisor e a configuração atual ainda não foram verificados.
- No Debian, verificar habilitação e política de reinício do serviço `fsj-reserva.service` e, quando implantado, do executor WhatsApp; `active` antes da queda não comprova retorno automático depois.
- Autenticação WhatsApp persistente em disco facilita reconexão, mas pode expirar ou exigir novo QR Code. Preservar diretórios de sessão com permissões restritas e backup seguro; não copiar segredos para o repositório.
- Se o computador ficar desligado às 7h, não presumir que o disparo ocorrerá depois: a política de recuperação deve conciliar registros por data/destinatário, confirmar conectividade e solicitar autorização para envios atrasados quando houver incerteza.
- Para reduzir riscos, usar desligamento normal sempre que possível, backup consistente da VM e dos dados, proteção contra queda de energia (nobreak, se disponível) e teste controlado de reinício. Não alterar configurações de produção sem verificar o ambiente.
- **Pendente de validação:** hipervisor, opção de autostart, serviço após reboot, integridade de armazenamento e plano de recuperação. Não afirmar que a retomada automática já está implantada.

### Verificação do Hyper-V em 24/10/2026
O proprietário executou `Get-VM | Select-Object Name,State,AutomaticStartAction,AutomaticStartDelay,AutomaticStopAction` no Windows. Resultado da VM `Assistente-FSJ`: `Running`, `AutomaticStartAction=Start`, `AutomaticStartDelay=0`, `AutomaticStopAction=Save`. Serviços do host: `vmms=Running/Automatic`, `vmcompute=Running/Manual`. Assim, a inicialização automática da VM já está configurada no Hyper-V, sem necessidade de mudança. `Save` é aplicável a desligamento controlado; queda súbita de energia não salva o estado. Ainda verificar reinício dos serviços dentro do Debian e recuperação do executor WhatsApp antes de declarar recuperação integral das rotinas.

### Verificação dos serviços Debian em 24/10/2026
Consulta remota, sem modificações: `systemctl --user is-enabled fsj-reserva.service` retornou `enabled`; `systemctl --user is-active fsj-reserva.service` retornou `active`; `loginctl show-user urbano -p Linger` retornou `Linger=yes`. Isso confirma que o serviço principal está habilitado, ativo e pode funcionar sem sessão interativa do usuário. Com `AutomaticStartAction=Start` no Hyper-V, a configuração favorece recuperação após reinício do host. **Não foi realizado teste de reinicialização real** e o executor WhatsApp na VM ainda não está em produção. Preservar o agendamento WhatsApp atual do Windows até migração validada.

## Andamento da interface WhatsApp em 24/10/2026
- Confirmado `qrcode` instalado no executor da VM e sintaxe do módulo validada com Node 24.
- Consulta `ss -ltnp` não encontrou serviços escutando nas portas 3000, 3001, 8765 e 8766 naquele momento.
- Pacote `FSJ-WhatsApp-Painel.zip` transferido por SCP e listado: contém `fsj-whatsapp-interface/fsj-whatsapp-painel.mjs` (4055 bytes).
- Arquivo extraído em `/home/urbano/fsj-whatsapp/painel/fsj-whatsapp-interface/fsj-whatsapp-painel.mjs`; `node --check` com Node 24 terminou sem erro.
- Revisão do código: servidor HTTP Node escuta **somente** em `127.0.0.1:8765`, fornece página com cabeçalho FSJ, botão de vinculação, QR Code e estado. Utiliza Chromium headless e `whatsapp-web.js`, sessão `LocalAuth` com `clientId=fsj` sob `FSJ_STATE_DIR/auth`. **O painel não envia mensagens**.
- **Ainda não executado:** definir e validar `FSJ_STATE_DIR` privado/persistente e exclusivo da VM, confirmar ausência de processos concorrentes, iniciar painel, abrir via túnel SSH, vincular QR, testar reconexão. Não declarar a migração concluída.
- **Atenção técnica antes do uso:** validar tratamento de falhas, estados de conexão e reinicialização antes de tornar o serviço permanente. O painel não tem autenticação HTTP própria: manter acesso somente via túnel SSH, sem publicar a porta.
- Consulta `sudo ufw status verbose` e `sudo ss -ltnp` não foi concluída porque SSH sem terminal interativo não permitiu solicitar senha do sudo. A pedido do proprietário, adiar alterações de firewall/portas até a migração estar plenamente funcional. Não abrir portas públicas agora.
- Preservar integralmente o agendamento das 7h no Windows, registros e autenticação. Não iniciar envio pela VM antes de transição controlada.

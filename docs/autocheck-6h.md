# Autocheck local das 6h

Arquivos independentes da rotina de envio: automation/autocheck.mjs, autocheck-core.mjs e install-autocheck.ps1. O instalador registra FSJ-Autocheck-06h sob a mesma conta Windows com logon interativo. Não modifica FSJ-Tarefas-07h, wa.mjs, routine.mjs, core.mjs, banco ou diário.

Executar no computador executor com FSJ_STATE_DIR definido, Node disponível, chave-agendamento.xml protegida existente e task das 7h ativa. Baixar os três arquivos da mesma versão do GitHub para a pasta automation; executar powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\install-autocheck.ps1. Se as 6h de hoje já passaram, a execução diária começa na próxima ocorrência; pode-se executar Start-ScheduledTask -TaskName FSJ-Autocheck-06h para uma consulta imediata.

Verifica presença dos módulos, escrita na pasta privada, conectividade/banco, destinatários selecionados, diário legível e ausência de envio incerto do dia, ausência de routine.lock, páginas quadro/responder, WhatsApp CONNECTED, leitura das conversas e resolução dos números. Não testa envio/exclusão reais nem garante disponibilidade futura às 7h. Folga/feriado não são tratados como erro. Não remove bloqueios. Encerra o navegador após o teste. Limite de execução Windows: 10 minutos.

O wrapper verifica se o próximo disparo da tarefa principal é hoje às 7h. Registra em autocheck.log e autocheck-ultimo.json, na pasta privada. Não inclui chave ou números no relatório. O arquivo de diagnóstico não prova envio ou entrega.

SMS ainda não conectado: requer gateway/provedor ou modem GSM com SIM e API/comandos suportados. Adaptador Ethernet/Wi-Fi comum não envia SMS. Problemas ficam no log até integração do canal de alerta. Computador desligado, usuário deslogado ou tarefa que nunca inicia impedem o autocheck local: esse cenário precisa de monitoramento externo para gerar aviso independente.

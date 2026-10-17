# Rotina da equipe às 7h

Destinatários e folgas configurados em Pessoas no painel do gestor.
GitHub Actions agenda às 10h UTC (7h em Igarassu/PE). A fila do GitHub pode atrasar.
O computador executor deve permanecer ligado, conectado e sem suspensão.

## Configuração inicial no computador executor

1. Instalar Node.js 22 ou superior e um runner do GitHub neste repositório, com a etiqueta `fsj-whatsapp`. Não habilitar execução de pull requests de terceiros nesse runner.
2. Definir no ambiente do serviço do runner `FSJ_STATE_DIR`, uma pasta privada persistente FORA do checkout; e `SUPABASE_SERVICE_ROLE_KEY`, obtida pelo gestor no Supabase e mantida somente nesse ambiente protegido. A chave é privilegiada: nunca incluir no repositório, em capturas, no chat ou no site. Não é uma chave de IA paga.
3. Na pasta `automation`, executar `npm ci`, depois `npm run link`. Na janela que abrir, vincular com WhatsApp → Aparelhos conectados. O QR não é armazenado nos logs. Executar sob o mesmo usuário do serviço do runner.
4. Rodar `npm test`. No GitHub, criar a variável de repositório `FSJ_ROTINA_ATIVA=true` somente quando a vinculação estiver concluída. Em Actions, executar manualmente o workflow uma vez e conferir a conversa e o histórico.

## Comportamento

- Recebem somente pessoas com cadastro ativo e recebimento às 7h marcado. Folgas cadastradas manualmente por data impedem o envio. Não há geração automática de folgas. Menininha permanece selecionada na migração inicial; os demais são habilitados pelo gestor.
- Escala 6×1: 7h20 de trabalho e 2h de almoço. Horários de entrada/almoço são informações do cadastro; o disparo segue às 7h, bloqueado antes desse horário.
- Mantém sessão compartilhada, envios sequenciais e diário separado por pessoa/dia. Falha de uma pessoa não bloqueia as demais.
- routine.lock impede sobreposição de processos locais; após interrupção forçada, conferir processos e diário antes de remover essa pasta.
- Gera/reutiliza quadro e links individuais do dia; tarefas pontuais concluídas saem; diárias voltam no dia seguinte, salvo conclusão naquele dia.
- Tenta apagar para todos SOMENTE a mensagem cujo identificador foi armazenado pela rotina. Não pesquisa mensagens arbitrárias para excluir.
- O primeiro envio não consegue apagar os testes antigos sem identificador técnico. Envia o aviso junto do link.
- Só registra exclusão confirmada ao receber evento de revogação do WhatsApp. Sem confirmação, envia o quadro com aviso.
- Registra envio com identificador devolvido pelo WhatsApp; distingue envio de entrega/leitura. O histórico não presume recebimento pela destinatária.
- Diário privado persistente evita duplicação. Resultado de envio incerto bloqueia repetição automática até conferência da conversa. Não apagar o diário para tentar resolver erro.
- Se há confirmação no diário local mas falha no banco, a próxima execução tenta apenas registrar o mesmo identificador.
- Usa whatsapp-web.js (automação do WhatsApp Web, não API oficial da Meta); alterações do WhatsApp podem exigir manutenção e novo vínculo. Nenhuma conta é conectada por publicar estes arquivos.
- Prévia do quadro depende do WhatsApp; a biblioteca solicita prévia de link, sem garantir sua apresentação em todo aparelho.

Fontes: https://docs.wwebjs.dev/Message.html e https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows

## Mensagem diária a partir de 18/10/2026

O modelo inclui data em GESTÃO DE TAREFAS, CONSULTA TAREFAS, TAREFAS DE TERCEIROS apenas para supervisores autorizados e o aviso em negrito ESTA MENSAGEM CANCELA AS ANTERIORES. O cartão é gerado no navegador já aberto pela sessão; se a geração falhar, transmite uma única mensagem de texto. Os links completos são preservados: reticências e centralização da bolha de conversa são apenas recursos da prévia, sem controle no WhatsApp do destinatário.

A publicação não executa a rotina e não reenvia a mensagem de 17/10. O workflow faz checkout no horário já configurado. Se a execução usa o Agendador do Windows com uma cópia local, essa cópia precisa ser atualizada antes das 7h; publicações no GitHub não atualizam essa pasta automaticamente. Não substituir arquivos locais com alterações próprias sem conferir o diff e preservar as correções instaladas.

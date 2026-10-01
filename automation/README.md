# Rotina de Menininha às 7h

Código preparado; envio desativado até a vinculação do computador executor.
GitHub Actions agenda às 10h UTC (7h em Fortaleza). A fila do GitHub pode atrasar.
O computador executor deve permanecer ligado, conectado e sem suspensão.

## Configuração inicial no computador executor

1. Instalar Node.js 22 ou superior e um runner do GitHub neste repositório, com a etiqueta `fsj-whatsapp`. Não habilitar execução de pull requests de terceiros nesse runner.
2. Definir no ambiente do serviço do runner `FSJ_STATE_DIR`, uma pasta privada persistente FORA do checkout; e `SUPABASE_SERVICE_ROLE_KEY`, obtida pelo gestor no Supabase e mantida somente nesse ambiente protegido. A chave é privilegiada: nunca incluir no repositório, em capturas, no chat ou no site. Não é uma chave de IA paga.
3. Na pasta `automation`, executar `npm ci`, depois `npm run link`. Na janela que abrir, vincular com WhatsApp → Aparelhos conectados. O QR não é armazenado nos logs. Executar sob o mesmo usuário do serviço do runner.
4. Rodar `npm test`. No GitHub, criar a variável de repositório `FSJ_ROTINA_ATIVA=true` somente quando a vinculação estiver concluída. Em Actions, executar manualmente o workflow uma vez e conferir a conversa e o histórico.

## Comportamento

- Destinatária única: cadastro de Menininha `mul7dlmfghkq`, número lido da Armazenagem.
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

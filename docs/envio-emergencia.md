# Envio individual e confirmação

Nas abas Pessoas e WhatsApp, use **Enviar tarefas pelo WhatsApp** para preparar a mensagem com o link individual. Confirme o envio no WhatsApp e, ao voltar ao FSJ, toque em **Confirmar envio** junto à pessoa correspondente. Esse botão também serve para declarar um envio que já ocorreu hoje, desde que exista o quadro do dia. O proprietário precisa confirmar cada destinatário que efetivamente recebeu sua mensagem; abrir o WhatsApp não registra um envio.

A declaração é salva no Supabase por pessoa e dia e no histórico de mensagens como `quadro_manual_confirmado`. O botão principal passa a **Envio Confirmado** pelo restante daquele dia, inclusive após reabrir o aplicativo em outro aparelho. Isso significa confirmação pelo proprietário, sem presumir entrega, leitura ou identificação técnica pelo WhatsApp. No dia seguinte, o botão volta ao estado de envio.

## Reconhecimento pela rotina automática

Atualizar o repositório no computador executor é necessário para ativar essa integração:

```powershell
Set-Location "$env:USERPROFILE\Assistente.FSJ"
git pull --ff-only
```

O `run.mjs` passa a envolver a rotina local existente com `manual-history.mjs`. O agendamento, o número de tentativas e os arquivos locais de envio, imagem e diário são preservados. Um envio manual confirmado impede a repetição automática naquele dia. Antes do envio em dia posterior, o executor tenta identificar a última mensagem manual confirmada entre até 200 mensagens recentes da conversa registrada, exigindo saída pela própria conta, destinatário, dia e URL/token exatos. Nenhuma mensagem é escolhida apenas pelo nome da pessoa ou por conter texto genérico de tarefas.

Uma correspondência única é registrada com o identificador real em `mensagens_whatsapp` como `quadro_manual_identificado`. A rotina existente então considera essa mensagem no histórico e solicita sua exclusão antes do novo quadro. Correspondências inexistentes ou ambíguas não geram identificadores fictícios. A exclusão depende da sincronização, disponibilidade da mensagem e permissão do WhatsApp; o resultado efetivo continua registrado pela rotina. Sem atualizar o executor, a integração automática não estará ativa.

## Folga semanal

Depois de salvar a folga, o quadro do empregado exibe apenas a data escolhida. As demais datas reaparecem somente ao tocar em Alterar minha folga. Se a folga foi definida e bloqueada pelo gestor, esse controle não aparece. A regra de escolha e a autoridade do gestor permanecem as mesmas.

Verificação: `node --test tests/manual-send.cjs tests/individual-send.cjs tests/manual-history.test.mjs tests/folga-selected.cjs`.


## Emergência para Urbano no laptop — 29/10/2026

Na tela Disparo de Emergência, usar **Preparar disparo para Urbano — Proprietário**. A rotina consulta a titularidade oficial e seleciona a pessoa pelo identificador, sem presumir identidade pelo nome ou gravar telefone no código. Se a identificação falhar, interrompe. Reutiliza o envio individual autenticado e suas proteções contra duplicidade; não amplia permissões. No laptop, a mensagem é copiada para colar e enviar na conversa de Urbano no WhatsApp Web ativo. Confirmar no FSJ somente depois de enviar. Publicação não comprova envio, entrega ou instalação na VM. Nenhuma rotina das 7h é alterada. Versão: 20261029-emergencia-proprietario-01. Recuperação: reverter o commit desta entrega. Validação local: contrato de atualização e sintaxe; seleção vinculada ao ID da titularidade; envio real pendente no laptop.

# Regras permanentes — Assistente FSJ

Este documento é referência normativa do projeto. Mudanças de interface, API, APK, banco de dados, simuladores ou infraestrutura devem respeitá-lo. Não substituir a autorização do Proprietário por inferência de perfil, dispositivo ou data de envio.

## FSJ-ACESSO-001 — Links individuais independentes da data de envio

**Regra obrigatória:** o link individual encaminhado pelo WhatsApp identifica o usuário, mas a data em que foi enviado não expira, por si só, seu acesso. Um link enviado ontem ou em data anterior deve continuar identificando a mesma pessoa. Não exigir reenvio diário.

1. Validar a credencial individual e sua vinculação à pessoa cadastrada; rejeitar credenciais desconhecidas, revogadas ou comprometidas. Não transformar a data de envio nem a data de referência da tarefa em motivo de bloqueio de identidade.
2. Consultar, em tempo de acesso, o cadastro central: usuário ativo, categoria, autorização expressa de supervisão, grupos, vínculos e demais permissões. Uma alteração feita pelo Proprietário deve valer na próxima consulta, sem depender do conteúdo antigo do link.
3. Identificar **separadamente** a plataforma de apresentação (Celular ou Desktop) e encaminhar ao INDEX adequado. O link não confere privilégios e o layout não modifica permissões. APK segue a mesma regra.
4. Aplicar horários de trabalho, folgas, férias, feriados e demais restrições **às operações** correspondentes, conforme o perfil. Não confundir restrição operacional temporária com expiração do link. Proprietário mantém a isenção de bloqueio de horário.
5. Fora do expediente, manter a identificação, apresentar a mensagem de restrição e permitir a TV FSJ 24 horas, respeitando as autorizações de cada função.
6. O botão **Supervisão** só aparece com autorização **ativa e expressa** no cadastro central; um Executor sem essa autorização (como José Carlos) não o vê. A API também deve impedir acesso não autorizado, mesmo por URL direta.
7. Os dados de tarefas, registros de execução, folgas e supervisão são compartilhados entre as plataformas e filtrados pelas permissões atuais. Tarefas periódicas usam o dia corrente ou a data selecionada para registro, não o dia de emissão do link.
8. Revogação explícita, desativação de usuário e incidentes de segurança continuam podendo invalidar credenciais. Não reutilizar token para pessoa diferente.

### Ordem de inicialização obrigatória

**Link/credencial → identidade autenticada → perfil e habilitações atuais → plataforma Celular/Desktop → INDEX correto → dados e ações autorizados.**

### Critérios mínimos de regressão

- Link de ontem e de dias anteriores identifica o mesmo usuário ativo sem bloqueio por data de envio.
- Usuário inativo, token desconhecido ou revogado não obtém acesso.
- Executor sem supervisão não vê nem acessa Supervisão; Executor autorizado pelo Proprietário vê somente seu escopo.
- Celular nunca abre indevidamente a interface Desktop e vice-versa.
- Restrições de expediente e folgas afetam as operações cabíveis, sem invalidar o link ou bloquear TV FSJ.
- Proprietário acessa com suas permissões, inclusive fora do expediente.

**Governança:** toda mudança futura que contrarie esta norma exige autorização explícita do Proprietário e atualização deste documento. Testar antes de declarar implantado. O documento não substitui os controles executados pelo servidor e banco de dados.

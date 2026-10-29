# Banner e horário de consulta


## Banner aprovado e controle de acesso por expediente — 29/10/2026

Publicado o modelo aprovado: banner verde com detalhe dourado, título CONSULTA DE TAREFAS e texto contínuo justificado, com tamanho uniforme: **A partir das 7:00h, disponível para consulta, exceto nos horários de descanso e após o expediente.** Rodapé: Horário de Pernambuco. Substitui o aviso de horário em texto vermelho nas páginas inicio-usuario.html, quadro.html, responder.html e supervisor.html.

O bloqueio agora consulta no servidor a regra já vigente public.fsj_horario_resposta: 07:00–12:00 e 14:00–16:20, America/Recife. Resposta-tarefa v28 e supervisao v13 implantadas; não basta alterar o relógio do navegador para receber dados. Fora do horário, as respostas retornam codigo=fora_expediente sem conteúdo das tarefas. Dentro do horário, seguem as mesmas validações de token, vínculo, perfil, supervisão, validade e autorização, sem ampliar permissões. Diagnóstico administrativo autenticado permanece separado. Não foram alteradas folgas, feriados, cadastros nem direitos de cada perfil.

Os recursos do banner preservam formulários e rascunhos ao ocultar o conteúdo protegido fora de horário. A tela inicial revalida o acesso a cada 30 segundos e ao retomar; o quadro mantém sua revalidação existente. O banner também é exibido se o período encerrar com uma página já aberta, sem gravar respostas nem reenviar operações. Erros de link/sessão diferentes de expediente continuam usando o tratamento existente.

Separação determinada pelo proprietário: envio antecipado entre 6:30 e 7:00 é independente do horário de consulta. Esta entrega publica o banner e o bloqueio de consulta; NÃO configura nem comprova mudança dos agendamentos de envio, executor online ou disparos para todos. O transporte emergencial no GitHub Actions ainda depende de credenciais, sessão vinculada e configuração inicial. Publicação do banner não deve ser apresentada como validação do apagamento/envio emergencial.

Verificações: testes em oito limites de horário para board/detail/start/submit/reminders e ações de supervisão, sem leitura de tarefas fora do expediente; consulta real à regra SQL em nove limites; sintaxe e inclusão dos recursos em quatro páginas; contrato de atualização passou. Sem mensagens enviadas/apagadas. Recuperação: reverter o commit dos recursos visuais e reimplantar as versões anteriores das duas funções, mediante decisão do proprietário; não promover esta alteração como backup completo das instalações isoladas da VM.


### Exceção permanente do proprietário — 29/10/2026

O proprietário está dispensado do bloqueio de expediente. O servidor reconhece a identidade pela titularidade oficial e por sessão autenticada válida ou token válido vinculado à pessoa titular ativa; não confia em nome, parâmetro de URL ou sinalizador enviado pelo cliente. Outros perfis continuam sujeitos às faixas de expediente. Validade dos tokens, atribuições e âmbito de supervisão são preservados.

Resposta-tarefa v29 e supervisao v14 implantadas com o indicador de horário livre retornado pelo servidor. O banner respeita esse indicador e não bloqueia o proprietário por relógio local. O banco já possuía exceção do proprietário em fsj_registrar_resposta; nenhuma função SQL ou permissão foi alterada nesta correção. Testes cobrem titular ativo, outro usuário, inativo, link inválido e expirado. O painel autenticado do proprietário continua podendo preparar o disparo antes das 7h.

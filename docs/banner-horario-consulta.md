# Banner e horário de consulta

## Identidade do destinatário no link individual — 30/10/2026

Correção `20261030-destinatario-01`: a entrada `inicio-usuario.html#token=...` preserva o perfil associado ao token recebido. Uma sessão de proprietário no mesmo aparelho não redireciona esse acesso para o painel administrativo; token inválido ou vazio também não causa promoção para proprietário. A entrada sem token mantém o reconhecimento autenticado do titular. O bloqueio de 07:00–12:00 e 14:00–16:20 (America/Recife) e a exceção para links do próprio titular continuam validados pelo servidor.

Validação: testes de entrada com sessão titular, sessão expirada, link individual válido, inválido e vazio; testes de expediente e contrato de atualização. Publicação no GitHub não comprova atualização de aba antiga, instalação na VM ou validação do link real da Menininha. Não há alteração no banco, nas tarefas, nos disparos ou nas sessões salvas. Instalação web: recurso versionado na página inicial. Recuperação: reverter apenas o commit desta correção; preservar as demais melhorias. Validação no aparelho com o link recebido permanece pendente.



## Correção do bloqueio visual no celular — 30/10/2026

Versão dos recursos: `20261030-expediente-tela-03`. A tela inicial (`inicio-usuario.html`) tinha painéis e navegação fora dos seletores ocultados pelo bloqueio anterior. O aviso agora fica diretamente no `main`, separado dos quadros protegidos; as quatro páginas individuais ocultam todo o conteúdo do `main`, navegação inferior e diálogos ao bloquear. Os controles ficam inertes durante o bloqueio, restaurando seu estado anterior ao liberar; rascunhos não são apagados. A conferência ocorre a cada segundo, ao retomar a tela e ao restaurar o histórico. Uma resposta iniciada antes do fim do expediente não reabre a tela depois do limite; o retorno ao horário permitido depende de uma nova resposta autorizada do servidor.

Mantidas as faixas 07:00–12:00 e 14:00–16:20, America/Recife, e a exceção do Proprietário confirmada pelo servidor. O diagnóstico administrativo não altera essa exceção. A negativa do servidor prevalece mesmo com relógio local dentro do expediente. Não houve alteração de folgas, disparos, perfis, banco ou funções implantadas.

Validações desta entrega: `node tests/expediente-screen.cjs`, `node tests/expediente-banner.cjs`, `node tests/owner-hours-access.cjs`, `node tests/automatic-update-contract.cjs` e `git diff --check`, aprovados. Consulta real confirmou a regra SQL; chamada HTTP sem token real de usuário recebeu 403/fora_expediente no período fechado. Não havia quadros vigentes para validar uma sessão individual real nesta checagem. Teste visual no aparelho do usuário e validação de seu link específico permanecem pendentes.

Instalação: recursos publicados no GitHub Pages das páginas individuais, sem nova instalação de APK ou atualização da VM. Publicação do repositório e resposta dos arquivos servidos devem ser conferidas antes do encerramento; isso não comprova atualização de uma aba antiga ainda aberta. Recuperação: reverter somente o commit desta correção visual, preservando o controle já existente no servidor e as demais melhorias. Histórico anterior permanece no Git.



## Banner aprovado e controle de acesso por expediente — 29/10/2026

Publicado o modelo aprovado: banner verde com detalhe dourado, título CONSULTA DE TAREFAS e texto contínuo justificado, com tamanho uniforme: **A partir das 7:00h, disponível para consulta, exceto nos horários de descanso e após o expediente.** Rodapé: Horário de Pernambuco. Substitui o aviso de horário em texto vermelho nas páginas inicio-usuario.html, quadro.html, responder.html e supervisor.html.

O bloqueio agora consulta no servidor a regra já vigente public.fsj_horario_resposta: 07:00–12:00 e 14:00–16:20, America/Recife. Resposta-tarefa v28 e supervisao v13 implantadas; não basta alterar o relógio do navegador para receber dados. Fora do horário, as respostas retornam codigo=fora_expediente sem conteúdo das tarefas. Dentro do horário, seguem as mesmas validações de token, vínculo, perfil, supervisão, validade e autorização, sem ampliar permissões. Diagnóstico administrativo autenticado permanece separado. Não foram alteradas folgas, feriados, cadastros nem direitos de cada perfil.

Os recursos do banner preservam formulários e rascunhos ao ocultar o conteúdo protegido fora de horário. A tela inicial revalida o acesso a cada 30 segundos e ao retomar; o quadro mantém sua revalidação existente. O banner também é exibido se o período encerrar com uma página já aberta, sem gravar respostas nem reenviar operações. Erros de link/sessão diferentes de expediente continuam usando o tratamento existente.

Separação determinada pelo proprietário: envio antecipado entre 6:30 e 7:00 é independente do horário de consulta. Esta entrega publica o banner e o bloqueio de consulta; NÃO configura nem comprova mudança dos agendamentos de envio, executor online ou disparos para todos. O transporte emergencial no GitHub Actions ainda depende de credenciais, sessão vinculada e configuração inicial. Publicação do banner não deve ser apresentada como validação do apagamento/envio emergencial.

Verificações: testes em oito limites de horário para board/detail/start/submit/reminders e ações de supervisão, sem leitura de tarefas fora do expediente; consulta real à regra SQL em nove limites; sintaxe e inclusão dos recursos em quatro páginas; contrato de atualização passou. Sem mensagens enviadas/apagadas. Recuperação: reverter o commit dos recursos visuais e reimplantar as versões anteriores das duas funções, mediante decisão do proprietário; não promover esta alteração como backup completo das instalações isoladas da VM.


### Exceção permanente do proprietário — 29/10/2026

O proprietário está dispensado do bloqueio de expediente. O servidor reconhece a identidade pela titularidade oficial e por sessão autenticada válida ou token válido vinculado à pessoa titular ativa; não confia em nome, parâmetro de URL ou sinalizador enviado pelo cliente. Outros perfis continuam sujeitos às faixas de expediente. Validade dos tokens, atribuições e âmbito de supervisão são preservados.

Resposta-tarefa v29 e supervisao v14 implantadas com o indicador de horário livre retornado pelo servidor. O banner respeita esse indicador e não bloqueia o proprietário por relógio local. O banco já possuía exceção do proprietário em fsj_registrar_resposta; nenhuma função SQL ou permissão foi alterada nesta correção. Testes cobrem titular ativo, outro usuário, inativo, link inválido e expirado. O painel autenticado do proprietário continua podendo preparar o disparo antes das 7h.


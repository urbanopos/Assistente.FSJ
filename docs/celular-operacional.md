# Interface operacional Celular


## Interface Celular 0.2.1 — 30/10/2026

FSJ-CELULAR, build 20261030-celular-operacional-24. Nos celulares Android e iPhone reconhecidos, o menu individual mostra os módulos autorizados e encaminha as tarefas aos formulários operacionais existentes. O botão casa retorna ao início do destinatário. TV FSJ aparece após autorização e continua dependente do servidor da fazenda disponível. Acesso do Proprietário mantém todas as funções anteriores.

Folgas e férias contém Marcar datas e Consultar solicitações, com calendário mensal e gravação central da folga semanal permitida pelo serviço. Férias, feriados, compensações e alterações de folga já registrada continuam com o Proprietário. Não há nova solicitação de férias do executor nesta entrega. Sugestões requerem link de tarefa vigente; texto é preservado em falha e atualização adiada durante edição. Visitante não envia por estes controles. Não alterados os endpoints, a autorização, os registros, as sessões ou os disparos.

O adaptador não modifica Desktop, laptop, tablet Android ou iPad. As duas linhas de interface mantêm códigos e versões independentes; não há instalador nativo novo. Fontes originais novos permanecem na pasta Celular do repositório privado. Neste repositório é distribuído somente o adaptador compilado, sem mapa de fontes; código servido ao navegador continua inspecionável.

Testes locais de navegação, identidade dos links, calendário por contrato, erro de gravação, permissões, rascunho, expediente e atualização passaram sem escrita/envio real. Conferência visual e gravação pelo usuário no aparelho real permanecem pendentes. A disponibilidade depende de conclusão do Pages e conferência HTTP. Para recuperar, reverter somente este commit de adaptação, preservando Desktop e dados centrais. Não restaurar cartões PDF. Nenhuma VM, banco, serviço ou APK foi instalado por esta entrega.

Atualização adiada também durante ditado, TV aberta ou data não salva. Revisão 0.2.1 substitui a preparação 0.2.0.


## Celular 0.2.2 — painel do Proprietário — 30/10/2026

Build `20261030-celular-proprietario-25`. Menu celular com TV primeiro, tarefas, responder dúvidas e sugestões, folgas e férias, registro, disparo e pessoas. Os botões originais permanecem montados com seus eventos. Comunicação, grupos, informações, armazenagem e manutenção são acrescentados a partir do menu permitido somente após confirmação de titularidade; os atalhos são ocultados e revalidados se essa condição for retirada. A montagem tardia do botão Responder dúvidas também é incorporada ao menu. Casa retorna ao início e reinicia a paginação existente. Botões não quebram entre páginas, com numeração e setas do paginador operacional. Fotografia, autenticação e permissões do servidor permanecem existentes; a apresentação não concede perfil administrativo.

Verificação de versão celular acrescentada ao painel: ao abrir/retomar e periodicamente, com proteção de edição já existente; adiada enquanto TV/chamadas estão abertas. Desktops, laptops, tablets Android e iPad continuam fora do adaptador. Não alterados backend, banco, tarefas, sessões, chamadas, WhatsApp nem agendamento das 7h. TV e YouTube continuam dependendo do serviço da fazenda; não se declara recuperação da VM ou reprodução validada. Férias mantêm o fluxo do Proprietário existente.

Validação: testes locais do adaptador fonte e compilado para Android/iPhone, exclusão de computadores/tablets, casa, controle titular e revogação, montagem tardia e eventos originais; contratos de calendário, falhas, rascunhos, expediente e atualização; sintaxe das cinco entradas. Sem gravações ou mensagens reais. Publicação web deve ser distinguida de teste visual/funcional na sessão real do Proprietário, ainda pendente. Não há novo APK/iOS instalado. Recuperação: reverter somente a entrega 0.2.2, sem apagar registros, trocar a versão Desktop ou restaurar cartões PDF.


## Celular 0.2.3 — menu inicial do Proprietário — 30/10/2026

Build `20261030-celular-proprietario-26`. Interface verde compacta em duas colunas, com TV FSJ primeiro, Minhas tarefas, Criar tarefa, Tarefas de terceiros, Responder dúvidas, Sugestões, Folgas e férias, Relatórios, Pessoas e perfis, Comunicação, Disparo emergencial, Disparo automático e Painel de manutenção. Grupos e Armazenagem continuam acessíveis. Casa retorna ao menu; numeração e setas seguem o paginador existente, sem partir botões. A entrada inicial autenticada mostra o menu quando seguro; preservar edição e entrada emergencial.

Minhas tarefas seleciona a pessoa vinculada à titularidade consultada pelo mecanismo existente; se ausente no cadastro, informa a falha e não escolhe outra pessoa. Tarefas de terceiros conserva o seletor original. Dúvidas e Sugestões abrem filtros do módulo operacional já existente. Relatórios recebe filtro por situação, inclusive Arquivada (valor interno Arquivado), sobre o relatório mensal existente; não foi implantado novo relatório por intervalo ou API. Manutenção utiliza o endereço VPN já configurado e depende da VM disponível. Disparo automático informa que ainda não está ativado nesta instalação; não agenda nem envia mensagens. Sua presença no menu não comprova automação Android instalada.

Permissões, autenticação e validações no servidor permanecem existentes. Atalhos adicionais exigem o estado de titularidade existente e revalidam esse estado no clique; revogação os oculta. Isto não constitui nova auditoria de autenticação. Nenhum endpoint, dado central, disparo, agendamento, sessão ou versão Desktop foi alterado. Fontes novos ficam exclusivamente na pasta privada Assistente FSJ - Celular; distribuição pública recebe apenas o adaptador minificado e referências de versão celular. O build geral e o adaptador Desktop permanecem intactos.

Validação local: contrato obrigatório de atualização nas bases privada e pública; sintaxe das cinco entradas; testes do fonte e do compilado de Android/iPhone, exclusão de computadores/tablets, titularidade e revogação, eventos originais, montagem tardia, seleção da pessoa titular, filtro Arquivada, casa e proteção de atualizações durante edição/TV. Somente respostas simuladas; nenhuma gravação ou mensagem real. Teste visual e funcional na sessão real do celular permanece pendente. Publicação deve ser confirmada por Pages e verificação do adaptador servido antes de anunciar disponibilidade.

Instalação web: endereço habitual e atualização automática segura, sem exigir APK ou recarga manual. Backup e recuperação: versão anterior preservada no histórico Git; reverter exclusivamente esta entrega de menu/bundle/referências, preservando Desktop, registros, rascunhos, autenticação e rotina das 7h. Não restaurar cartões PDF nem executar automações copiadas.



## Celular 0.2.4 — SUPERVISÃO no menu inicial — 31/10/2026

Build `20261031-celular-supervisao-27`. O menu inicial do executor recebe exatamente um atalho SUPERVISÃO, somente após resposta `ativo: true` do serviço central para o token do próprio quadro. O atalho abre supervisor.html com esse mesmo token e relaciona as tarefas das pessoas e grupos autorizados. O acesso equivalente antes aninhado no Informativo de tarefas foi movido para a primeira tela, sem duplicação. Perfis comuns, falha de consulta e respostas sem autorização positiva não exibem o botão. As permissões são consultadas novamente ao abrir/retomar; respostas antigas não substituem uma consulta mais recente e uma falha do acesso individual invalida consultas pendentes.

A consulta de tarefas continua protegida no servidor: supervisor e pessoa ativos, quadro válido do dia, prazo e escopos de pessoas/grupos. Nenhuma atribuição de supervisão, autenticação, tabela, política ou função foi modificada por esta entrega. O menu não concede novos poderes sobre tarefas. Desktop/tablets, serviços centrais, chamadas, registros, sessões e rotina das 7h permanecem nos fluxos existentes.

Validação: contrato obrigatório de atualização automática nas entradas privada e pública; testes de DOM do fonte e do minificado, Android/iPhone, exclusão de computadores/tablets, permissões positivas/negativas, falha negando acesso, perfil local sem efeito, token do quadro preservado e revogação ao retomar; regressões do Proprietário, rascunhos, calendário, expediente e atualização segura aprovadas. Conferência somente de leitura das definições operacionais e teste no banco confirmaram rejeição de vínculo/token inválido. Nenhuma tarefa, mensagem ou cadastro real foi alterado. Validação visual na sessão real do usuário permanece pendente.

Instalação web: atualização automática segura no endereço e nos links individuais habituais. Não há novo instalador nativo. Fontes novos somente na pasta privada Assistente FSJ - Celular; distribuição recebe bundle minificado sem mapa e referências de versão. Estado de publicação e commits constam de PUBLICACAO-CELULAR.json. Backup: versão anterior preservada no histórico Git; recuperação por reversão exclusiva desta entrega, sem restaurar cartões PDF nem apagar registros centrais.

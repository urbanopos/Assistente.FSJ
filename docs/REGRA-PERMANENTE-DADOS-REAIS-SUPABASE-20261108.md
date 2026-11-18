# Regra operacional permanente — dados reais do Supabase

Aprovada pelo Proprietário em 08/11/2026. Aplica-se a todas as telas Desktop, Celular e APK do Assistente FSJ – Tarefas.

1. A base Supabase, respeitadas as políticas de autorização, é a única fonte de verdade dos registros operacionais e cadastros. Nenhum componente operacional pode preencher telas com usuários, tarefas, feriados, folgas, férias, permissões, grupos, datas ou situações fictícias, presumidas ou herdadas de simuladores.
2. Ao entrar em uma tela, consultar os dados atuais necessários àquela tela. Ao trocar pessoa, mês, grupo ou filtro, consultar novamente a base para o escopo selecionado. Revalidar dados antes de qualquer gravação e confirmar a gravação pela resposta da base.
3. Os estados de apresentação são distintos: **carregando**, **dados confirmados**, **consulta vazia** e **falha na consulta**. Consulta vazia nunca deve virar dado de exemplo; falha nunca deve ser mostrada como ausência de registros.
4. A interface não pode mostrar dados locais ou caches como se fossem atuais sem confirmação da base. Cache pode ser usado apenas se identificado claramente como desatualizado, somente leitura e sem servir de fundamento a ações.
5. O cadastro em Pessoas e as permissões estabelecidas pelo Proprietário governam a navegação e as operações. Ocultar controles na interface não substitui a autorização na base (RLS e/ou serviço autenticado).
6. Layout e código de interface não podem alterar, limpar ou sobrescrever registros do Supabase por mera navegação, mudança de tela, simulação ou atualização de apresentação.
7. Simuladores devem ser isolados e identificados como simuladores. Seus dados não entram na operação nem se misturam com a base real.
8. No calendário padrão Folgas e Feriados, sem pessoa selecionada, mostrar exclusivamente feriados reais retornados do Supabase e a descrição de cada um abaixo do calendário. Com pessoa selecionada, consultar seus registros reais. Ao desmarcar ou sair da seleção, restaurar a visão padrão.
9. Nenhuma alteração será anunciada como operacionalmente validada sem teste dos fluxos afetados, incluindo dados existentes, ausência de dados, falha de consulta, troca de filtros e preservação dos registros.
10. Em caso de falha de autenticação, rede ou autorização, mostrar erro explícito e impedir operações que dependam de dados não confirmados. Nunca inventar conteúdo para preencher a tela.

**Preservação:** Não modificar o FSJ.VM em consequência desta regra.
## Condição default reafirmada pelo Proprietário — 08/11/2026

- Toda informação de registro operacional apresentada em qualquer tela deve ser obtida e confirmada no Supabase; **jamais** tomar dados do navegador (localStorage, sessionStorage, cache ou estado em memória) como fonte de verdade.
- Informações locais podem existir como estado técnico temporário, mas não devem ser exibidas como atuais sem confirmação da base.
- Sempre que a tela utilizar dados não confirmados ou a consulta central falhar, mostrar **tarja vermelha de AMBIENTE NÃO VALIDADO**, sem números antigos apresentados como atuais.
- Esta regra é padrão para qualquer novo desenvolvimento, edição de layout ou navegação, incluindo Desktop, Celular e APK. Não modificar o FSJ.VM.
- O monitor inicial no index.html é uma proteção geral; a auditoria individual das telas e de suas fontes de dados permanece necessária para assegurar cumprimento integral.

## Regra homologada — Tarefas em Execução / Desktop Proprietário — 18/11/2026

**Situação da tarefa → Em Aberto (Padrão)** é um filtro de **tarefas ainda não concluídas**, e NÃO uma comparação literal com o status `Em aberto`.

- Incluir tarefas não iniciadas, iniciadas, em andamento, pendentes e entregues, desde que não concluídas.
- Excluir tarefas concluídas e arquivadas; continuam acessíveis por seus filtros próprios.
- Ao entrar pelo menu Tarefas em Execução, manter Em Aberto como seleção padrão.
- Preservar a seleção de executor, categoria, paginação e consultas específicas conforme seus fluxos aprovados.
- **Implementação validada pelo Proprietário:** `index.html`, função `fsjRenderTarefasEmExecucao`, commit `479bb2edb4dedd43b7a16a99d2ef475a798fccb9`.
- **Regra anterior revogada:** `situacao === statusFiltro` quando `statusFiltro === 'Em aberto'`. Não restaurar esse teste literal em atualizações, merges, backups ou refatorações.
- Validação visual e funcional informada pelo Proprietário em 18/11/2026. Nenhuma alteração nos dados operacionais decorre desta consolidação documental.

## Extensão homologada — Desktop e Celular — 18/11/2026

A semântica **Em Aberto (Padrão)** aplica-se aos dois modos, sem unificação dos layouts: incluir tarefas ainda não concluídas (não iniciadas, iniciadas, em andamento, pendentes e entregues), excluir concluídas e arquivadas. Os controles, calendários, permissões, filtros e paginações específicos de Desktop e Celular permanecem independentes. Implementação em `index.html`, `fsjRenderTarefasEmExecucao`, commit `c9dca603a803a73cf826fbe5fef89572fd8537d4`. Não restaurar o filtro móvel antigo que excluía apenas arquivadas.

## Homologação — Relatório Diário Consolidado — 18/11/2026

**Versão validada pelo Proprietário:** commit `4d5e496f16a65eebe577547b69a59a728b901358` de `index.html` (Desktop).

Regras obrigatórias para Desktop e Celular, respeitando a interface própria de cada plataforma:
- Relatório Diário Consolidado é o modo padrão ao acessar Relatórios; Relatório Mensal Consolidado continua disponível.
- Cada ocorrência deve exibir número e descrição da tarefa e nome(s) de executor(es) ao lado.
- O número da tarefa deve ser um link funcional que abre sua respectiva consulta.
- Tarefas periódicas abrem calendário na competência da data selecionada; tarefas pontuais abrem detalhes.
- Preservar as listas de Em execução, Concluídas e Entregues e seus registros datados.
- Não alterar o layout, paginação, permissões ou navegação de uma plataforma ao implementar a outra.
- **Critérios anteriores revogados:** links sem ação direta ou que não abram a consulta correspondente; listagem sem responsável; abertura de calendário periódico no mês atual ignorando a data selecionada; tentativa de usar funções inexistentes de abertura. Não reutilizar esses critérios em restaurações ou refatorações.
- **Estado da implementação:** Desktop validado pelo Proprietário. A aplicação da mesma funcionalidade ao Celular é requisito aprovado, mas requer implementação e validação separadas; esta homologação não presume que a interface móvel já esteja concluída.
- Não excluir histórico Git ou registros operacionais; a revogação é lógica/documental, sem apagar evidências de versões anteriores.

## Homologação — Registrar Tarefa sem Histórico diário — 18/11/2026

**Validação expressa do Proprietário:** alteração do arquivo `index.html` no commit `892cde5bb1d73eb5f804a03229f2035e032c2f69`.

- Na página **Registrar Tarefa**, nos modos Desktop e Celular, não apresentar o bloco **Histórico diário**, seu cabeçalho, seletor de usuário, botão **Atualizar histórico**, área de resultados ou aviso de rotina das 7h que integravam esse bloco.
- A entrada em Registrar Tarefa não deve disparar o carregamento desse histórico antigo.
- A consulta diária consolidada aprovada pertence à seção **Relatórios**, sem misturar as responsabilidades das telas.
- **Revogados:** desenhos, instruções e fluxos anteriores que recolocavam o Histórico diário abaixo do formulário de registro. Não restaurar por merge, cópia de backup, reutilização de HTML antigo ou refatoração.
- **Preservação obrigatória:** campos, botões, validações, cadastros, edições, registros históricos e rotinas operacionais que não dependam visualmente do bloco retirado; layouts e paginações específicos de Desktop e Celular; permissões por perfil e Armazenagem central.
- Funções auxiliares de histórico eventualmente usadas em outros lugares **não devem ser excluídas sem auditoria de referências**. Não excluir dados, histórico Git, backups necessários à recuperação ou implementações aprovadas de outros módulos.
- Em caso de conflito entre documentos antigos e esta homologação, prevalece o comportamento validado do aplicativo. Revisar o conflito pontualmente, sem exclusão indiscriminada.


## Regra-mestra de autorização — Pessoas e Grupos — 18/11/2026

**Decisão do Proprietário:** a seção **Pessoas e Grupos** é a fonte oficial dos atributos de cada pessoa e de suas autorizações. Nenhuma rotina, tela, link, consulta ou operação pode ser habilitada sem prévia identificação do usuário e consulta à sua ficha autorizativa atual.

1. Confirmar identidade autenticada, vínculo com cadastro existente e situação ativa; negar acesso por padrão em caso de falha, ausência ou inconsistência.
2. Consultar perfil, atributos, marcações e permissões individuais em Pessoas e Grupos **antes de cada autorização**; não inferir privilégios apenas de URL, dispositivo, interface ou estado local.
3. Distinguir Consulta, Inclusão, Edição, Exclusão e operações especiais, aplicando as autorizações efetivamente atribuídas pelo Proprietário.
4. Validar permissões também no servidor e na Armazenagem central (incluindo leituras e escritas), para impedir contorno por requisições diretas; controles visuais são complementares, não substitutos.
5. Revalidar quando permissões ou estado cadastral mudarem; não manter privilégios revogados em sessões antigas.
6. Manter perfis e interfaces Desktop/Celular independentes; preservar registros e funcionalidades homologadas.
7. Para Gestor, permitir apenas as operações sobre registros operacionais autorizadas individualmente. Não permitir administração técnica, programação, arquitetura, integrações ou mudança de permissões de terceiros. Registros arquivados não podem ser editados ou excluídos pelo Gestor; a definição de arquivamento pelo Gestor permanece pendente e não deve ser presumida.

**Implantação:** esta regra documenta o requisito obrigatório. A existência da documentação não comprova implementação das verificações de autorização no servidor; exigir auditoria, testes por perfil e homologação antes de declarar a proteção operacional concluída.

## Identificação obrigatória conjunta — Telefone E E-mail — 18/11/2026

**Decisão expressa do Proprietário:** a identificação cadastral exige **telefone E e-mail conjuntamente**, ambos vinculados à **mesma pessoa ativa** em Pessoas e Grupos. Nunca aceitar apenas um dos identificadores como suficiente para habilitar qualquer perfil, sessão, rotina ou operação.

- Telefone: normalizar DDI/DDD e comparar com o telefone cadastrado.
- E-mail: normalizar caixa e espaços e comparar com o e-mail cadastrado.
- Ausência, divergência, duplicidade ou vínculo com pessoas distintas: negar habilitação até correção e validação.
- Aplica-se a Proprietário, Gestor, Supervisor, Executor e Visitante, em Desktop e Celular.
- A dupla correspondência cadastral **não é prova de posse** de telefone/e-mail nem substitui autenticação segura e autorização por perfil no servidor. Não presumir que a simples digitação de dois dados conhecidos autentica o usuário.
- Revogam-se quaisquer critérios anteriores que aceitem somente telefone ou somente e-mail para identificação habilitadora.
- **Status:** requisito documentado; não alterar autenticação em produção sem verificar fluxos atuais, integridade dos cadastros, mecanismos de comprovação de posse e caminhos de recuperação para não bloquear usuários legítimos.

## Exceção expressa — Funcionários — 18/11/2026

**Retificação posterior do Proprietário (prevalece sobre a regra de dupla identificação acima):** pessoas cadastradas com tipo **Funcionário** ficam **fora da exigência conjunta de telefone e e-mail**. Não exigir e-mail para habilitar o acesso do Funcionário; manter o mecanismo de identificação/autenticação já estabelecido para esse perfil, sujeito a validação de segurança. A dispensa não autoriza acesso sem identificação válida, cadastro ativo ou permissões pertinentes.

A regra de telefone **E** e-mail permanece para os demais perfis. Em qualquer divergência entre as seções anteriores e esta exceção, **esta exceção prevalece**. Não aplicar mudanças disruptivas à autenticação em produção sem auditar fluxos, registros e mecanismos de segurança.

## Homologação e preservação Desktop/Celular — 18/11/2026

O Proprietário validou a apresentação do painel complementar do tipo Gestor (colunas Consulta e Edição) e determinou preservar as condições operacionais atuais de **Desktop** e **Celular**, com seus layouts próprios.

- **Marco imutável de recuperação do código:** commit `06dd874744ab7fe5cea03d2a9bfc3dce8bcc5ef4`, branch `backup/desktop-celular-validados-2026-11-18-gestor`.
- Não misturar layouts Desktop e Celular nem substituir arquivos de um pelo outro; não alterar módulos, rotinas, paginação, filtros, calendários ou dados fora do escopo de cada intervenção.
- Alterações posteriores exigem preservação do estado aprovado, teste por perfil e plataforma, e nova validação do Proprietário antes de descartar a versão anterior.
- A validação informada pelo Proprietário refere-se ao **painel do Gestor**; não implica homologação de controle de acesso efetivo no servidor, que ainda exige implementação e testes específicos.
- O backup GitHub protege **código e arquivos versionados**, não constitui backup dos registros Supabase, da VM ou de segredos/configurações externas. Não afirmar proteção integral desses componentes sem cópias independentes verificadas.

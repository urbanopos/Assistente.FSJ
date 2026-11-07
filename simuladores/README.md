# Assistente FSJ — Simuladores de Desenvolvimento

**Acesso fixo:** [Proprietário — Celular](celular-proprietario.html) · [Executor — Celular](celular-executor.html) · [Painéis lado a lado](index.html)

## Regra de isolamento permanente
Todo desenvolvimento e teste de novas funcionalidades ocorre **exclusivamente em `simuladores/`**. Nenhum código, cadastro, banco, disparo, APK, versão de produção ou serviço da operação real será alterado durante o desenvolvimento. Qualquer intervenção no aplicativo operacional deverá ser identificada como **Manutenção** e dependerá de autorização expressa do Proprietário.

## Pasta única dos simuladores — regra permanente
Todo material relacionado a planejamento, desenvolvimento, testes, demonstrações, arquivos HTML/JS/CSS, relatórios de validação, manuais, versões e registros **de simulação** deve permanecer em `simuladores/` ou em subpastas **internas à própria pasta**. Não criar arquivos dos simuladores na raiz, em `Celular/`, `celular/`, `desktop/`, `raw/` ou em outros diretórios operacionais. Os backups ficam exclusivamente em `simuladores/backups/` e devem ser produzidos **antes de cada alteração**, sem apagar versões anteriores. O código real e o banco operacional ficam separados e intocados durante o desenvolvimento. Links para favoritar no Chrome apontam sempre para os acessos estáveis abaixo e não para backups ou arquivos de versões antigas.

## Arquitetura e sincronização
O arquivo `index.html` contém o motor **único**, os modelos de tela e os registros demonstrativos dos dois perfis. `celular-proprietario.html` e `celular-executor.html` são os dois links permanentes que abrem a respectiva interface, ocultando a outra visualmente. Os dados de teste são guardados no armazenamento local do Chrome (`localStorage`, chave exclusiva `fsj_sim_executor_proprietario_limpo_v1_20261107`) e são sincronizados entre abas do **mesmo navegador e domínio** pelo evento `storage`. Não há consulta ou alteração de dados reais. Se o navegador estiver em outro computador, perfil ou origem, não haverá compartilhamento automático de dados; limpar armazenamento apaga os registros de teste.

**Para testar em conjunto:** abrir os dois links no mesmo Chrome, no mesmo computador. Um cadastro criado no Proprietário fica disponível ao Executor sem recarregamento manual, após a propagação do evento. O arquivo `index.html` também exibe as duas interfaces lado a lado.

## Compatibilidade entre perfis
A função `fsjCheckSimulatorCompatibility` verifica a versão contratual do Proprietário e do Executor e a lista de recursos compartilhados. Uma evolução que deixar contrato ou recurso do Executor defasado gera **AVISO DE COMPATIBILIDADE** visível. Ao mudar uma funcionalidade do Proprietário que dependa do Executor, atualizar e testar ambos antes de igualar as versões de contrato. O aviso não substitui testes reais de comportamento.

## Backup obrigatório antes de TODA alteração
Antes de modificar qualquer versão, **salvar uma cópia idêntica da versão atual em `simuladores/backups/AAAA-MM-DD_HHMM_vNN/`**, com data/hora e versão, antes do commit de alteração. Manter o histórico do GitHub e identificar versão, motivo e resultado dos testes. Não sobrescrever nem apagar backups anteriores. A versão inicial combinada foi preservada em `backups/2026-11-07_1929_v00/index-original.html`.

## Convenções de teste
- Cabeçalho com perfil, nome, campo foto e botão Sair em cada página;
- Tarefas vinculadas a pessoas e grupos simulados, sem duplicar executores;
- Calendários periódicos, SIM/NÃO e comprovação, ciência de não cumpridas, sugestões e folgas;
- Registros do Proprietário refletidos no Executor, relatórios sequenciais, sem rolagem vertical;
- Verificar sincronização em duas abas, avisos de compatibilidade, versão e regressão de navegação.

## Histórico
- **v00 (backup), 07/11/2026**: cópia integral dos dois simuladores combinados previamente aprovados.
- **v1.0.0, 07/11/2026**: criados links de perfil separados; motor único da pasta, filtro de tela por perfil, sincronização entre abas e aviso de incompatibilidade. Não interfere no sistema operacional.

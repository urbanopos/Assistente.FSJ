# Registro de versões preservadas — 08/11/2026

Regra: não sobrescrever backups anteriores. Arquivo index.html é uma cópia do código no instante de captura; os demais scripts, arquivos e Supabase não estão incorporados automaticamente. A restauração integral exige examinar dependências e esquema da base. Horários nos nomes são etiquetas históricas, não prova do momento exato da cópia.

| Backup | Origem | Referência do código | Função |
|---|---|---|---|
| FSJ_INDEX_Desktop_2026-11-08_08h31.html | index.html | dbb00e00 | Estado inicial da preservação, tarja vermelha quando fonte não confirmada |
| FSJ_INDEX_Celular_Proprietario_2026-11-08_08h31.html | celular/proprietario/index.html | dbb00e00 | Entrada celular proprietário |
| FSJ_INDEX_Celular_Executor_2026-11-08_08h39_SEM_SUPERVISAO.html | celular/layouts/executor/index.html | c26a2681 | Executor sem botão azul Supervisão |
| FSJ_INDEX_Celular_Supervisor_2026-11-08_08h31.html | celular/layouts/supervisor/index.html | cc3048da | Supervisor preservado separadamente |
| FSJ_INDEX_Proprietario_Desktop_2026-11-08_08h55_FILTROS_KPI_SUPABASE.html | index.html | 59871817 | Links Em aberto, Concluídas, Pendentes, Perguntas com filtro opcional por pessoa e separação individual/grupo |

## Histórico procedural associado
- a8be76d7: consulta atualizada de tarefas e responsáveis no Supabase para indicadores.
- dbb00e00: monitor de confirmação da fonte Supabase e tarja vermelha.
- d8860765: regra documental permanente de fonte única.
- c26a2681: remoção do botão Supervisão no layout do Executor.
- 59871817: filtro de pessoa nos quatro links do resumo do Proprietário.
- 5c140a12: cópia do index Desktop após o filtro de pessoas.

## Regra de restauração
1. Escolher a versão validada pelo Proprietário.
2. Comparar commit e arquivos dependentes com a versão atual.
3. Restaurar apenas a funcionalidade/layout afetado, preservando melhorias posteriores.
4. Consultar registros atuais exclusivamente no Supabase; nunca restaurar dados de navegador.
5. Verificar publicação, permissões e comportamento em Desktop e Celular antes de considerar concluído.

**Situação:** os arquivos foram salvos no GitHub; não implica validação funcional completa da interface.

## Conjunto de backups Celular — 08/11/2026, referência 59871817

Cópias individuais dos arquivos de entrada/layout do repositório; a referência 59871817 indica o estado-base do projeto, **não** que todos os arquivos tenham sido modificados naquele commit.

| Perfil | Arquivo de backup | Origem | SHA do conteúdo |
|---|---|---|---|
| Proprietário | FSJ_INDEX_Celular_Proprietario_2026-11-08_VERSAO_ATUAL_59871817.html | celular/layouts/proprietario/index.html | 98b68e45ef47c61c461246743ed6653d02648bed |
| Gestor | FSJ_INDEX_Celular_Gestor_2026-11-08_VERSAO_ATUAL_59871817.html | celular/layouts/gestor/index.html | 2359771865b0d9c55ef9ee7c7b07323efd44d84d |
| Supervisor | FSJ_INDEX_Celular_Supervisor_2026-11-08_VERSAO_ATUAL_59871817.html | celular/layouts/supervisor/index.html | 2974157061a1521eb295bb211c84237cd6590de5 |
| Executor | FSJ_INDEX_Celular_Executor_2026-11-08_VERSAO_ATUAL_59871817.html | celular/layouts/executor/index.html | 982655c84d48800d34b3e5e2906ac84b555940d4 |
| Entrada geral | FSJ_INDEX_Celular_Entrada_2026-11-08_VERSAO_ATUAL_59871817.html | celular/index.html | 0be41c56449cfa6bf4b8a0c2f48268dad2bce8ee |
| Entrada proprietário | FSJ_INDEX_Celular_Entrada_Proprietario_2026-11-08_VERSAO_ATUAL_59871817.html | celular/proprietario/index.html | e304f7e97d1b42fa0a437cb7a8b8780ad67c6ffb |

Executor: botão azul Supervisão retirado conforme commit c26a2681. Supervisor: versão separada preservada. Visitante utiliza regras de autorização próprias; não foi encontrado index independente para visitante neste conjunto. Para restauração funcional integral, consultar dependências de scripts, dados e autenticação no commit e não copiar isoladamente o HTML. A atualização de indicadores do Proprietário no index.html principal (59871817) não implica alterações em todos os layouts móveis.

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

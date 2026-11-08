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

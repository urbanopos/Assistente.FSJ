# Perfil Gestor — definição do Proprietário

Data: 22/10/2026.
Estado: definição registrada; ampliação de permissões ainda não implantada nem validada.
Esta decisão substitui a regra anterior que limitava o Gestor a acompanhar e orientar tarefas.

## Regra operacional solicitada

O Gestor deve ter as funcionalidades operacionais do Proprietário, incluindo o uso para tarefas pessoais. A condição de Gestor é concedida e revogada pelo Proprietário, sem transferência de titularidade do software.

Atividades previstas:
- Consultar o painel, pessoas, grupos, demandas, respostas, justificativas, anexos e relatórios.
- Cadastrar e atualizar pessoas e grupos, organizar responsáveis, supervisão, jornadas, folgas, férias e feriados no âmbito operacional autorizado.
- Criar, distribuir, editar e acompanhar tarefas pontuais e periódicas; definir prioridade e urgência.
- Iniciar, suspender, retomar e responder SIM/NÃO às tarefas pelo fluxo operacional, preservando o responsável e a auditoria.
- Tratar dúvidas, sugestões e pedidos de materiais/providências; orientar executores.
- Rever conclusões insatisfatórias com motivo, aprovar e arquivar tarefas segundo as regras do sistema.
- Operar os controles de comunicação disponíveis no aplicativo, respeitando horários, recibos, travas e prevenção de duplicação; sem editar a automação.
- Usar TV FSJ, biblioteca e chamadas; gerir conteúdo operacional conforme as autorizações concedidas.
- Consultar relatórios e histórico operacional.

Exclusão de registros operacionais exige confirmação e preservação de histórico quando aplicável; não equivale a permissão de apagar o aplicativo, banco completo, auditoria ou backups. Exportar relatório operacional não deve ser confundido com exportar o projeto ou base integral.

## Exclusões da administração técnica

O Gestor não recebe:
- Conta, credenciais, colaboração ou permissões administrativas de GitHub, Supabase, Windows, VM, SSH ou VPN.
- Acesso a chaves de serviço, senhas técnicas, tokens administrativos, variáveis protegidas ou backups integrais.
- Poder de modificar, publicar, instalar, restaurar, suprimir ou destruir código e componentes do aplicativo.
- Poder de executar terminal, SQL arbitrário, instaladores ou workflows técnicos.
- Poder de copiar, distribuir ou compartilhar o projeto, instaladores ou código por controles administrativos do aplicativo.
- Poder de assumir a titularidade, promover-se a Proprietário, nomear/revogar Gestores ou conceder administração técnica a terceiros.

A delegação de perfil e as competências técnicas permanecem exclusivas do Proprietário. A nova regra operacional não autoriza alterar o disparo das 7h.

## Limites verificáveis

O repositório urbanopos/Assistente.FSJ é público nesta revisão. Um perfil do aplicativo não impede consulta, download ou fork do material público. HTML/JavaScript entregue ao navegador pode ser inspecionado mesmo com repositório privado. Não existe garantia técnica de impedir toda captura ou cópia de conteúdo exibido ao usuário.

É possível impedir acesso administrativo, proteger código e segredos do servidor e bloquear alterações não autorizadas por autenticação e autorização no servidor. Tornar o repositório privado exige avaliar a hospedagem e os custos antes de alterar a visibilidade. Esta decisão não faz essa alteração.

## Implantação necessária

Separar Proprietário de Gestor operacional na identidade, no banco e em todas as APIs; revisar leituras, escritas, storage, RPCs, exclusões e acessos ao módulo da VM. Não basta ocultar botões nem substituir a verificação do Proprietário por “autenticado”.

A concessão deve depender de pessoa ativa e delegação atual do Proprietário, com revogação efetiva, auditoria e bloqueio de autoelevação. Testar cada operação autorizada e cada tentativa técnica proibida, inclusive chamadas diretas às APIs. A validação deve preservar tarefas, contas e rotina das 7h.

Até implantação e testes, continuam valendo as permissões efetivamente existentes. Nenhum usuário real foi promovido por este documento.

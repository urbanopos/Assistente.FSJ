# Página inicial Desktop — publicação operacional

Versão `20261030-desktop-inicio-22`, 30/10/2026. Endereço de uso: https://urbanopos.github.io/Assistente.FSJ/.

O recurso operacional compilado `desktop/layout.min.js` aplica ao desktop/laptop o layout aprovado: contadores e links antes das ações; Tarefas em Execução e Responder dúvidas e sugestões lado a lado; Aplicativos nativos e Agenda de folgas e feriados após todos os botões verdes. Mantém os elementos, contagens dinâmicas e manipuladores de eventos existentes.

Android, iPhone e iPad mantêm a organização anterior. O tipo de aparelho é reconhecido pelos sinais disponíveis no navegador, incluindo modo Desktop do iPad; a largura da janela não é o critério de seleção. A detecção orienta apenas apresentação e não concede privilégios. Não há leitura de MAC. Não alterar a base privada Celular por esta entrega.

Fonte do novo adaptador mantida exclusivamente na pasta privada Assistente FSJ - Desktop; distribuição pública apenas do artefato compilado e da referência de carregamento. O restante do aplicativo público anterior não foi migrado nem removido nesta entrega. Código entregue ao navegador continua inspecionável.

Mantidos acesso autenticado, permissões, endpoints, dados, sessões, rascunhos, calendário e agendamentos. Nenhuma alteração de servidor ou instalação na VM. O adaptador move os controles existentes sem recriá-los e é idempotente. O mecanismo existente de atualização automática recebe a nova identidade de versão e preserva edições em curso.

Validação: contrato de atualização e sintaxe aprovados; execução do artefato compilado em DOM simulado para Windows, Linux, Mac, Android, iPhone e iPad. Confirmados o par de botões, quatro links de contagem, ordem dos blocos, manipuladores preservados e ausência de mudanças de DOM no celular. Sem envio de WhatsApp ou gravação real. A verificação HTTP da página e do recurso compilado confirma distribuição; a conferência visual na sessão real do Proprietário é separada.

Recuperação: reverter somente o commit desta publicação, preservando o histórico, os dados e as demais melhorias. Não restaurar cartões PDF, duplicar executores ou sobrescrever a versão Celular.

# MarIA — identidade da assistente

Decisão do Proprietário em 24/10/2026: o nome exibido será **MarIA**, sem FSJ. A Brisa no ChatGPT, da OpenAI, permanece distinta.

## Operação

Abrir a assistente pelo avatar existente. O painel, as mensagens de voz e os textos de apoio usam MarIA. O interpretador aceita “MarIA, abra Pessoas” e mantém o nome antigo como alias para continuidade. O avatar anterior foi preservado; a imagem morena apresentada na conversa é uma proposta e não foi instalada nesta entrega.

## Limites

A mudança de nome não amplia permissões nem integra Ollama. Consultas e dados permanecem nos mecanismos existentes. A manutenção autorizada deve se limitar a restaurar funções implantadas; novas funcionalidades são encaminhadas ao Proprietário para avaliação com a Brisa no ChatGPT. Esse limite de manutenção é uma decisão registrada, não uma capacidade autônoma implantada.

## Instalação e verificação

Versão da interface: `20261024-maria-01`. GitHub Pages disponibiliza o frontend após concluir o build. O atualizador existente verifica novas versões quando seguro e preserva edição, sessões e chamadas. Não exigir recarga manual como rotina. A cópia da VM deve ser sincronizada e conferida separadamente.

Validar abertura do painel, nome MarIA, apresentação e comando “MarIA, abra Pessoas”. Os testes de código usam dados simulados e não substituem teste do microfone real no dispositivo. Arquivos, IDs e chaves de preferências `brisa*` continuam existentes por compatibilidade.

## Recuperação

Reverter os textos e o identificador de versão pelo Git, com validação do contrato de atualização. Não apagar localStorage, sessão, tarefas nem trocar as imagens para desfazer a alteração de nome.


### Atualização visual de 24/10/2026 — `20261024-maria-avatar-02`

Substitui a indicação anterior de avatar preservado: o painel, o ícone de abertura e a miniatura do cabeçalho passam a usar a identidade morena apresentada para MarIA. `maria-avatar.webp` contém o retrato e `maria-expressoes.webp` quatro expressões para a animação existente (repouso, piscar, fala aberta e fala arredondada). Os arquivos antigos permanecem no histórico para recuperação. Novos nomes de arquivo evitam reutilização indevida das imagens anteriores no cache. A animação visual não representa uma implementação de reconhecimento de fala local.

Validado: identidade das imagens, dimensões da folha de expressões, referências dos três pontos de exibição, sintaxe e contrato de atualização automática. Publicar não comprova atualização da cópia na VM. Recuperação: reverter somente referências e imagens da alteração visual pelo Git, mantendo as regras de versão, sem apagar preferências, sessões ou registros.


### Expressões ampliadas — `20261024-maria-expressoes-03`

Substitui a folha de quatro expressões da preparação anterior por um atlas de 12 quadros em quatro colunas e três linhas: neutra, piscar, atenta, reflexiva, quatro posições de fala (A, E/I, O e U), preocupada, triste, séria/sizuda e repouso. “Ouvindo” usa atenção; “Preparando resposta” usa reflexão. Expressões de preocupação, tristeza e seriedade são selecionadas por frases explícitas de erro, lamento ou restrição da resposta, sem atribuir sentimentos reais à assistente.

A boca acompanha eventos de palavras da voz quando o navegador os oferece, com duração aproximada por palavra e retorno ao repouso. Sem esses eventos, há sequência visual aproximada. Não se promete sincronização fonética exata; o atlas não contém todas as combinações de emoção e posição labial. A preferência de movimento reduzido é respeitada. Interromper a fala cancela os temporizadores da animação.

Validações: coordenadas dos 12 quadros, vogais e repouso, escolha de expressão em erros/restrições/lamento, cancelamento de temporizadores, bloqueio de movimento reduzido e voz interrompida, contrato de atualização e comandos existentes. Microfone e vozes reais permanecem sujeitos ao teste no dispositivo.

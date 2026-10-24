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

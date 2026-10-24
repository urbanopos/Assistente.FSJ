# MarIA — ponte documental HTTPS V1

A ponte acrescenta somente `/api/maria/status` e `/api/maria/ask` ao servidor existente, porta 8443, usando o certificado já configurado. A API exige token Bearer validado pelo mecanismo central de titularidade já utilizado pela TV FSJ. Tokens de quadros pessoais não liberam esta consulta técnica. CORS fica restrito a `https://urbanopos.github.io`; não usa cookies de terceiros nem publica o arquivo knowledge.json.

Respostas documentais determinísticas: memória/disco medidos, versão local e referência da última busca, estados dos serviços, limites de manutenção e encaminhamento de melhorias. Não gera texto com Ollama, não inventa resposta para dúvida desconhecida e não executa ações. Consulta desconhecida pede esclarecimento. Base ausente ou com mais de uma hora é recusada. Datas das medições aparecem nas respostas relevantes.

## Instalar uma vez

```bash
python3 automation/maria-knowledge-bridge/install.py
```

Execute como urbano, sem sudo. Requer a base já instalada, servidor em `/home/urbano/fsj-video-v001`, certificado público em `dados/tls/servidor.crt` e o validador de titularidade existente. A chave privada é utilizada somente pelo servidor já implantado; o instalador não a lê nem a copia.

O instalador suspende brevemente os gatilhos do atualizador, recusa concorrência com atualização em andamento, cria o bloqueio de novas escritas já reconhecido pelo servidor e confirma `busy=false` em `/api/version`. Se ocupado ou sem informação verificável, interrompe sem substituir o código. Faz backup de server.py e do módulo, instala somente a ponte, reinicia `fsj-reserva.service` e verifica que a rota sem credenciais devolve 401. Essa verificação local fixa a identidade ao certificado público exato antes de enviar a requisição, sem transmitir token. Restaura os gatilhos ao terminar; falha no teste da ponte provoca recuperação do código anterior.

Nenhum banco, sessão persistente, vídeo, WhatsApp, certificado, credencial ou permissão do participante é modificado. Um reinício pode exigir reautenticação de sessões temporárias. A integração da interface web é uma etapa posterior; a existência da ponte não prova que o painel já a utiliza.

## Recuperação e atualizações

Backup em `fsj-video-v001/backups/maria-documental-DATA`. Reverter somente o server.py e módulo correspondentes, com o servidor livre, preservando bancos e mídias. Nunca restaurar dados de negócio a partir deste backup de código. Pacotes assinados futuros devem preservar/reaplicar a integração; não assumir que um pacote legado contém o módulo. Código publicado, ponte instalada, autenticação real e chat conectado devem ser registrados separadamente.

Testes isolados: respostas factuais, limitação de conhecimento, credenciais recusadas, preservação de rotas anteriores, instalação idempotente do adaptador, rejeição de origem e ausência de autenticação antes da leitura da base. Instalação/HTTPS/autenticação reais na VM aguardam confirmação; teste local não substitui o teste pelo navegador.

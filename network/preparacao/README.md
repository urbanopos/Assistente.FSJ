# FSJ Reserva — preparação de acesso externo próprio

Estado: preparação testada, **acesso externo não ativado**. O APK de produção ainda aponta para a rede local. Não confunda este material com um servidor já publicado na internet.

## Arquitetura sob controle do Proprietário

Na própria VM: aplicativo Python, autenticação, SQLite, arquivos/vídeos, Nginx para HTTPS e coturn para STUN/TURN. A instalação usará a CA já pertencente ao FSJ, incorporada ao APK. Um IPv4 público fixo permite usar IP diretamente, sem exigir DNS gerenciado, certificado de terceiro, VPN comercial ou servidor de retransmissão externo. Nginx e coturn são software de código aberto; hospedagem e dados ficam sob controle do Proprietário, respeitadas as licenças originais.

A operadora continua fornecendo a conexão com a internet. Ainda não sabemos se o acesso da fazenda tem IPv4 público, CGNAT ou bloqueio de entrada. Uma rede só com CGNAT sem encaminhamento de entrada não publica a VM diretamente para qualquer cliente IPv4. É necessário resolver isso com a operadora antes de anunciar funcionamento remoto.

## Levantamento pendente

1. Operadora e possibilidade de IPv4 público fixo com entrada permitida.
2. IP WAN do roteador e comparação com o IP público visto na saída da própria fazenda. O IP obtido aqui no ambiente de desenvolvimento não é o da fazenda. O endereço Topaz Loopback visto no Windows não foi considerado IP WAN.
3. Modelo do roteador, acesso administrativo e encaminhamento de TCP/UDP.
4. Switch Hyper-V e rota efetiva até 192.168.77.2. O portproxy existente do Windows só trata TCP; não resolve o transporte UDP do TURN. Nenhum switch do Hyper-V deve ser alterado sem revisar a interface usada pelo Windows.
5. Disponibilidade do computador/VM e capacidade de upload para os vídeos/chamadas.

## Planejamento privado

Depois de confirmar os endereços, executar na VM:

```
python3 planejar_rede.py --ip-publico IP_CONFIRMADO --ip-vm IP_CONFIRMADO_DA_VM --saida /home/urbano/fsj-rede-planejada
```

O comando apenas gera arquivos, com pasta 0700 e arquivos 0600. Não instala pacotes, abre portas, altera certificados, troca switch, muda serviços ou torna o FSJ público. Os arquivos rede.json e turnserver.conf possuem segredo local gerado nessa execução: nunca enviá-los ao GitHub nem a participantes.

## Ativação que ainda precisa ser configurada e testada

- Instalar Nginx/coturn na VM; gerar novo certificado de servidor assinado pela **mesma CA própria**, incluindo o IPv4 público e fsj-backend.local. Preservar a CA/chave raiz existentes e os certificados anteriores em backup. Distribuir o certificado/chave de serviço para /etc/fsj-reserva/tls com acesso mínimo dos serviços. A chave raiz não deve ser disponibilizada ao Nginx/coturn.
- Manter a API atual em HTTPS local 8443 para preservar a rotina de atualização e a verificação de saúde. Nginx fará proxy HTTPS em loopback e validará a CA e o nome fsj-backend.local. Configurar dados/proxy.json com {"trusted_loopback":true}, dono urbano e modo 0600, apenas para o proxy local, antes de expor login publicamente. O Nginx deve sobrescrever X-Forwarded-For com um único $remote_addr. Cabeçalhos vindos de outro peer ou sem configuração explícita são ignorados.
- Encaminhar, no roteador e no caminho até a VM: HTTPS TCP 443; STUN/TURN TCP e UDP 3478; TURN TLS TCP 5349; relay UDP 49160–49260. Não encaminhar SSH, banco, API interna 8443 ou interfaces de administração indiscriminadamente.
- Instalar rede.json em /home/urbano/fsj-video-v001/dados/rede.json com dono urbano e modo 0600. A API autenticada /api/rtc-config entrega apenas credenciais TURN temporárias, com validade de duas horas; nunca entrega o segredo mestre.
- Gerar e assinar o APK com o endereço público confirmado, mantendo o pacote, a assinatura do Proprietário e a confiança na CA própria. Atualizar os links de abertura para esse endereço. Verificar acesso pelo mesmo Wi-Fi (hairpin NAT/rota local) e por dados móveis; ainda não foi gerado APK apontando para um endereço público desconhecido.
- Conferir login, bloqueio de conta, arquivos, exibição em grupo e chamada com Regina em dados móveis e outro aparelho no Wi-Fi. Testar ainda pausa, encerramento, reconexão e TURN forçado. Não considerar apenas troca de SDP como prova de áudio/vídeo remoto.
- Conferir inicialização automática e política de atualização. O canal GitHub de distribuição e o espelhamento do principal são integrações já existentes e não foram desativados nesta preparação; esta proposta não exige hospedagem de aplicação nem relay externos para o funcionamento do Reserva.

## Testes já realizados nesta preparação

Credenciais temporárias, validação de host/IP, configuração ausente ou inválida, segredo mestre não exposto, permissões de arquivo, regressões de autenticação e chamadas. Gerador não altera rede e rejeita endereços privados/CGNAT como IP público. A configuração final de Nginx/coturn, TLS público próprio, roteador, Hyper-V, operadora e chamadas reais permanece pendente.

Referências: https://webrtc.org/getting-started/turn-server ; https://github.com/coturn/coturn/blob/master/examples/etc/turnserver.conf .

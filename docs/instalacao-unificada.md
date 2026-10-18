# Instalação unificada do Assistente FSJ

Entrada única: instalar.html. A antiga instalar-reserva.html encaminha para esta página.

## Windows

Instalar-Assistente-FSJ.cmd é um instalador de atalhos, não um aplicativo Windows nativo. Cria Assistente FSJ.Web.url (casinha) e Assistente FSJ.VM.lnk (ramo), guarda imagens no AppData e registra somente a CA pública conferida no repositório CurrentUser\Root. Não exige administrador. Confirmações do Windows continuam possíveis. Nenhuma chave privada ou senha está no arquivo.

O acesso VM usa um iniciador local que testa TCP 192.168.77.2:8443 ao abrir; se disponível, abre a URL local. Caso contrário, abre o IP público. O navegador continua validando HTTPS. Testar TCP não comprova certificado nem funcionamento completo do aplicativo. Atalhos anteriores reconhecidos como criados pelo nosso instalador são movidos para um backup. Não encerra Chrome nem outros aplicativos. Pode ser necessário reabrir o navegador para reconhecer uma CA nova.

## Android Reserva 15

Pacote br.com.fazendasaojose.reservavm, mesma assinatura das versões anteriores, versionCode 15. Incorpora a CA da fazenda. RoutePolicy aceita somente quatro origens fixas. VMEndpoint testa HTTPS sem redirecionamento e sem desativar certificado/hostname, confere API de versão e guarda a rota que funcionou. A escolha ocorre ao abrir; o recebimento em segundo plano tenta novamente em outra rota após falha. Não promete continuidade de uma chamada durante mudança de rede.

Mantém as funções do código Android 14, incluindo notificações, vínculo do aparelho, senha salva e chamadas. O novo acesso é selecionado antes de iniciar sessão/consulta de atualização. O serviço de recebimento usa o mesmo último destino disponível.

Atualizações: consulta a versão da VM e downloads/android-latest.json. O APK disponível no canal de distribuição é usado quando sua versão for maior. A confiança do sistema é permitida somente para urbanopos.github.io, usada na distribuição, enquanto a interface do app permanece restrita à origem da VM. O APK precisa corresponder ao pacote atual, ser mais recente e ter a mesma assinatura; confirmações do Android continuam necessárias. Não altera o backend nem os arquivos privados da VM. A primeira passagem de Android 11/14 para 15 exige baixar e confirmar o novo APK uma vez.

A cada nova versão, publicar o APK assinado e android-latest.json juntos. O JSON do canal nunca deve apontar para versão de APK que não esteja publicada. A VM pode manter seu canal próprio; nunca é permitido rebaixar uma instalação mais recente.

## Web e iOS

O principal continua como aplicativo web instalado pelo navegador. A página utiliza beforeinstallprompt quando o navegador disponibilizar o recurso; caso contrário, orienta o menu de instalação. No Safari, Adicionar à Tela de Início continua sendo uma ação do usuário. Não foi criado APK do principal.

O instalador nativo do Reserva para iPhone permanece pendente. A versão web da VM com a CA privada atual exige configuração manual e não atende à instalação simplificada. Nenhum IPA, assinatura Apple ou serviço pago foi criado. Não existe arquivo executável único que sirva para Windows, Android e iOS.

## Validação e limites

Compilação Android 35/API mínima 26; assinatura APK v2/v3 conferida com certificado do proprietário. Cinco cenários executados para seleção segura de rota. Página testada em Chromium com identificação Windows, Android e iPhone, incluindo ocultação do APK no iPhone e no Windows e ícones disponíveis. Isto não substitui testes em iPhone ou Android reais. Script Windows revisado e arquivos incorporados conferidos, mas não executado em Windows neste ambiente.

O acesso externo pelo computador, o aviso de certificado no Chrome e as chamadas entre redes continuam sujeitos a teste no ambiente real. Este instalador não configura roteador, TURN ou firewall e não comprova operação perfeita. A VM precisa continuar ligada e acessível. Não substitui nem sobrescreve a interface da VM, contas, vídeos, banco ou automação WhatsApp.

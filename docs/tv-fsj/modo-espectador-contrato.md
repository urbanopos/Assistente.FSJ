# TV FSJ — Modo Espectador

## Acesso
- Disponível 24h, sem relação com a rotina de tarefas das 7h.
- O acesso móvel de Espectador exige um link individual vigente vinculado no servidor a `pessoas.id` com `public.pessoas.ativo=true`.
- Não aceitar `pessoa_id`, `tipo`, `perfil` ou `proprietario` enviados pelo cliente como prova de identidade; não permitir escolher pessoa em lista para autenticar.
- Credenciais de `quadros_do_dia` e `links_resposta` só autorizam seus próprios recursos; não conferem acesso genérico à TV.

## Interface Espectador
- Exibir somente reprodução de TV e biblioteca de vídeos permitidos.
- Ocultar e, principalmente, **negar no backend** rotas de iniciar/atender/encerrar chamadas, convite, microfone, câmera, captura, upload, editar e excluir vídeos.
- Não conceder privilégios por parâmetros da URL ou CSS. Endpoints de chamada exigem sessão verificada e titularidade do Proprietário na Central.
- A VM deve oferecer uma rota distinta `/espectador`, sem reutilizar a página administrativa que contém controles de chamada.

## Testes obrigatórios antes da ativação
1. Proprietário mantém chamadas e administração.
2. Pessoa ativa e habilitada reproduz TV em qualquer horário, sem acesso a chamadas.
3. Pessoa não habilitada, inativa ou sem sessão recebe 403.
4. Tentativas diretas de chamadas como espectador recebem 403.
5. O link individual fica no Assistente. Somente um código de TV temporário vai para a VM.
6. Nenhuma alteração na rotina WhatsApp das 7h.

## Estado
Piloto Espectador instalado na VM em serviço separado. A entrada respondeu HTTP 200 pelo Dell, vídeos sem sessão retornaram 403 e a rota de manutenção retornou 404. A regra TCP 9443 está ativa no roteador da Hi-Link e aponta para a porta 9443 do Dell. O acesso ao endereço público e a reprodução autenticada no celular aguardam validação.

## Botão verde no celular — 13/11/2026

- O fluxo de link individual e espelho entra em `celular/layouts/executor/index.html` ou `celular/layouts/supervisor/index.html`. O botão verde abre `https://168.196.84.147:9443/espectador` depois da validação do destinatário. Durante o descanso, o botão continua disponível e as tarefas seguem o expediente. A URL da TV não recebe o token de tarefas, identificadores de pessoa ou privilégios.
- A navegação é distribuída pelo GitHub Pages a partir de `main`. Validar pelo botão verde no link espelho, com o Wi-Fi da Fazenda ligado. Para entrar no Espectador, o aparelho deve confiar na CA da Fazenda e a conta deve estar autorizada na TV.
- Para recuperar o destino anterior, reverter a alteração nos dois índices móveis e a documentação correspondente. Essa recuperação no GitHub não requer alterações no banco nem na VM.

## Entrada pelo cadastro Pessoas — 13/11/2026

- O botão verde solicita ao serviço `fsj-tv-espectador-acesso` um código exclusivo da TV. A emissão exige um link individual vigente e uma pessoa ativa. A VM confere o código com o cadastro central e revalida a pessoa pelo espelho local durante o uso. O código fica no fragmento somente até a página da TV iniciar e é aceito uma vez pela instância do piloto enquanto vigente. A sessão de Espectador dura até 30 minutos e respeita a validade do link.
- Uma conta da TV é opcional para quem entra pelo Assistente. Sem vínculo, a pessoa recebe somente os vídeos marcados como compartilhados com todos. Com vínculo ativo, as restrições por vídeo usam a mesma conta vinculada. As chamadas e a administração estão fora do serviço Espectador.
- A função central foi implantada a partir de [`supabase/functions/fsj-tv-espectador-acesso/index.ts`](../../supabase/functions/fsj-tv-espectador-acesso/index.ts). A atualização na VM usa o pacote `TV-FSJ-Acesso-Direto.zip` e faz cópia de recuperação dos arquivos alterados antes do reinício do piloto. Validação local cobriu links válidos e inválidos, pessoas inativas, código adulterado, repetição, vídeos compartilhados e restritos. O Proprietário confirmou no Galaxy a reprodução pelo link espelho do Carlos após instalar.
- Para recuperar a navegação anterior, reverta o commit dos índices móveis e restaure os três arquivos da cópia `antes-acesso-direto-*` do piloto antes de reiniciar `fsj-tv-espectador.service`. A versão inicial do acesso direto ainda mostrava o formulário de senha na URL direta e ao sair da TV.

## Saída da TV no celular — 13/11/2026

- **Sair da TV** encerra a sessão Espectador e retorna pelo histórico à página de origem do Executor ou Supervisor. O fluxo preserva o destinatário do link espelho e dispensa transferir o token das tarefas de uma origem para a outra. Sem uma navegação de origem, a TV mostra a instrução para abrir pelo botão verde do Assistente.
- O pacote `TV-FSJ-Saida-Celular.zip` atualiza apenas `index.html` e `tv.js` do piloto. Antes da troca, salva uma cópia em `antes-saida-celular-*`. A VM lê os arquivos em cada requisição e o instalador confere por HTTPS o conteúdo publicado. Para recuperação, copie esses dois arquivos da cópia de segurança para a pasta do piloto.
- Testes locais cobriram retorno aos dois índices, saída recusada e acesso direto sem sessão. A saída pelo Galaxy precisa ser conferida após aplicar o pacote.

## TV FSJ do Proprietário no celular — 13/11/2026

- O botão verde do índice móvel autenticado abre `/proprietario` no mesmo endereço Hi-Link e na mesma porta 9443 do Espectador. A função `fsj-tv-proprietario-acesso` exige sessão válida no Auth, titularidade cadastrada e pessoa ativa. Emite código cifrado de 45 segundos que só a VM autorizada pode trocar. A VM abre uma sessão própria pelo SSO já existente do Reserva. O navegador recebe um cookie dedicado e o código sai da barra de endereço. O link espelho de funcionário continua abrindo o Espectador.
- O serviço 9443 disponibiliza a tela existente da TV e encaminha apenas as rotas necessárias de reprodução, videoteca e chamadas após validar a sessão própria. **Sair da TV** encerra essa sessão e retorna ao Assistente. A manutenção da VM, a atualização remota e a configuração do espelho ficam fora desta entrada. O botão e o fluxo do Desktop conservam a entrada existente.
- A validação central foi publicada. A ativação do piloto usa o pacote `TV-FSJ-Proprietario-Hi-Link.zip` no Dell. O instalador verifica o SSO local, preserva cópia da unidade, reinicia apenas o piloto da porta 9443 e confirma a disponibilidade das duas entradas, o bloqueio sem sessão e a ausência da rota de manutenção. Para voltar ao serviço anterior, restaure a unidade `fsj-tv-espectador.service` de `antes-proprietario-*` e recarregue as unidades do usuário. O teste final de titularidade, reprodução, saída e chamadas no Galaxy precisa de sessão do Proprietário.

### Compatibilidade do cookie de sessão

Após a instalação da entrada do Proprietário, o Galaxy chegou à VM e exibiu “A VM não abriu a sessão do Proprietário”. O leitor da porta 9443 rejeitava o cabeçalho com `Partitioned` nas versões do Python anteriores à 3.14. O teste local reproduziu essa resposta e passou após corrigir a leitura do cookie `fsj_sso` e validar seu prazo. O atributo continua sendo enviado pelo SSO existente. A sessão enviada ao Galaxy continua protegida por `HttpOnly`, `Secure` e `SameSite=Strict`.

O pacote `TV-FSJ-Proprietario-Correcao-Sessao.zip` atualiza `owner_proxy.py`, faz uma cópia em `antes-cookie-proprietario-*`, reinicia o piloto da porta 9443 e verifica as rotas de Espectador e Proprietário. Para restaurar, use o arquivo dessa cópia e reinicie o piloto. A sessão real do titular no Galaxy deve ser testada após aplicar.

### Tela inicial do Proprietário no padrão Espectador

O Proprietário confirmou a abertura e a reprodução no Galaxy após corrigir a sessão. A atualização seguinte apresenta o mesmo cartaz, estilos, botão central e videoteca do Espectador. **Administração** abre chamadas e autorizações disponíveis na TV. **Edição** abre os controles existentes de videoteca e vídeo institucional. Essas duas áreas oferecem **Voltar à TV FSJ**. A reprodução continua dependente de toque, e **Sair da TV** encerra a sessão e retorna ao Assistente.

O pacote `TV-FSJ-Proprietario-Layout.zip` atualiza somente a entrada móvel do Proprietário no serviço 9443. O instalador faz cópia em `antes-layout-proprietario-*`, reinicia o piloto e valida suas rotas e a proteção sem sessão. Para recuperar a versão anterior, restaure `owner_proxy.py` e `owner.js` dessa cópia, retire os novos arquivos `owner-home.html` e `owner-home.js` e reinicie o piloto. Os testes locais cobriram o cartaz, a reprodução acionada por toque, os destinos dos dois botões, a saída e a proteção das rotas. A nova interface ainda precisa ser aplicada e conferida no Galaxy.

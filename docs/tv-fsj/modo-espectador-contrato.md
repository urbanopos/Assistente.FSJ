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
- A função central foi implantada a partir de [`supabase/functions/fsj-tv-espectador-acesso/index.ts`](../../supabase/functions/fsj-tv-espectador-acesso/index.ts). A atualização na VM usa o pacote `TV-FSJ-Acesso-Direto.zip` e faz cópia de recuperação dos arquivos alterados antes do reinício do piloto. Validação local cobriu links válidos e inválidos, pessoas inativas, código adulterado, repetição, vídeos compartilhados e restritos. A reprodução pelo link espelho no Galaxy precisa ser conferida após instalar.
- Para recuperar a navegação anterior, reverta o commit dos índices móveis e restaure os três arquivos da cópia `antes-acesso-direto-*` do piloto antes de reiniciar `fsj-tv-espectador.service`. O formulário legado permanece acessível pela URL direta.

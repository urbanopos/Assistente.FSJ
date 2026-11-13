# TV FSJ — Modo Espectador

## Acesso
- Disponível 24h, sem relação com a rotina de tarefas das 7h.
- Acesso exclusivamente a pessoas com `public.pessoas.ativo=true` e `public.pessoas.videos_chamadas=true`, mediante credencial autenticada e vinculada no servidor a `pessoas.id`.
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
5. Links de tarefas não viram autenticação de TV.
6. Nenhuma alteração na rotina WhatsApp das 7h.

## Estado
Piloto Espectador instalado na VM em serviço separado. A entrada respondeu HTTP 200 pelo Dell, vídeos sem sessão retornaram 403 e a rota de manutenção retornou 404. A regra TCP 9443 está ativa no roteador da Hi-Link e aponta para a porta 9443 do Dell. O acesso ao endereço público e a reprodução autenticada no celular aguardam validação.

## Botão verde no celular — 13/11/2026

- O fluxo de link individual e espelho entra em `celular/layouts/executor/index.html` ou `celular/layouts/supervisor/index.html`. O botão verde abre `https://168.196.84.147:9443/espectador` depois da validação do destinatário. Durante o descanso, o botão continua disponível e as tarefas seguem o expediente. A URL da TV não recebe o token de tarefas, identificadores de pessoa ou privilégios.
- A navegação é distribuída pelo GitHub Pages a partir de `main`. Validar pelo botão verde no link espelho, com o Wi-Fi da Fazenda ligado. Para entrar no Espectador, o aparelho deve confiar na CA da Fazenda e a conta deve estar autorizada na TV.
- Para recuperar o destino anterior, reverter a alteração nos dois índices móveis e a documentação correspondente. Essa recuperação no GitHub não requer alterações no banco nem na VM.

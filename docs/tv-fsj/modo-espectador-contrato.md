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
Contrato registrado no repositório. **Pendente de implementação e publicação do servidor VM**, que não está acessível para deploy nesta integração GitHub/Supabase. Não apresentar como ativado.

## Botão verde no celular — preparação de 13/11/2026

- O fluxo de link individual e espelho entra em `celular/layouts/executor/index.html` ou `celular/layouts/supervisor/index.html`. A preparação troca o IP privado pelo destino público `https://168.196.84.147:9443/espectador` depois da validação de identidade já existente. O expediente continua a ser aplicado apenas aos recursos de tarefas. A URL da TV não recebe o token do quadro, identificadores de pessoa ou indicação de privilégio.
- O piloto Espectador está instalado na VM. A rota respondeu HTTP 200 pelo Dell, vídeos sem sessão retornaram 403 e a rota de manutenção retornou 404. O endereço público com a porta 9443 e a reprodução no celular ainda aguardam validação. A versão de produção da navegação segue na branch `main`.
- Validar no Wi-Fi da fazenda e nos dados móveis. Testar o link espelho com uma pessoa habilitada e uma pessoa sem autorização para a TV. A liberação do botão no descanso deve coexistir com o bloqueio das tarefas. Validar o certificado e os controles de servidor antes da publicação da rota.
- A mudança de navegação será distribuída pelo GitHub Pages quando a alteração for integrada. Para recuperar o caminho anterior, reverter o commit dos índices móveis e sua documentação. Esta preparação não instala arquivos na VM nem requer cópia do banco.

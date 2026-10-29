# Publicador de arquivos do Assistente FSJ

Publicador independente em `../publicar.html`, com símbolo do Assistente e logotipo Fazenda São José incorporados. Repositório fixo: urbanopos/Assistente.FSJ; identifica a branch padrão pela API. Não utiliza urbanopos/fazenda.

## Operação

Abra https://urbanopos.github.io/Assistente.FSJ/publicar.html, selecione o arquivo recebido, confira o caminho exato informado na entrega e informe seu token GitHub com Contents de leitura e escrita para este repositório. Clique Conferir e publicar. A confirmação mostra repositório, branch, caminho, nome e tamanho. O nome recebido preenche o caminho inicialmente; para subpastas, ajuste-o conforme a entrega. Desktop e Celular não têm caminhos presumidos nem são implantados por este publicador.

O publicador consulta o SHA atual antes de substituir. Um conflito do GitHub não é sobrescrito automaticamente. Um caminho inexistente cria arquivo novo somente após confirmação explícita. O conteúdo é transferido como bytes em base64, inclusive imagens; limite local 20 MB. ZIP não é extraído. Após gravar, confere o SHA no commit resultante. Se a conferência falhar depois do envio, orienta verificar histórico antes de repetir. Os links permitem ver o arquivo e acompanhar Actions. Commit aceito não equivale a site publicado ou função operacional validada.

## Acesso e recuperação

Usar somente pelo Proprietário ou por quem tenha autorização e token de escrita no repositório. A página pública não contém token. O token digitado permanece em memória/DOM durante a abertura; não é salvo em localStorage, cookies ou no repositório. Não cria backups parciais: a versão anterior continua no histórico de commits; eventual recuperação requer escolher uma alteração validada segundo as regras do projeto. O publicador não fiscaliza prazo de seis horas nem promove cópia corrente de restauro.

## Estado e validação

Arquivo adicionado ao GitHub no commit 238a01a7fa271e424a33404a9e1d2f86669e6048. Testes locais simulados: substituição com SHA, criação, cancelamento sem escrita e preservação dos bytes. Publicação real com token digitado pelo Proprietário ainda não testada. Nenhum envio WhatsApp, dado operacional, serviço VM, agendamento ou página index/responder foi modificado.

O teste existente `node tests/automatic-update-contract.cjs` foi executado sobre o index do repositório antes desta entrega e já falhou por divergência de identidade entre meta `20261026-grupos-separados-05` e constante `20261026-nav-light-04`. Não é regressão do publicador independente, que não muda esse mecanismo; não foi enfraquecido o teste nem promovida uma versão do aplicativo. Essa pendência do aplicativo permanece separada.

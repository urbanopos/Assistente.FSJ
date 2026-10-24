# MarIA — base documental privada V1

Primeiro componente local da implantação; não é um modelo treinado e não conecta sozinho o chat ao Ollama. Instalação inicial em Debian, como urbano, sem sudo:

```bash
python3 automation/maria-knowledge/install.py --install --source /home/urbano/Assistente-FSJ
```

A base fica em `~/maria-fsj/knowledge.json`, pasta 0700 e arquivo 0600. Conserva uma única versão anterior em `knowledge.previous.json`; não acumula cópias ilimitadas. O serviço exclusivo `fsj-maria-knowledge.service` e o timer `fsj-maria-knowledge.timer` atualizam a base a cada quinze minutos. Não reiniciam serviços operacionais. Persistência sem sessão SSH exige Linger habilitado; o instalador informa se conseguiu confirmar essa condição.

Fontes permitidas: manual principal, identidade MarIA, decisão de atualização automática e decisão do perfil Gestor. A base registra literalmente os documentos; não converte descrições planejadas em capacidades instaladas. Documentos não executam comandos. Configurações privadas, arquivos .env, bancos, sessões e chaves não são lidos.

Fatos medidos: commit local, última referência origin/main já buscada, RAM total/disponível, disco e estados dos serviços conhecidos. A referência origin/main não é uma consulta ao GitHub em tempo real. Este serviço não sincroniza o checkout. Banco central, vídeos, certificados, sessões e rotina WhatsApp não são modificados. A pasta de arquivo no Dell permanece pendente de configuração.

Regras incorporadas: atendimento somente com dados autorizados; documentação técnica restrita ao Proprietário; manutenção limitada a restaurar funções implantadas sob autorização; propostas de novas funcionalidades encaminhadas à Brisa no ChatGPT. O componente não executa manutenção nem altera permissões. A aplicação ainda não consulta esta base; não declarar a IA integrada após instalar somente esta etapa.

## Consultar

```bash
systemctl --user is-active fsj-maria-knowledge.timer
journalctl --user -u fsj-maria-knowledge.service -n 20 --no-pager
```

## Recuperação

Para suspender somente a atualização documental: `systemctl --user disable --now fsj-maria-knowledge.timer`. Nenhum serviço operacional deve ser parado. Um manual principal ausente ou inválido impede a substituição da base atual. A versão anterior pode ser consultada para diagnóstico; não restaurar bancos a partir desta base, que não contém os registros do negócio.

Validação em ambiente isolado: exclusão de credenciais, preservação de arquivo operacional sentinela, permissões privadas, estados de implantação explícitos, falha sem sobrescrever base atual, backup limitado e rejeição de destino por link simbólico. Instalação e execução reais na VM aguardam confirmação do Proprietário.

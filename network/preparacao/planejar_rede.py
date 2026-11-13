#!/usr/bin/env python3
"""Gera arquivos privados de planejamento; não instala pacotes nem altera a rede."""
import argparse,ipaddress,json,os,secrets
from pathlib import Path

def generate(public_ip,vm_ip,output):
 public=ipaddress.IPv4Address(public_ip);local=ipaddress.IPv4Address(vm_ip)
 if not public.is_global:raise ValueError('É necessário IPv4 público alcançável; CGNAT e endereços privados não servem.')
 if not local.is_private or local.is_loopback or local.is_link_local:raise ValueError('Informe o IP privado da VM na rede local.')
 out=Path(output).resolve()
 if out.exists():raise ValueError('Escolha uma pasta nova para preservar planos e chaves anteriores.')
 out.mkdir(parents=True,mode=0o700);os.chmod(out,0o700)
 secret=secrets.token_hex(32);public=str(public);local=str(local)
 cfg={'turn_host':public,'turn_port':3478,'turn_tls_port':5349,'turn_secret':secret,'force_relay':False}
 files={'rede.json':json.dumps(cfg,indent=2)+'\n','turnserver.conf':f'''# Somente a VM. Preparação, não ativada.
listening-port=3478
tls-listening-port=5349
listening-ip={local}
relay-ip={local}
external-ip={public}/{local}
realm=fsj-reserva
fingerprint
use-auth-secret
static-auth-secret={secret}
cert=/etc/fsj-reserva/tls/servidor.crt
pkey=/etc/fsj-reserva/tls/servidor.key
min-port=49160
max-port=49260
user-quota=6
total-quota=48
max-bps=1000000
bps-capacity=12000000
no-cli
no-multicast-peers
no-tlsv1
no-tlsv1_1
denied-peer-ip=0.0.0.0-0.255.255.255
denied-peer-ip=10.0.0.0-10.255.255.255
denied-peer-ip=100.64.0.0-100.127.255.255
denied-peer-ip=127.0.0.0-127.255.255.255
denied-peer-ip=169.254.0.0-169.254.255.255
denied-peer-ip=172.16.0.0-172.31.255.255
denied-peer-ip=192.168.0.0-192.168.255.255
''','servidor.ext':f'''basicConstraints=critical,CA:FALSE
keyUsage=critical,digitalSignature,keyEncipherment
extendedKeyUsage=serverAuth
subjectAltName=IP:{public},IP:{local},IP:127.0.0.1,IP:192.168.1.114,IP:192.168.77.2,DNS:fsj-backend.local
''','nginx-fsj.conf':f'''# Exige certificado da CA própria com SAN fsj-backend.local no backend.
limit_req_zone $binary_remote_addr zone=fsj_login:10m rate=10r/m;
server {{
 listen 443 ssl;
 server_name {public};
 ssl_certificate /etc/fsj-reserva/tls/servidor.crt;
 ssl_certificate_key /etc/fsj-reserva/tls/servidor.key;
 ssl_protocols TLSv1.2 TLSv1.3;
 client_max_body_size 500m;
 client_body_timeout 60s;
 location = /api/login {{
  limit_req zone=fsj_login burst=10 nodelay;
  proxy_pass https://127.0.0.1:8443;
  include /etc/nginx/snippets/fsj-backend.conf;
 }}
 location / {{
  proxy_pass https://127.0.0.1:8443;
  include /etc/nginx/snippets/fsj-backend.conf;
 }}
}}
''','fsj-backend.conf':'''proxy_set_header Host $http_host;
proxy_set_header X-Forwarded-For $remote_addr;
proxy_ssl_verify on;
proxy_ssl_name fsj-backend.local;
proxy_ssl_trusted_certificate /etc/fsj-reserva/tls/fsj-ca.crt;
proxy_request_buffering on;
proxy_read_timeout 120s;
proxy_connect_timeout 10s;
'''}
 for name,content in files.items():
  path=out/name;fd=os.open(path,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
  with os.fdopen(fd,'w') as f:f.write(content)
 return out
if __name__=='__main__':
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('--ip-publico',required=True);p.add_argument('--ip-vm',required=True);p.add_argument('--saida',required=True);a=p.parse_args()
 try:out=generate(a.ip_publico,a.ip_vm,a.saida)
 except ValueError as e:p.error(str(e))
 print('Planejamento gerado em:',out);print('Nada foi instalado ou ativado. Mantenha os arquivos privados na VM e revise o README antes da configuração.')

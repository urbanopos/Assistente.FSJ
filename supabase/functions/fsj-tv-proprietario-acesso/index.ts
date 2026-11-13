const origin = 'https://urbanopos.github.io';
const base = Deno.env.get('SUPABASE_URL');
const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ||
  JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}').default;
const encoder = new TextEncoder();
const purpose = encoder.encode('fsj-tv-proprietario/v1');
const codePattern = /^[A-Za-z0-9_-]{42,20000}$/;
const jwtPattern = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

function encode(bytes) {
  return btoa(String.fromCharCode(...bytes)).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
}

function reply(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: {
    'Content-Type': 'application/json', 'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
  } });
}

async function query(path, token = service) {
  const result = await fetch(base + path, {
    headers: { apikey: service, Authorization: 'Bearer ' + token },
    redirect: 'error', signal: AbortSignal.timeout(6000),
  });
  if ([401,403].includes(result.status)) return null;
  if (!result.ok) throw Error('Consulta indisponível.');
  return result.json();
}

async function validate(token) {
  if (typeof token !== 'string' || token.length > 12000 || !jwtPattern.test(token)) return false;
  const user = await query('/auth/v1/user', token);
  if (!user?.id || !user.email_confirmed_at || user.is_anonymous) return false;
  const owner = await query('/rest/v1/fsj_titularidade?id=eq.true&auth_user_id=eq.' +
    encodeURIComponent(user.id) + '&select=pessoa_id&limit=1');
  if (!owner?.[0]?.pessoa_id) return false;
  const people = await query('/rest/v1/pessoas?ativo=eq.true&id=eq.' +
    encodeURIComponent(owner[0].pessoa_id) + '&select=id&limit=1');
  return people?.[0]?.id === owner[0].pessoa_id;
}

async function key() {
  if (!service || service.length < 32) throw Error('Configuração indisponível.');
  const raw = await crypto.subtle.digest('SHA-256', encoder.encode('fsj-tv-proprietario/v1:' + service));
  return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt','decrypt']);
}

async function vmAuthorized(device) {
  if (typeof device !== 'string' || !/^[0-9a-f]{64}$/.test(device)) return false;
  const publishable = Deno.env.get('SUPABASE_ANON_KEY') ||
    JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS') || '{}').default;
  if (!publishable) throw Error('Configuração indisponível.');
  const result = await fetch(base + '/rest/v1/rpc/fsj_reserva_snapshot', {
    method: 'POST', headers: { apikey: publishable, 'Content-Type': 'application/json' },
    body: JSON.stringify({ chave: device }), redirect: 'error', signal: AbortSignal.timeout(6000),
  });
  await result.body?.cancel();
  return result.ok;
}

Deno.serve(async req => {
  const source = req.headers.get('Origin');
  if (req.method === 'OPTIONS' && source === origin) return reply({});
  if (req.method !== 'POST' || (source && source !== origin)) return reply({erro:'Acesso recusado.'},403);
  try {
    if (Number(req.headers.get('Content-Length')) > 20500) return reply({erro:'Pedido inválido.'},400);
    const body = await req.text();
    if (body.length > 20500) return reply({erro:'Pedido inválido.'},400);
    let data;
    try { data = JSON.parse(body); } catch { return reply({erro:'Pedido inválido.'},400); }
    if (source === origin && data?.action === 'issue') {
      const token = (req.headers.get('Authorization') || '').match(/^Bearer (\S+)$/)?.[1];
      if (!await validate(token)) return reply({erro:'Acesso exclusivo do Proprietário autenticado.'},403);
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const ticket = encoder.encode(JSON.stringify({ token, expires: Date.now() + 45000 }));
      const data = new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:purpose},await key(),ticket));
      return reply({code:encode([...iv,...data])});
    }
    if (!source && data?.action === 'exchange') {
      const denied = () => reply({erro:'Acesso inválido ou expirado.'},403);
      if (typeof data.code !== 'string' || !codePattern.test(data.code) ||
          typeof data.device !== 'string' || !/^[0-9a-f]{64}$/.test(data.device)) return denied();
      const secret = await key();
      let ticket;
      try {
        const bytes = Uint8Array.from(atob(data.code.replaceAll('-','+').replaceAll('_','/')), c=>c.charCodeAt(0));
        if (encode(bytes) !== data.code) return denied();
        const decoded = await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes.slice(0,12),additionalData:purpose},secret,bytes.slice(12));
        ticket = JSON.parse(new TextDecoder().decode(decoded));
      } catch { return denied(); }
      if (!Number.isFinite(ticket.expires) || ticket.expires <= Date.now() || ticket.expires > Date.now()+45000) return denied();
      if (!await vmAuthorized(data.device) || !await validate(ticket.token) || ticket.expires <= Date.now()) return denied();
      return reply({access_token:ticket.token});
    }
    return reply({erro:'Acesso recusado.'},403);
  } catch {
    return reply({erro:'A validação do Proprietário está indisponível.'},503);
  }
});

const browserOrigin = 'https://urbanopos.github.io';
const base = Deno.env.get('SUPABASE_URL') || '';
const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ||
  JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}').default;
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const purpose = encoder.encode('fsj-tv-espectador/v1');
const taskLink = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const accessCode = /^[A-Za-z0-9_-]{42,640}$/;

function base64url(bytes) {
  return btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

function response(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': browserOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type',
    'Cache-Control': 'no-store',
  } });
}

async function rows(table, filters) {
  const url = new URL('/rest/v1/' + table, base);
  url.search = new URLSearchParams(filters).toString();
  const result = await fetch(url, {
    headers: { apikey: key, Authorization: 'Bearer ' + key },
    redirect: 'error', signal: AbortSignal.timeout(5000),
  });
  if (!result.ok) throw new Error('Consulta indisponível');
  return await result.json();
}

async function encryptionKey() {
  if (typeof key !== 'string' || key.length < 32) throw new Error('Configuração indisponível');
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode('fsj-tv-espectador/v1:' + key));
  return crypto.subtle.importKey('raw', digest, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

async function issue(token) {
  if (typeof token !== 'string' || !taskLink.test(token)) return response({ erro: 'Acesso individual inválido.' }, 400);
  const filter = { token: 'eq.' + token, select: 'pessoa_id,expira_em', limit: '1' };
  let links = await rows('quadros_do_dia', filter);
  if (!links.length) links = await rows('links_resposta', filter);
  const link = links[0];
  const expiry = Date.parse(link?.expira_em);
  if (typeof link?.pessoa_id !== 'string' || !Number.isFinite(expiry) || expiry <= Date.now()) {
    return response({ erro: 'Use um link individual vigente para abrir a TV FSJ.' }, 403);
  }
  const people = await rows('pessoas', { id: 'eq.' + link.pessoa_id, ativo: 'eq.true', select: 'id', limit: '1' });
  if (people[0]?.id !== link.pessoa_id) return response({ erro: 'Pessoa inativa ou indisponível.' }, 403);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const expires = Math.min(expiry, Date.now() + 60000);
  const payload = encoder.encode(JSON.stringify({ person: link.pessoa_id, expires, link_expires: expiry }));
  const encrypted = new Uint8Array(await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, additionalData: purpose }, await encryptionKey(), payload,
  ));
  const code = base64url([...iv, ...encrypted]);
  return response({ code });
}

async function exchange(code) {
  const denied = () => response({ erro: 'Acesso à TV inválido ou expirado.' }, 403);
  if (typeof code !== 'string' || !accessCode.test(code)) return denied();
  const secret = await encryptionKey();
  let ticket;
  try {
    const binary = atob(code.replaceAll('-', '+').replaceAll('_', '/'));
    const bytes = Uint8Array.from(binary, ch => ch.charCodeAt(0));
    if (base64url(bytes) !== code) return denied();
    const plain = await crypto.subtle.decrypt({
      name: 'AES-GCM', iv: bytes.slice(0, 12), additionalData: purpose,
    }, secret, bytes.slice(12));
    ticket = JSON.parse(decoder.decode(plain));
  } catch {
    return denied();
  }
  const now = Date.now();
  if (typeof ticket.person !== 'string' || !Number.isFinite(ticket.expires) || ticket.expires <= now ||
      ticket.expires > now + 60000 || !Number.isFinite(ticket.link_expires) || ticket.link_expires < ticket.expires) {
    return denied();
  }
  const people = await rows('pessoas', { id: 'eq.' + ticket.person, ativo: 'eq.true', select: 'id', limit: '1' });
  if (people[0]?.id !== ticket.person || ticket.expires <= Date.now()) return denied();
  return response({ person: ticket.person, expires: ticket.expires, link_expires: ticket.link_expires });
}

Deno.serve(async req => {
  const origin = req.headers.get('Origin');
  if (req.method === 'OPTIONS' && origin === browserOrigin) return response({});
  if (req.method !== 'POST' || (origin && origin !== browserOrigin)) return response({ erro: 'Acesso não permitido.' }, 403);
  try {
    if (Number(req.headers.get('Content-Length')) > 1024) return response({ erro: 'Pedido inválido.' }, 400);
    const text = await req.text();
    if (text.length > 1024) return response({ erro: 'Pedido inválido.' }, 400);
    let data;
    try { data = JSON.parse(text); } catch { return response({ erro: 'Pedido inválido.' }, 400); }
    if (origin === browserOrigin && data?.action === 'issue') return await issue(data.token);
    if (origin === null && data?.action === 'exchange') return await exchange(data.code);
    return response({ erro: 'Acesso não permitido.' }, 403);
  } catch {
    return response({ erro: 'A validação da TV está temporariamente indisponível.' }, 503);
  }
});

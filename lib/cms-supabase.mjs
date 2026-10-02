// Server-only transport. Never import this module from a client component.
export class SupabaseCmsError extends Error {
  constructor(message, status = 503, code = null) { super(message); this.status = status; this.code = code; }
}

export function storageMode() {
  const mode = process.env.CMS_STORAGE || (process.env.VERCEL ? 'supabase' : 'local');
  if (!['local', 'supabase'].includes(mode)) throw new SupabaseCmsError('CMS_STORAGE doit valoir local ou supabase.');
  if (process.env.VERCEL && mode === 'local') throw new SupabaseCmsError('Le stockage local du CMS est interdit sur Vercel.');
  return mode;
}

export function supabaseConfig() {
  const value = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  let url;
  try { url = new URL(value); } catch { throw new SupabaseCmsError('SUPABASE_URL est manquante ou incorrecte.'); }
  if (url.protocol !== 'https:' || !/^[a-z0-9-]+\.supabase\.co$/.test(url.hostname) || url.username || url.password || url.search || url.hash || url.pathname !== '/') {
    throw new SupabaseCmsError('Utilisez l’URL HTTPS de votre projet Supabase.');
  }
  if (!key || (!key.startsWith('sb_secret_') && !key.startsWith('eyJ'))) throw new SupabaseCmsError('La clé secrète Supabase côté serveur est manquante ou incorrecte.');
  if (key.startsWith('eyJ')) {
    try {
      if (JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString()).role !== 'service_role') throw new Error();
    } catch { throw new SupabaseCmsError('La clé historique doit être une clé service_role, pas anon.'); }
  }
  return { url: url.origin, key };
}

export async function supabaseRequest(route, { method = 'GET', body, headers = {}, binary = false } = {}) {
  const { url, key } = supabaseConfig();
  const requestHeaders = { apikey: key, ...headers };
  // Opaque sb_secret keys belong in apikey, not in a JWT Authorization header.
  if (key.startsWith('eyJ')) requestHeaders.Authorization = 'Bearer ' + key;
  if (body !== undefined && !Buffer.isBuffer(body)) requestHeaders['Content-Type'] = 'application/json';
  let response;
  try {
    response = await fetch(url + route, {
      method, headers: requestHeaders, body: body === undefined ? undefined : Buffer.isBuffer(body) ? body : JSON.stringify(body),
      cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(20000),
    });
  } catch (error) {
    // Next.js uses exceptions with a digest to interrupt prerendering. These are
    // framework control flow, not network failures, and must reach Next.js.
    if (error?.digest) throw error;
    throw new SupabaseCmsError('Supabase est momentanément inaccessible. Aucune sauvegarde locale de secours n’a été effectuée.');
  }
  if (!response.ok) {
    let error;
    try { error = await response.json(); } catch { error = {}; }
    // Do not forward provider messages: they may contain SQL or private data.
    const code = typeof error.code === 'string' ? error.code : null;
    if (response.status === 401 || response.status === 403) throw new SupabaseCmsError('Accès Supabase refusé. Vérifiez la clé serveur et les permissions.', 503, code);
    if (code === '42P01' || code === 'PGRST205' || code === 'PGRST202') throw new SupabaseCmsError('Le schéma CMS est absent. Exécutez le script supabase/migrations/20261002_cms.sql.', 503, code);
    throw new SupabaseCmsError('La requête Supabase a échoué (HTTP ' + response.status + ').', response.status === 409 ? 409 : 503, code);
  }
  if (binary) return Buffer.from(await response.arrayBuffer());
  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export async function readRemoteStore() {
  const rows = await supabaseRequest('/rest/v1/cms_store?id=eq.1&select=revision,data');
  if (!Array.isArray(rows) || rows.length > 1) throw new SupabaseCmsError('Réponse CMS incorrecte.');
  if (!rows.length) return null;
  const row = rows[0];
  if (!Number.isSafeInteger(row.revision) || !row.data || !Array.isArray(row.data.articles) || !Array.isArray(row.data.sessions) || !Array.isArray(row.data.attempts)) {
    throw new SupabaseCmsError('Le stockage CMS a un format incorrect.');
  }
  return row;
}

export async function compareAndSwapStore(revision, data) {
  const result = await supabaseRequest('/rest/v1/rpc/cms_compare_and_swap', { method: 'POST', body: { expected_revision: revision, next_data: data } });
  if (typeof result !== 'boolean') throw new SupabaseCmsError('Réponse de sauvegarde CMS incorrecte.');
  return result;
}

export const mediaBucket = 'cms-media';
export const mediaTypes = { png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif' };
export async function uploadRemoteMedia(filename, buffer, extension) {
  return supabaseRequest('/storage/v1/object/' + mediaBucket + '/' + encodeURIComponent(filename), {
    method: 'POST', body: buffer, headers: { 'Content-Type': mediaTypes[extension], 'x-upsert': 'false' },
  });
}
export async function downloadRemoteMedia(filename) {
  return supabaseRequest('/storage/v1/object/authenticated/' + mediaBucket + '/' + encodeURIComponent(filename), { binary: true });
}

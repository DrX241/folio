import test, { beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { storageMode, supabaseConfig, supabaseRequest, readRemoteStore, compareAndSwapStore, uploadRemoteMedia, downloadRemoteMedia } from '../lib/cms-supabase.mjs';

const realFetch = globalThis.fetch;
const originalEnv = { ...process.env };
const json = (value, status = 200) => new Response(JSON.stringify(value), { status });
beforeEach(() => {
  delete process.env.VERCEL;
  delete process.env.CMS_STORAGE;
  process.env.SUPABASE_URL = 'https://cms-test.supabase.co';
  process.env.SUPABASE_SECRET_KEY = 'sb_secret_fake_test_only';
});
afterEach(() => {
  globalThis.fetch = realFetch;
  for (const name of ['CMS_STORAGE', 'VERCEL', 'SUPABASE_URL', 'SUPABASE_SECRET_KEY', 'SUPABASE_SERVICE_ROLE_KEY']) {
    if (originalEnv[name] === undefined) delete process.env[name]; else process.env[name] = originalEnv[name];
  }
});

test('local remains default; Vercel requires durable storage', () => {
  assert.equal(storageMode(), 'local');
  process.env.VERCEL = '1';
  assert.equal(storageMode(), 'supabase');
  process.env.CMS_STORAGE = 'local';
  assert.throws(storageMode, /interdit/);
  process.env.CMS_STORAGE = 'typo';
  assert.throws(storageMode, /doit valoir/);
});
test('configuration rejects public keys and credential-leaking destinations', () => {
  for (const value of ['https://evil.test', 'http://cms-test.supabase.co', 'https://cms-test.supabase.co/evil', 'https://user:pass@cms-test.supabase.co']) {
    process.env.SUPABASE_URL = value;
    assert.throws(supabaseConfig);
  }
  process.env.SUPABASE_URL = 'https://cms-test.supabase.co';
  process.env.SUPABASE_SECRET_KEY = 'sb_publishable_fake';
  assert.throws(supabaseConfig);
  process.env.SUPABASE_SECRET_KEY = 'eyJ.' + Buffer.from(JSON.stringify({ role: 'anon' })).toString('base64url') + '.test';
  assert.throws(supabaseConfig, /service_role/);
});
test('opaque server key uses apikey, no cache, no redirects', async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(url, 'https://cms-test.supabase.co/rest/v1/test');
    assert.equal(options.headers.apikey, 'sb_secret_fake_test_only');
    assert.equal(options.headers.Authorization, undefined);
    assert.equal(options.cache, 'no-store');
    assert.equal(options.redirect, 'error');
    return json([]);
  };
  assert.deepEqual(await supabaseRequest('/rest/v1/test'), []);
});
test('legacy service-role key supplies a JWT authorization header', async () => {
  process.env.SUPABASE_SECRET_KEY = 'eyJ.' + Buffer.from(JSON.stringify({ role: 'service_role' })).toString('base64url') + '.test';
  globalThis.fetch = async (_, options) => {
    assert.equal(options.headers.Authorization, 'Bearer ' + process.env.SUPABASE_SECRET_KEY);
    return json([]);
  };
  await supabaseRequest('/rest/v1/test');
});
test('missing schema and permission errors are actionable and do not leak private provider messages', async () => {
  globalThis.fetch = async () => json({ code: 'PGRST205', message: 'private password should not escape' }, 404);
  await assert.rejects(readRemoteStore(), error => error.status === 503 && /schéma CMS/.test(error.message) && !/password/.test(error.message));
  globalThis.fetch = async () => json({ message: 'private data' }, 401);
  await assert.rejects(readRemoteStore(), /Accès Supabase refusé/);
});
test('network failure fails closed, never changes mode to local', async () => {
  process.env.CMS_STORAGE = 'supabase';
  globalThis.fetch = async () => { throw new Error('sensitive details'); };
  await assert.rejects(readRemoteStore(), /Aucune sauvegarde locale/);
  assert.equal(storageMode(), 'supabase');
});
test('Next.js prerender interrupts are not reported as network failures', async () => {
  const interrupt = Object.assign(new Error('dynamic render'), { digest: 'DYNAMIC_SERVER_USAGE' });
  globalThis.fetch = async () => { throw interrupt; };
  await assert.rejects(readRemoteStore(), error => error === interrupt);
});
test('empty store is distinguished from a malformed record', async () => {
  globalThis.fetch = async () => json([]);
  assert.equal(await readRemoteStore(), null);
  globalThis.fetch = async () => json([{ revision: 1, data: {} }]);
  await assert.rejects(readRemoteStore(), /format incorrect/);
});
test('compare-and-swap sends revision and enforces a boolean result', async () => {
  globalThis.fetch = async (_, options) => {
    assert.deepEqual(JSON.parse(options.body), { expected_revision: 12, next_data: { test: true } });
    return json(false);
  };
  assert.equal(await compareAndSwapStore(12, { test: true }), false);
  globalThis.fetch = async () => json('false');
  await assert.rejects(compareAndSwapStore(12, {}), /incorrecte/);
});
test('media are uploaded without overwrite and read from the private endpoint', async () => {
  const buffer = Buffer.from('test-image');
  globalThis.fetch = async (url, options) => {
    if (options.method === 'POST') {
      assert.ok(url.includes('/storage/v1/object/cms-media/'));
      assert.equal(options.headers['x-upsert'], 'false');
      assert.equal(options.headers['Content-Type'], 'image/png');
      assert.deepEqual(options.body, buffer);
      return json({});
    }
    assert.ok(url.includes('/storage/v1/object/authenticated/cms-media/'));
    return new Response(buffer);
  };
  await uploadRemoteMedia('image.png', buffer, 'png');
  assert.deepEqual(await downloadRemoteMedia('image.png'), buffer);
});
test('two server instances preserve concurrent logins, drafts, publication and version conflicts', async () => {
  process.env.CMS_STORAGE = 'supabase';
  let remote = { revision: 0, data: { version: 1, setupKey: 'private-test-setup', account: null, sessions: [], attempts: [], articles: [], pages: {} } };
  let conflicts = 0;
  globalThis.fetch = async (url, options) => {
    await new Promise(resolve => setTimeout(resolve, 2));
    if (url.includes('/rpc/cms_compare_and_swap')) {
      const body = JSON.parse(options.body);
      if (body.expected_revision !== remote.revision) { conflicts++; return json(false); }
      remote = { revision: remote.revision + 1, data: structuredClone(body.next_data) };
      return json(true);
    }
    return json([structuredClone(remote)]);
  };
  const a = await import('../lib/cms-store.mjs?instance=a');
  const b = await import('../lib/cms-store.mjs?instance=b');
  const credentials = { email: 'test@example.test', password: 'test-only-password-8372' };
  await a.createAccount({ ...credentials, key: 'private-test-setup' });
  const [tokenA, tokenB] = await Promise.all([a.login(credentials), b.login(credentials)]);
  assert.ok(conflicts > 0);
  assert.equal(remote.data.sessions.length, 3);
  assert.ok(await a.sessionAccount(tokenA));
  assert.ok(await b.sessionAccount(tokenB));
  const article = slug => ({ slug, title: slug, summary: 'Résumé', category: 'Test', date: '2026-10-02', status: 'draft', sections: [{ heading: 'Test', paragraphs: ['Un texte concret.'] }] });
  const [one] = await Promise.all([a.saveArticle(tokenA, article('article-a')), b.saveArticle(tokenB, article('article-b'))]);
  assert.equal(remote.data.articles.length, 2);
  assert.equal((await a.publicContent()).articles.length, 0);
  const published = await a.saveArticle(tokenA, { ...one, status: 'published' });
  assert.equal((await b.publicContent()).articles.length, 1);
  await assert.rejects(b.saveArticle(tokenB, one), error => error.status === 409);
  const admin = await a.adminContent(tokenA);
  await a.saveCms(tokenA, { config: admin.cms.draft, version: 0 });
  await assert.rejects(b.saveCms(tokenB, { config: admin.cms.draft, version: 0 }), error => error.status === 409);
  assert.equal('account' in admin, false);
  assert.equal('sessions' in admin, false);
  assert.ok(published.history.length);
  await b.logout(tokenA);
  assert.equal(await a.sessionAccount(tokenA), null);
  assert.ok(await a.sessionAccount(tokenB));
});

import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';
import { randomBytes, randomUUID, scryptSync, timingSafeEqual, createHash } from 'node:crypto';
import { defaultPages, pageFields } from './content-defaults.mjs';
import { defaultCms } from './cms-defaults.mjs';
import { validateConfig } from './cms-schema.mjs';
import { storageMode, readRemoteStore, compareAndSwapStore, uploadRemoteMedia, downloadRemoteMedia } from './cms-supabase.mjs';
import { validateArticleBlocks, validateImage } from './article-blocks.mjs';
import { validateArticleLayout } from './journal-document.mjs';

const directory = path.resolve(process.env.CMS_DATA_DIR || path.join(process.cwd(), '.content'));
const filename = path.join(directory, 'content.json');
let queue = Promise.resolve();
const tokenHash = value => createHash('sha256').update(value).digest('hex');
export class CmsError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}
async function readStore() {
  if (storageMode() === 'supabase') {
    const row = await readRemoteStore();
    if (!row) throw new CmsError('Le CMS Supabase n’a pas encore reçu vos données locales. Effectuez la migration avant de l’activer.', 503);
    return row.data;
  }
  try { return JSON.parse(await readFile(filename, 'utf8')); }
  catch (error) {
    if (error.code !== 'ENOENT') throw error;
    return { version: 1, setupKey: randomBytes(24).toString('hex'), account: null, sessions: [], attempts: [], articles: [], pages: defaultPages() };
  }
}
function transaction(callback) {
  const pending = queue.then(async () => {
    if (storageMode() === 'supabase') {
      // Each instance uses a database revision; the process queue alone is not a lock.
      for (let attempt = 0; attempt < 8; attempt++) {
        const row = await readRemoteStore();
        if (!row) throw new CmsError('Effectuez la migration locale vers Supabase avant d’enregistrer.', 503);
        const result = await callback(row.data);
        if (await compareAndSwapStore(row.revision, row.data)) return result;
      }
      throw new CmsError('Le stockage est occupé. Réessayez : vos modifications n’ont pas été écrasées.', 409);
    }
    await mkdir(directory, { recursive: true, mode: 0o700 });
    const store = await readStore();
    const result = await callback(store);
    const temporary = path.join(directory, randomUUID() + '.tmp');
    await writeFile(temporary, JSON.stringify(store, null, 2), { mode: 0o600 });
    for (let attempt = 0; ; attempt++) {
      try { await rename(temporary, filename); break; }
      catch (error) {
        if (!['EPERM','EACCES','EBUSY'].includes(error.code) || attempt >= 5) throw error;
        await new Promise(resolve => setTimeout(resolve, 20 * (attempt + 1)));
      }
    }
    return result;
  });
  queue = pending.catch(() => {});
  return pending;
}
export async function setupKey() {
  return transaction(store => store.account ? null : store.setupKey);
}
export async function hasAccount() { return Boolean((await readStore()).account); }
export async function publicContent() {
  const store = await readStore();
  return { articles: store.articles.filter(article => article.status === 'published').map(({ history, ...article }) => article), pages: { ...defaultPages(), ...store.pages }, cms: store.cms?.published || defaultCms() };
}
function passwordHash(password, salt) { return scryptSync(password, salt, 64).toString('hex'); }
function validCredentials(email, password) {
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) throw new CmsError('Indiquez une adresse e-mail valide.');
  if (typeof password !== 'string' || password.length < 12 || password.length > 200) throw new CmsError('Le mot de passe doit contenir entre 12 et 200 caractères.');
}
function createSession(store) {
  const token = randomBytes(32).toString('hex');
  store.sessions = store.sessions.filter(session => session.expires > Date.now()).slice(-9);
  store.sessions.push({ hash: tokenHash(token), expires: Date.now() + 8 * 60 * 60 * 1000 });
  return token;
}
export async function createAccount({ email, password, key }) {
  validCredentials(email, password);
  return transaction(store => {
    if (store.account) throw new CmsError('Le compte administrateur existe déjà.', 409);
    if (typeof key !== 'string' || !key || tokenHash(key) !== tokenHash(store.setupKey)) throw new CmsError('Le lien de création du compte est incorrect.', 403);
    const salt = randomBytes(32).toString('hex');
    store.account = { email: email.trim().toLowerCase(), salt, hash: passwordHash(password, salt) };
    store.setupKey = null;
    return createSession(store);
  });
}
export async function login({ email, password }) {
  // The limit is global for this single-owner site and survives restarts.
  const outcome = await transaction(store => {
    store.attempts = store.attempts.filter(time => time > Date.now() - 15 * 60 * 1000);
    if (store.attempts.length >= 10) return { error: 'Trop de tentatives. Réessayez dans 15 minutes.', status: 429 };
    const account = store.account;
    const candidate = typeof password === 'string' && password.length <= 200 ? passwordHash(password, account?.salt || 'unconfigured') : null;
    if (!account || typeof email !== 'string' || email.trim().toLowerCase() !== account.email || !candidate || !timingSafeEqual(Buffer.from(candidate, 'hex'), Buffer.from(account.hash, 'hex'))) {
      store.attempts.push(Date.now());
      return { error: 'Adresse e-mail ou mot de passe incorrect.', status: 401 };
    }
    store.attempts = [];
    return { token: createSession(store) };
  });
  if (outcome.error) throw new CmsError(outcome.error, outcome.status);
  return outcome.token;
}
function authorized(store, token) {
  return typeof token === 'string' && store.account && store.sessions.some(session => session.expires > Date.now() && session.hash === tokenHash(token));
}
function requireSession(store, token) {
  if (!authorized(store, token)) throw new CmsError('Connectez-vous pour accéder à cet espace.', 401);
}
export async function sessionAccount(token) {
  const store = await readStore();
  return authorized(store, token) ? { email: store.account.email } : null;
}
export async function adminContent(token) {
  const store = await readStore();
  requireSession(store, token);
  return { email: store.account.email, articles: store.articles, deletedArticles: store.deletedArticles || [], pages: { ...defaultPages(), ...store.pages }, cms: store.cms || { draft: defaultCms(), published: defaultCms(), version: 0, history: [], updatedAt: null } };
}
export async function logout(token) {
  return transaction(store => { store.sessions = store.sessions.filter(session => session.hash !== tokenHash(token || '')); });
}
function text(value, name, max, required = true) {
  if (typeof value !== 'string' || value.length > max || (required && !value.trim())) throw new CmsError('Vérifiez le champ « ' + name + ' ».');
  return value.trim();
}
export async function saveArticle(token, input) {
  return transaction(async store => {
    requireSession(store, token);
    if (!input || typeof input !== 'object' || JSON.stringify(input).length > 1500000) throw new CmsError('Article incorrect ou trop volumineux.');
    const title = text(input.title, 'Titre', 200);
    const publishing = input.status === 'published';
    let document;
    try { document=input.document ? await (await import('./journal-html.mjs')).compileJournalDocument(input.document) : null; } catch(error){throw new CmsError(error.message);}
    if(publishing && document?.enabled && !document.plainText)throw new CmsError('Le document HTML doit contenir du texte avant publication.');
    const slug = text(input.slug, 'Adresse de l’article', 120);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new CmsError('L’adresse doit contenir des lettres minuscules, des chiffres et des tirets.');
    if (!['draft', 'published', 'archived'].includes(input.status)) throw new CmsError('Statut incorrect.');
    const previous = input.id ? store.articles.find(article => article.id === input.id) : null;
    if (input.id && !previous) throw new CmsError('Cet article n’existe plus.', 404);
    if (previous && input.updatedAt !== previous.updatedAt) throw new CmsError('L’article a changé dans un autre onglet. Rechargez avant de l’enregistrer.', 409);
    if (store.articles.some(article => article.slug === slug && article.id !== previous?.id)) throw new CmsError('Cette adresse est déjà utilisée par un autre article.', 409);
    const date = text(input.date, 'Date', 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date) throw new CmsError('Date incorrecte.');
    if (!Array.isArray(input.sections) || !input.sections.length || input.sections.length > 40) throw new CmsError('Ajoutez entre 1 et 40 sections.');
    let blockCount = 0;
    const sections = input.sections.map((section, index) => {
      if (!section || !Array.isArray(section.paragraphs) || section.paragraphs.length > 100) throw new CmsError('Section incorrecte.');
      const paragraphs = section.paragraphs.map(value => text(value, 'Texte', 20000, false)).filter(Boolean);
      let blocks;
      try { blocks = validateArticleBlocks(section.blocks, publishing && !document?.enabled, index + 1); } catch (error) { throw new CmsError(error.message); }
      blockCount += blocks.length;
      if (blockCount > 200) throw new CmsError('Un article peut contenir jusqu’à 200 blocs.');
      if (publishing && !document?.enabled && !paragraphs.length && !blocks.length) throw new CmsError('Chaque section doit contenir du texte ou un bloc avant publication.');
      return { id: typeof section.id === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(section.id) ? section.id : 'section-' + (index + 1), heading: text(section.heading, 'Titre de section', 200, publishing && !document?.enabled), paragraphs, blocks };
    });
    let cover;
    try { cover = validateImage(input.cover, publishing); } catch (error) { throw new CmsError(error.message); }
    if (input.tags !== undefined && (!Array.isArray(input.tags) || input.tags.length > 12)) throw new CmsError('Ajoutez au maximum 12 mots-clés.');
    const tags = [...new Set((input.tags || []).map(tag => text(tag, 'Mot-clé', 40, false)).filter(Boolean))];
    let layout;
    try { layout = validateArticleLayout(input.layout); } catch (error) { throw new CmsError(error.message); }
    const now = new Date(Math.max(Date.now(), Date.parse(previous?.updatedAt || '') + 1 || 0)).toISOString();
    const article = { id: previous?.id || randomUUID(), slug, title, summary: text(input.summary, 'Résumé', 1000, publishing), category: text(input.category, 'Rubrique', 100), date, status: input.status, sections, cover, tags, seoTitle: text(input.seoTitle || '', 'Titre SEO', 200, false), seoDescription: text(input.seoDescription || '', 'Description SEO', 500, false), createdAt: previous?.createdAt || now, updatedAt: now };
    article.layout = layout;
    article.document = document;
    if (previous) {
      article.history = [{ title: previous.title, slug: previous.slug, summary: previous.summary, category: previous.category, date: previous.date, status: previous.status, sections: previous.sections, cover: previous.cover || null, tags: previous.tags || [], seoTitle: previous.seoTitle || '', seoDescription: previous.seoDescription || '', updatedAt: previous.updatedAt }, ...(previous.history || [])].slice(0, 10);
      store.articles = store.articles.map(item => item.id === article.id ? article : item);
      article.history[0].layout = previous.layout || validateArticleLayout();
      article.history[0].document = previous.document || null;
    } else store.articles.push(article);
    return article;
  });
}
export async function deleteArticle(token, { id, updatedAt } = {}) {
  return transaction(store => {
    requireSession(store, token);
    const article = store.articles.find(item => item.id === id);
    if (!article) throw new CmsError('Article introuvable.', 404);
    if (article.updatedAt !== updatedAt) throw new CmsError('L’article a changé. Rechargez avant de le supprimer.', 409);
    store.deletedArticles ||= [];
    store.deletedArticles.push({ article, deletedAt: new Date().toISOString() });
    store.articles = store.articles.filter(item => item.id !== id);
    return { id };
  });
}
export async function restoreArticle(token, { id } = {}) {
  return transaction(store => {
    requireSession(store, token);
    const deleted = (store.deletedArticles || []).find(item => item.article.id === id);
    if (!deleted) throw new CmsError('Article supprimé introuvable.', 404);
    if (store.articles.some(item => item.id === id || item.slug === deleted.article.slug)) throw new CmsError('Cette adresse est déjà utilisée. La restauration ne peut pas écraser un autre article.', 409);
    const article = { ...deleted.article, status: 'draft', updatedAt: new Date(Math.max(Date.now(), Date.parse(deleted.article.updatedAt) + 1 || 0)).toISOString() };
    store.articles.push(article);
    store.deletedArticles = store.deletedArticles.filter(item => item.article.id !== id);
    return article;
  });
}
export async function emptyTrash(token, { expected } = {}) {
  return transaction(store => {
    requireSession(store, token);
    if (!Array.isArray(expected) || expected.some(item => !item || typeof item.id !== 'string' || typeof item.updatedAt !== 'string') || new Set(expected.map(item => item.id)).size !== expected.length) {
      throw new CmsError('Confirmation de la corbeille incorrecte.');
    }
    const deleted = store.deletedArticles || [];
    if (deleted.length !== expected.length || deleted.some(item => !expected.some(entry => entry.id === item.article.id && entry.updatedAt === item.article.updatedAt))) {
      throw new CmsError('La corbeille a changé dans un autre onglet. Rechargez avant de la vider.', 409);
    }
    store.deletedArticles = [];
    return { ok: true, removed: deleted.length };
  });
}
export async function savePage(token, { name, values, previous }) {
  return transaction(store => {
    requireSession(store, token);
    if (!pageFields[name] || !values || typeof values !== 'object') throw new CmsError('Page inconnue.');
    const current = store.pages[name] || defaultPages()[name];
    if (JSON.stringify(previous) !== JSON.stringify(current)) throw new CmsError('La page a changé dans un autre onglet. Rechargez avant de l’enregistrer.', 409);
    store.pages[name] = Object.fromEntries(Object.keys(pageFields[name].fields).map(field => [field, text(values[field], pageFields[name].fields[field][0], 20000)]));
    return store.pages[name];
  });
}
export async function saveCms(token, { config, version, publish = false }) {
  return transaction(store => {
    requireSession(store, token);
    const cms = store.cms || { draft: defaultCms(), published: defaultCms(), version: 0, history: [], updatedAt: null };
    if (version !== cms.version) throw new CmsError('Le site a changé dans un autre onglet. Exportez vos modifications, puis rechargez l’éditeur.', 409);
    let validated;
    try { validated = validateConfig(config); } catch (error) { throw new CmsError(error.message); }
    const now = new Date().toISOString();
    const history = publish ? [{ config: cms.published, date: now }, ...cms.history].slice(0, 10) : cms.history;
    store.cms = { draft: validated, published: publish ? validated : cms.published, version: cms.version + 1, history, updatedAt: now, publishedAt: publish ? now : cms.publishedAt || null };
    return store.cms;
  });
}
export async function addMedia(token, buffer, extension) {
  const store = await readStore(); requireSession(store, token);
  const filename = randomUUID() + '.' + extension;
  if (storageMode() === 'supabase') {
    await uploadRemoteMedia(filename, buffer, extension);
    return { src: '/api/media/' + filename };
  }
  const mediaDir = path.join(directory, 'media');
  await mkdir(mediaDir, { recursive: true });
  await writeFile(path.join(mediaDir, filename), buffer);
  return { src: '/api/media/' + filename };
}
export async function getMedia(filename) {
  if (!/^[a-f0-9-]{36}\.(png|jpg|webp|gif)$/.test(filename)) throw new CmsError('Image inconnue.', 404);
  if (storageMode() === 'supabase') return downloadRemoteMedia(filename);
  try { return await readFile(path.join(directory, 'media', filename)); }
  catch (error) { if (error.code === 'ENOENT') throw new CmsError('Image inconnue.', 404); throw error; }
}

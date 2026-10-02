import nextEnv from '@next/env';
import { readFile, readdir, mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { readRemoteStore, supabaseRequest, supabaseConfig, mediaBucket, uploadRemoteMedia, downloadRemoteMedia } from '../lib/cms-supabase.mjs';
import { validateConfig } from '../lib/cms-schema.mjs';
import { defaultCms } from '../lib/cms-defaults.mjs';

nextEnv.loadEnvConfig(process.cwd(), true, { info() {}, error() {} });
const command = process.argv[2] || 'check';
const digest = buffer => createHash('sha256').update(buffer).digest('hex');

async function check() {
  supabaseConfig();
  // Storage API is available even before our database schema is installed.
  const buckets = await supabaseRequest('/storage/v1/bucket');
  console.log('Connexion Supabase et clé serveur : OK.');
  console.log('Bucket cms-media : ' + (buckets.some(bucket => bucket.id === mediaBucket) ? 'présent' : 'à créer avec le SQL'));
  const row = await readRemoteStore();
  console.log(row ? 'Tables CMS : OK, données déjà présentes.' : 'Tables CMS : OK, migration locale à effectuer.');
}

async function migrate() {
  const { url } = supabaseConfig();
  if (process.env.CMS_MIGRATION_PROJECT_URL !== url) throw new Error('Définissez CMS_MIGRATION_PROJECT_URL avec l’URL exacte du projet cible pour confirmer la migration.');
  if (await readRemoteStore()) throw new Error('Le CMS distant contient déjà des données : migration refusée pour éviter un écrasement.');
  const directory = path.resolve(process.env.CMS_DATA_DIR || '.content');
  const filename = path.join(directory, 'content.json');
  const original = await readFile(filename);
  const store = JSON.parse(original.toString());
  if (!store.account?.hash || !store.account?.salt || !Array.isArray(store.articles)) throw new Error('Créez votre compte admin local avant de migrer.');
  if (store.cms) { validateConfig(store.cms.draft); validateConfig(store.cms.published); }
  const backup = path.join(directory, 'backups', 'before-supabase-' + Date.now());
  await mkdir(backup, { recursive: true, mode: 0o700 });
  await copyFile(filename, path.join(backup, 'content.json'));
  const mediaDir = path.join(directory, 'media');
  let files;
  try { files = await readdir(mediaDir); } catch (error) { if (error.code !== 'ENOENT') throw error; files = []; }
  const buckets = await supabaseRequest('/storage/v1/bucket');
  const bucket = buckets.find(item => item.id === mediaBucket);
  if (!bucket || bucket.public || Number(bucket.file_size_limit) !== 8388608) throw new Error('Le bucket cms-media privé et sa limite de 8 Mo doivent être configurés par le SQL.');
  for (const file of files) {
    if (!/^[a-f0-9-]{36}\.(png|jpg|webp|gif)$/.test(file)) throw new Error('Fichier média local non reconnu : migration interrompue.');
    const buffer = await readFile(path.join(mediaDir, file));
    await mkdir(path.join(backup, 'media'), { recursive: true });
    await copyFile(path.join(mediaDir, file), path.join(backup, 'media', file));
    try { await uploadRemoteMedia(file, buffer, file.split('.').pop()); }
    catch (error) {
      // A previous interrupted import may already have uploaded the same file.
      if (digest(await downloadRemoteMedia(file)) !== digest(buffer)) throw error;
    }
    if (digest(await downloadRemoteMedia(file)) !== digest(buffer)) throw new Error('Une image distante diffère de son original local.');
  }
  if (digest(await readFile(filename)) !== digest(original)) throw new Error('Les données locales ont changé pendant la migration. Relancez une fois les éditions arrêtées.');
  // Preserve the existing account, drafts, publications and histories; revoke old sessions.
  const imported = { ...store, sessions: [], attempts: [], cms: store.cms || { draft: defaultCms(), published: defaultCms(), version: 0, history: [], updatedAt: null } };
  await supabaseRequest('/rest/v1/cms_store', { method: 'POST', body: { id: 1, revision: 0, data: imported } });
  const row = await readRemoteStore();
  if (JSON.stringify(row?.data) === undefined || digest(Buffer.from(stable(row.data))) !== digest(Buffer.from(stable(imported)))) throw new Error('Vérification distante échouée. Ne basculez pas le site.');
  console.log('Migration vérifiée : ' + imported.articles.length + ' article(s), ' + files.length + ' image(s).');
  console.log('Compte et contenus conservés. Reconnectez-vous après la bascule.');
  console.log('Originaux et copie avant migration conservés dans .content (hors Git).');
  console.log('Pour activer : CMS_STORAGE=supabase, puis redémarrez le serveur.');
}
function stable(value) {
  if (Array.isArray(value)) return '[' + value.map(stable).join(',') + ']';
  if (value && typeof value === 'object') return '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + stable(value[key])).join(',') + '}';
  return JSON.stringify(value);
}

try {
  if (command === 'check') await check();
  else if (command === 'migrate') await migrate();
  else throw new Error('Commande attendue : check ou migrate.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}

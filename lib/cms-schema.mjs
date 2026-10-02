export const defaultSettings = {
  name: 'Eddy Missoni', brand: 'eddy missoni', tagline: 'DATA & IA · CARNET PERSONNEL',
  email: 'eddymissoni.pro@gmail.com', linkedin: 'https://www.linkedin.com/in/eddy-missoni/', cv: '/cv.pdf',
  contactLabel: 'Échangeons', contactHref: '/contact', footerLabel: 'LES BONNES IDÉES COMMENCENT PAR UN ÉCHANGE.', footerInvite: 'Et si on en parlait ?',
  copyright: 'Site personnel',
  navigation: [{ label: 'Journal', href: '/journal' }, { label: 'Projets', href: '/projets' }, { label: 'Vision', href: '/vision' }, { label: 'À propos', href: '/a-propos' }, { label: 'Le LAB', href: '/lab' }],
  theme: { paper: '#f3f0e8', ink: '#242822', muted: '#64675e', line: '#d3d2c7', accent: '#293fce', dark: '#242922', highlight: '#d4e998', font: 'Arial', serif: 'Georgia', width: 1320, gutter: 64, textScale: 100, radius: 0 },
};
export const componentLabels = { entry: 'Choix d’une expérience', projects: 'Collection de projets', journal: 'Articles du journal', 'journal-preview': 'Derniers articles', 'lab-welcome': 'Première manipulation', 'lab-tool': 'Expérience interactive', 'project-art': 'Aperçu d’une expérience', 'copy-email': 'Copier une adresse' };
export const tags = new Set(['#text','section','header','footer','nav','div','article','aside','h1','h2','h3','h4','h5','h6','p','span','em','strong','b','i','small','a','br','hr','ul','ol','li','dl','dt','dd','blockquote','figure','figcaption','img','details','summary','time','table','thead','tbody','tr','th','td','code','pre']);
export const styleKeys = ['color','backgroundColor','fontSize','fontWeight','textAlign','paddingTop','paddingBottom','paddingLeft','paddingRight','marginTop','marginBottom','gap','maxWidth','borderRadius','borderColor','borderWidth','borderStyle','lineHeight','letterSpacing','display','gridTemplateColumns','alignItems','justifyContent'];
export function safeUrl(value, image = false) {
  if (typeof value !== 'string' || value.length > 2048 || /[\u0000-\u0020\\]/.test(value)) return false;
  if (value.startsWith('/') && !value.startsWith('//')) return true;
  if (!image && /^(#[a-zA-Z0-9_-]+|mailto:[^\s<>]+|tel:[+0-9()-]+)$/.test(value)) return true;
  try { return ['https:', 'http:'].includes(new URL(value).protocol); } catch { return false; }
}
export function editablePath(value) {
  return typeof value === 'string' && (value === '/' || /^\/[a-z0-9-]+(?:\/[a-z0-9-]+)*$/.test(value)) && !/^\/(admin|api|_next|recherche|feed|robots|sitemap)(\/|$)/.test(value) && !/^\/journal\//.test(value) && value.length <= 200;
}
export function validateConfig(config) {
  const fail = message => { throw new Error(message); };
  const string = (value, max = 20000) => typeof value === 'string' && value.length <= max;
  if (!config || typeof config !== 'object' || !config.settings || !config.documents) fail('Configuration incomplète.');
  if (JSON.stringify(config).length > 1800000) fail('La configuration est trop volumineuse.');
  const settings = config.settings;
  for (const key of ['name','brand','tagline','email','linkedin','cv','contactLabel','contactHref','footerLabel','footerInvite','copyright']) if (!string(settings[key], 2000)) fail('Réglage incorrect : ' + key);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email)) fail('Adresse e-mail incorrecte.');
  for (const key of ['linkedin','cv','contactHref']) if (!safeUrl(settings[key])) fail('Lien incorrect : ' + key);
  if (!Array.isArray(settings.navigation) || settings.navigation.length > 12) fail('Le menu peut contenir au maximum 12 liens.');
  for (const item of settings.navigation) if (!string(item.label, 100) || !item.label.trim() || !safeUrl(item.href)) fail('Vérifiez les liens du menu.');
  const theme = settings.theme;
  for (const key of ['paper','ink','muted','line','accent','dark','highlight']) if (!/^#[0-9a-fA-F]{6}$/.test(theme?.[key])) fail('Couleur incorrecte : ' + key);
  if (!['Arial','Helvetica','Verdana','Trebuchet MS','Georgia'].includes(theme.font) || !['Georgia','Palatino Linotype','Times New Roman'].includes(theme.serif)) fail('Police incorrecte.');
  for (const [key, min, max] of [['width',900,1600],['gutter',12,90],['textScale',80,130],['radius',0,24]]) if (!Number.isFinite(theme[key]) || theme[key] < min || theme[key] > max) fail('Réglage de taille incorrect : ' + key);
  const documents = Object.entries(config.documents);
  if (documents.length > 150 || !config.documents['/']) fail('Conservez une page d’accueil ; maximum 150 pages.');
  for (const [path, doc] of documents) {
    if (!editablePath(path) || doc.path !== path || !string(doc.title, 250) || !string(doc.description, 1000) || !Array.isArray(doc.blocks)) fail('Page incorrecte : ' + path);
    let count = 0; const ids = new Set();
    const visit = (node, depth = 0) => {
      if (!node || ++count > 5000 || depth > 25 || typeof node.id !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(node.id) || ids.has(node.id)) fail('Structure de page incorrecte : ' + path);
      ids.add(node.id);
      for (const style of [node.style, node.mobileStyle]) for (const [key, value] of Object.entries(style || {})) {
        if (!styleKeys.includes(key) || !string(value, 100) || /[;{}<>\\]|url\(|expression|@import/i.test(value)) fail('Style incorrect.');
      }
      if (node.type) {
        if (!componentLabels[node.type] || !node.props || JSON.stringify(node.props).length > 200000) fail('Composant incorrect.');
        if (node.type === 'lab-tool' && !['next-token','semantic-space','rag-observatory','classifier-clinic'].includes(node.props.slug)) fail('Expérience inconnue.');
        for (const item of node.props.textOverrides || []) if (!string(item.source) || !string(item.value)) fail('Explication incorrecte.');
        return;
      }
      if (!tags.has(node.tag) || (node.text !== undefined && !string(node.text))) fail('Élément ou texte incorrect.');
      const allowed = ['className','id','href','target','rel','role','title','src','alt','width','height','aria-label','aria-labelledby','aria-current','aria-hidden','dateTime','scope'];
      for (const [key, value] of Object.entries(node.attrs || {})) {
        if (!allowed.includes(key) || !string(value, 3000)) fail('Attribut incorrect.');
        if ((key === 'href' || key === 'src') && !safeUrl(value, key === 'src')) fail('Lien ou image incorrect.');
      }
      for (const child of node.children || []) visit(child, depth + 1);
    };
    for (const node of doc.blocks) visit(node);
  }
  return JSON.parse(JSON.stringify(config));
}
export function themeCss(settings) {
  const t = settings.theme;
  return `:root{--u-paper:${t.paper};--u-ink:${t.ink};--u-muted:${t.muted};--u-line:${t.line};--u-blue:${t.accent};--u-dark:${t.dark};--u-lime:${t.highlight};--u-width:${t.width}px;--u-gutter:clamp(22px,4.4vw,${t.gutter}px);--cms-font:'${t.font}';--cms-serif:'${t.serif}';--cms-scale:${t.textScale / 100};--cms-radius:${t.radius}px}body{font-family:var(--cms-font),sans-serif}.u-wrap em,.u-footer em{font-family:var(--cms-serif),serif}.u-button,.u-entry,.u-example{border-radius:var(--cms-radius)}.cms-page{font-size:calc(16px * var(--cms-scale))}.cms-page h1{zoom:var(--cms-scale)}.cms-page h2{zoom:var(--cms-scale)}`;
}
export function makeBlock(kind, id = 'b' + Date.now().toString(36)) {
  const node = (suffix, tag, text, attrs = {}) => ({ id: id + suffix, tag, attrs, text });
  if (kind === 'image') return { id, tag: 'figure', attrs: { className: 'u-wrap cms-image-block' }, children: [{ id: id + 'img', tag: 'img', attrs: { src: '/icon.svg', alt: 'Ajoutez votre image et son texte alternatif' } }, node('caption', 'figcaption', 'Légende de l’image')] };
  if (kind === 'quote') return { id, tag: 'section', attrs: { className: 'u-wrap cms-quote-block' }, children: [node('quote', 'blockquote', 'Une conviction à partager.'), node('author', 'p', 'Votre signature')] };
  if (kind === 'cta') return { id, tag: 'section', attrs: { className: 'u-wrap cms-added-block' }, children: [node('title', 'h2', 'Pour continuer.'), node('text', 'p', 'Présentez ici la prochaine étape.'), node('link', 'a', 'Découvrir', { href: '/contact', className: 'u-button' })] };
  if (kind === 'projects' || kind === 'journal') return { id, tag: 'section', attrs: { className: 'u-wrap u-content-section' }, children: [{ id: id + 'collection', type: kind, props: {} }] };
  if (kind === 'columns') return { id, tag: 'section', attrs: { className: 'u-wrap u-content-section u-two-col' }, children: [1,2].map(index => ({ id: id + 'col' + index, tag: 'div', attrs: { className: 'u-prose' }, children: [node('heading' + index, 'h2', 'Titre de la colonne ' + index), node('text' + index, 'p', 'Votre texte, votre exemple ou votre réalisation.')] })) };
  return { id, tag: 'section', attrs: { className: 'u-wrap u-prose cms-added-block' }, children: [node('title', 'h2', 'Une nouvelle section.'), node('text', 'p', 'Écrivez ici ce que vous souhaitez partager.')] };
}
export function makePage(path, title, kind = 'page') {
  const id = 'p' + Date.now().toString(36);
  return { path, title, description: '', kind, blocks: [{ id, tag: 'header', attrs: { className: 'u-wrap u-page-intro' }, children: [{ id: id + 'title', tag: 'h1', attrs: {}, text: title }, { id: id + 'intro', tag: 'p', attrs: { className: 'u-page-description' }, text: 'Présentez cette page en quelques lignes.' }] }, makeBlock('text', id + 'body')], updatedAt: null };
}

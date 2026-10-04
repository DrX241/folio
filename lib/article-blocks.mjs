export const blockLabels = { text: 'Texte', image: 'Image', quote: 'Citation', list: 'Liste', table: 'Tableau', diagram: 'Schéma', code: 'Code', html: 'Démo HTML / CSS', callout: 'Encadré' };
export const codeLanguages = ['text', 'html', 'css', 'typescript', 'javascript', 'python', 'sql', 'json', 'bash', 'markdown'];
export function articleUrl(value) {
  if (typeof value !== 'string' || /[\s\x00-\x1f\\]/.test(value)) return false;
  if (/^\/(?!\/)[a-zA-Z0-9/_.,?=&%#~-]*$/.test(value)) return true;
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password; } catch { return false; }
}
function string(value, label, max, required = false) {
  if (typeof value !== 'string' || value.length > max || (required && !value.trim())) throw new Error('Vérifiez « ' + label + ' ».');
  return value.trim();
}
export function validateImage(value, publishing = false) {
  if (!value || !value.src) return null;
  const src = string(value.src, 'Adresse de l’image', 2000, true);
  if (!articleUrl(src)) throw new Error('L’image doit utiliser une URL HTTPS ou un fichier du site.');
  return { src, alt: string(value.alt || '', 'Description de l’image', 500, publishing), caption: string(value.caption || '', 'Légende', 1000) };
}
export function makeArticleBlock(type) {
  const common = { id: globalThis.crypto.randomUUID(), type };
  if (type === 'image') return { ...common, src: '', alt: '', caption: '' };
  if (type === 'quote') return { ...common, text: '', author: '' };
  if (type === 'list') return { ...common, items: [''], ordered: false };
  if (type === 'table') return { ...common, headers: ['Colonne 1', 'Colonne 2'], rows: [['', '']], caption: '' };
  if (type === 'diagram') return { ...common, nodes: ['Entrée', 'Traitement', 'Résultat'], edges: [{ from: 0, to: 1 }, { from: 1, to: 2 }], caption: '' };
  if (type === 'code') return { ...common, language: 'typescript', code: '', caption: '' };
  if (type === 'html') return { ...common, html: '<h2>Votre démonstration</h2>\n<p>Modifiez ce texte et son style.</p>', css: 'body { font-family: sans-serif; padding: 24px; }\nh2 { color: #293fce; }', caption: '', height: 320 };
  if (type === 'callout') return { ...common, title: '', text: '', tone: 'note' };
  return { ...common, type: 'text', text: '' };
}
export function validateArticleBlocks(input = [], publishing = false, section = 0) {
  if (!Array.isArray(input) || input.length > 80) throw new Error('Une section peut contenir jusqu’à 80 blocs.');
  return input.map((block, index) => {
    if (!block || !Object.hasOwn(blockLabels, block.type)) throw new Error('Type de bloc inconnu.');
    const result = { id: typeof block.id === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(block.id) ? block.id : 's' + section + '-b' + (index + 1), type: block.type, presentation: validatePresentation(block.presentation) };
    const caption = () => string(block.caption || '', 'Légende', 1000);
    if (block.type === 'image') {
      const image = validateImage(block, publishing);
      if (publishing && !image) throw new Error('Ajoutez une image au bloc ou retirez-le avant publication.');
      return { ...result, src: '', alt: '', caption: '', ...image };
    }
    if (['text', 'quote', 'callout'].includes(block.type)) {
      if (block.type === 'text' && block.richText) { result.richText = validateRichDocument(block.richText, publishing); result.text = richPlainText(result.richText); }
      else result.text = string(block.text || '', 'Contenu du bloc', 20000, publishing);
      if (block.type === 'quote') result.author = string(block.author || '', 'Auteur de la citation', 300);
      if (block.type === 'callout') { result.title = string(block.title || '', 'Titre de l’encadré', 200); result.tone = block.tone === 'warning' ? 'warning' : 'note'; }
    } else if (block.type === 'list') {
      if (!Array.isArray(block.items) || block.items.length > 100) throw new Error('Liste incorrecte.');
      result.items = block.items.map(item => string(item, 'Élément de liste', 2000)).filter(Boolean);
      if (publishing && !result.items.length) throw new Error('Complétez la liste avant publication.');
      result.ordered = Boolean(block.ordered);
    } else if (block.type === 'code') {
      if (!codeLanguages.includes(block.language)) throw new Error('Langage de code inconnu.');
      string(block.code || '', 'Code', 50000, publishing);
      result.language = block.language; result.code = block.code || ''; result.caption = caption();
    } else if (block.type === 'html') {
      string(block.html || '', 'HTML', 50000, publishing); string(block.css || '', 'CSS', 20000);
      result.html = block.html || ''; result.css = block.css || ''; result.caption = caption(); result.height = Number(block.height || 320);
      if (!Number.isInteger(result.height) || result.height < 180 || result.height > 800) throw new Error('La hauteur de la démo doit être comprise entre 180 et 800 px.');
    } else if (block.type === 'table') {
      if (!Array.isArray(block.headers) || block.headers.length < 1 || block.headers.length > 10 || !Array.isArray(block.rows) || block.rows.length > 50) throw new Error('Le tableau accepte 10 colonnes et 50 lignes maximum.');
      result.headers = block.headers.map(value => string(value, 'Titre de colonne', 300, publishing));
      result.rows = block.rows.map(row => {
        if (!Array.isArray(row) || row.length !== result.headers.length) throw new Error('Chaque ligne doit avoir le même nombre de colonnes.');
        return row.map(value => string(value, 'Cellule', 2000));
      });
      if (publishing && !result.rows.length) throw new Error('Ajoutez une ligne au tableau.');
      result.caption = caption();
    } else if (block.type === 'diagram') {
      if (!Array.isArray(block.nodes) || !block.nodes.length || block.nodes.length > 12 || !Array.isArray(block.edges) || block.edges.length > 30) throw new Error('Schéma limité à 12 étapes et 30 relations.');
      result.nodes = block.nodes.map(value => string(value, 'Étape du schéma', 120, publishing));
      result.edges = block.edges.map(edge => {
        if (!Number.isInteger(edge.from) || !Number.isInteger(edge.to) || edge.from < 0 || edge.to < 0 || edge.from >= result.nodes.length || edge.to >= result.nodes.length || edge.from === edge.to) throw new Error('Relation de schéma incorrecte.');
        return { from: edge.from, to: edge.to };
      });
      result.caption = caption();
    }
    return result;
  });
}
export function articlePlainText(article) {
  if(article.document?.enabled)return article.document.plainText || '';
  return (article.sections || []).flatMap(section => [section.heading, ...(section.paragraphs || []), ...(section.blocks || []).map(block => [block.text, block.caption, block.title, block.author, block.alt, ...(block.items || []), ...(block.nodes || []), ...(block.headers || []), ...(block.rows || []).flat(), block.type === 'code' ? block.code : ''].filter(Boolean).join(' '))]).filter(Boolean).join(' ');
}
import { validateRichDocument, richPlainText, validatePresentation } from './journal-document.mjs';

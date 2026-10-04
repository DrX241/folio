import { articleUrl } from './article-blocks.mjs';

export const alignments = ['left', 'center', 'right', 'justify'];
export function validatePresentation(input = {}) {
  const choose = (key, values, fallback) => {
    if (input[key] === undefined) return fallback;
    if (!values.includes(input[key])) throw new Error('Réglage de mise en page incorrect : ' + key);
    return input[key];
  };
  return { width: choose('width', ['inherit', 'reading', 'wide', 'full'], 'inherit'), align: choose('align', ['inherit', ...alignments], 'inherit'), spacing: choose('spacing', ['compact', 'normal', 'airy'], 'normal') };
}
export function validateArticleLayout(input = {}) {
  const presentation=validatePresentation(input);
  return { ...presentation, width: presentation.width === 'inherit' ? 'reading' : presentation.width, align: presentation.align === 'inherit' ? 'left' : presentation.align, toc: input.toc !== false, cover: ['classic', 'panoramic', 'none'].includes(input.cover) ? input.cover : 'classic' };
}
// Store structured text, never arbitrary executable HTML. Reconstruct every field.
export function validateRichDocument(doc, publishing = false) {
  let count = 0, characters = 0;
  const visit = (node, depth = 0) => {
    if (!node || typeof node !== 'object' || depth > 16 || ++count > 3000) throw new Error('Texte riche trop complexe.');
    const allowed = ['doc','paragraph','heading','text','hardBreak','bulletList','orderedList','listItem','blockquote','horizontalRule','codeBlock'];
    if (!allowed.includes(node.type)) throw new Error('Élément de texte non pris en charge.');
    const result = { type: node.type };
    if (node.type === 'text') {
      if (typeof node.text !== 'string' || !node.text.length) throw new Error('Texte incorrect.');
      characters += node.text.length; result.text = node.text;
      if (characters > 100000) throw new Error('Texte limité à 100 000 caractères par bloc.');
      if (node.marks !== undefined) {
        if (!Array.isArray(node.marks) || node.marks.length > 8) throw new Error('Mise en forme incorrecte.');
        result.marks = node.marks.map(mark => {
          if (!['bold','italic','underline','strike','code','link','highlight'].includes(mark.type)) throw new Error('Mise en forme inconnue.');
          if (mark.type === 'link') {
            if (!articleUrl(mark.attrs?.href)) throw new Error('Le lien doit utiliser HTTPS ou une adresse du site.');
            return { type: 'link', attrs: { href: mark.attrs.href, target: '_blank', rel: 'noopener noreferrer' } };
          }
          return { type: mark.type };
        });
      }
    } else {
      if (node.content !== undefined) {
        if (!Array.isArray(node.content)) throw new Error('Contenu de texte incorrect.');
        const blocks=['paragraph','heading','bulletList','orderedList','blockquote','horizontalRule','codeBlock'];
        const children=node.content.map(child=>child?.type);
        const permitted=node.type==='doc'||node.type==='blockquote'||node.type==='listItem'?blocks:node.type==='bulletList'||node.type==='orderedList'?['listItem']:node.type==='codeBlock'?['text']:node.type==='paragraph'||node.type==='heading'?['text','hardBreak']:[];
        if(children.some(type=>!permitted.includes(type)))throw new Error('Structure du texte incorrecte.');
        if(node.type==='listItem'&&children[0]!=='paragraph')throw new Error('Un élément de liste doit commencer par un paragraphe.');
        result.content = node.content.map(child => visit(child, depth + 1));
      }
      if (['paragraph','heading'].includes(node.type)) {
        result.attrs = {};
        if (node.attrs?.textAlign != null) {
          if (!alignments.includes(node.attrs.textAlign)) throw new Error('Alignement incorrect.');
          result.attrs.textAlign = node.attrs.textAlign;
        }
        if (node.type === 'heading') {
          if (![2,3,4].includes(node.attrs?.level)) throw new Error('Titre incorrect.');
          result.attrs.level = node.attrs.level;
        }
      }
      if (node.type === 'orderedList') result.attrs = { start: Number.isInteger(node.attrs?.start) && node.attrs.start > 0 && node.attrs.start < 10000 ? node.attrs.start : 1 };
      if (node.type === 'codeBlock') result.attrs = { language: null };
    }
    return result;
  };
  if (doc?.type !== 'doc') throw new Error('Document riche incorrect.');
  const result = visit(doc);
  if(!result.content?.length)result.content=[{type:'paragraph',content:[]}];
  if (publishing && !richPlainText(result).trim()) throw new Error('Écrivez du texte avant publication.');
  return result;
}
export function richPlainText(node) {
  return node?.type === 'text' ? node.text : (node?.content || []).map(richPlainText).join(node?.type === 'doc' ? '\n\n' : '');
}
export function legacyDocument(text = '') {
  const inline = value => value.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^\s)]+\))/g).filter(Boolean).map(part => {
    let type, content = part;
    if (part.startsWith('**') && part.endsWith('**')) { type = 'bold'; content = part.slice(2,-2); }
    else if (part.startsWith('*') && part.endsWith('*')) { type = 'italic'; content = part.slice(1,-1); }
    else if (part.startsWith('`') && part.endsWith('`')) { type = 'code'; content = part.slice(1,-1); }
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link && articleUrl(link[2])) return { type: 'text', text: link[1], marks: [{ type: 'link', attrs: { href: link[2] } }] };
    return { type: 'text', text: content, ...(type ? { marks: [{ type }] } : {}) };
  });
  return { type: 'doc', content: text.split(/\n\s*\n/).map(paragraph => ({ type: 'paragraph', content: paragraph.split('\n').flatMap((line, index) => [...(index ? [{ type: 'hardBreak' }] : []), ...inline(line)]) })) };
}
export function studioArticle(article) {
  return { ...article, layout: validateArticleLayout(article.layout), sections: article.sections.map(section => ({ ...section, paragraphs: [], blocks: [...((section.paragraphs || []).filter(Boolean).length ? [{ id: section.id + '-text', type: 'text', text: section.paragraphs.join('\n\n'), richText: legacyDocument(section.paragraphs.join('\n\n')) }] : []), ...(section.blocks || [])].map(block => block.type === 'text' ? { ...block, richText: block.richText || legacyDocument(block.text) } : block) })) };
}

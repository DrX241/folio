/* eslint-disable @next/next/no-img-element */
import { useId } from 'react';
import { articleUrl } from '@/lib/article-blocks.mjs';
import ArticleCode from './ArticleCode';
import RichDocument from './RichDocument';
import JournalDocumentFrame from './JournalDocumentFrame';

export function ArticleInline({ text = '' }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^\s)]+\))/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*')) return <em key={index}>{part.slice(1, -1)}</em>;
    if (part.startsWith('`') && part.endsWith('`')) return <code key={index}>{part.slice(1, -1)}</code>;
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link && articleUrl(link[2])) return <a key={index} href={link[2]} rel="noopener noreferrer">{link[1]}</a>;
    return part;
  });
}
export function ArticleImage({ image, cover = false }) {
  return image?.src && articleUrl(image.src) ? <figure className={cover ? 'journal-cover' : 'journal-image'}><img src={image.src} alt={image.alt || ''} loading={cover ? 'eager' : 'lazy'} referrerPolicy="no-referrer" />{image.caption && <figcaption>{image.caption}</figcaption>}</figure> : null;
}
function Diagram({ block }) {
  const id = useId();
  const nodes = block.nodes || [];
  const description = (block.edges || []).map(edge => nodes[edge.from] + ' vers ' + nodes[edge.to]).join('. ');
  return <figure className="journal-diagram"><svg viewBox={'0 0 600 ' + Math.max(120, nodes.length * 110)} role="img" aria-label={'Schéma. ' + description}>
    <defs><marker id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" /></marker></defs>
    {(block.edges || []).map((edge, index) => {
      const fromY = edge.from * 110 + 46, toY = edge.to * 110 + 46;
      const d = edge.to === edge.from + 1 ? `M300 ${fromY + 36} L300 ${toY - 36}` : `M510 ${fromY} C580 ${fromY} 580 ${toY} 510 ${toY}`;
      return <path key={index} d={d} fill="none" stroke="currentColor" strokeWidth="2" markerEnd={'url(#' + id + ')'} />;
    })}
    {nodes.map((label, index) => {
      const words = label.split(/\s+/); const lines = [''];
      words.forEach(word => { const last = lines.length - 1; if ((lines[last] + word).length > 38 && lines[last]) lines.push(word + ' '); else lines[last] += word + ' '; });
      return <g key={index}><rect x="90" y={index * 110 + 10} width="420" height="72" fill="var(--u-paper)" stroke="var(--u-line)" /><text x="110" y={index * 110 + 50} fontSize="12" fill="var(--u-muted)">{String(index + 1).padStart(2, '0')}</text><text x="310" y={index * 110 + 46 - (lines.length - 1) * 8} textAnchor="middle" fontSize="16" fill="var(--u-ink)">{lines.map((line, position) => <tspan key={position} x="310" dy={position ? 18 : 0}>{line.trim()}</tspan>)}</text></g>;
    })}
  </svg>{block.caption && <figcaption>{block.caption}</figcaption>}</figure>;
}
export function htmlDemoDocument(block) {
  const css = (block.css || '').replace(/<\/style/gi, '<\\/style');
  return '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'none\'; style-src \'unsafe-inline\'; img-src data:; font-src \'none\'; connect-src \'none\'; frame-src \'none\'; object-src \'none\'; base-uri \'none\'; form-action \'none\'"><style>body{margin:0;overflow-wrap:anywhere}img{max-width:100%}' + css + '</style></head><body>' + (block.html || '') + '</body></html>';
}
export function RichBlock({ block }) {
  if (block.type === 'text' && block.richText) return <RichDocument document={block.richText} />;
  if (block.type === 'image') return <ArticleImage image={block} />;
  if (block.type === 'code') return <ArticleCode block={block} />;
  if (block.type === 'diagram') return <Diagram block={block} />;
  if (block.type === 'quote') return <blockquote className="journal-quote"><p><ArticleInline text={block.text} /></p>{block.author && <cite>{block.author}</cite>}</blockquote>;
  if (block.type === 'list') { const List = block.ordered ? 'ol' : 'ul'; return <List className="journal-list">{block.items.map((item, index) => <li key={index}><ArticleInline text={item} /></li>)}</List>; }
  if (block.type === 'table') return <div className="journal-table-scroll" tabIndex={0} role="region" aria-label={block.caption || 'Tableau de l’article'}><table><caption>{block.caption || 'Tableau'}</caption><thead><tr>{block.headers.map((header, index) => <th key={index} scope="col">{header}</th>)}</tr></thead><tbody>{block.rows.map((row, index) => <tr key={index}>{row.map((cell, position) => <td key={position}><ArticleInline text={cell} /></td>)}</tr>)}</tbody></table></div>;
  if (block.type === 'html') return <figure className="journal-demo"><iframe title={block.caption || 'Démonstration HTML et CSS isolée'} sandbox="" referrerPolicy="no-referrer" srcDoc={htmlDemoDocument(block)} height={block.height || 320} loading="lazy" /><figcaption>{block.caption || 'Aperçu HTML / CSS'} · Sans JavaScript, ni accès au site ou à ses données.</figcaption></figure>;
  if (block.type === 'callout') return <aside className={'journal-callout ' + (block.tone === 'warning' ? 'journal-callout-warning' : '')}>{block.title && <strong>{block.title}</strong>}<p><ArticleInline text={block.text} /></p></aside>;
  return (block.text || '').split(/\n\s*\n/).filter(Boolean).map((text, index) => <p key={index}><ArticleInline text={text} /></p>);
}
export default function ArticleContent({ article, preview = false }) {
  if(article.document?.enabled)return <JournalDocumentFrame document={article.document} title={article.title || 'Article HTML'} />;
  const Heading = preview ? 'h3' : 'h2';
  return <div className={'journal-body journal-width-' + (article.layout?.width || 'reading')} style={{textAlign:article.layout?.align || 'left'}}>{(article.sections || []).map((section, index) => <section key={section.id || index} id={section.id || 'section-' + (index + 1)}><Heading>{section.heading || (preview ? 'Titre de section' : '')}</Heading>{(section.paragraphs || []).filter(Boolean).map((text, position) => <p key={position}><ArticleInline text={text} /></p>)}{(section.blocks || []).map((block, position) => <div className={'journal-render-block journal-width-' + ((block.presentation?.width && block.presentation.width !== 'inherit' ? block.presentation.width : article.layout?.width) || 'reading') + ' journal-spacing-' + (block.presentation?.spacing || 'normal')} style={{textAlign:block.presentation?.align !== 'inherit' ? block.presentation?.align : undefined}} key={block.id || position}><RichBlock block={block} /></div>)}</section>)}</div>;
}

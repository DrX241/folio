/* eslint-disable @next/next/no-img-element */
"use client";
import { createElement } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import UniverseArt from './UniverseArt';
import ProjectGrid from './ProjectGrid';
import ProjectArt from './ProjectArt';
import LabWelcome from './lab/LabWelcome';
const LabToolRenderer = dynamic(() => import('./LabToolRenderer'));
import CopyEmail from './CopyEmail';
import { explorations } from '@/lib/explorations';
import { defaultSettings } from '@/lib/cms-schema.mjs';

function JournalCollection({ articles = [], compact = false, props = {} }) {
  const items = compact ? articles.slice(0, Number(props.limit) || 2) : articles;
  return items.length ? <div className={compact ? '' : 'u-results'}>{items.map(article => <Link className={compact ? 'u-journal-entry' : 'cms-journal-card'} key={article.slug} href={'/journal/' + article.slug}>{!compact && article.cover?.src && <img src={article.cover.src} alt="" loading="lazy" referrerPolicy="no-referrer" />}{!compact && <span className="u-label">{article.category} · {article.date}</span>}<h2>{article.title}</h2>{!compact && <p>{article.summary}</p>}</Link>)}</div> : <div className="u-journal-status"><p className="u-label">{props.emptyTitle || 'PREMIÈRES PUBLICATIONS À VENIR'}</p><p>{props.emptyText || 'Aucun article publié pour le moment. Vous pouvez déjà lire ma vision ou explorer les méthodes présentées dans le Lab.'}</p><div className="u-action-row"><Link href="/vision" className="u-link">Lire ma vision ↗</Link><Link href="/lab" className="u-link">Explorer le Lab ↗</Link></div></div>;
}
export default function CmsRenderer({ document, articles = [], projects = [], settings, selected, editing = false }) {
  const mobileRules = [];
  const collectStyles = node => {
    if (node.mobileStyle) mobileRules.push('[data-cms-node="' + node.id + '"]{' + Object.entries(node.mobileStyle).map(([key,value]) => key.replace(/[A-Z]/g, letter => '-' + letter.toLowerCase()) + ':' + value + '!important').join(';') + '}');
    (node.children || []).forEach(collectStyles);
  };
  document.blocks.forEach(collectStyles);
  const render = node => {
    if (!node || node.hidden) return null;
    if (node.tag === '#text') return node.text;
    const props = node.props || {};
    if (node.type) {
      let component;
      if (node.type === 'entry') component = <UniverseArt items={props.items} heading={props.heading} />;
      else if (node.type === 'projects') {
        const items = (props.items || explorations).filter(item => item.slug !== props.exclude);
        component = <><ProjectGrid items={items} headingLevel={props.headingLevel || 3} />{projects.length > 0 && <div className="cms-project-collection">{projects.map(project => <Link className="cms-journal-card" key={project.path} href={project.path}><span className="u-label">RÉALISATION PERSONNELLE</span><h2>{project.title}</h2><p>{project.description}</p></Link>)}</div>}</>;
      } else if (node.type === 'journal') component = <JournalCollection articles={articles} props={props} />;
      else if (node.type === 'journal-preview') component = <JournalCollection articles={articles} compact props={props} />;
      else if (node.type === 'lab-welcome') component = <LabWelcome {...props} />;
      else if (node.type === 'lab-tool') component = <div className="u-wrap ll-workshop-content"><LabToolRenderer slug={props.slug} textOverrides={props.textOverrides} /></div>;
      else if (node.type === 'project-art') component = <ProjectArt motif={props.motif} number={props.number} example={props.example} />;
      else if (node.type === 'copy-email') component = <CopyEmail email={props.email || settings?.email} />;
      return <div key={node.id} data-cms-node={node.id} data-cms-selected={editing && selected === node.id || undefined} className="cms-component" style={node.style}>{component}</div>;
    }
    const attrs = { ...node.attrs, style: node.style, key: node.id, 'data-cms-node': node.id, 'data-cms-grid': node.style?.display === 'grid' || undefined, 'data-cms-selected': editing && selected === node.id || undefined };
    if (settings && attrs.href === 'mailto:' + defaultSettings.email) attrs.href = 'mailto:' + settings.email;
    if (settings && attrs.href === defaultSettings.linkedin) attrs.href = settings.linkedin;
    if (settings && attrs.href === defaultSettings.cv) attrs.href = settings.cv;
    const text = settings && typeof node.text === 'string' ? node.text.replaceAll(defaultSettings.email, settings.email) : node.text;
    if (attrs.target === '_blank') attrs.rel = 'noopener noreferrer';
    if (node.tag === 'img') { attrs.loading = 'lazy'; attrs.alt = attrs.alt || ''; }
    return createElement(node.tag, attrs, ['img','br','hr'].includes(node.tag) ? undefined : node.text !== undefined ? text : (node.children || []).map(render));
  };
  return <div className={'cms-page ' + (document.container?.className || '')}>{mobileRules.length > 0 && <style>{'@media(max-width:800px){' + mobileRules.join('') + '}'}</style>}{document.blocks.map(render)}</div>;
}

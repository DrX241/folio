"use client";
import { useEffect, useState } from 'react';
import CmsRenderer from './CmsRenderer';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import { themeCss } from '@/lib/cms-schema.mjs';

export default function CmsPreview({ initial, articles }) {
  const [state, setState] = useState({ config: initial, path: '/', selected: '', editing: true });
  useEffect(() => {
    document.getElementById("main-content")?.setAttribute("aria-label", "Aperçu du site");
    const receive = event => {
      if (event.origin !== location.origin || event.source !== window.parent || event.data?.type !== 'cms-update') return;
      setState(event.data.state);
    };
    window.addEventListener('message', receive);
    window.parent.postMessage({ type: 'cms-ready' }, location.origin);
    return () => window.removeEventListener('message', receive);
  }, []);
  useEffect(() => {
    if (!state.selected) return;
    const element = document.querySelector('[data-cms-node="' + CSS.escape(state.selected) + '"]');
    const target = element?.classList.contains('cms-component') ? element.firstElementChild : element;
    target?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
  }, [state.selected, state.path]);
  const doc = state.config.documents[state.path];
  const select = event => {
    const element = event.target.closest('[data-cms-node]');
    const link = event.target.closest('a');
    if (state.editing && element) {
      event.preventDefault(); event.stopPropagation();
      window.parent.postMessage({ type: 'cms-select', id: element.dataset.cmsNode }, location.origin);
    } else if (link) {
      event.preventDefault(); event.stopPropagation();
      if (state.config.documents[link.getAttribute('href')]) window.parent.postMessage({ type: 'cms-navigate', path: link.getAttribute('href') }, location.origin);
    }
  };
  if (!doc) return <p>Choisissez une page dans l’éditeur.</p>;
  return <div className="cms-preview-root" onClickCapture={select}>
    <style>{themeCss(state.config.settings)}</style>
    <style>{'body>.u-header,body>.u-footer,body>.u-skip{display:none}body main{padding:0}body{margin:0}.cms-preview-root [data-cms-selected=true]{outline:2px solid var(--u-blue);outline-offset:3px}.cms-preview-root .cms-component[data-cms-selected=true]>:first-child{outline:2px solid var(--u-blue);outline-offset:3px}'}</style>
    <SiteHeader settings={state.config.settings} preview />
    <CmsRenderer document={doc} articles={articles} projects={Object.values(state.config.documents).filter(item => item.kind === 'project' && item.enabled !== false)} settings={state.config.settings} selected={state.selected} editing={state.editing} />
    <SiteFooter settings={state.config.settings} preview />
  </div>;
}

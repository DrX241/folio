"use client";
import { useEffect, useRef, useState } from 'react';
import { componentLabels, editablePath, makeBlock, makePage, validateConfig } from '@/lib/cms-schema.mjs';
import { projectExamples } from "./ProjectArt";
import { explorations } from '@/lib/explorations';

function findNode(nodes, id) {
  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index];
    if (node.id === id) return { node, siblings: nodes, index };
    const nested = node.children && findNode(node.children, id);
    if (nested) return nested;
  }
  return null;
}
function textLeaves(node, found = []) {
  if (node.text !== undefined && node.tag !== 'br') found.push(node);
  for (const child of node.children || []) textLeaves(child, found);
  return found;
}
function label(node) { const sections = { 'u-cover': 'Accueil · introduction', 'u-paths': 'Les entrées dans le site', 'u-dark-statement': 'Votre conviction', 'u-selected': 'Les projets', 'u-journal-preview': 'Le journal', 'u-about-preview': 'Votre présentation', 'll-lobby-hero': 'Introduction du Lab', 'll-pathways': 'Les expériences du Lab', 'll-workshop-intro': 'Introduction de l’expérience' }; const name = Object.entries(sections).find(([key]) => node.attrs?.className?.split(' ').includes(key)); if (name) return name[1]; return componentLabels[node.type] || textLeaves(node).find(item => item.text?.trim())?.text.trim().slice(0, 45) || ({ section: 'Section', div: 'Groupe', img: 'Image', header: 'Introduction', nav: 'Navigation' }[node.tag]) || 'Élément'; }
function outline(nodes, depth = 0, list = []) {
  for (const node of nodes) {
    if (!['#text','br','em','strong','span','small','i','b'].includes(node.tag)) list.push({ node, depth });
    if (depth < 2 && node.children) outline(node.children, depth + 1, list);
  }
  return list;
}
function duplicate(node) {
  const copy = structuredClone(node); const suffix = crypto.randomUUID().slice(0, 8); const anchors = {};
  const walk = item => { item.id = 'c' + crypto.randomUUID().replaceAll('-', '').slice(0, 16); if (item.attrs?.id) { anchors[item.attrs.id] = item.attrs.id + '-' + suffix; item.attrs.id += '-' + suffix; } (item.children || []).forEach(walk); };
  walk(copy);
  const repair = item => { if (item.attrs?.href?.startsWith('#') && anchors[item.attrs.href.slice(1)]) item.attrs.href = '#' + anchors[item.attrs.href.slice(1)]; if (item.attrs?.['aria-labelledby']) item.attrs['aria-labelledby'] = item.attrs['aria-labelledby'].split(' ').map(id => anchors[id] || id).join(' '); (item.children || []).forEach(repair); };
  repair(copy); return copy;
}

export default function CmsStudio({ initial, onDirty, onSaved, onBusy }) {
  const [config, setConfig] = useState(() => structuredClone(initial.draft));
  const [version, setVersion] = useState(initial.version);
  const [history, setHistory] = useState(initial.history);
  const [path, setPath] = useState('/');
  const [selected, setSelected] = useState('');
  const [panel, setPanel] = useState('element');
  const [device, setDevice] = useState(1200);
  const [styleDevice, setStyleDevice] = useState('desktop');
  const [editing, setEditing] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);
  const [addKind, setAddKind] = useState('text');
  const [newPage, setNewPage] = useState(null);
  const [available, setAvailable] = useState(800);
  const iframe = useRef(null); const canvas = useRef(null);
  const doc = config.documents[path];
  const found = findNode(doc?.blocks || [], selected);
  const node = found?.node;
  const selectionStyle = node?.[styleDevice === 'mobile' ? 'mobileStyle' : 'style'] || {};
  const state = { config, path, selected, editing };
  const current = useRef(state); current.current = state;
  const send = () => iframe.current?.contentWindow?.postMessage({ type: 'cms-update', state: current.current }, window.location.origin);
  useEffect(() => { onDirty(dirty); }, [dirty, onDirty]);
  useEffect(() => { onBusy?.(busy); }, [busy, onBusy]);
  useEffect(() => {
    const receive = event => {
      if (event.origin !== location.origin || event.source !== iframe.current?.contentWindow) return;
      if (event.data?.type === 'cms-ready') send();
      if (event.data?.type === 'cms-select') { setSelected(event.data.id); setPanel('element'); }
      if (event.data?.type === 'cms-navigate' && current.current.config.documents[event.data.path]) { setPath(event.data.path); setSelected(''); }
    };
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, []);
  useEffect(() => { const timer = setTimeout(send, 60); return () => clearTimeout(timer); }, [config, path, selected, editing]);
  useEffect(() => {
    const observer = new ResizeObserver(entries => setAvailable(Math.max(280, entries[0].contentRect.width - 24)));
    if (canvas.current) observer.observe(canvas.current);
    return () => observer.disconnect();
  }, []);
  const change = callback => {
    setPast(items => [...items.slice(-29), config]); setFuture([]);
    const next = structuredClone(config); callback(next); setConfig(next); setDirty(true); setMessage('');
  };
  const updateNode = callback => change(next => { const target = findNode(next.documents[path].blocks, selected); if (target) callback(target.node, target); });
  const updateStyle = (key, value) => updateNode(target => {
    const field = styleDevice === 'mobile' ? 'mobileStyle' : 'style'; target[field] ||= {};
    if (value) target[field][key] = value; else delete target[field][key];
  });
  const undo = () => { if (!past.length) return; const previous = past[past.length - 1]; setFuture(items => [config, ...items]); setConfig(previous); if (!previous.documents[path]) { setPath('/'); setSelected(''); } setPast(items => items.slice(0, -1)); setDirty(true); };
  const redo = () => { if (!future.length) return; const next = future[0]; setPast(items => [...items, config]); setConfig(next); if (!next.documents[path]) { setPath('/'); setSelected(''); } setFuture(items => items.slice(1)); setDirty(true); };
  const persist = async publish => {
    if (publish && !window.confirm('Publier les pages et les réglages de ce brouillon sur le site ?')) return;
    setBusy(true); setError(''); setMessage('');
    try {
      const response = await fetch('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'cms', config, version, publish }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error);
      setVersion(result.version); setHistory(result.history); setDirty(false); onSaved(result);
      setMessage(publish ? 'Le site a été publié. Les pages publiques sont à jour.' : 'Brouillon enregistré. Le site public reste inchangé.');
    } catch (failure) { setError(failure.message || 'Enregistrement impossible. Vos modifications restent dans l’éditeur.'); }
    finally { setBusy(false); }
  };
  const move = direction => updateNode((target, position) => { const other = position.index + direction; if (other >= 0 && other < position.siblings.length) [position.siblings[other], position.siblings[position.index]] = [position.siblings[position.index], position.siblings[other]]; });
  const add = () => { const block = makeBlock(addKind, 'b' + crypto.randomUUID().replaceAll('-', '').slice(0, 16)); change(next => next.documents[path].blocks.push(block)); setSelected(block.id); setPanel('element'); };
  const upload = async file => {
    if (!file) return;
    setBusy(true); setError('');
    try { const form = new FormData(); form.append('file', file); const response = await fetch('/api/admin/media', { method: 'POST', body: form }); const result = await response.json(); if (!response.ok) throw new Error(result.error); updateNode(target => { target.attrs ||= {}; target.attrs.src = result.src; }); }
    catch (failure) { setError(failure.message); } finally { setBusy(false); }
  };
  const field = (label, value, onChange, multiline = false) => <label className="studio-field">{label}{multiline ? <textarea aria-label={label} rows={4} value={value ?? ''} onChange={event => onChange(event.target.value)} /> : <input aria-label={label} value={value ?? ''} onChange={event => onChange(event.target.value)} />}</label>;
  const globalField = (key, label) => field(label, config.settings[key], value => change(next => { next.settings[key] = value; }));
  const exportDraft = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const link = window.document.createElement('a'); link.href = url; link.download = 'eddy-missoni-brouillon.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const importDraft = async file => {
    if (!file) return;
    try { if (file.size > 2 * 1024 * 1024) throw new Error('Le fichier dépasse 2 Mo.'); const imported = validateConfig(JSON.parse(await file.text())); if (!window.confirm('Charger ces pages et ces réglages dans le brouillon ? Le site public restera inchangé.')) return; change(next => Object.assign(next, imported)); setPath('/'); setSelected(''); setError(''); }
    catch (failure) { setError(failure.message || 'Fichier incorrect.'); }
  };
  const scale = Math.min(1, available / device);
  return <section className="cms-studio" aria-label="Éditeur visuel du site">
    <header className="studio-toolbar"><div><span className="u-label">ÉDITEUR VISUEL</span><p>{dirty ? 'Modifications non enregistrées' : 'Brouillon enregistré'} · version {version}</p></div><div className="studio-toolbar-actions"><button disabled={!past.length || busy} onClick={undo}>Annuler</button><button disabled={!future.length || busy} onClick={redo}>Rétablir</button><button disabled={busy} onClick={() => persist(false)}>Enregistrer le brouillon</button><button className="studio-publish" disabled={busy} onClick={() => persist(true)}>{busy ? 'Enregistrement…' : 'Publier le site'}</button></div></header>
    {error && <p role="alert" className="admin-error">{error}</p>}{message && <p role="status" className="admin-success">{message}</p>}
    <div className="studio-layout"><aside className="studio-sidebar"><fieldset className="studio-controls" disabled={busy}><label className="studio-field">Page à modifier<select aria-label="Page à modifier" value={path} onChange={event => { setPath(event.target.value); setSelected(config.documents[event.target.value].blocks[0]?.id || ''); }}>{Object.values(config.documents).map(item => <option key={item.path} value={item.path}>{item.path === '/' ? 'Accueil' : item.path} {item.enabled === false ? '(masquée)' : ''}</option>)}</select></label><button className="studio-add-page" onClick={() => setNewPage({ title: '', path: '/nouvelle-page', kind: 'page' })}>Créer une page ou une réalisation</button>
      {newPage && <div className="studio-new-page">{field('Titre de la nouvelle page', newPage.title, title => setNewPage({ ...newPage, title }))}{field('Adresse de la nouvelle page', newPage.path, path => setNewPage({ ...newPage, path }))}<label className="studio-field">Type de page<select aria-label="Type de page" value={newPage.kind} onChange={event => setNewPage({ ...newPage, kind: event.target.value })}><option value="page">Page libre</option><option value="project">Réalisation (apparaît dans les projets)</option></select></label><button onClick={() => { if (!editablePath(newPage.path) || config.documents[newPage.path] || !newPage.title.trim()) { setError('Choisissez un titre et une adresse disponible, par exemple /projets/mon-projet.'); return; } const created = makePage(newPage.path, newPage.title, newPage.kind); change(next => { next.documents[created.path] = created; }); setPath(created.path); setSelected(created.blocks[0].id); setNewPage(null); setError(''); }}>Créer cette page</button><button onClick={() => setNewPage(null)}>Fermer</button></div>}
      <div className="studio-panel-tabs" role="group" aria-label="Réglages à afficher">{[['element','Élément'],['page','Page'],['global','Identité']].map(([value, text]) => <button key={value} aria-pressed={panel === value} onClick={() => setPanel(value)}>{text}</button>)}</div>
      {panel === 'element' && <>
        <details className="studio-outline" open><summary>Structure de la page</summary><div>{outline(doc.blocks).map(({ node: item, depth }) => <button key={item.id} aria-pressed={selected === item.id} onClick={() => setSelected(item.id)} style={{ paddingLeft: 12 + depth * 14 }}><span>{item.hidden ? 'Masqué · ' : ''}{label(item)}</span></button>)}</div></details>
        <div className="studio-add-block"><label className="studio-field">Nouvelle brique<select aria-label="Nouvelle brique" value={addKind} onChange={event => setAddKind(event.target.value)}><option value="text">Texte et titre</option><option value="columns">Deux colonnes</option><option value="image">Image et légende</option><option value="quote">Citation</option><option value="cta">Appel à l’action</option><option value="projects">Collection de projets</option><option value="journal">Articles du journal</option></select></label><button onClick={add}>Ajouter une section</button></div>
        {node ? <div className="studio-inspector"><h2>{label(node)}</h2><div className="studio-node-actions"><button onClick={() => move(-1)}>Monter</button><button onClick={() => move(1)}>Descendre</button><button onClick={() => { const copy = duplicate(node); updateNode((_, location) => location.siblings.splice(location.index + 1, 0, copy)); setSelected(copy.id); }}>Dupliquer</button><button onClick={() => updateNode(target => { target.hidden = !target.hidden; })}>{node.hidden ? 'Afficher' : 'Masquer'}</button><button onClick={() => { if (window.confirm('Retirer cet élément du brouillon ? Vous pourrez annuler cette action.')) { updateNode((_, location) => location.siblings.splice(location.index, 1)); setSelected(''); } }}>Retirer</button></div>
          {textLeaves(node).slice(0, 45).map((leaf, index) => <div key={leaf.id}>{field('Texte ' + (index + 1), leaf.text, value => change(next => { findNode(next.documents[path].blocks, leaf.id).node.text = value; }), true)}</div>)}
          {node.tag === 'a' && <>{field('Destination du lien', node.attrs?.href, value => updateNode(target => { target.attrs ||= {}; target.attrs.href = value; }))}<label className="studio-field">Présentation du lien<select aria-label="Présentation du lien" value={node.attrs?.className === 'u-button' ? 'button' : 'link'} onChange={event => updateNode(target => { target.attrs.className = event.target.value === 'button' ? 'u-button' : 'u-link'; })}><option value="link">Lien discret</option><option value="button">Bouton plein</option></select></label></>}
          {node.tag === 'img' && <>{field('Adresse de l’image', node.attrs?.src, value => updateNode(target => { target.attrs ||= {}; target.attrs.src = value; }))}{field('Texte alternatif', node.attrs?.alt, value => updateNode(target => { target.attrs.alt = value; }))}<label className="studio-field">Importer une image<input aria-label="Importer une image" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={event => upload(event.target.files?.[0])} /><small>PNG, JPEG, WebP ou GIF · 8 Mo maximum</small></label></>}
          {node.type && <div className="studio-component-fields">
            {['journal','journal-preview'].includes(node.type) && <>{field('Titre en l’absence d’articles', node.props.emptyTitle || 'PREMIÈRES PUBLICATIONS À VENIR', value => updateNode(target => { target.props.emptyTitle = value; }))}{field('Texte en l’absence d’articles', node.props.emptyText || 'Aucun article publié pour le moment. Vous pouvez déjà lire ma vision ou explorer les méthodes présentées dans le Lab.', value => updateNode(target => { target.props.emptyText = value; }), true)}</>}
            {node.type === 'copy-email' && field('Adresse à copier', node.props.email || config.settings.email, value => updateNode(target => { target.props.email = value; }))}
            {node.type === 'entry' && field('Titre du choix d’expérience', node.props.heading || 'UNE QUESTION POUR COMMENCER', value => updateNode(target => { target.props.heading = value; }))}
            {['entry','projects'].includes(node.type) && (node.props.items || explorations).map((item, index) => <details key={item.slug}><summary>{item.name}</summary>{['name','title','description','takeaway'].map(key => field(({ name:'Nom',title:'Titre',description:'Présentation',takeaway:'À comprendre' })[key] + ' — expérience ' + (index + 1), item[key] || '', value => updateNode(target => { target.props.items ||= structuredClone(explorations); target.props.items[index][key] = value; }), true))}</details>)}
            {node.type === 'lab-tool' && <><p className="studio-help">Les textes ci-dessous accompagnent la manipulation. Les calculs, les données et les résultats restent interactifs.</p>{(node.props.textOverrides || []).map((item, index) => <div key={index}>{field('Explication ' + (index + 1), item.value, value => updateNode(target => { target.props.textOverrides[index].value = value; }), true)}</div>)}</>}
            {node.type === 'lab-welcome' && [['heading','Repère du Lab','UNE PREMIÈRE MANIPULATION'],['intro','Explication courte','La même phrase peut avoir plusieurs suites.'],['wakeLabel','Premier contexte','Au réveil'],['tripLabel','Second contexte','Sur le trajet'],['drawLabel','Bouton de tirage','Tirer un mot au hasard'],['linkLabel','Lien vers le parcours','Explorer comment une IA écrit']].map(([key,title,fallback]) => field(title, node.props[key] || fallback, value => updateNode(target => { target.props[key] = value; })))}
            {node.type === 'project-art' && (() => { const example = node.props.example || projectExamples[node.props.motif]; return example ? <>{['title','note'].map(key => field(key === 'title' ? 'Titre de l’aperçu' : 'Limite à comprendre', example[key], value => updateNode(target => { target.props.example ||= structuredClone(example); target.props.example[key] = value; }), true))}{example.steps.map(([label,text],index) => <div key={index}>{field('Repère ' + (index + 1), label, value => updateNode(target => { target.props.example ||= structuredClone(example); target.props.example.steps[index][0] = value; }))}{field('Exemple ' + (index + 1), text, value => updateNode(target => { target.props.example ||= structuredClone(example); target.props.example.steps[index][1] = value; }))}</div>)}</> : null; })()}
            {['lab-welcome','project-art'].includes(node.type) && <p className="studio-help">Les textes expliquent l’expérience ; ils ne changent pas les calculs de la démonstration.</p>}
          </div>}
          {!node.type && <details className="studio-style" open><summary>Apparence de cet élément</summary><div className="studio-style-device"><button aria-pressed={styleDevice === 'desktop'} onClick={() => setStyleDevice('desktop')}>Ordinateur</button><button aria-pressed={styleDevice === 'mobile'} onClick={() => { setStyleDevice('mobile'); setDevice(390); }}>Mobile</button></div><div className="studio-color-grid">{[['color','Texte'],['backgroundColor','Fond']].map(([key, title]) => <label key={key}>{title}<input type="color" aria-label={title} value={/^#[0-9a-f]{6}$/i.test(selectionStyle[key] || '') ? selectionStyle[key] : config.settings.theme[key === 'color' ? 'ink' : 'paper']} onChange={event => updateStyle(key, event.target.value)} /><button onClick={() => updateStyle(key, '')}>Réinitialiser</button></label>)}</div>{[['fontSize','Taille du texte'],['paddingTop','Espace intérieur haut'],['paddingBottom','Espace intérieur bas'],['paddingLeft','Espace intérieur gauche'],['paddingRight','Espace intérieur droit'],['marginTop','Espace au-dessus'],['marginBottom','Espace en dessous'],['gap','Espacement entre éléments'],['borderRadius','Arrondi']].map(([key, title]) => <label className="studio-field" key={key}>{title} (px)<input type="number" min="0" max="400" placeholder="Valeur du design" value={selectionStyle[key]?.replace('px','') || ''} onChange={event => updateStyle(key, event.target.value ? event.target.value + 'px' : '')} /></label>)}<label className="studio-field">Alignement du texte<select aria-label="Alignement du texte" value={selectionStyle.textAlign || ''} onChange={event => updateStyle('textAlign', event.target.value)}><option value="">Design actuel</option><option value="left">Gauche</option><option value="center">Centre</option><option value="right">Droite</option></select></label>{['section','div','article','header'].includes(node.tag) && <label className="studio-field">Organisation<select aria-label="Organisation" value={selectionStyle.gridTemplateColumns || ''} onChange={event => { updateNode(target => { const field = styleDevice === 'mobile' ? 'mobileStyle' : 'style'; target[field] ||= {}; if (event.target.value) { target[field].display = 'grid'; target[field].gridTemplateColumns = event.target.value; } else { delete target[field].display; delete target[field].gridTemplateColumns; } }); }}><option value="">Design actuel</option><option value="1fr">Une colonne</option><option value="repeat(2,minmax(0,1fr))">Deux colonnes</option><option value="repeat(3,minmax(0,1fr))">Trois colonnes</option></select></label>}</details>}
        </div> : <p className="studio-help">Cliquez sur un élément de l’aperçu pour le modifier.</p>}
      </>}
      {panel === 'page' && <div className="studio-page-fields">{field('Titre pour les moteurs de recherche', doc.title, value => change(next => { next.documents[path].title = value; }))}{field('Description de la page', doc.description, value => change(next => { next.documents[path].description = value; }), true)}<label className="studio-field">Visibilité<select aria-label="Visibilité de la page" value={doc.enabled === false ? 'hidden' : 'visible'} onChange={event => change(next => { next.documents[path].enabled = event.target.value === 'visible'; })}><option value="visible">Page visible après publication</option><option value="hidden">Page masquée après publication</option></select></label><p className="studio-help">Adresse : {path}</p><button onClick={exportDraft}>Exporter ce brouillon</button><label className="studio-field">Importer un brouillon<input type="file" accept="application/json,.json" onChange={event => importDraft(event.target.files?.[0])} /></label><details><summary>Revenir à une publication précédente</summary><p className="studio-help">La version choisie sera chargée dans le brouillon. Elle ne sera pas publiée automatiquement.</p>{history.length ? history.map((revision, index) => <button className="studio-revision" key={index} onClick={() => { if (window.confirm('Charger cette ancienne publication dans le brouillon ?')) { change(next => { Object.assign(next, structuredClone(revision.config)); }); setSelected(''); if (!revision.config.documents[path]) setPath('/'); } }}>{new Date(revision.date).toLocaleString('fr-FR')}</button>) : <p className="studio-help">L’historique commence à la première publication.</p>}</details></div>}
      {panel === 'global' && <div className="studio-global-fields"><h2>Identité & navigation</h2>{[['name','Votre nom'],['brand','Signature du site'],['tagline','Sous-titre de la signature'],['email','Adresse e-mail'],['linkedin','Lien LinkedIn'],['cv','Lien du CV'],['contactLabel','Texte du bouton de contact'],['contactHref','Destination du bouton de contact'],['footerLabel','Introduction du pied de page'],['footerInvite','Invitation du pied de page'],['copyright','Mention sous la signature']].map(([key,title]) => <div key={key}>{globalField(key,title)}</div>)}<h3>Menu du site</h3>{config.settings.navigation.map((item,index) => <fieldset key={index}><legend>Lien {index + 1}</legend>{field('Nom du lien ' + (index + 1), item.label, value => change(next => { next.settings.navigation[index].label = value; }))}{field('Adresse du lien ' + (index + 1), item.href, value => change(next => { next.settings.navigation[index].href = value; }))}<div className="studio-node-actions">{index > 0 && <button onClick={() => change(next => { const menu=next.settings.navigation; [menu[index-1],menu[index]]=[menu[index],menu[index-1]]; })}>Monter</button>}<button onClick={() => change(next => next.settings.navigation.splice(index,1))}>Retirer</button></div></fieldset>)}<button onClick={() => change(next => next.settings.navigation.push({label:'Nouveau lien',href:path}))}>Ajouter un lien au menu</button><h3>Palette & typographie</h3><div className="studio-color-grid">{[['paper','Papier'],['ink','Encre'],['muted','Texte secondaire'],['line','Séparateurs'],['accent','Accent'],['dark','Sections sombres'],['highlight','Accent clair']].map(([key,title]) => <label key={key}>{title}<input type="color" value={config.settings.theme[key]} onChange={event => change(next => { next.settings.theme[key]=event.target.value; })} /><small>{config.settings.theme[key]}</small></label>)}</div>{[['font','Police principale',['Arial','Helvetica','Verdana','Trebuchet MS','Georgia']],['serif','Police des textes en italique',['Georgia','Palatino Linotype','Times New Roman']]].map(([key,title,options]) => <label className="studio-field" key={key}>{title}<select aria-label={title} value={config.settings.theme[key]} onChange={event => change(next => { next.settings.theme[key]=event.target.value; })}>{options.map(font => <option key={font}>{font}</option>)}</select></label>)}{[['width','Largeur maximale',900,1600],['gutter','Marges latérales',12,90],['textScale','Échelle des titres (%)',80,130],['radius','Arrondi des briques',0,24]].map(([key,title,min,max]) => <label className="studio-field" key={key}>{title} · {config.settings.theme[key]}<input type="range" min={min} max={max} value={config.settings.theme[key]} onChange={event => change(next => { next.settings.theme[key]=Number(event.target.value); })} /></label>)}</div>}
      </fieldset></aside><div className="studio-preview-panel"><div className="studio-preview-toolbar"><div className="studio-devices" role="group" aria-label="Format de l’aperçu">{[[1200,'Ordinateur'],[768,'Tablette'],[390,'Mobile']].map(([width,label]) => <button key={width} aria-pressed={device === width} onClick={() => setDevice(width)}>{label}</button>)}</div><button aria-pressed={editing} onClick={() => setEditing(!editing)}>{editing ? 'Sélectionner les éléments' : 'Tester les interactions'}</button></div><p className="studio-help">{editing ? 'Cliquez sur un texte, un lien ou une image pour le modifier. L’aperçu suit vos changements.' : 'Vous pouvez utiliser les boutons et les expériences comme un visiteur.'}</p><div className="studio-canvas" ref={canvas} tabIndex={0} aria-label="Zone de prévisualisation"><div className="studio-iframe-wrap" style={{ width: device * scale, height: 1000 * scale }}><iframe ref={iframe} src="/admin/preview" title="Aperçu du site en direct" style={{ width: device, height: 1000, transform: `scale(${scale})` }} /></div></div></div></div>
  </section>;
}

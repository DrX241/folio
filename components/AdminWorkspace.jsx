"use client";

import CmsStudio from "./CmsStudio";
import Link from 'next/link';
import { useEffect, useState } from 'react';

const slugify = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 120);
const statusLabel = { draft: 'Brouillon', published: 'Publié', archived: 'Archivé' };
function blankArticle() { return { title: '', slug: '', summary: '', category: 'Réflexion', date: new Date().toLocaleDateString('en-CA'), status: 'draft', sections: [{ heading: '', paragraphs: [''] }] }; }
async function request(body) {
  const response = await fetch('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error);
  return result;
}

export default function AdminWorkspace({ initial, configured, setupKey = '' }) {
  const [data, setData] = useState(initial);
  const [auth, setAuth] = useState({ email: '', password: '', key: setupKey });
  const [view, setView] = useState('journal');
  const [article, setArticle] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(false);
  useEffect(() => {
    const guard = event => { if (dirty) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, [dirty]);
  const canLeave = () => !dirty || window.confirm('Des modifications ne sont pas enregistrées. Les abandonner ?');
  const run = async work => {
    setBusy(true); setError(''); setMessage('');
    try { await work(); } catch (failure) { setError(failure.message || 'Connexion impossible. Réessayez.'); }
    finally { setBusy(false); }
  };
  const enter = event => {
    event.preventDefault();
    run(async () => {
      await request({ action: configured ? 'login' : 'setup', ...auth });
      window.location.replace('/admin');
    });
  };
  const openArticle = value => {
    if (!canLeave()) return;
    setArticle(structuredClone(value)); setDirty(false); setPreview(false); setMessage(''); setError('');
  };
  const updateArticle = (key, value) => { setArticle(current => ({ ...current, [key]: value })); setDirty(true); };
  const editSection = (index, key, value) => updateArticle('sections', article.sections.map((section, position) => position === index ? { ...section, [key]: value } : section));
  const save = status => run(async () => {
    const saved = await request({ action: 'article', article: { ...article, status } });
    setArticle(saved); setDirty(false);
    setData(current => ({ ...current, articles: [...current.articles.filter(item => item.id !== saved.id), saved] }));
    setMessage(status === 'published' ? 'Article publié. Il est maintenant visible dans le journal.' : status === 'archived' ? 'Article archivé. Il est retiré du journal.' : 'Brouillon enregistré. Il reste privé.');
  });
  const switchView = next => {
    if (busy || !canLeave()) return;
    setView(next); setArticle(null); setDirty(false); setError(''); setMessage('');
  };

  if (!data) return <section className="admin-login u-wrap">
    <p className="u-label">ESPACE PERSONNEL</p><h1>{configured ? 'Se connecter.' : 'Créer votre compte.'}</h1>
    <p>{configured ? 'Écrivez dans votre journal et mettez vos pages à jour.' : 'Choisissez votre adresse e-mail et votre mot de passe. Ce compte est réservé à l’administration du site.'}</p>
    <form onSubmit={enter} className="admin-form">
      {!configured && <label>Clé de création du compte<input name="key" required value={auth.key} autoComplete="off" onChange={event => setAuth({ ...auth, key: event.target.value })} /><small>Le lien de première connexion fourni avec le site remplit ce champ.</small></label>}
      <label>Adresse e-mail<input type="email" name="email" required maxLength={200} autoComplete="username" value={auth.email} onChange={event => setAuth({ ...auth, email: event.target.value })} /></label>
      <label>Mot de passe<input aria-label="Mot de passe" type="password" name="password" required minLength={configured ? 1 : 12} maxLength={200} autoComplete={configured ? 'current-password' : 'new-password'} value={auth.password} onChange={event => setAuth({ ...auth, password: event.target.value })} />{!configured && <small>Au moins 12 caractères. Utilisez un mot de passe unique.</small>}</label>
      {error && <p role="alert" className="admin-error">{error}</p>}
      <button className="u-button" disabled={busy}>{busy ? 'Connexion…' : configured ? 'Se connecter' : 'Créer mon compte'}</button>
    </form>
  </section>;

  return <div className="admin-workspace u-wrap">
    <header className="admin-top"><div><p className="u-label">ADMINISTRATION · {data.email}</p><h1>Votre espace d’écriture.</h1></div><div className="u-action-row"><Link className="u-link" href="/" target="_blank" rel="noopener">Voir le site ↗</Link><button className="admin-text-button" disabled={busy} onClick={() => { if (canLeave()) run(async () => { await request({ action: 'logout' }); window.location.reload(); }); }}>Se déconnecter</button></div></header>
    <nav className="admin-tabs" aria-label="Sections de l’administration"><button aria-current={view === 'journal' ? 'page' : undefined} onClick={() => switchView('journal')}>Journal</button><button aria-current={view === 'pages' ? 'page' : undefined} onClick={() => switchView('pages')}>Éditeur visuel</button><a href="/api/admin" download="eddy-missoni-contenus.json">Exporter mes contenus</a></nav>
    {error && <p role="alert" className="admin-error">{error}</p>}{message && <p role="status" className="admin-success">{message}</p>}
    {view === 'journal' && <div className="admin-columns"><aside className="admin-library"><button className="u-button" disabled={busy} onClick={() => openArticle(blankArticle())}>Nouvel article <span aria-hidden="true">+</span></button><p className="admin-help">Les brouillons et les archives sont visibles uniquement ici.</p>{data.articles.length ? [...data.articles].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).map(item => <button className="admin-article-item" key={item.id} aria-pressed={article?.id === item.id} disabled={busy} onClick={() => openArticle(item)}><span>{statusLabel[item.status]} · {item.date}</span><strong>{item.title}</strong></button>) : <p className="admin-help">Votre premier article commence ici.</p>}</aside>
      {!article ? <section className="admin-empty"><h2>Une idée à partager ?</h2><p>Créez un article, écrivez par sections, puis prévisualisez votre texte avant de le publier.</p></section> : <section className="admin-editor" aria-label="Éditeur d’article">
        <div className="admin-editor-top"><p className="u-label">{statusLabel[article.status]} · {dirty ? 'MODIFICATIONS NON ENREGISTRÉES' : article.id ? 'ENREGISTRÉ' : 'NOUVEL ARTICLE'}</p><button type="button" className="admin-text-button" onClick={() => setPreview(!preview)}>{preview ? 'Revenir à l’écriture' : 'Prévisualiser'}</button></div>
        {preview ? <div className="admin-preview"><p className="u-label">APERÇU · {article.category}</p><h2>{article.title || 'Titre de votre article'}</h2><p className="admin-summary">{article.summary}</p><article className="u-prose">{article.sections.map((section, index) => <section key={index}><h3>{section.heading || 'Titre de section'}</h3>{section.paragraphs.filter(Boolean).map((paragraph, position) => <p key={position}>{paragraph}</p>)}</section>)}</article></div> : <fieldset disabled={busy} className="admin-form admin-edit-fields">
          <label>Titre de l’article<input value={article.title} maxLength={200} onChange={event => { const title = event.target.value; setArticle(current => ({ ...current, title, slug: !current.id && current.slug === slugify(current.title) ? slugify(title) : current.slug })); setDirty(true); }} /></label>
          <div className="admin-field-row"><label>Rubrique<input value={article.category} maxLength={100} onChange={event => updateArticle('category', event.target.value)} /></label><label>Date de publication<input type="date" value={article.date} onChange={event => updateArticle('date', event.target.value)} /></label></div>
          <label>Résumé<textarea aria-label="Résumé" rows={3} value={article.summary} maxLength={1000} onChange={event => updateArticle('summary', event.target.value)} /><small>Ce texte présente l’article dans le journal et les résultats de recherche.</small></label>
          <label>Adresse de l’article<input aria-label="Adresse de l’article" value={article.slug} maxLength={120} onChange={event => updateArticle('slug', event.target.value)} /><small>/journal/{article.slug || 'titre-de-votre-article'}{article.status === 'published' && ' — Changer cette adresse modifie le lien public.'}</small></label>
          {article.sections.map((section, index) => <fieldset key={index} className="admin-section"><legend>Section {index + 1}</legend><label>Titre de section<input value={section.heading} maxLength={200} onChange={event => editSection(index, 'heading', event.target.value)} /></label><label>Texte<textarea aria-label={"Texte de la section " + (index + 1)} rows={9} value={section.paragraphs.join('\n\n')} onChange={event => editSection(index, 'paragraphs', event.target.value.split(/\n\s*\n/))} /><small>Séparez les paragraphes par une ligne vide. Aucun code à écrire.</small></label><div className="u-action-row">{index > 0 && <button type="button" className="admin-text-button" onClick={() => { const sections = [...article.sections]; [sections[index - 1], sections[index]] = [sections[index], sections[index - 1]]; updateArticle('sections', sections); }}>Monter la section {index + 1}</button>}{article.sections.length > 1 && <button type="button" className="admin-text-button" onClick={() => { if (window.confirm('Retirer cette section de l’article ?')) updateArticle('sections', article.sections.filter((_, position) => position !== index)); }}>Retirer la section {index + 1}</button>}</div></fieldset>)}
          <button type="button" className="admin-secondary" onClick={() => updateArticle('sections', [...article.sections, { heading: '', paragraphs: [''] }])}>Ajouter une section</button>
          {!!article.history?.length && <details className="admin-history"><summary>Versions précédentes ({article.history.length})</summary><p className="admin-help">Charger une version ne la publie pas. Vérifiez-la, puis enregistrez votre choix.</p>{article.history.map((revision, index) => <button key={index} className="admin-article-item" onClick={() => { if (window.confirm('Remplacer le texte dans l’éditeur par cette version ?')) { setArticle(current => ({ ...current, ...revision, status: current.status, updatedAt: current.updatedAt })); setDirty(true); } }}>{revision.title} · {new Date(revision.updatedAt).toLocaleString('fr-FR')}</button>)}</details>}
        </fieldset>}
        <footer className="admin-save"><button className="u-button" disabled={busy} onClick={() => save(article.status === 'published' ? 'published' : 'draft')}>{busy ? 'Enregistrement…' : article.status === 'published' ? 'Enregistrer les modifications' : 'Enregistrer le brouillon'}</button>{article.status !== 'published' && <button className="admin-secondary" disabled={busy} onClick={() => { if (window.confirm('Publier cet article dans le journal ?')) save('published'); }}>Publier dans le journal</button>}{article.status === 'published' && <button className="admin-text-button" disabled={busy} onClick={() => { if (window.confirm('Retirer cet article du journal et le conserver en brouillon ?')) save('draft'); }}>Retirer du journal</button>}{article.id && article.status !== 'archived' && <button className="admin-text-button" disabled={busy} onClick={() => { if (window.confirm('Archiver cet article ? Son texte sera conservé dans cet espace.')) save('archived'); }}>Archiver</button>}{article.status === 'published' && <Link className="u-link" href={'/journal/' + article.slug} target="_blank" rel="noopener">Lire sur le site ↗</Link>}</footer>
      </section>}
    </div>}
    {view === 'pages' && <CmsStudio initial={data.cms} onDirty={setDirty} onBusy={setBusy} onSaved={cms => setData(current => ({ ...current, cms }))} />}
  </div>;
}

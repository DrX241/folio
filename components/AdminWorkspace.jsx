"use client";

import CmsStudio from "./CmsStudio";
import JournalStudio from './JournalStudio';
import { studioArticle, legacyDocument } from '@/lib/journal-document.mjs';
import { makeArticleBlock } from '@/lib/article-blocks.mjs';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const statusLabel = { draft: 'Brouillon', published: 'Publié', archived: 'Archivé' };
function blankArticle() { return { title: '', slug: '', summary: '', category: 'Réflexion', date: new Date().toLocaleDateString('en-CA'), status: 'draft', sections: [{ id:crypto.randomUUID(), heading: 'Votre point de départ', paragraphs: [], blocks:[{...makeArticleBlock('text'),richText:legacyDocument('')}] }] }; }
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
  const [pendingAction, setPendingAction] = useState(null);
  const [trashConfirmation, setTrashConfirmation] = useState(false);
  const [autosave, setAutosave] = useState(true);
  const [editorSession, setEditorSession] = useState(0);
  useEffect(() => {
    const guard = event => { if (dirty) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, [dirty]);
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('article');
    const found = initial?.articles?.find(item=>item.id===id);
    if(found) setArticle(studioArticle(structuredClone(found)));
  }, [initial]);
  const canLeave = () => (!dirty) || window.confirm('Des modifications ne sont pas enregistrées. Les abandonner ?');
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
    setEditorSession(current=>current+1); setArticle(studioArticle(structuredClone(value))); setDirty(false); setPreview(false); setPendingAction(null); setMessage(''); setError('');
  };
  const removeArticle = () => {
    setPendingAction(null);
    run(async () => {
      await request({ action: 'delete-article', id: article.id, updatedAt: article.updatedAt });
      const stored = data.articles.find(item => item.id === article.id);
      setData(current => ({ ...current, articles: current.articles.filter(item => item.id !== article.id), deletedArticles: [...(current.deletedArticles || []), { article: stored, deletedAt: new Date().toISOString() }] }));
      setArticle(null); setDirty(false); setMessage('Article supprimé du journal. Il reste restaurable dans la corbeille.');
    });
  };
  const restore = id => {
    if (busy || !canLeave()) return;
    run(async () => {
      const restored = await request({ action: 'restore-article', id });
      setData(current => ({ ...current, articles: [...current.articles, restored], deletedArticles: current.deletedArticles.filter(item => item.article.id !== id) }));
      setEditorSession(current=>current+1); setArticle(studioArticle(restored)); setDirty(false); setPreview(false); setPendingAction(null); setMessage('Article restauré en brouillon. Il n’est pas publié automatiquement.');
    });
  };
  const save = status => run(async () => {
    const { history, ...content } = article;
    const saved = await request({ action: 'article', article: { ...content, status } });
    setArticle(saved); setDirty(false); setPendingAction(null);
    setData(current => ({ ...current, articles: [...current.articles.filter(item => item.id !== saved.id), saved] }));
    setMessage(status === 'published' ? 'Publication enregistrée. Ouvrez « Lire sur le site » pour consulter l’article.' : status === 'archived' ? 'Article archivé. Il est retiré du journal.' : 'Brouillon enregistré. Il reste privé.');
  });
  const emptyTrash = () => run(async () => {
    const expected = (data.deletedArticles || []).map(({ article }) => ({ id: article.id, updatedAt: article.updatedAt }));
    const result = await request({ action: 'empty-trash', expected });
    setData(current => ({ ...current, deletedArticles: [] }));
    setTrashConfirmation(false);
    setMessage('Corbeille vidée : ' + result.removed + ' article(s) supprimé(s). La restauration depuis la corbeille n’est plus possible.');
  });
  const switchView = next => {
    if (busy || !canLeave()) return;
    setView(next); setArticle(null); setDirty(false); setPendingAction(null); setError(''); setMessage('');
  };
  const togglePreview = () => {
    if (preview) { setPreview(false); return; }
    if (!article.document?.enabled) { setPreview(true); return; }
    run(async () => {
      const document = await request({ action: 'preview-document', document: article.document });
      setArticle(current => ({ ...current, document }));
      setPreview(true);
    });
  };
  useEffect(() => {
    if (!autosave || !dirty || busy || error || !article?.title.trim() || !article?.slug || article.status !== 'draft') return;
    const timer = setTimeout(() => save('draft'), 2500);
    return () => clearTimeout(timer);
    // Save only private drafts, never publish through an automatic timer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article, autosave, busy, dirty, error]);

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

  return <div className={'admin-workspace u-wrap ' + (view === 'journal' && article ? 'admin-atelier-open' : '')}>
    <header className="admin-top"><div><p className="u-label">ADMINISTRATION · {data.email}</p><h1>Votre espace d’écriture.</h1></div><div className="u-action-row"><Link className="u-link" href="/" target="_blank" rel="noopener">Voir le site ↗</Link><button className="admin-text-button" disabled={busy} onClick={() => { if (canLeave()) run(async () => { await request({ action: 'logout' }); window.location.reload(); }); }}>Se déconnecter</button></div></header>
    <nav className="admin-tabs" aria-label="Sections de l’administration"><button aria-current={view === 'journal' ? 'page' : undefined} onClick={() => switchView('journal')}>Journal</button><button aria-current={view === 'pages' ? 'page' : undefined} onClick={() => switchView('pages')}>Éditeur visuel</button><a href="/api/admin" download="eddy-missoni-contenus.json">Exporter mes contenus</a></nav>
    {error && <p role="alert" className="admin-error">{error}</p>}{message && <p role="status" className="admin-success">{message}</p>}
    {view === 'journal' && <div className="admin-columns"><aside className="admin-library"><button className="u-button" disabled={busy} onClick={() => openArticle(blankArticle())}>Nouvel article <span aria-hidden="true">+</span></button><p className="admin-help">Les brouillons et les archives sont visibles uniquement ici.</p>{data.articles.length ? [...data.articles].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).map(item => <button className="admin-article-item" key={item.id} aria-pressed={article?.id === item.id} disabled={busy} onClick={() => openArticle(item)}><span>{statusLabel[item.status]} · {item.date}</span><strong>{item.title}</strong></button>) : <p className="admin-help">Votre premier article commence ici.</p>}</aside>
      {!article ? <section className="admin-empty"><h2>Une idée à partager ?</h2><p>Créez un article, écrivez par sections, puis prévisualisez votre texte avant de le publier.</p></section> : <section className="admin-editor" aria-label="Éditeur d’article">
        <div className="admin-editor-top"><p className="u-label">{statusLabel[article.status]} · {busy ? 'ENREGISTREMENT…' : dirty ? 'MODIFICATIONS NON ENREGISTRÉES' : article.id ? 'ENREGISTRÉ' : 'NOUVEL ARTICLE'}</p><label className="atelier-checkbox"><input type="checkbox" checked={autosave} onChange={event=>setAutosave(event.target.checked)} />Sauvegarde automatique des brouillons</label><button type="button" disabled={busy} className="admin-text-button" onClick={togglePreview}>{preview ? 'Revenir à l’écriture' : 'Prévisualiser'}</button></div>
        {article.status === 'published' && <p className="journal-setup-note">Article publié : les changements ne seront visibles qu’après « Enregistrer les modifications ». La sauvegarde automatique est réservée aux brouillons.</p>}
        <JournalStudio key={editorSession} article={article} onChange={next=>{setArticle(next);setDirty(true);setError('');}} busy={busy} onBusy={setBusy} onError={setError} preview={preview} />
        {!!article.history?.length && <details className="admin-history"><summary>Versions précédentes ({article.history.length})</summary><p className="admin-help">Charger une version ne la publie pas. Vérifiez-la, puis enregistrez votre choix.</p>{article.history.map((revision,index)=><button key={index} className="admin-article-item" disabled={busy} onClick={()=>{if(window.confirm('Remplacer le texte dans l’éditeur par cette version ?')){setArticle(current=>studioArticle({...current,cover:null,tags:[],seoTitle:'',seoDescription:'',layout:undefined,document:null,...revision,status:current.status,updatedAt:current.updatedAt}));setDirty(true);}}}>{revision.title} · {new Date(revision.updatedAt).toLocaleString('fr-FR')}</button>)}</details>}
        {error && <p className="admin-error" role="alert">Publication non effectuée : {error}</p>}<footer className="admin-save"><button className="u-button" disabled={busy} onClick={() => save(article.status === 'published' ? 'published' : 'draft')}>{busy ? 'Enregistrement…' : article.status === 'published' ? 'Enregistrer les modifications' : 'Enregistrer le brouillon'}</button>{article.status !== 'published' && <button className="admin-secondary" disabled={busy} onClick={() => setPendingAction('publish')}>Publier dans le journal</button>}{article.status === 'published' && <button className="admin-text-button" disabled={busy} onClick={() => { if (window.confirm('Retirer cet article du journal et le conserver en brouillon ?')) save('draft'); }}>Retirer du journal</button>}{article.id && article.status !== 'archived' && <button className="admin-text-button" disabled={busy} onClick={() => { if (window.confirm('Archiver cet article ? Son texte sera conservé dans cet espace.')) save('archived'); }}>Archiver</button>}{article.status === 'published' && <Link className="u-link" href={'/journal/' + article.slug} target="_blank" rel="noopener">Lire sur le site ↗</Link>}</footer>
        {article.id && <div className="admin-save"><button type="button" disabled={busy} className="admin-text-button journal-danger" onClick={() => setPendingAction('delete')}>Supprimer l’article</button></div>}
        {pendingAction && <div className="journal-callout" role="group" aria-label="Confirmation de l’action"><p>{pendingAction === 'delete' ? 'Supprimer cet article du journal et le placer dans la corbeille ? Les modifications non enregistrées seront abandonnées. Vous pourrez restaurer le contenu enregistré.' : 'Publier cet article ? Son contenu sera accessible à tous les visiteurs.'}</p><div className="u-action-row"><button className="u-button" disabled={busy} onClick={() => pendingAction === 'delete' ? removeArticle() : save('published')}>{pendingAction === 'delete' ? 'Confirmer la suppression' : 'Confirmer la publication'}</button><button className="admin-text-button" disabled={busy} onClick={() => setPendingAction(null)}>Annuler cette action</button></div></div>}
      </section>}
    </div>}
    {view === 'journal' && <details className="journal-trash"><summary>Corbeille ({data.deletedArticles?.length || 0})</summary><p className="admin-help">Restaurer un article le remet en brouillon, sans le rendre public. Vider la corbeille retire tous ses articles et leurs versions de cet espace. Les sauvegardes techniques et les images ne sont pas effacées.</p><button type="button" className="admin-text-button journal-danger" disabled={busy || !data.deletedArticles?.length || trashConfirmation} onClick={() => { setError(''); setTrashConfirmation(true); }}>Vider la corbeille</button>{trashConfirmation && <div className="journal-callout" role="group" aria-label="Confirmation du vidage de la corbeille"><p>Supprimer les {data.deletedArticles?.length || 0} article(s) de la corbeille ? Vous ne pourrez plus les restaurer depuis cet espace. Les articles du journal ne seront pas touchés.</p>{error && <p className="admin-error" role="alert">{error}</p>}<div className="u-action-row"><button type="button" className="u-button" disabled={busy} onClick={emptyTrash}>Confirmer le vidage</button><button type="button" className="admin-text-button" disabled={busy} onClick={() => setTrashConfirmation(false)}>Annuler le vidage</button></div></div>}{!data.deletedArticles?.length && <p className="admin-help">La corbeille est vide.</p>}{data.deletedArticles?.map(item => <div key={item.article.id}><p>{item.article.title}</p><button type="button" className="admin-secondary" disabled={busy || trashConfirmation} onClick={() => restore(item.article.id)}>Restaurer {item.article.title}</button></div>)}</details>}
    {view === 'pages' && <CmsStudio initial={data.cms} onDirty={setDirty} onBusy={setBusy} onSaved={cms => setData(current => ({ ...current, cms }))} />}
  </div>;
}

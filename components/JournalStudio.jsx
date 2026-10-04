"use client";
/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from 'react';
import JournalRichEditor from './JournalRichEditor';
import JournalHtmlStudio from './JournalHtmlStudio';
import ArticleContent, { ArticleImage, RichBlock } from './ArticleContent';
import { BlockFields, JournalImageFields } from './JournalEditorFields';
import { blockLabels, makeArticleBlock } from '@/lib/article-blocks.mjs';
import { legacyDocument, validateArticleLayout } from '@/lib/journal-document.mjs';

const labels = { reading: 'Lecture', wide: 'Large', full: 'Pleine largeur' };
const slugify = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,120);
const sourceContent = article => { const {history,id,createdAt,updatedAt,status,...content}=article;return content; };

export default function JournalStudio({ article, onChange, busy, onBusy, onError, preview }) {
  const mode = article.document?.enabled ? 'html' : 'visual'; const [panel,setPanel] = useState('publication');
  const [focus,setFocus] = useState(false); const [viewport,setViewport] = useState('desktop');
  const [selected,setSelected] = useState(null); const [kind,setKind] = useState('text');
  const [palette,setPalette] = useState(null);
  const undo = useRef([]), redo = useRef([]), lastEdit = useRef(0);
  const layout = article.layout || validateArticleLayout();
  const selectedSection = selected ? article.sections[selected.section] : null;
  const selectedBlock = selectedSection?.blocks?.[selected?.block];
  const commit = (next, group = false) => {
    if(!group || Date.now()-lastEdit.current>1000){undo.current.push(structuredClone(article));undo.current=undo.current.slice(-50);}
    redo.current=[];lastEdit.current=Date.now();onChange(next);
  };
  const change = (key,value,group=false) => commit({...article,[key]:value},group);
  const changeDocument = document => {
    const parsed = new DOMParser().parseFromString(document.html || '', 'text/html');
    parsed.querySelectorAll('script,style,template').forEach(node=>node.remove());
    const clean = (value,limit) => (value || '').replace(/\s+/g,' ').trim().slice(0,limit);
    const title = article.title || clean(parsed.querySelector('title')?.textContent || parsed.querySelector('h1')?.textContent,200);
    const summary = article.summary || clean(parsed.querySelector('meta[name="description"]')?.getAttribute('content') || parsed.querySelector('.lead-chapo')?.textContent || parsed.querySelector('p')?.textContent,1000);
    commit({...article,title,summary,slug:article.slug || slugify(title),document:{...document,enabled:true}},true);
  };
  const restoreSnapshot = snapshot => onChange({...snapshot,id:article.id,history:article.history,updatedAt:article.updatedAt,createdAt:article.createdAt,status:article.status});
  const changeSection = (index,changes,group=false) => change('sections',article.sections.map((section,i)=>i===index?{...section,...changes}:section),group);
  const changeBlock = (si,bi,changes,group=false) => changeSection(si,{blocks:article.sections[si].blocks.map((block,i)=>i===bi?{...block,...changes}:block)},group);
  const setLayout = (key,value) => change('layout',{...layout,[key]:value});
  const insert = (si,type=kind) => {
    const block = makeArticleBlock(type); if(type==='text') block.richText=legacyDocument('');
    const section = article.sections[si], blocks=[...(section.blocks || [])];
    const at=selected?.section===si?selected.block+1:blocks.length;blocks.splice(at,0,block);
    changeSection(si,{blocks});setSelected({section:si,block:at});setPanel('block');setPalette(null);
  };
  const moveBlock = (direction) => {
    const blocks=[...selectedSection.blocks], from=selected.block,to=from+direction;
    if(to<0||to>=blocks.length)return;[blocks[from],blocks[to]]=[blocks[to],blocks[from]];
    changeSection(selected.section,{blocks});setSelected({...selected,block:to});
  };
  const uploadDrop = async event => {
    if(mode==='html'||!event.dataTransfer.files.length)return;event.preventDefault();if(busy)return;
    const file=event.dataTransfer.files[0];onBusy(true);onError('');
    try{
      if(file.size>4*1024*1024)throw new Error('Utilisez une image de 4 Mo maximum.');
      const form=new FormData();form.append('file',file);const response=await fetch('/api/admin/media',{method:'POST',body:form});const image=await response.json();if(!response.ok)throw new Error(image.error);
      const si=selected?.section || 0;const block={...makeArticleBlock('image'),src:image.src};
      changeSection(si,{blocks:[...article.sections[si].blocks,block]});setSelected({section:si,block:article.sections[si].blocks.length});setPanel('block');
    }catch(failure){onError(failure.message);}finally{onBusy(false);}
  };
  const switchMode = next => {
    if(next===mode)return;
    change('document',{html:'',css:'',tailwind:true,fonts:false,...article.document,enabled:next==='html'});
    setPanel('publication');setSelected(null);setPalette(null);
  };
  const exportArticle = () => {
    const url=URL.createObjectURL(new Blob([JSON.stringify(sourceContent(article),null,2)],{type:'application/json'}));
    const anchor=document.createElement('a');anchor.href=url;anchor.download=(article.slug||'article')+'.json';anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  const articlePreview = <div className={'atelier-sheet atelier-preview journal-cover-'+layout.cover+' journal-width-'+layout.width} style={{textAlign:layout.align}}><p className="u-label">{article.category}</p><h1>{article.title || 'Titre de votre article'}</h1><p className="atelier-deck">{article.summary}</p>{layout.cover!=='none'&&<ArticleImage image={article.cover} cover />}<article className="u-prose"><ArticleContent article={article} /></article></div>;
  return <div className={'journal-atelier '+(mode==='html'?'atelier-html-mode ':'')+(focus?'atelier-focus':'')}>
    <div className="atelier-commandbar"><div><p className="u-label">ATELIER ÉDITORIAL</p><p className="atelier-command-help">Écrivez dans la page. Composez à votre rythme.</p></div><div className="atelier-modes" role="group" aria-label="Mode d’édition">{[['html','HTML libre'],['visual','No-code']].map(([value,label])=><button type="button" aria-pressed={mode===value} disabled={busy} key={value} onClick={()=>switchMode(value)}>{label}</button>)}</div><div className="atelier-command-actions"><button type="button" disabled={busy||!undo.current.length} onClick={()=>{redo.current.push(structuredClone(article));restoreSnapshot(undo.current.pop());setSelected(null);}}>Annuler</button><button type="button" disabled={busy||!redo.current.length} onClick={()=>{undo.current.push(structuredClone(article));restoreSnapshot(redo.current.pop());setSelected(null);}}>Rétablir</button><button type="button" onClick={exportArticle}>Exporter</button><button type="button" aria-pressed={focus} onClick={()=>setFocus(!focus)}>{focus?'Quitter la concentration':'Concentration'}</button><button type="button" aria-pressed={viewport==='mobile'} onClick={()=>setViewport(viewport==='desktop'?'mobile':'desktop')}>{viewport==='desktop'?'Vue mobile':'Vue ordinateur'}</button></div></div>
    <div className="atelier-workspace">
      {!focus && mode==='visual' && <aside className="atelier-outline" aria-label="Plan de l’article"><p className="u-label">LE FIL DU TEXTE</p>{article.sections.map((section,si)=><div key={section.id || si}><a href={'#atelier-section-'+si}>{String(si+1).padStart(2,'0')} · {section.heading||'Nouvelle section'}</a>{section.blocks?.map((block,bi)=><button type="button" key={block.id || bi} aria-pressed={selected?.section===si&&selected?.block===bi} onClick={()=>{setSelected({section:si,block:bi});setPanel('block');document.getElementById('atelier-block-'+si+'-'+bi)?.scrollIntoView({block:'center'});}}>{blockLabels[block.type]}{block.type==='text'?' · '+(block.text||'À écrire').slice(0,24):''}</button>)}</div>)}<button type="button" disabled={busy||article.sections.length>=40} onClick={()=>{change('sections',[...article.sections,{id:crypto.randomUUID(),heading:'',paragraphs:[],blocks:[{...makeArticleBlock('text'),richText:legacyDocument('')}]}]);}}>Ajouter une section</button><button type="button" onClick={()=>setPanel(panel==='publication'?'layout':'publication')}>{panel==='publication'?'Mise en page':'Publication'}</button></aside>}
      <div className={'atelier-canvas '+(viewport==='mobile'?'atelier-mobile':'')} onDragOver={event=>{if(event.dataTransfer.types.includes('Files'))event.preventDefault();}} onDrop={uploadDrop}>
        {palette!==null&&<div className="atelier-palette" role="dialog" aria-label="Insérer un bloc"><p className="u-label">QU’ALLEZ-VOUS AJOUTER ?</p><div>{Object.entries(blockLabels).map(([type,label],index)=><button type="button" autoFocus={index===0} disabled={busy} key={type} onClick={()=>insert(palette,type)}>{label}</button>)}</div><button type="button" onClick={()=>setPalette(null)}>Fermer l’insertion</button></div>}
        {preview?articlePreview:mode==='html'?<JournalHtmlStudio document={article.document} disabled={busy} onChange={changeDocument} />:<div className={'atelier-sheet journal-cover-'+layout.cover+' journal-width-'+layout.width} style={{textAlign:layout.align}}>
          <p className="u-label">{article.category} · {article.date}</p>
          <label className="atelier-title"><span className="atelier-sr-only">Titre de l’article</span><textarea aria-label="Titre de l’article" rows={2} placeholder="Une idée mérite un article." value={article.title} disabled={busy} maxLength={200} onChange={event=>{const title=event.target.value;commit({...article,title,slug:!article.id&&article.slug===slugify(article.title)?slugify(title):article.slug},true);}} /></label>
          <label className="atelier-summary"><span className="atelier-sr-only">Résumé</span><textarea aria-label="Résumé" rows={3} placeholder="Quelques lignes pour donner envie de poursuivre…" value={article.summary} disabled={busy} maxLength={1000} onChange={event=>change('summary',event.target.value,true)} /></label>
          {layout.cover!=='none'&&(article.cover?.src?<button type="button" className="atelier-cover-button" aria-label="Modifier l’image de couverture" onClick={()=>setPanel('publication')}><ArticleImage image={article.cover} cover /></button>:<button type="button" className="atelier-cover-empty" onClick={()=>setPanel('publication')}>Ajouter une couverture <span>Photographie, illustration ou schéma</span></button>)}
          <div className="u-prose atelier-prose">{article.sections.map((section,si)=><section id={'atelier-section-'+si} className="atelier-section" key={section.id || si}>
            <div className="atelier-section-heading"><label><span className="atelier-sr-only">Titre de section {si+1}</span><input aria-label={si===0?'Titre de section':'Titre de section '+(si+1)} placeholder="Titre de cette partie" value={section.heading} disabled={busy} maxLength={200} onChange={event=>changeSection(si,{heading:event.target.value},true)} /></label><div><button type="button" disabled={busy||si===0} aria-label={'Monter la section '+(si+1)} onClick={()=>{const sections=[...article.sections];[sections[si-1],sections[si]]=[sections[si],sections[si-1]];change('sections',sections);setSelected(null);}}>↑</button><button type="button" disabled={busy||si===article.sections.length-1} aria-label={'Descendre la section '+(si+1)} onClick={()=>{const sections=[...article.sections];[sections[si+1],sections[si]]=[sections[si],sections[si+1]];change('sections',sections);setSelected(null);}}>↓</button>{article.sections.length>1&&<button type="button" disabled={busy} onClick={()=>{if(confirm('Retirer cette section et ses blocs ?')){change('sections',article.sections.filter((_,index)=>index!==si));setSelected(null);}}}>Retirer</button>}</div></div>
            {section.blocks?.map((block,bi)=><div id={'atelier-block-'+si+'-'+bi} className={'atelier-edit-block journal-width-'+((block.presentation?.width&&block.presentation.width!=='inherit'?block.presentation.width:layout.width))+' journal-spacing-'+(block.presentation?.spacing||'normal')+(selected?.section===si&&selected?.block===bi?' atelier-selected':'')} key={block.id||bi} style={{textAlign:block.presentation?.align!=='inherit'?block.presentation?.align:undefined}} onFocus={()=>setSelected({section:si,block:bi})}>
              <div className="atelier-block-handle"><span>{blockLabels[block.type]}</span><button type="button" aria-label={'Réglages du bloc '+(bi+1)+' section '+(si+1)} onClick={()=>{setSelected({section:si,block:bi});setPanel('block');}}>Réglages</button></div>
              {block.type==='text'?<JournalRichEditor block={block} label={'Texte de la section '+(si+1)+' bloc '+(bi+1)} disabled={busy} onInsertRequest={()=>{setSelected({section:si,block:bi});setPalette(si);}} onChange={changes=>changeBlock(si,bi,changes,true)} />:block.type==='table'?<div className="journal-table-scroll"><table><caption>{block.caption||'Tableau'}</caption><thead><tr>{block.headers.map((value,i)=><th key={i}><input aria-label={'Titre colonne '+(i+1)} value={value} disabled={busy} onChange={event=>changeBlock(si,bi,{headers:block.headers.map((cell,index)=>index===i?event.target.value:cell)},true)} /></th>)}</tr></thead><tbody>{block.rows.map((row,ri)=><tr key={ri}>{row.map((cell,ci)=><td key={ci}><input aria-label={'Ligne '+(ri+1)+' colonne '+(ci+1)} value={cell} disabled={busy} onChange={event=>changeBlock(si,bi,{rows:block.rows.map((cells,index)=>index===ri?cells.map((item,col)=>col===ci?event.target.value:item):cells)},true)} /></td>)}</tr>)}</tbody></table></div>:<RichBlock block={block} />}
            </div>)}
            <div className="atelier-insert"><select aria-label={'Bloc à ajouter dans la section '+(si+1)} value={kind} disabled={busy} onChange={event=>setKind(event.target.value)}>{Object.entries(blockLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select><button type="button" disabled={busy||section.blocks?.length>=80} onClick={()=>insert(si)}>Ajouter le bloc à la section {si+1}</button></div>
          </section>)}</div>
          <p className="atelier-endnote">La fin du texte. Le début d’une conversation.</p>
        </div>}
      </div>
      {!focus&&<aside className="atelier-inspector"><div className="atelier-panel-tabs" role="group" aria-label="Panneau de réglages">{(mode==='html'?[['publication','Publication']]:[['publication','Publication'],['layout','Page'],['block','Bloc']]).map(([value,label])=><button type="button" aria-pressed={panel===value} key={value} onClick={()=>setPanel(value)}>{label}</button>)}</div><fieldset className="admin-form" disabled={busy}>
        {(panel==='publication'||mode==='html')&&<><p className="u-label">PRÉPARER LA PUBLICATION</p>{mode==='html'&&<><label>Titre de l’article<input aria-label="Titre de l’article" value={article.title} maxLength={200} onChange={event=>{const title=event.target.value;commit({...article,title,slug:!article.id&&article.slug===slugify(article.title)?slugify(title):article.slug},true);}} /></label><label>Résumé<textarea aria-label="Résumé" value={article.summary} maxLength={1000} onChange={event=>change('summary',event.target.value,true)} /></label></>}<label>Rubrique<input value={article.category} maxLength={100} onChange={event=>change('category',event.target.value,true)} /></label><label>Date de publication<input type="date" value={article.date} onChange={event=>change('date',event.target.value)} /></label><label>Adresse de l’article<input aria-label="Adresse de l’article" value={article.slug} onChange={event=>change('slug',event.target.value,true)} /><small>/journal/{article.slug||'mon-article'}</small></label><JournalImageFields title="Image de couverture" image={article.cover} onChange={cover=>change('cover',cover)} onBusy={onBusy} onError={onError} /><label>Mots-clés<input value={(article.tags||[]).join(',')} onChange={event=>change('tags',event.target.value.split(','),true)} /></label><details><summary>Moteurs de recherche</summary><label>Titre SEO<input value={article.seoTitle||''} maxLength={200} onChange={event=>change('seoTitle',event.target.value,true)} /></label><label>Description SEO<textarea value={article.seoDescription||''} maxLength={500} onChange={event=>change('seoDescription',event.target.value,true)} /></label></details></>}
        {mode==='visual'&&panel==='layout'&&<><p className="u-label">L’ESPACE DE LECTURE</p><label>Largeur de l’article<select aria-label="Largeur de l’article" value={layout.width} onChange={event=>setLayout('width',event.target.value)}>{Object.entries(labels).map(([value,label])=><option value={value} key={value}>{label}</option>)}</select></label><label>Alignement par défaut<select aria-label="Alignement de l’article" value={layout.align} onChange={event=>setLayout('align',event.target.value)}><option value="left">À gauche</option><option value="center">Centré</option><option value="right">À droite</option><option value="justify">Justifié</option></select></label><label>Couverture<select value={layout.cover} onChange={event=>setLayout('cover',event.target.value)}><option value="classic">Classique</option><option value="panoramic">Panoramique</option><option value="none">Masquée</option></select></label><label className="atelier-checkbox"><input type="checkbox" checked={layout.toc} onChange={event=>setLayout('toc',event.target.checked)} />Afficher le sommaire</label><p className="journal-setup-note">La largeur et l’alignement sont indépendants. Chaque bloc peut avoir sa propre largeur.</p></>}
        {mode==='visual'&&panel==='block'&&(selectedBlock?<><p className="u-label">{blockLabels[selectedBlock.type]} · BLOC {selected.block+1}</p><label>Largeur du bloc<select aria-label="Largeur du bloc" value={selectedBlock.presentation?.width||'inherit'} onChange={event=>changeBlock(selected.section,selected.block,{presentation:{...selectedBlock.presentation,width:event.target.value}})}><option value="inherit">Comme l’article</option>{Object.entries(labels).map(([value,label])=><option value={value} key={value}>{label}</option>)}</select></label><label>Respiration<select value={selectedBlock.presentation?.spacing||'normal'} onChange={event=>changeBlock(selected.section,selected.block,{presentation:{...selectedBlock.presentation,spacing:event.target.value}})}><option value="compact">Compacte</option><option value="normal">Normale</option><option value="airy">Aérée</option></select></label>{selectedBlock.type!=='text'&&<BlockFields block={selectedBlock} update={changes=>changeBlock(selected.section,selected.block,changes,true)} onBusy={onBusy} onError={onError} />}<div className="atelier-block-actions"><button type="button" disabled={busy||selected.block===0} onClick={()=>moveBlock(-1)}>Monter</button><button type="button" disabled={busy||selected.block===selectedSection.blocks.length-1} onClick={()=>moveBlock(1)}>Descendre</button><button type="button" onClick={()=>{const blocks=[...selectedSection.blocks];blocks.splice(selected.block+1,0,{...structuredClone(selectedBlock),id:crypto.randomUUID()});changeSection(selected.section,{blocks});}}>Dupliquer</button><button type="button" className="journal-danger" onClick={()=>{if(confirm('Retirer ce bloc ?')){changeSection(selected.section,{blocks:selectedSection.blocks.filter((_,index)=>index!==selected.block)});setSelected(null);}}}>Retirer</button></div></>:<p className="journal-setup-note">Sélectionnez un bloc dans la page pour ajuster sa présentation.</p>)}
      </fieldset></aside>}
    </div>
  </div>;
}

"use client";
import {useEffect,useRef,useState} from 'react';
import JournalDocumentFrame from './JournalDocumentFrame';

const starter='<!DOCTYPE html>\n<html lang="fr">\n<head><meta charset="UTF-8"><title>Mon article</title></head>\n<body>\n<main class="max-w-4xl mx-auto p-8">\n  <h1 class="text-4xl font-bold mb-6">Une autre façon de raconter.</h1>\n  <div class="grid md:grid-cols-2 gap-8">\n    <p>Votre article, votre composition.</p>\n    <aside class="border-l-4 border-blue-800 pl-6">Une idée à retenir.</aside>\n  </div>\n</main>\n</body>\n</html>';
export default function JournalHtmlStudio({document,onChange,disabled}){
 const current=document||{html:'',css:'',tailwind:true,fonts:false,enabled:true};
 const [compiled,setCompiled]=useState(document?.rendered?document:null),[error,setError]=useState(''),[loading,setLoading]=useState(false);
 const [device,setDevice]=useState('desktop'),[view,setView]=useState('split');const fileRef=useRef();
 const signature=JSON.stringify({html:current.html,css:current.css,tailwind:current.tailwind,fonts:current.fonts,enabled:current.enabled});
 useEffect(()=>{
  if(!current.html.trim()){setCompiled(null);setError('');setLoading(false);return;}
  const controller=new AbortController();setLoading(true);
  const timer=setTimeout(async()=>{
   try{const response=await fetch('/api/admin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'preview-document',document:JSON.parse(signature)}),signal:controller.signal});const result=await response.json();if(!response.ok)throw new Error(result.error);if(!controller.signal.aborted){setCompiled(result);setError('');}}
   catch(failure){if(!controller.signal.aborted)setError(failure.message);}
   finally{if(!controller.signal.aborted)setLoading(false);}
  },800);
  return()=>{clearTimeout(timer);controller.abort();};
  // Signature includes every option affecting compilation.
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[signature]);
 const change=(key,value)=>onChange({...current,[key]:value});
 const importFile=async event=>{
  const file=event.target.files?.[0];if(!file)return;
  if(file.size>200000){setError('Le fichier doit faire moins de 200 Ko.');return;}
  change('html',await file.text());event.target.value='';
 };
 return <section className="journal-html-studio"><header><p className="u-label">HTML LIBRE · UNE COMPOSITION ENTIÈRE</p><p>Collez un document complet : doctype, head, styles et body. Vos colonnes, grilles et styles restent indépendants du site.</p></header><div className="journal-html-tools"><label className="atelier-checkbox"><input type="checkbox" disabled={disabled} checked={current.tailwind!==false} onChange={event=>change('tailwind',event.target.checked)} />Compiler les classes Tailwind 3</label><label className="atelier-checkbox"><input type="checkbox" disabled={disabled} checked={current.fonts===true} onChange={event=>change('fonts',event.target.checked)} />Autoriser les Google Fonts du document</label><button type="button" disabled={disabled} onClick={()=>fileRef.current.click()}>Importer un fichier HTML</button><input ref={fileRef} className="atelier-sr-only" type="file" accept=".html,.htm,.txt,text/html,text/plain" aria-label="Importer un document HTML" onChange={importFile} /><button type="button" disabled={disabled} onClick={()=>{if(!current.html||confirm('Remplacer le source HTML par un modèle ?'))change('html',starter);}}>Insérer un modèle</button><button type="button" onClick={()=>setView(view==='split'?'code':'split')}>{view==='split'?'Code seul':'Code et rendu'}</button><button type="button" onClick={()=>setView(view==='preview'?'split':'preview')}>{view==='preview'?'Revenir au code':'Rendu seul'}</button><button type="button" onClick={()=>setDevice(device==='desktop'?'mobile':'desktop')}>{device==='desktop'?'Aperçu mobile':'Aperçu ordinateur'}</button></div><p className="journal-setup-note">Les scripts importés et les appels réseau sont bloqués. Tailwind est compilé sur le serveur, sans CDN. Les polices Google, si activées, sont chargées depuis Google ; les autres bibliothèques ne sont pas exécutées.</p><div className={'journal-html-panes '+(view!=='split'?'journal-html-code-only':'')} >{view!=='preview'&&<div><label>Document HTML complet<textarea aria-label="Document HTML complet" value={current.html} onChange={event=>change('html',event.target.value)} disabled={disabled} rows={25} spellCheck={false} placeholder="Collez ici votre document HTML complet…" /></label><details><summary>CSS supplémentaire</summary><label>CSS supplémentaire<textarea aria-label="CSS supplémentaire du document" value={current.css||''} onChange={event=>change('css',event.target.value)} disabled={disabled} spellCheck={false} rows={8} /></label></details></div>}{view!=='code'&&<div className={'journal-html-preview '+(device==='mobile'?'journal-html-mobile':'')}><p className="u-label" role="status">{loading?'COMPILATION DE L’APERÇU…':'APERÇU ISOLÉ'}</p>{compiled?<JournalDocumentFrame document={compiled} title="Aperçu du document HTML libre" />:<p>Le rendu apparaîtra ici après collage ou import du code.</p>}</div>}</div>{error&&<p className="admin-error" role="alert">{error} Le dernier aperçu valide est conservé.</p>}{!!compiled?.warnings?.length&&<details className="journal-html-warnings"><summary>Adaptations de sécurité ({compiled.warnings.length})</summary><ul>{compiled.warnings.map(message=><li key={message}>{message}</li>)}</ul></details>}<p className="journal-setup-note">Le document HTML fait référence pour enregistrer, prévisualiser et publier. Sélectionnez No-code pour retrouver le modèle visuel : chaque mode conserve son contenu. L’aperçu ne publie rien.</p></section>;
}

"use client";
import { useEffect,useId,useRef,useState } from 'react';

export default function JournalDocumentFrame({document,title='Composition HTML de l’article'}){
 const ref=useRef(null),token=useId().replace(/[^a-zA-Z0-9]/g,'');const [height,setHeight]=useState(600);
 useEffect(()=>{
  const receive=event=>{const data=event.data;if(event.source!==ref.current?.contentWindow||data?.type!=='journal-document-height'||data.token!==token||!Number.isFinite(data.height))return;setHeight(Math.max(180,Math.min(30000,Math.ceil(data.height))));};
  window.addEventListener('message',receive);ref.current?.contentWindow?.postMessage({type:'journal-request-height',token},'*');return()=>window.removeEventListener('message',receive);
 },[token]);
 if(!document?.rendered)return <p className="journal-setup-note">Le document sera disponible après compilation de l’aperçu.</p>;
 return <iframe ref={ref} className="journal-document-frame" title={title} sandbox="allow-scripts" referrerPolicy="no-referrer" srcDoc={document.rendered.replaceAll('__JOURNAL_FRAME_TOKEN__',token)} height={height} onLoad={()=>ref.current?.contentWindow?.postMessage({type:'journal-request-height',token},'*')} />;
}

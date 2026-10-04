"use client";
import { useState } from 'react';
export default function ArticleCode({ block }) {
  const [notice, setNotice] = useState('');
  const copy = async () => {
    try { await navigator.clipboard.writeText(block.code); setNotice('Code copié'); }
    catch { setNotice('Sélectionnez le code pour le copier.'); }
  };
  return <figure className="journal-code"><div className="journal-code-bar"><span>{block.language}</span><button type="button" onClick={copy}>Copier le code</button><span role="status">{notice}</span></div><pre tabIndex={0} aria-label={'Code ' + block.language}><code>{block.code}</code></pre>{block.caption && <figcaption>{block.caption}</figcaption>}</figure>;
}

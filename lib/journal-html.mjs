import { parse, serialize, parseFragment } from 'parse5';
import postcss from 'postcss';
import tailwind from 'tailwindcss';
import { createHash } from 'node:crypto';

const resizer = "(()=>{const send=()=>parent.postMessage({type:\"journal-document-height\",token:document.documentElement.dataset.journalFrame,height:Math.ceil(document.body.getBoundingClientRect().height)},\"*\");new ResizeObserver(send).observe(document.body);addEventListener(\"load\",send);addEventListener(\"message\",event=>{if(event.source===parent&&event.data?.type===\"journal-request-height\"&&event.data.token===document.documentElement.dataset.journalFrame)send()});send()})()";
const scriptHash=createHash('sha256').update(resizer).digest('base64');
const cache=new Map();
export async function compileJournalDocument(input) {
  if(!input || typeof input.html!=='string' || input.html.length>200000 || typeof (input.css||'')!=='string' || (input.css||'').length>50000)throw new Error('Document limité à 200 000 caractères HTML et 50 000 caractères CSS.');
  const source={html:input.html,css:input.css||'',tailwind:input.tailwind!==false,fonts:input.fonts===true,enabled:input.enabled===true};
  // Defense in depth while Tailwind 3 still depends on unpatched braces.
  // Content remains raw HTML: never accept glob paths, plugins or safelist patterns.
  if(source.tailwind){
    let depth=0;
    for(const char of source.html){
      if(char==='{')depth++;
      else if(char==='}')depth=Math.max(0,depth-1);
      if(depth>32)throw new Error('Le document contient trop de niveaux d’accolades pour la compilation Tailwind.');
    }
  }
  const key=createHash('sha256').update(JSON.stringify(source)).digest('hex');
  if(cache.has(key))return cache.get(key);
  const doc=parse(source.html),warnings=new Set(),text=[];
  let count=0;
  const clean=(node,depth=0)=>{
    if(++count>15000||depth>100)throw new Error('Document HTML trop complexe.');
    if(node.nodeName==='#text' && !['style','script'].includes(node.parentNode?.tagName))text.push(node.value);
    if(node.attrs)node.attrs=node.attrs.filter(attr=>{
      if(attr.name.startsWith('on')||attr.name==='srcdoc'){warnings.add('Gestionnaires JavaScript retirés.');return false;}return true;
    });
    if(node.childNodes)node.childNodes=node.childNodes.filter(child=>{
      if(['script','iframe','object','embed','base'].includes(child.tagName)){warnings.add('Scripts et contenus exécutables retirés ; Tailwind est compilé sans CDN.');return false;}
      if(child.tagName==='meta'&&child.attrs?.some(a=>a.name==='http-equiv')){warnings.add('Directives de navigation et politiques importées retirées.');return false;}
      if(child.tagName==='link'){
        const href=child.attrs?.find(a=>a.name==='href')?.value||'';
        const rel=child.attrs?.find(a=>a.name==='rel')?.value||'';
        if(!source.fonts || !href.startsWith('https://fonts.googleapis.com/') || rel!=='stylesheet'){warnings.add('Liens externes retirés. Les Google Fonts sont une option explicite.');return false;}
      }
      clean(child,depth+1);return true;
    });
    if(node.content)clean(node.content,depth+1);
  };
  clean(doc);
  if(source.tailwind){
    const candidates=new Set();
    const inspect=node=>{
      for(const attr of node.attrs||[])if(attr.name==='class')for(const candidate of attr.value.split(/\s+/).filter(Boolean)){
        if(candidate.length>512)throw new Error('Une classe Tailwind dépasse 512 caractères.');
        candidates.add(candidate);
        if(candidates.size>2000)throw new Error('Document limité à 2 000 classes distinctes pour la compilation Tailwind.');
      }
      for(const child of node.childNodes||[])inspect(child);
      if(node.content)inspect(node.content);
    };
    inspect(doc);
  }
  const root=doc.childNodes.find(n=>n.tagName==='html'),head=root.childNodes.find(n=>n.tagName==='head'),body=root.childNodes.find(n=>n.tagName==='body');
  root.attrs=root.attrs.filter(a=>a.name!=='data-journal-frame');root.attrs.push({name:'data-journal-frame',value:'__JOURNAL_FRAME_TOKEN__'});
  if(!root.attrs.some(a=>a.name==='lang'))root.attrs.push({name:'lang',value:'fr'});
  let utilityCss='';
  if(source.tailwind){const result=await postcss([tailwind({content:[{raw:source.html,extension:'html'}],plugins:[],theme:{extend:{}}})]).process('@tailwind base;@tailwind components;@tailwind utilities;',{from:undefined,map:false});utilityCss=result.css;}
  if(utilityCss.length>500000)throw new Error('Trop de classes Tailwind dans ce document.');
  const styleSources=source.fonts?"'unsafe-inline' https://fonts.googleapis.com":"'unsafe-inline'";
  const csp="default-src 'none'; script-src 'sha256-"+scriptHash+"'; style-src "+styleSources+"; font-src "+(source.fonts?'https://fonts.gstatic.com':"'none'")+"; img-src 'self' data:; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'";
  const escapedCss=value=>value.replace(/<\/style/gi,'<\\/style');
  const injected=parseFragment('<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="'+csp+'"><style>'+escapedCss(utilityCss)+'</style>').childNodes;
  injected.forEach(n=>n.parentNode=head);head.childNodes.unshift(...injected);
  const extra=parseFragment('<style>html,body{margin:0}body{overflow-wrap:anywhere}img,svg,video{max-width:100%}'+escapedCss(source.css)+'</style>').childNodes;extra.forEach(n=>n.parentNode=head);head.childNodes.push(...extra);
  const bridge=parseFragment('<script>'+resizer+'</script>').childNodes;bridge.forEach(n=>n.parentNode=body);body.childNodes.push(...bridge);
  const result={...source,rendered:serialize(doc),plainText:text.join(' ').replace(/\s+/g,' ').trim(),warnings:[...warnings]};
  if(cache.size>=12)cache.delete(cache.keys().next().value);cache.set(key,result);return result;
}

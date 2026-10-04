import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {validateRichDocument,validateArticleLayout,legacyDocument,studioArticle,richPlainText} from '../lib/journal-document.mjs';

test('legacy paragraphs become editable text without losing inline formatting',()=>{
 const legacy={title:'Titre',sections:[{id:'old',heading:'Titre',paragraphs:['Une **idée** et un [lien](https://example.com).'],blocks:[{id:'existing',type:'code',language:'typescript',code:'  const x = 1;'}]}]};
 const converted=studioArticle(legacy);
 assert.equal(converted.sections[0].paragraphs.length,0);
 assert.equal(converted.sections[0].blocks[1].code,'  const x = 1;');
 assert.equal(richPlainText(converted.sections[0].blocks[0].richText),'Une idée et un lien.');
 assert.equal(converted.sections[0].blocks[0].richText.content[0].content.find(n=>n.text==='idée').marks[0].type,'bold');
});
test('rich text retains supported formatting, rejects unsafe links and structural payloads',()=>{
 const doc=legacyDocument('Un texte');doc.content[0].attrs={textAlign:'justify',onclick:'evil'};
 doc.content[0].content[0].marks=[{type:'highlight',attrs:{color:'url(evil)'}},{type:'underline'}];
 const safe=validateRichDocument(doc,true);
 assert.deepEqual(safe.content[0].attrs,{textAlign:'justify'});
 assert.deepEqual(safe.content[0].content[0].marks,[{type:'highlight'},{type:'underline'}]);
 assert.throws(()=>validateRichDocument({type:'doc',content:[{type:'script',text:'evil'}]}));
 assert.throws(()=>validateRichDocument({type:'doc',content:[{type:'paragraph',content:[{type:'heading',attrs:{level:2}}]}]}));
 const unsafe=legacyDocument('Un texte');unsafe.content[0].content[0].marks=[{type:'link',attrs:{href:'javascript:alert(1)'}}];assert.throws(()=>validateRichDocument(unsafe));
 assert.throws(()=>validateRichDocument(legacyDocument(''),true));
 assert.throws(()=>validateArticleLayout({width:'calc(100vh)'}));
});
test('rich text and presentation survive save, publication, history and restoration',async()=>{
 process.env.CMS_STORAGE='local';process.env.CMS_DATA_DIR=await mkdtemp(path.join(os.tmpdir(),'journal-document-unit-'));
 const cms=await import('../lib/cms-store.mjs?document');const token=await cms.createAccount({email:'studio@example.test',password:'test-only-password-8372',key:await cms.setupKey()});
 const doc=legacyDocument('Un **contenu** riche');doc.content[0].attrs={textAlign:'center'};
 const article=await cms.saveArticle(token,{title:'Studio',slug:'studio',summary:'Résumé',category:'Réflexion',date:'2026-10-03',status:'draft',layout:{width:'full',toc:false,cover:'panoramic'},sections:[{id:'stable-section',heading:'Titre',paragraphs:[],blocks:[{id:'stable-block',type:'text',text:'stale',richText:doc,presentation:{width:'wide',spacing:'airy'}}]}]});
 assert.equal(article.sections[0].id,'stable-section');assert.equal(article.sections[0].blocks[0].id,'stable-block');
 assert.equal(article.sections[0].blocks[0].text,'Un contenu riche');assert.equal(article.layout.width,'full');
 const published=await cms.saveArticle(token,{...article,status:'published'});assert.equal(published.history[0].layout.width,'full');assert.equal((await cms.publicContent()).articles[0].layout.toc,false);
 await cms.deleteArticle(token,published);const restored=await cms.restoreArticle(token,{id:published.id});assert.equal(restored.status,'draft');assert.equal(restored.sections[0].blocks[0].richText.content[0].attrs.textAlign,'center');
});

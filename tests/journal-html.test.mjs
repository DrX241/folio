import test from 'node:test';
import assert from 'node:assert/strict';
import {compileJournalDocument} from '../lib/journal-html.mjs';
import {mkdtemp} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
test('complete HTML retains head/body styles and compiles Tailwind without imported scripts',async()=>{
 const document=await compileJournalDocument({html:'<!doctype html><html lang="fr"><head><title>Gazette</title><script src="https://cdn.tailwindcss.com"></script><style>.title{color:red}</style></head><body><h1 class="text-2xl font-bold" onclick="parent.evil=true">Gazette</h1><script>parent.evil=true</script><meta http-equiv="refresh" content="0;url=https://evil.test"></body></html>',enabled:true,tailwind:true});
 assert.ok(document.rendered.includes('.text-2xl'));
 assert.ok(document.rendered.includes('.title{color:red}'));
 assert.equal(document.rendered.includes('parent.evil'),false);
 assert.equal(document.rendered.includes('cdn.tailwindcss.com'),false);
 assert.equal(document.rendered.includes('http-equiv="refresh"'),false);
 assert.ok(document.rendered.includes("script-src 'sha256-"));assert.ok(document.plainText.includes('Gazette'));
});
test('fonts are opt-in and arbitrary external resources are not enabled',async()=>{
 const html='<head><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Oswald"><link rel="stylesheet" href="https://evil.test/style.css"></head><body>Texte</body>';
 const off=await compileJournalDocument({html,tailwind:false});assert.equal(off.rendered.includes('href="https://fonts.googleapis.com'),false);
 const on=await compileJournalDocument({html,tailwind:false,fonts:true});assert.ok(on.rendered.includes('href="https://fonts.googleapis.com'));assert.equal(on.rendered.includes('evil.test'),false);
 await assert.rejects(compileJournalDocument({html:'a'.repeat(200001)}));
 await assert.rejects(compileJournalDocument({html:'{'.repeat(33)+'x'+'}'.repeat(33),tailwind:true}),/niveaux d’accolades/);
 await assert.rejects(compileJournalDocument({html:'<p class="'+ 'a'.repeat(513)+'">Texte</p>',tailwind:true}),/512 caractères/);
 await assert.rejects(compileJournalDocument({html:'<p class="'+Array.from({length:2001},(_,i)=>'class-'+i).join(' ')+'">Texte</p>',tailwind:true}),/2 000 classes/);
});
test('HTML composition is recompiled on save, remains private in draft and survives history/trash',async()=>{
 process.env.CMS_STORAGE='local';process.env.CMS_DATA_DIR=await mkdtemp(path.join(os.tmpdir(),'journal-html-unit-'));
 const cms=await import('../lib/cms-store.mjs?html');const token=await cms.createAccount({email:'html@example.test',password:'test-only-password-8372',key:await cms.setupKey()});
 const article=await cms.saveArticle(token,{title:'Gazette',slug:'gazette',summary:'Résumé',category:'Opinion',date:'2026-10-03',status:'draft',sections:[{heading:'',paragraphs:[],blocks:[]}],document:{html:'<h1 class="font-bold">Une gazette</h1><script>parent.injected=true</script>',enabled:true,tailwind:true,rendered:'<script>forged</script>'}});
 assert.equal(article.document.rendered.includes('forged'),false);assert.equal(article.document.rendered.includes('parent.injected'),false);assert.ok(article.document.html.includes('parent.injected'));assert.equal((await cms.publicContent()).articles.length,0);
 const published=await cms.saveArticle(token,{...article,status:'published'});assert.equal(published.history[0].document.html,article.document.html);assert.equal((await cms.publicContent()).articles[0].document.enabled,true);
 const visual=await cms.saveArticle(token,{...published,status:'draft',sections:[{heading:'Modèle visuel',paragraphs:['Texte no-code conservé'],blocks:[]}],document:{...published.document,enabled:false}});
 assert.equal(visual.document.enabled,false);assert.equal(visual.document.html,article.document.html);
 await assert.rejects(cms.saveArticle(token,{...visual,status:'published',document:{html:'',enabled:true,tailwind:false}}),/document HTML doit contenir du texte/);
 const htmlAgain=await cms.saveArticle(token,{...visual,status:'published',document:{...visual.document,enabled:true}});
 assert.equal(htmlAgain.sections[0].paragraphs[0],'Texte no-code conservé');assert.equal((await cms.publicContent()).articles[0].document.enabled,true);
 await cms.deleteArticle(token,htmlAgain);const restored=await cms.restoreArticle(token,{id:htmlAgain.id});assert.equal(restored.status,'draft');assert.equal(restored.document.html,article.document.html);assert.equal((await cms.publicContent()).articles.length,0);
});

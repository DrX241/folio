"use client";
import { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { DOMParser as ProseMirrorParser } from '@tiptap/pm/model';
import { legacyDocument, validateRichDocument, richPlainText } from '@/lib/journal-document.mjs';

export default function JournalRichEditor({ block, onChange, disabled, shared = false, label, onInsertRequest }) {
  const callback = useRef(onChange); callback.current = onChange;
  const insertCallback = useRef(onInsertRequest); insertCallback.current = onInsertRequest;
  const [source, setSource] = useState(''); const [error, setError] = useState('');
  const [link, setLink] = useState(null); const [revision, refresh] = useState(0);
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [2,3,4] }, link: { openOnClick: false, autolink: false, protocols: ['https'] } }), TextAlign.configure({ types: ['heading','paragraph'] }), Highlight],
    immediatelyRender: false,
    content: block.richText || legacyDocument(block.text),
    editorProps: { attributes: { 'aria-label': label, role: 'textbox', 'aria-multiline': 'true', spellcheck: 'true', lang: 'fr' }, handleKeyDown: (view,event) => { if(event.key==='/' && !view.state.selection.$from.parent.textContent.trim()){event.preventDefault();insertCallback.current?.();return true;}return false;} },
    onUpdate: ({ editor: instance }) => {
      const doc = instance.getJSON(); callback.current({ richText: doc, text: richPlainText(doc) });
      setSource(instance.getHTML()); setError(''); refresh(n => n + 1);
    },
    onSelectionUpdate: () => refresh(n => n + 1),
  });
  useEffect(() => { if (editor) editor.setEditable(!disabled); }, [editor, disabled]);
  useEffect(() => {
    if (!editor) return;
    const content = block.richText || legacyDocument(block.text);
    if (JSON.stringify(editor.getJSON()) !== JSON.stringify(content)) editor.commands.setContent(content, { emitUpdate: false });
    setSource(editor.getHTML());
  }, [block.richText, block.text, editor]);
  const importHtml = value => {
    setSource(value);
    try {
      const dom = new window.DOMParser().parseFromString(value, 'text/html');
      const allowed = ['P','BR','STRONG','B','EM','I','U','S','DEL','CODE','PRE','A','MARK','H2','H3','H4','UL','OL','LI','BLOCKQUOTE','HR'];
      for (const el of dom.body.querySelectorAll('*')) {
        if (!allowed.includes(el.tagName) || Array.from(el.attributes).some(attr => attr.name.startsWith('on'))) throw new Error('Ce HTML contient un élément non éditorial. Utilisez un bloc Démo HTML / CSS pour une composition personnalisée.');
      }
      const doc = validateRichDocument(ProseMirrorParser.fromSchema(editor.schema).parse(dom.body).toJSON());
      editor.commands.setContent(doc, { emitUpdate: false }); callback.current({ richText: doc, text: richPlainText(doc) }); setError('');
    } catch (failure) { setError(failure.message); }
  };
  if (!editor) return <p className="journal-setup-note">Ouverture de l’espace d’écriture…</p>;
  const tool = (name, action, active = false) => <button type="button" key={name} title={name} aria-label={name} aria-pressed={active} disabled={disabled} onMouseDown={event => event.preventDefault()} onClick={action}>{name}</button>;
  return <div className={'atelier-rich ' + (shared ? 'atelier-rich-shared' : '')} data-revision={revision}>
    <div className="atelier-format" role="toolbar" aria-label={'Mise en forme : ' + label}>
      {tool('Gras', () => editor.chain().focus().toggleBold().run(), editor.isActive('bold'))}
      {tool('Italique', () => editor.chain().focus().toggleItalic().run(), editor.isActive('italic'))}
      {tool('Souligner', () => editor.chain().focus().toggleUnderline().run(), editor.isActive('underline'))}
      {tool('Surligner', () => editor.chain().focus().toggleHighlight().run(), editor.isActive('highlight'))}
      <select aria-label="Style du texte sélectionné" disabled={disabled} value={editor.isActive('heading',{level:2}) ? '2' : editor.isActive('heading',{level:3}) ? '3' : editor.isActive('heading',{level:4}) ? '4' : 'p'} onChange={event => event.target.value === 'p' ? editor.chain().focus().setParagraph().run() : editor.chain().focus().toggleHeading({level:Number(event.target.value)}).run()}><option value="p">Paragraphe</option><option value="2">Titre 2</option><option value="3">Titre 3</option><option value="4">Titre 4</option></select>
      {[['left','À gauche'],['center','Centrer'],['right','À droite'],['justify','Justifier']].map(([value, name]) => tool(name, () => editor.chain().focus().setTextAlign(value).run(),editor.isActive({textAlign:value})))}
      {tool('Liste à puces', () => editor.chain().focus().toggleBulletList().run(), editor.isActive('bulletList'))}
      {tool('Liste numérotée', () => editor.chain().focus().toggleOrderedList().run(), editor.isActive('orderedList'))}
      {tool('Lien', () => setLink(editor.getAttributes('link').href || 'https://'))}
      {tool('Code en ligne', () => editor.chain().focus().toggleCode().run(),editor.isActive('code'))}
      {tool('Annuler le texte', () => editor.chain().focus().undo().run())}
      {tool('Rétablir le texte', () => editor.chain().focus().redo().run())}
    </div>
    {link !== null && <div className="atelier-link"><label>Adresse du lien<input aria-label="Adresse du lien" value={link} onChange={event => setLink(event.target.value)} /></label><button type="button" onClick={() => { try { validateRichDocument({type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'lien',marks:[{type:'link',attrs:{href:link}}]}]}]}); editor.chain().focus().extendMarkRange('link').setLink({href:link}).run();setLink(null);setError(''); } catch(failure){setError(failure.message);} }}>Appliquer le lien</button><button type="button" onClick={() => {editor.chain().focus().unsetLink().run();setLink(null);}}>Retirer le lien</button><button type="button" onClick={() => setLink(null)}>Fermer</button></div>}
    <div className="atelier-rich-panes">{shared && <label className="atelier-html-source">Source HTML du texte<textarea aria-label={'Source HTML : ' + label} value={source} onChange={event => importHtml(event.target.value)} spellCheck={false} rows={12} disabled={disabled} /><small>Les modifications HTML valides actualisent le texte. Pour du HTML libre, utilisez une démonstration isolée.</small></label>}<EditorContent editor={editor} /></div>
    {error && <p className="admin-error" role="alert">{error} Le dernier texte valide est conservé.</p>}
  </div>;
}

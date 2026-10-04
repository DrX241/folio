import { articleUrl } from '@/lib/article-blocks.mjs';

function RichNode({ node }) {
  if (node.type === 'text') {
    let result = node.text;
    for (const mark of node.marks || []) {
      if (mark.type === 'link' && articleUrl(mark.attrs?.href)) result = <a href={mark.attrs.href} target="_blank" rel="noopener noreferrer">{result}</a>;
      else { const Tag = { bold: 'strong', italic: 'em', underline: 'u', strike: 's', code: 'code', highlight: 'mark' }[mark.type]; if (Tag) result = <Tag>{result}</Tag>; }
    }
    return result;
  }
  if (node.type === 'hardBreak') return <br />;
  if (node.type === 'horizontalRule') return <hr />;
  const children = (node.content || []).map((child, index) => <RichNode node={child} key={index} />);
  if (node.type === 'doc') return children;
  if (node.type === 'codeBlock') return <pre tabIndex={0}><code>{children}</code></pre>;
  const Tag = node.type === 'heading' ? 'h' + ([2,3,4].includes(node.attrs?.level) ? node.attrs.level : 3) : { paragraph:'p', bulletList:'ul', orderedList:'ol', listItem:'li', blockquote:'blockquote' }[node.type];
  if (!Tag) return null;
  const align = ['left','center','right','justify'].includes(node.attrs?.textAlign) ? node.attrs.textAlign : undefined;
  return <Tag style={align ? { textAlign: align } : undefined} {...(node.type === 'orderedList' ? { start: node.attrs?.start || 1 } : {})}>{children}</Tag>;
}
export default function RichDocument({ document }) { return <div className="journal-rich-document"><RichNode node={document} /></div>; }

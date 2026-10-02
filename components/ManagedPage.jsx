import { notFound } from 'next/navigation';
import { publicContent } from '@/lib/cms-store.mjs';
import { pageMetadata } from '@/lib/site';
import CmsRenderer from './CmsRenderer';
export async function managedMetadata(path) {
  const { cms } = await publicContent();
  const doc = cms.documents[path];
  return doc && doc.enabled !== false ? pageMetadata(doc.title, doc.description, path) : { title: 'Page introuvable' };
}
export default async function ManagedPage({ path }) {
  const { cms, articles } = await publicContent();
  const doc = cms.documents[path];
  if (!doc || doc.enabled === false) notFound();
  const projects = Object.values(cms.documents).filter(item => item.kind === 'project' && item.enabled !== false);
  return <CmsRenderer document={doc} articles={articles.sort((a,b) => b.date.localeCompare(a.date))} projects={projects} settings={cms.settings} />;
}

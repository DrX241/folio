import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { sessionAccount, adminContent } from '@/lib/cms-store.mjs';
import CmsPreview from '@/components/CmsPreview';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Aperçu privé', robots: { index: false, follow: false } };
export default async function PreviewPage() {
  const token = (await cookies()).get('eddy_admin')?.value;
  if (!(await sessionAccount(token))) redirect('/admin');
  const data = await adminContent(token);
  return <CmsPreview initial={data.cms.draft} articles={data.articles.filter(article => article.status === 'published')} />;
}

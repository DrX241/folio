import Link from 'next/link';
import { cookies } from 'next/headers';
import { sessionAccount } from '@/lib/cms-store.mjs';

export default async function ArticleAdminLink({ id }) {
  const token=(await cookies()).get('eddy_admin')?.value;
  if(!token || !(await sessionAccount(token)))return null;
  return <Link className="u-link journal-admin-link" href={'/admin?article='+encodeURIComponent(id)}>Modifier cet article dans l’atelier ↗</Link>;
}

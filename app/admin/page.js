import { cookies } from 'next/headers';
import AdminWorkspace from '@/components/AdminWorkspace';
import { adminContent, hasAccount, sessionAccount } from '@/lib/cms-store.mjs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const metadata = { title: 'Administration', robots: { index: false, follow: false }, referrer: 'no-referrer' };
export default async function AdminPage({ searchParams }) {
  const token = (await cookies()).get('eddy_admin')?.value;
  const account = await sessionAccount(token);
  const configured = await hasAccount();
  const params = await searchParams;
  return <AdminWorkspace initial={account ? await adminContent(token) : null} configured={configured} setupKey={!configured && typeof params.setup === 'string' ? params.setup : ''} />;
}

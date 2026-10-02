import ManagedPage, { managedMetadata } from '@/components/ManagedPage';
export const dynamic = 'force-dynamic';
export async function generateMetadata({ params }) { return managedMetadata('/' + (await params).cms.join('/')); }
export default async function Page({ params }) { return <ManagedPage path={'/' + (await params).cms.join('/')} />; }

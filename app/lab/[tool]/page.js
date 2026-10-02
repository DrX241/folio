import ManagedPage, { managedMetadata } from "@/components/ManagedPage";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }) { return managedMetadata("/lab/" + (await params).tool); }
export default async function Page({ params }) { return <ManagedPage path={"/lab/" + (await params).tool} />; }


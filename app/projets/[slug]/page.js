import ManagedPage, { managedMetadata } from "@/components/ManagedPage";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }) { return managedMetadata("/projets/" + (await params).slug); }
export default async function Page({ params }) { return <ManagedPage path={"/projets/" + (await params).slug} />; }

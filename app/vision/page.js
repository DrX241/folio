import ManagedPage, { managedMetadata } from "@/components/ManagedPage";
export const dynamic = "force-dynamic";
export function generateMetadata() { return managedMetadata("/vision"); }
export default function Page() { return <ManagedPage path="/vision" />; }

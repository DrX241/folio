import ManagedPage, { managedMetadata } from "@/components/ManagedPage";
export const dynamic = "force-dynamic";
export function generateMetadata() { return managedMetadata("/a-propos"); }
export default function Page() { return <ManagedPage path="/a-propos" />; }

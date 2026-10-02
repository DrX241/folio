import ManagedPage, { managedMetadata } from "@/components/ManagedPage";
export const dynamic = "force-dynamic";
export function generateMetadata() { return managedMetadata("/plan-du-site"); }
export default function Page() { return <ManagedPage path="/plan-du-site" />; }


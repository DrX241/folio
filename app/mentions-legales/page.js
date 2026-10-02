import ManagedPage, { managedMetadata } from "@/components/ManagedPage";
export const dynamic = "force-dynamic";
export function generateMetadata() { return managedMetadata("/mentions-legales"); }
export default function Page() { return <ManagedPage path="/mentions-legales" />; }


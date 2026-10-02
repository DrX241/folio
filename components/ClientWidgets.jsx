"use client";
import dynamic from "next/dynamic";

const ScrollProgress = dynamic(() => import("@/components/ScrollProgress"), { ssr: false, loading: () => null });

export default function ClientWidgets() {
  return <ScrollProgress />;
}

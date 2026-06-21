"use client";
import dynamic from "next/dynamic";

const Chatbot = dynamic(() => import("@/components/Chatbot"), { ssr: false, loading: () => null });
const ScrollProgress = dynamic(() => import("@/components/ScrollProgress"), { ssr: false, loading: () => null });

export default function ClientWidgets() {
  return (
    <>
      <ScrollProgress />
      <Chatbot />
    </>
  );
}

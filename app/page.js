"use client";
import dynamic from "next/dynamic";
import WelcomeTour from "@/components/WelcomeTour";
import HeroSection from "@/components/HeroSection";
import TimelineSection from "@/components/TimelineSection";
import LabShowcase from "@/components/LabShowcase";

const SkillsSection = dynamic(() => import("@/components/SkillsSection"), { ssr: false });

export default function HomePage() {
  return (
    <div style={{ width: "100%", maxWidth: "100%", margin: 0, padding: 0 }}>
      <WelcomeTour />
      <HeroSection />
      <TimelineSection />
      <LabShowcase />
      <div id="competences">
        <SkillsSection />
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";
import { CmsLabContext } from './lab/CmsLabText';
import NextTokenLab from "@/components/lab/NextTokenLab";
import SemanticSpaceLab from "@/components/lab/SemanticSpaceLab";
import RagObservatory from "@/components/lab/RagObservatory";
import ClassifierClinic from "@/components/lab/ClassifierClinic";
const experiences = { "next-token": NextTokenLab, "semantic-space": SemanticSpaceLab, "rag-observatory": RagObservatory, "classifier-clinic": ClassifierClinic };
export default function LabToolRenderer({ slug, textOverrides = [] }) {
  const [attempt, setAttempt] = useState(0);
  const Experience = experiences[slug];
  return Experience ? <CmsLabContext.Provider value={textOverrides}><Experience key={attempt} /><div className="ll-restart"><p>Votre carnet reste disponible tant que vous gardez cette expérience ouverte.</p><button onClick={() => { setAttempt(previous => previous + 1); document.getElementById("etape-1")?.scrollIntoView({ behavior: "auto" }); }}>Recommencer les essais</button></div></CmsLabContext.Provider> : null;
}


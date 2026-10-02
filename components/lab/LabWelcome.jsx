"use client";
import { useState } from "react";
import Link from "next/link";
import { drawToken, tokenDistribution } from "../../lib/lab-science.mjs";
import { ProbabilityBars } from "./LearningKit";
const contexts = [
  { start: "Ce matin, je bois un", tokens: [{ word: "café", logit: 3 }, { word: "thé", logit: 2 }, { word: "jus", logit: 1 }] },
  { start: "Je me rends au bureau à", tokens: [{ word: "vélo", logit: 3 }, { word: "pied", logit: 2 }, { word: "cheval", logit: 1 }] }
];
export default function LabWelcome({ heading = "UNE PREMIÈRE MANIPULATION", intro = "La même phrase peut avoir plusieurs suites.", wakeLabel = "Au réveil", tripLabel = "Sur le trajet", drawLabel = "Tirer un mot au hasard", linkLabel = "Explorer comment une IA écrit" }) {
  const [context, setContext] = useState(0);
  const [choice, setChoice] = useState(null);
  const [draws, setDraws] = useState(0);
  const distribution = tokenDistribution(contexts[context].tokens);
  return <div className="ll-welcome-bench">
    <p className="ll-eyebrow">{heading}</p>
    <p>{intro}</p>
    <div className="ll-options" role="group" aria-label="Changer le début de la phrase"><button aria-pressed={context === 0} onClick={() => { setContext(0); setChoice(null); setDraws(0); }}>{wakeLabel}</button><button aria-pressed={context === 1} onClick={() => { setContext(1); setChoice(null); setDraws(0); }}>{tripLabel}</button></div>
    <p className="ll-welcome-sentence">{contexts[context].start} <strong>{choice || "…"}</strong></p>
    <ProbabilityBars items={distribution} />
    <button className="ll-button" onClick={() => { setChoice(drawToken(distribution)); setDraws(value => value + 1); }}>{drawLabel}</button>
    <div className="ll-welcome-feedback" aria-live="polite">{draws ? `Tirage n° ${draws} : « ${choice} ». Le mot le plus probable n’est pas imposé : relancez pour observer les variations.` : "Les pourcentages sont préparés pour cette démonstration, pas calculés par une IA. Le tirage respecte ces probabilités. Changez de phrase ou faites plusieurs essais."}</div>
    <Link href="/lab/next-token" className="ll-start-link">{linkLabel} <span aria-hidden="true">↗</span></Link>
  </div>;
}


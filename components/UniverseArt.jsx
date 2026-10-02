"use client";

import Link from "next/link";
import { useState } from "react";
import { explorations } from "@/lib/explorations";

const labels = ["Écrire", "Chercher", "Vérifier", "Apprendre"];

export default function UniverseArt({ items = explorations, heading = 'UNE QUESTION POUR COMMENCER' }) {
  const [selected, setSelected] = useState(0);
  const experience = items[selected] || items[0];
  return <section className="u-entry" aria-labelledby="entry-title">
    <div className="u-entry-heading"><p className="u-label">{heading}</p><span className="u-label">{experience.number} / 04</span></div>
    <div className="u-entry-choices" role="group" aria-label="Choisir un sujet à explorer">{labels.map((label, index) => <button type="button" key={label} aria-pressed={selected === index} onClick={() => setSelected(index)}>{label}</button>)}</div>
    <div className="u-entry-content" aria-live="polite" aria-atomic="true">
      <h2 id="entry-title">{experience.title}</h2>
      <p>{experience.description}</p>
      <div className="u-entry-takeaway"><span className="u-label">CE QUE VOUS POURREZ COMPRENDRE</span><p>{experience.takeaway}</p></div>
    </div>
    <div className="u-entry-bottom"><span>{experience.duration} · sans prérequis</span><Link href={"/lab/" + experience.slug} className="u-link">Faire l’expérience <span aria-hidden="true">↗</span></Link></div>
  </section>;
}

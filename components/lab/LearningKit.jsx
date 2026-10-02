"use client";
import { useLabText } from './CmsLabText';

export function LessonStep({ number, title, children, experiment, hint, id }) {
  const text = useLabText();
  return <section className="ll-step" id={id || "etape-" + number} aria-labelledby={"lesson-heading-" + number}>
    <div className="ll-step-number"><span>{String(number).padStart(2, "0")}</span><i /></div>
    <div className="ll-step-body"><h2 id={"lesson-heading-" + number}>{text(title)}</h2>
      <div className="ll-step-pair"><div className="ll-explanation">{text(children)}</div>
      <div className="ll-bench"><div className="ll-bench-label"><span aria-hidden="true">↳</span> À VOUS D’ESSAYER</div>{hint && <p className="ll-instruction">{text(hint)}</p>}{experiment}</div></div>
    </div>
  </section>;
}
export function Observation({ children }) {
  return <div className="ll-observation" aria-live="polite"><span>Ce qu’on observe</span><p>{children}</p></div>;
}
export function TechnicalNote({ children, title = "Pour aller plus loin" }) {
  const text = useLabText();
  return <details className="ll-technical"><summary>{text(title)}</summary><div>{text(children)}</div></details>;
}
export function ProbabilityBars({ items }) {
  return <div className="ll-probabilities">{items.map(item => <div className={item.probability === 0 ? "is-excluded" : ""} key={item.word}><span>{item.word}</span><i aria-hidden="true"><b style={{ width: (item.probability * 100) + "%" }} /></i><span>{item.probability ? Math.round(item.probability * 100) + " %" : "écarté"}</span></div>)}</div>;
}
export function Notebook({ observations, takeaway, children }) {
  return <section className="ll-notebook" id="carnet" aria-labelledby="notebook-title">
    <div><p className="ll-eyebrow">VOTRE CARNET D’EXPÉRIENCE</p><h2 id="notebook-title">Garder une trace.</h2><p>Ce carnet reprend les réglages et les résultats de votre exploration. Revenez sur une manipulation, changez un paramètre et observez la différence.</p><div className="ll-takeaway"><strong>L’idée à emporter</strong><p>{takeaway}</p></div></div>
    <div className="ll-notebook-notes"><p className="ll-eyebrow">VOS OBSERVATIONS</p>{observations.map((entry, index) => <p key={index}><span>{String(index + 1).padStart(2, "0")}</span>{entry}</p>)}{children}</div>
  </section>;
}
export function SourceLinks({ items }) {
  return <details className="ll-sources"><summary>Les références pour continuer</summary><ul>{items.map(item => <li key={item.href}><a href={item.href} target="_blank" rel="noopener noreferrer">{item.label} ↗<span className="u-sr-only"> (nouvel onglet)</span></a><span>{item.note}</span></li>)}</ul></details>;
}


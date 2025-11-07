import Link from "next/link";

export const metadata = { 
  title: "Labs — Expériences immersives | Eddy MISSONI Idembi",
  description: "Quatre espaces interactifs pour expérimenter l'IA générative, les LLM, les plateformes immersives et l'industrialisation Data/Cloud."
};

export default function LabsPage() {
  return (
    <>
      <h1 className="section-title" style={{ fontSize: 48, marginTop: 0 }}>
        Labs — Démonstrations pédagogiques
      </h1>
      <p style={{ color: "var(--fg-muted)", marginTop: 0, fontSize: 18, maxWidth: 700, marginBottom: 48 }}>
        Six espaces interactifs pour expérimenter l'IA générative, les LLM, la BI, la Data Science, la gestion de projet et l'industrialisation Data/Cloud. 
        Chaque Lab illustre une réalisation concrète et renvoie vers les projets détaillés.
      </p>

      <div className="grid" style={{ marginTop: 0, gridTemplateColumns: "repeat(3, 1fr)" }}>
        <Link href="/labs/rag-studio" className="card" style={{ display: "block" }}>
          <div style={{ fontSize: 12, color: "var(--accent)", marginBottom: 12, fontWeight: 600, textTransform: "uppercase", fontFamily: "monospace" }}>
            Lab 1
          </div>
          <h3>RAG Studio</h3>
          <p style={{ marginBottom: 16 }}>IA Générative & Knowledge — Simulation pédagogique du pipeline RAG : ingestion, vectorisation, recherche, génération.</p>
          <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span className="badge">RAG</span>
            <span className="badge">Vectorisation</span>
            <span className="badge">Génération</span>
          </div>
          <div style={{ marginTop: 16, fontSize: 13, color: "var(--fg-muted)", fontFamily: "monospace" }}>
            → Expérimenter
          </div>
        </Link>

        <Link href="/labs/gen-lab" className="card" style={{ display: "block" }}>
          <div style={{ fontSize: 12, color: "var(--accent)", marginBottom: 12, fontWeight: 600, textTransform: "uppercase", fontFamily: "monospace" }}>
            Lab 2
          </div>
          <h3>GEN Lab</h3>
          <p style={{ marginBottom: 16 }}>LLM Engineering & Agents — Mini-orchestrateur visuel avec arbre de décision et exécution d'étapes.</p>
          <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span className="badge">LLM</span>
            <span className="badge">Agents</span>
            <span className="badge">Orchestration</span>
          </div>
          <div style={{ marginTop: 16, fontSize: 13, color: "var(--fg-muted)", fontFamily: "monospace" }}>
            → Expérimenter
          </div>
        </Link>

        <Link href="/labs/fyne" className="card" style={{ display: "block" }}>
          <div style={{ fontSize: 12, color: "var(--accent)", marginBottom: 12, fontWeight: 600, textTransform: "uppercase", fontFamily: "monospace" }}>
            Lab 3
          </div>
          <h3>FYNE</h3>
          <p style={{ marginBottom: 16 }}>Plateforme immersive alimentée par IA — Hub de modules interactifs : simulateurs, escape games, parcours pédagogiques.</p>
          <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span className="badge">Immersif</span>
            <span className="badge">Gamification</span>
            <span className="badge">Formation</span>
          </div>
          <div style={{ marginTop: 16, fontSize: 13, color: "var(--fg-muted)", fontFamily: "monospace" }}>
            → Expérimenter
          </div>
        </Link>

        <Link href="/labs/data-cloud" className="card" style={{ display: "block" }}>
          <div style={{ fontSize: 12, color: "var(--accent)", marginBottom: 12, fontWeight: 600, textTransform: "uppercase", fontFamily: "monospace" }}>
            Lab 4
          </div>
          <h3>DATA & CLOUD Lab</h3>
          <p style={{ marginBottom: 16 }}>Industrialisation & Architecture — Schéma interactif de flux : upload, analyse, résultat structuré.</p>
          <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span className="badge">Cloud</span>
            <span className="badge">Architecture</span>
            <span className="badge">Industrialisation</span>
          </div>
          <div style={{ marginTop: 16, fontSize: 13, color: "var(--fg-muted)", fontFamily: "monospace" }}>
            → Expérimenter
          </div>
        </Link>

        <Link href="/labs/bi-studio" className="card" style={{ display: "block" }}>
          <div style={{ fontSize: 12, color: "var(--accent)", marginBottom: 12, fontWeight: 600, textTransform: "uppercase", fontFamily: "monospace" }}>
            Lab 5
          </div>
          <h3>BI Studio</h3>
          <p style={{ marginBottom: 16 }}>Business Intelligence & Décisionnel — Simulation interactive de création de dashboards BI : KPIs, visualisations, indicateurs de performance.</p>
          <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span className="badge">BI</span>
            <span className="badge">Dashboards</span>
            <span className="badge">KPIs</span>
          </div>
          <div style={{ marginTop: 16, fontSize: 13, color: "var(--fg-muted)", fontFamily: "monospace" }}>
            → Expérimenter
          </div>
        </Link>

        <Link href="/labs/data-science" className="card" style={{ display: "block" }}>
          <div style={{ fontSize: 12, color: "var(--accent)", marginBottom: 12, fontWeight: 600, textTransform: "uppercase", fontFamily: "monospace" }}>
            Lab 6
          </div>
          <h3>Data Science Lab</h3>
          <p style={{ marginBottom: 16 }}>Analyse & Modélisation — Simulation interactive d'analyses Data Science : prédictions, clustering, détection d'anomalies, corrélations.</p>
          <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span className="badge">Data Science</span>
            <span className="badge">ML</span>
            <span className="badge">Analyse</span>
          </div>
          <div style={{ marginTop: 16, fontSize: 13, color: "var(--fg-muted)", fontFamily: "monospace" }}>
            → Expérimenter
          </div>
        </Link>
      </div>
    </>
  );
}


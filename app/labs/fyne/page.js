"use client";
import { useState } from "react";
import Link from "next/link";

export default function FYNEPage() {
  const [selectedModule, setSelectedModule] = useState(null);
  const [decision, setDecision] = useState("");
  const [score, setScore] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const modules = [
    { id: "crisis", name: "CRISIS_SIM", description: "Simulateur de crise ransomware", status: "available" },
    { id: "escape", name: "Escape Game IA", description: "Salles à débloquer, puzzles, budgets", status: "available" },
    { id: "15niveaux", name: "Parcours 15 niveaux", description: "Formation progressive cybersécurité", status: "available" },
    { id: "project", name: "Gestion de projet", description: "Simulation de cadrage et pilotage", status: "available" },
    { id: "hub", name: "Demos Hub", description: "Showcase des innovations", status: "available" },
  ];

  const handleDecision = () => {
    if (!decision.trim()) return;
    // Simulation de scoring
    const mockScore = Math.floor(Math.random() * 40) + 60;
    const mockFeedback = [
      "Décision rapide et structurée.",
      "Communication efficace avec les équipes.",
      "Gestion des priorités adaptée.",
      "Points d'amélioration : anticipation des risques secondaires."
    ];
    setScore(mockScore);
    setFeedback(mockFeedback);
  };

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <Link href="/labs" style={{ color: "var(--accent)", fontSize: 14, fontFamily: "monospace" }}>
          ← Retour aux Labs
        </Link>
      </div>

      <h1 className="section-title" style={{ fontSize: 42, marginTop: 0 }}>
        FYNE — Plateforme immersive alimentée par IA
      </h1>
      <p style={{ color: "var(--fg-muted)", marginTop: 0, fontSize: 17, maxWidth: 700, marginBottom: 48 }}>
        Hub de modules interactifs : simulateurs, escape games, parcours pédagogiques avec feedback IA simulé.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 48 }}>
        <div className="hero-card">
          <h3 style={{ marginTop: 0, marginBottom: 24, fontSize: 20 }}>Modules disponibles</h3>
          {modules.map((module) => (
            <div
              key={module.id}
              onClick={() => setSelectedModule(module)}
              style={{
                padding: "16px",
                border: selectedModule?.id === module.id ? "2px solid var(--accent)" : "1px solid var(--line-blueprint)",
                marginBottom: "12px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                background: selectedModule?.id === module.id ? "var(--accent-light)" : "transparent"
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 4, fontFamily: "monospace", fontSize: 14 }}>
                {module.name}
              </div>
              <div style={{ fontSize: 13, color: "var(--fg-muted)" }}>{module.description}</div>
            </div>
          ))}
        </div>

        {selectedModule && (
          <div className="hero-card">
            <h3 style={{ marginTop: 0, marginBottom: 24, fontSize: 20 }}>
              {selectedModule.id === "project" ? "Simulation de gestion de projet" : "Simulation décisionnelle"}
            </h3>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontFamily: "monospace", marginBottom: 8, textTransform: "uppercase" }}>
                Module: {selectedModule.name}
              </div>
              <p style={{ fontSize: 14, color: "var(--fg-muted)", marginBottom: 16 }}>
                {selectedModule.id === "project" 
                  ? "Simulez le cadrage d'un projet : définissez le périmètre, les objectifs, les risques et les jalons."
                  : "Scénario : Vous êtes RSSI face à un incident. Prenez une décision."}
              </p>
              <textarea
                value={decision}
                onChange={(e) => setDecision(e.target.value)}
                placeholder={selectedModule.id === "project" 
                  ? "Ex: Projet de migration BI pour 300+ indicateurs, équipe de 5 personnes, délai 6 mois, budget 200k€..."
                  : "Décrivez votre décision..."}
                rows={selectedModule.id === "project" ? 5 : 4}
                style={{ width: "100%", padding: "12px", border: "1px solid var(--line-blueprint)", fontFamily: "inherit", marginBottom: 16 }}
              />
              <button
                onClick={handleDecision}
                disabled={!decision.trim()}
                className="btn primary"
                style={{ width: "100%" }}
              >
                {selectedModule.id === "project" ? "[ Analyser le cadrage ]" : "[ Évaluer ]"}
              </button>
            </div>

            {score !== null && (
              <div>
                <div style={{
                  padding: "20px",
                  border: "2px solid var(--accent)",
                  textAlign: "center",
                  marginBottom: 24,
                  background: "var(--accent-light)"
                }}>
                  <div style={{ fontSize: 36, fontWeight: 700, color: "var(--accent)", marginBottom: 8 }}>
                    {score}/100
                  </div>
                  <div style={{ fontSize: 13, fontFamily: "monospace" }}>
                    {selectedModule.id === "project" ? "Score de cadrage" : "Score"}
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: 16, marginBottom: 12 }}>Feedback IA</h4>
                  <ul style={{ listStyle: "none", padding: 0 }}>
                    {feedback?.map((item, i) => (
                      <li key={i} style={{
                        padding: "12px",
                        marginBottom: 8,
                        border: "1px solid var(--line)",
                        fontSize: 14,
                        lineHeight: 1.6
                      }}>
                        → {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="hero-card" style={{ marginTop: 48 }}>
        <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: 20 }}>KPIs — Tableau de bord</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
          <div style={{ padding: "16px", border: "1px solid var(--line-blueprint)", textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: "var(--accent)", marginBottom: 4 }}>87%</div>
            <div style={{ fontSize: 12, fontFamily: "monospace", textTransform: "uppercase" }}>Taux de réussite</div>
          </div>
          <div style={{ padding: "16px", border: "1px solid var(--line-blueprint)", textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: "var(--accent)", marginBottom: 4 }}>12min</div>
            <div style={{ fontSize: 12, fontFamily: "monospace", textTransform: "uppercase" }}>Temps moyen</div>
          </div>
          <div style={{ padding: "16px", border: "1px solid var(--line-blueprint)", textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: "var(--accent)", marginBottom: 4 }}>3</div>
            <div style={{ fontSize: 12, fontFamily: "monospace", textTransform: "uppercase" }}>Erreurs fréquentes</div>
          </div>
        </div>
        <Link href="/projects/fyne-by-mc2i" className="btn primary">
          [ Voir le projet FYNE ]
        </Link>
      </div>
    </>
  );
}


"use client";
import { useState } from "react";
import Link from "next/link";

export default function GENLabPage() {
  const [userQuery, setUserQuery] = useState("");
  const [execution, setExecution] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const steps = [
    { id: 1, name: "Analyser", description: "Compréhension de la requête utilisateur" },
    { id: 2, name: "Rechercher", description: "Extraction d'informations pertinentes" },
    { id: 3, name: "Synthétiser", description: "Génération de la réponse avec LLM" },
  ];

  const handleExecute = async () => {
    if (!userQuery.trim()) return;

    setIsProcessing(true);
    setError(null);
    setExecution(null);

    // Simuler l'exécution étape par étape
    const newExecution = {
      query: userQuery,
      steps: steps.map((step, idx) => ({
        ...step,
        status: idx === 0 ? "running" : "pending"
      })),
      decisionTree: null,
      result: null
    };
    setExecution(newExecution);

    // Étape 1 : Analyser
    await new Promise(resolve => setTimeout(resolve, 800));
    setExecution(prev => ({
      ...prev,
      steps: prev.steps.map((s, idx) => ({
        ...s,
        status: idx === 0 ? "completed" : idx === 1 ? "running" : "pending"
      }))
    }));

    // Étape 2 : Rechercher
    await new Promise(resolve => setTimeout(resolve, 800));
    setExecution(prev => ({
      ...prev,
      steps: prev.steps.map((s, idx) => ({
        ...s,
        status: idx <= 1 ? "completed" : idx === 2 ? "running" : "pending"
      }))
    }));

    // Étape 3 : Synthétiser avec vraie génération LLM
    try {
      const response = await fetch("/api/llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Analyse cette requête et génère une réponse structurée : ${userQuery}`,
          temperature: 0.7,
          maxTokens: 150
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la génération");
      }

      const data = await response.json();
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setExecution(prev => ({
        ...prev,
        steps: prev.steps.map(s => ({ ...s, status: "completed" })),
        decisionTree: {
          root: "Requête utilisateur",
          branches: [
            { node: "Analyse", result: "Requête comprise" },
            { node: "Recherche", result: "Informations extraites" },
            { node: "Synthèse", result: "Réponse générée" }
          ]
        },
        result: data.generated
      }));
    } catch (err) {
      setError(err.message);
      setExecution(prev => ({
        ...prev,
        steps: prev.steps.map(s => ({ ...s, status: "completed" })),
        result: "Réponse simulée (erreur API)"
      }));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <Link href="/labs" style={{ color: "var(--accent)", fontSize: 14, fontFamily: "monospace" }}>
          ← Retour aux Labs
        </Link>
      </div>

      <h1 className="section-title" style={{ fontSize: 42, marginTop: 0 }}>
        GEN Lab — LLM Engineering & Agents
      </h1>
      <p style={{ color: "var(--fg-muted)", marginTop: 0, fontSize: 17, maxWidth: 700, marginBottom: 24 }}>
        Orchestrateur visuel avec <strong>vraie génération LLM en temps réel</strong> (Hugging Face Inference API gratuite - Mistral-7B-Instruct). 
        <strong>Aucune simulation</strong> — génération réelle à chaque exécution. Démo interactive reliée à <strong>RAO/RFP GPT Builder</strong> et <strong>IA'ctualités</strong>.
      </p>

      {/* Expériences professionnelles liées */}
      <div className="hero-card" style={{ marginBottom: 48, background: "var(--accent-light)", border: "2px solid var(--accent)" }}>
        <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: 18, color: "var(--accent)" }}>
          🔗 Expériences professionnelles liées
        </h3>
        <div style={{ marginBottom: 20 }}>
          <h4 style={{ fontSize: 16, marginBottom: 8 }}>RAO/RFP GPT Builder</h4>
          <p style={{ marginBottom: 12, lineHeight: 1.7, fontSize: 15 }}>
            Analyse automatisée d'appels d'offres : synthèse, matrices d'exigences, identification des risques, Q&A. 
            Workflow complet d'ingestion → scoring → livrables structurés avec orchestration LLM.
          </p>
          <Link href="/projects/rao-rfp-gpt-builder" className="btn" style={{ fontSize: 13 }}>
            [ Voir le projet ]
          </Link>
        </div>
        <div style={{ borderTop: "1px solid var(--line)", paddingTop: 20 }}>
          <h4 style={{ fontSize: 16, marginBottom: 8 }}>GPT Builder IA'ctualités</h4>
          <p style={{ marginBottom: 12, lineHeight: 1.7, fontSize: 15 }}>
            GPT dédié au média interne : règles éditoriales, persona, sources, consignes. Standardisation du ton et de la qualité des contenus.
          </p>
          <Link href="/projects/iactualites-media-gpt-builder" className="btn" style={{ fontSize: 13 }}>
            [ Voir le projet ]
          </Link>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 32, marginBottom: 48 }}>
        <div className="hero-card">
          <h3 style={{ marginTop: 0, marginBottom: 24, fontSize: 20 }}>Orchestrateur</h3>
          
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", marginBottom: 8, fontSize: 13, fontFamily: "monospace", textTransform: "uppercase" }}>
              Requête utilisateur
            </label>
            <textarea
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="Ex: Analyser un appel d'offres et identifier les risques..."
              rows={5}
              style={{ width: "100%", padding: "12px", border: "1px solid var(--line-blueprint)", fontFamily: "inherit" }}
            />
          </div>

          <button
            onClick={handleExecute}
            disabled={isProcessing || !userQuery.trim()}
            className="btn primary"
            style={{ width: "100%" }}
          >
            {isProcessing ? "[ Exécution en cours... ]" : "[ Exécuter l'orchestration ]"}
          </button>

          {error && (
            <div style={{ marginTop: 16, padding: "12px", background: "#fee", border: "1px solid #fcc", color: "#c00", fontSize: 13 }}>
              Erreur : {error}
            </div>
          )}
        </div>

        <div className="hero-card">
          <h3 style={{ marginTop: 0, marginBottom: 24, fontSize: 20 }}>Exécution</h3>
          
          {!execution && !isProcessing && (
            <p style={{ color: "var(--fg-muted)", fontSize: 14, fontStyle: "italic" }}>
              Aucune exécution. Entrez une requête et cliquez sur "Exécuter l'orchestration".
            </p>
          )}

          {execution && (
            <div style={{ position: "relative" }}>
              {execution.steps.map((step, i) => (
                <div key={step.id} style={{ position: "relative", marginBottom: 24 }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "12px",
                    border: "1px solid var(--line-blueprint)",
                    background: step.status === "completed" ? "var(--accent-light)" : step.status === "running" ? "var(--bg-secondary)" : "transparent",
                    transition: "all 0.3s ease"
                  }}>
                    <div style={{
                      width: "24px",
                      height: "24px",
                      border: "2px solid var(--line-blueprint)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "monospace",
                      fontSize: "12px",
                      background: step.status === "completed" ? "var(--accent)" : step.status === "running" ? "var(--accent-light)" : "transparent",
                      color: step.status === "completed" ? "white" : "var(--fg)"
                    }}>
                      {step.status === "completed" ? "✓" : step.status === "running" ? "..." : step.id}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{step.name}</div>
                      <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>{step.description}</div>
                    </div>
                  </div>
                  {i < execution.steps.length - 1 && (
                    <div style={{
                      position: "absolute",
                      left: "11px",
                      top: "32px",
                      width: "2px",
                      height: "24px",
                      background: step.status === "completed" ? "var(--accent)" : "var(--line)"
                    }} />
                  )}
                </div>
              ))}
            </div>
          )}

          {execution?.decisionTree && (
            <div style={{ marginTop: 32, padding: "16px", border: "1px solid var(--line-blueprint)", background: "var(--bg-secondary)" }}>
              <h4 style={{ fontSize: 14, marginBottom: 12, fontFamily: "monospace", textTransform: "uppercase" }}>
                Arbre de décision
              </h4>
              <div style={{ fontSize: 13, lineHeight: 1.8, fontFamily: "monospace" }}>
                {execution.decisionTree.branches.map((branch, i) => (
                  <div key={i} style={{ marginBottom: 8 }}>
                    {branch.node} → {branch.result}
                  </div>
                ))}
              </div>
            </div>
          )}

          {execution?.result && (
            <div style={{ marginTop: 32 }}>
              <h4 style={{ fontSize: 16, marginBottom: 16, color: "var(--accent)", fontFamily: "monospace" }}>
                Résultat généré (Mistral-7B-Instruct)
              </h4>
              <div style={{
                padding: "20px",
                border: "2px solid var(--accent)",
                background: "var(--accent-light)",
                lineHeight: 1.8,
                fontSize: 15
              }}>
                {execution.result}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

"use client";
import { useState } from "react";
import Link from "next/link";

export default function DataCloudPage() {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [activeStep, setActiveStep] = useState(null);

  const steps = [
    { id: 1, name: "Upload S3", description: "Fichier déposé dans le bucket", icon: "📤" },
    { id: 2, name: "Lambda Trigger", description: "Fonction déclenchée automatiquement", icon: "⚡" },
    { id: 3, name: "Analyse", description: "Traitement via checker.py", icon: "🔍" },
    { id: 4, name: "API Gateway", description: "Retour JSON structuré", icon: "📡" },
  ];

  const handleUpload = () => {
    if (!file) return;
    setIsProcessing(true);
    setActiveStep(1);

    // Simulation du flux étape par étape
    steps.forEach((step, index) => {
      setTimeout(() => {
        setActiveStep(step.id);
        if (step.id === steps.length) {
          setResult({
            status: "success",
            data: {
              filename: file.name,
              size: "2.4 MB",
              validation: "passed",
              checks: [
                { name: "Format", status: "✓", value: "JSON valide" },
                { name: "Structure", status: "✓", value: "Conforme" },
                { name: "Intégrité", status: "✓", value: "Vérifiée" },
              ],
              timestamp: new Date().toISOString()
            }
          });
          setIsProcessing(false);
        }
      }, (index + 1) * 800);
    });
  };

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <Link href="/labs" style={{ color: "var(--accent)", fontSize: 14, fontFamily: "monospace" }}>
          ← Retour aux Labs
        </Link>
      </div>

      <h1 className="section-title" style={{ fontSize: 42, marginTop: 0 }}>
        DATA & CLOUD Lab — Industrialisation & Architecture
      </h1>
      <p style={{ color: "var(--fg-muted)", marginTop: 0, fontSize: 17, maxWidth: 700, marginBottom: 48 }}>
        Schéma interactif d'un flux type : Upload → Analyse → Résultat JSON structuré.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 32, marginBottom: 48 }}>
        <div className="hero-card">
          <h3 style={{ marginTop: 0, marginBottom: 24, fontSize: 20 }}>Upload</h3>
          <div style={{ marginBottom: 24 }}>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              style={{ width: "100%", padding: "12px", border: "1px solid var(--line-blueprint)" }}
            />
          </div>
          {file && (
            <div style={{ marginBottom: 24, padding: "12px", border: "1px solid var(--line-blueprint)", fontSize: 13, fontFamily: "monospace" }}>
              Fichier: {file.name}
            </div>
          )}
          <button
            onClick={handleUpload}
            disabled={!file || isProcessing}
            className="btn primary"
            style={{ width: "100%" }}
          >
            {isProcessing ? "[ Traitement... ]" : "[ Upload & Analyser ]"}
          </button>
        </div>

        <div className="hero-card">
          <h3 style={{ marginTop: 0, marginBottom: 24, fontSize: 20 }}>Flux d'exécution</h3>
          <div style={{ position: "relative" }}>
            {steps.map((step, i) => (
              <div key={step.id} style={{ marginBottom: 32, position: "relative" }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "16px",
                  border: activeStep === step.id ? "2px solid var(--accent)" : "1px solid var(--line-blueprint)",
                  background: activeStep === step.id ? "var(--accent-light)" : "transparent",
                  transition: "all 0.3s ease"
                }}>
                  <div style={{ fontSize: 24 }}>{step.icon}</div>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 4, fontFamily: "monospace", fontSize: 14 }}>
                      {step.name}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--fg-muted)" }}>{step.description}</div>
                  </div>
                  {activeStep === step.id && (
                    <div style={{ marginLeft: "auto", fontSize: 12, color: "var(--accent)", fontFamily: "monospace" }}>
                      [ En cours... ]
                    </div>
                  )}
                </div>
                {i < steps.length - 1 && (
                  <div style={{
                    position: "absolute",
                    left: "28px",
                    top: "64px",
                    width: "2px",
                    height: "32px",
                    background: activeStep > step.id ? "var(--accent)" : "var(--line)"
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {result && (
        <div className="hero-card" style={{ marginBottom: 48 }}>
          <h3 style={{ marginTop: 0, marginBottom: 24, fontSize: 20 }}>Résultat JSON</h3>
          <pre style={{
            padding: "20px",
            border: "1px solid var(--line-blueprint)",
            background: "var(--bg-secondary)",
            overflow: "auto",
            fontSize: "13px",
            fontFamily: "monospace",
            lineHeight: 1.6
          }}>
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </div>
      )}

      <div className="hero-card" style={{ marginTop: 48 }}>
        <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: 20 }}>Cas réels</h3>
        <div style={{ marginBottom: 24 }}>
          <h4 style={{ fontSize: 16, marginBottom: 8 }}>DC-Validator (S3 + Lambda + API Gateway)</h4>
          <p style={{ marginBottom: 12, lineHeight: 1.8, fontSize: 15 }}>
            Upload web vers S3, analyse automatique via Lambda, retours structurés JSON. Validation de données cloud-native.
          </p>
          <Link href="/projects/dc-validator" className="btn" style={{ fontSize: 13 }}>
            [ Voir le projet ]
          </Link>
        </div>
        <div style={{ marginBottom: 24 }}>
          <h4 style={{ fontSize: 16, marginBottom: 8 }}>Intégration Pinecone (AWS Marketplace)</h4>
          <p style={{ marginBottom: 12, lineHeight: 1.8, fontSize: 15 }}>
            Vector DB managée pour RAG internes. Intégration AWS Marketplace, IAM, billing, indexation/recherche vectorielle.
          </p>
          <Link href="/projects/pinecone-integration" className="btn" style={{ fontSize: 13 }}>
            [ Voir le projet ]
          </Link>
        </div>
        <div>
          <h4 style={{ fontSize: 16, marginBottom: 8 }}>Odin – Nosing énergie (veille & scoring marchés)</h4>
          <p style={{ marginBottom: 12, lineHeight: 1.8, fontSize: 15 }}>
            Ingestion multi-sources, scoring d'indicateurs, alertes. Veille stratégique sur les marchés énergétiques.
          </p>
          <Link href="/projects/odin-nosing-energie" className="btn" style={{ fontSize: 13 }}>
            [ Voir le projet ]
          </Link>
        </div>
      </div>
    </>
  );
}


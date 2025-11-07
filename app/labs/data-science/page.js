"use client";
import { useState } from "react";
import Link from "next/link";

export default function DataSciencePage() {
  const [selectedAnalysis, setSelectedAnalysis] = useState("prediction");
  const [inputData, setInputData] = useState("");
  const [results, setResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const analyses = [
    { id: "prediction", name: "Prédiction", description: "Modèle prédictif sur données temporelles" },
    { id: "clustering", name: "Clustering", description: "Segmentation et regroupement de données" },
    { id: "anomaly", name: "Détection d'anomalies", description: "Identification de valeurs aberrantes" },
    { id: "correlation", name: "Analyse de corrélation", description: "Relations entre variables" },
  ];

  const runAnalysis = () => {
    if (!inputData.trim()) {
      alert("Veuillez entrer des données à analyser");
      return;
    }

    setIsProcessing(true);
    setResults(null);

    // Simulation d'analyse Data Science
    setTimeout(() => {
      const mockResults = {
        prediction: {
          title: "Prédiction temporelle",
          accuracy: "87.3%",
          predictions: [
            { period: "T+1", value: 1247, confidence: 0.89 },
            { period: "T+2", value: 1289, confidence: 0.85 },
            { period: "T+3", value: 1321, confidence: 0.82 },
          ],
          insights: [
            "Tendance haussière détectée (+6.2% sur 3 périodes)",
            "Modèle Random Forest avec 87.3% de précision",
            "Facteurs clés : saisonnalité, historique, variables externes"
          ]
        },
        clustering: {
          title: "Segmentation",
          clusters: 4,
          distribution: [
            { cluster: "Groupe A", size: 342, characteristics: "Haut volume, faible marge" },
            { cluster: "Groupe B", size: 198, characteristics: "Volume moyen, marge élevée" },
            { cluster: "Groupe C", size: 456, characteristics: "Faible volume, marge variable" },
            { cluster: "Groupe D", size: 251, characteristics: "Volume élevé, marge moyenne" },
          ],
          insights: [
            "4 segments identifiés via K-means (k=4)",
            "Groupe C représente 43% de la population",
            "Recommandation : stratégie différenciée par segment"
          ]
        },
        anomaly: {
          title: "Détection d'anomalies",
          anomalies: 12,
          total: 1247,
          rate: "0.96%",
          examples: [
            { id: "A001", value: 2847, expected: 1200, deviation: "+137%" },
            { id: "A002", value: 45, expected: 850, deviation: "-94.7%" },
            { id: "A003", value: 0, expected: 320, deviation: "-100%" },
          ],
          insights: [
            "12 anomalies détectées sur 1247 observations (0.96%)",
            "Méthode : Isolation Forest avec seuil à 2.5σ",
            "Actions recommandées : investigation manuelle des cas A001-A003"
          ]
        },
        correlation: {
          title: "Analyse de corrélation",
          matrix: [
            { var1: "Volume", var2: "Revenus", correlation: 0.87, strength: "Forte" },
            { var1: "Temps", var2: "Satisfaction", correlation: -0.62, strength: "Modérée" },
            { var1: "Qualité", var2: "Retours", correlation: -0.91, strength: "Très forte" },
          ],
          insights: [
            "Corrélation très forte entre Qualité et Retours (-0.91)",
            "Volume et Revenus fortement corrélés (+0.87)",
            "Temps impacte négativement la Satisfaction (-0.62)"
          ]
        }
      };

      setResults(mockResults[selectedAnalysis]);
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <Link href="/labs" style={{ color: "var(--accent)", fontSize: 14, fontFamily: "monospace" }}>
          ← Retour aux Labs
        </Link>
      </div>

      <h1 className="section-title" style={{ fontSize: 42, marginTop: 0 }}>
        Data Science Lab — Analyse & Modélisation
      </h1>
      <p style={{ color: "var(--fg-muted)", marginTop: 0, fontSize: 17, maxWidth: 700, marginBottom: 24 }}>
        Simulation interactive d'analyses Data Science : prédictions, clustering, détection d'anomalies, corrélations. 
        Démo reliée à <strong>DataMRO</strong> (acteur majeur de l'aéronautique) et projets d'analyse de données.
      </p>

      {/* Expérience professionnelle liée */}
      <div className="hero-card" style={{ marginBottom: 48, background: "var(--accent-light)", border: "2px solid var(--accent)" }}>
        <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: 18, color: "var(--accent)" }}>
          🔗 Expérience professionnelle : DataMRO
        </h3>
        <p style={{ marginBottom: 16, lineHeight: 1.7, fontSize: 15 }}>
          Développement de scripts Python/VBA et BI pour fiabiliser données MRO et optimiser réparations. 
          Création de tableaux de bord Power BI pour le suivi des performances de réparation et disponibilité des pièces. 
          Définition d'indicateurs clés (KPIs) en lien avec les ingénieurs production et qualité. 
          Projet réalisé pour un <strong>acteur majeur de l'aéronautique</strong>.
        </p>
        <Link href="/projects/safran-datamro-mro" className="btn primary" style={{ fontSize: 13 }}>
          [ Voir le projet complet ]
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 32, marginBottom: 48 }}>
        <div className="hero-card">
          <h3 style={{ marginTop: 0, marginBottom: 24, fontSize: 20 }}>Configuration</h3>
          
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", marginBottom: 8, fontSize: 13, fontFamily: "monospace", textTransform: "uppercase" }}>
              Type d'analyse
            </label>
            <select
              value={selectedAnalysis}
              onChange={(e) => {
                setSelectedAnalysis(e.target.value);
                setResults(null);
              }}
              style={{ width: "100%", padding: "12px", border: "1px solid var(--line-blueprint)", fontFamily: "inherit" }}
            >
              {analyses.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            <p style={{ fontSize: 12, color: "var(--fg-muted)", marginTop: 8 }}>
              {analyses.find(a => a.id === selectedAnalysis)?.description}
            </p>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", marginBottom: 8, fontSize: 13, fontFamily: "monospace", textTransform: "uppercase" }}>
              Données d'entrée (JSON ou CSV)
            </label>
            <textarea
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              placeholder='Ex: {"period": "2024-01", "value": 1200} ou données CSV...'
              rows={6}
              style={{ width: "100%", padding: "12px", border: "1px solid var(--line-blueprint)", fontFamily: "monospace", fontSize: 12 }}
            />
          </div>

          <button
            onClick={runAnalysis}
            disabled={isProcessing || !inputData.trim()}
            className="btn primary"
            style={{ width: "100%" }}
          >
            {isProcessing ? "[ Analyse en cours... ]" : "[ Lancer l'analyse ]"}
          </button>
        </div>

        <div className="hero-card">
          <h3 style={{ marginTop: 0, marginBottom: 24, fontSize: 20 }}>Résultats</h3>
          
          {!results && !isProcessing && (
            <p style={{ color: "var(--fg-muted)", fontSize: 14, fontStyle: "italic", textAlign: "center", padding: "40px" }}>
              Sélectionnez un type d'analyse, entrez des données et cliquez sur "Lancer l'analyse".
            </p>
          )}

          {isProcessing && (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--fg-muted)" }}>
              <div style={{ fontSize: 14, fontFamily: "monospace", marginBottom: 16 }}>Traitement en cours...</div>
              <div style={{ fontSize: 12, color: "var(--accent)" }}>
                Préparation données → Modélisation → Calcul résultats
              </div>
            </div>
          )}

          {results && (
            <div>
              <h4 style={{ fontSize: 18, marginBottom: 16, color: "var(--accent)" }}>
                {results.title}
              </h4>

              {results.accuracy && (
                <div style={{ marginBottom: 24, padding: "16px", border: "1px solid var(--line-blueprint)", background: "var(--bg-secondary)" }}>
                  <div style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 8, fontFamily: "monospace" }}>
                    Précision du modèle
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: "var(--accent)" }}>
                    {results.accuracy}
                  </div>
                </div>
              )}

              {results.predictions && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 14, fontFamily: "monospace", marginBottom: 12, textTransform: "uppercase" }}>
                    Prédictions
                  </div>
                  {results.predictions.map((pred, i) => (
                    <div key={i} style={{ marginBottom: 12, padding: "12px", border: "1px solid var(--line-blueprint)", display: "flex", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{pred.period}</div>
                        <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>Confiance: {(pred.confidence * 100).toFixed(0)}%</div>
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: "var(--accent)" }}>
                        {pred.value}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {results.clusters && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 14, fontFamily: "monospace", marginBottom: 12, textTransform: "uppercase" }}>
                    Segments ({results.clusters} clusters)
                  </div>
                  {results.distribution.map((cluster, i) => (
                    <div key={i} style={{ marginBottom: 12, padding: "12px", border: "1px solid var(--line-blueprint)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <div style={{ fontWeight: 600 }}>{cluster.cluster}</div>
                        <div style={{ fontSize: 14, color: "var(--accent)" }}>{cluster.size} éléments</div>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>{cluster.characteristics}</div>
                    </div>
                  ))}
                </div>
              )}

              {results.anomalies !== undefined && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 14, fontFamily: "monospace", marginBottom: 12, textTransform: "uppercase" }}>
                    Anomalies détectées: {results.anomalies} / {results.total} ({results.rate})
                  </div>
                  {results.examples.map((anomaly, i) => (
                    <div key={i} style={{ marginBottom: 12, padding: "12px", border: "2px solid #ef4444", background: "#fef2f2" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <div style={{ fontWeight: 600 }}>{anomaly.id}</div>
                        <div style={{ fontSize: 12, color: "#ef4444", fontFamily: "monospace" }}>{anomaly.deviation}</div>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>
                        Valeur: {anomaly.value} | Attendu: {anomaly.expected}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {results.matrix && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 14, fontFamily: "monospace", marginBottom: 12, textTransform: "uppercase" }}>
                    Matrice de corrélation
                  </div>
                  {results.matrix.map((corr, i) => (
                    <div key={i} style={{ marginBottom: 12, padding: "12px", border: "1px solid var(--line-blueprint)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <div style={{ fontWeight: 600 }}>{corr.var1} ↔ {corr.var2}</div>
                        <div style={{ fontSize: 14, color: "var(--accent)", fontFamily: "monospace" }}>
                          {corr.correlation > 0 ? "+" : ""}{corr.correlation.toFixed(2)}
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>{corr.strength}</div>
                    </div>
                  ))}
                </div>
              )}

              {results.insights && (
                <div style={{ padding: "16px", border: "2px solid var(--accent)", background: "var(--accent-light)" }}>
                  <div style={{ fontSize: 14, fontFamily: "monospace", marginBottom: 12, textTransform: "uppercase", color: "var(--accent)" }}>
                    Insights
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {results.insights.map((insight, i) => (
                      <li key={i} style={{ marginBottom: 8, lineHeight: 1.6 }}>{insight}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}


"use client";
import { useState } from "react";
import Link from "next/link";

export default function BIStudioPage() {
  const [selectedDataset, setSelectedDataset] = useState("ratp");
  const [kpis, setKpis] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const datasets = [
    { id: "ratp", name: "Transport - Performance contractuelle", description: "300+ indicateurs contractuels" },
    { id: "lvmh", name: "Luxe - RH & Juridique", description: "Coûts formation, effectifs, conformité" },
    { id: "safran", name: "Aéronautique - DataMRO", description: "Performance ateliers, disponibilité pièces" },
  ];

  const generateDashboard = () => {
    setIsGenerating(true);
    
    // Simulation de génération de dashboard BI
    setTimeout(() => {
      const mockKPIs = {
        ratp: [
          { label: "Indicateurs contractuels", value: "312", trend: "+5%", color: "var(--accent)" },
          { label: "Taux de conformité", value: "94.2%", trend: "+2.1%", color: "#22c55e" },
          { label: "Délai de traitement", value: "2.3j", trend: "-0.5j", color: "#3b82f6" },
          { label: "Satisfaction métiers", value: "87%", trend: "+3%", color: "#f59e0b" },
        ],
        lvmh: [
          { label: "Coûts formation", value: "€2.4M", trend: "-8%", color: "var(--accent)" },
          { label: "Effectifs", value: "1,247", trend: "+12", color: "#22c55e" },
          { label: "Conformité RH", value: "98.5%", trend: "+1.2%", color: "#3b82f6" },
          { label: "Taux de rotation", value: "4.2%", trend: "-0.8%", color: "#f59e0b" },
        ],
        safran: [
          { label: "Disponibilité pièces", value: "91%", trend: "+3%", color: "var(--accent)" },
          { label: "Temps moyen réparation", value: "18h", trend: "-2h", color: "#22c55e" },
          { label: "Taux de qualité", value: "96.8%", trend: "+1.5%", color: "#3b82f6" },
          { label: "Ateliers optimisés", value: "12/15", trend: "+2", color: "#f59e0b" },
        ],
      };

      const mockChartData = {
        ratp: [
          { month: "Jan", value: 285, target: 300 },
          { month: "Fév", value: 298, target: 300 },
          { month: "Mar", value: 305, target: 300 },
          { month: "Avr", value: 312, target: 300 },
        ],
        lvmh: [
          { month: "Q1", value: 2.6, target: 2.5 },
          { month: "Q2", value: 2.4, target: 2.5 },
          { month: "Q3", value: 2.3, target: 2.5 },
          { month: "Q4", value: 2.4, target: 2.5 },
        ],
        safran: [
          { month: "Jan", value: 88, target: 90 },
          { month: "Fév", value: 89, target: 90 },
          { month: "Mar", value: 90, target: 90 },
          { month: "Avr", value: 91, target: 90 },
        ],
      };

      setKpis(mockKPIs[selectedDataset]);
      setChartData(mockChartData[selectedDataset]);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <Link href="/labs" style={{ color: "var(--accent)", fontSize: 14, fontFamily: "monospace" }}>
          ← Retour aux Labs
        </Link>
      </div>

      <h1 className="section-title" style={{ fontSize: 42, marginTop: 0 }}>
        BI Studio — Business Intelligence & Décisionnel
      </h1>
      <p style={{ color: "var(--fg-muted)", marginTop: 0, fontSize: 17, maxWidth: 700, marginBottom: 24 }}>
        Simulation interactive de création de dashboards BI : KPIs, visualisations, indicateurs de performance. 
        Démo reliée à des projets BI réalisés pour des <strong>acteurs majeurs du transport, du luxe et de l'aéronautique</strong>.
      </p>

      {/* Expériences professionnelles liées */}
      <div className="hero-card" style={{ marginBottom: 48, background: "var(--accent-light)", border: "2px solid var(--accent)" }}>
        <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: 18, color: "var(--accent)" }}>
          🔗 Expériences professionnelles liées
        </h3>
        <div style={{ marginBottom: 20 }}>
          <h4 style={{ fontSize: 16, marginBottom: 8 }}>Acteur majeur du transport — 300+ indicateurs contractuels</h4>
          <p style={{ marginBottom: 12, lineHeight: 1.7, fontSize: 15 }}>
            Développement d'applications BI (Power BI, QlikView, Cognos) pour le suivi des coûts, qualité de service et performances économiques. 
            Maintien en condition opérationnelle de l'infocentre économique.
          </p>
          <Link href="/projects/ratp-pilotage-idfm-bi" className="btn" style={{ fontSize: 13 }}>
            [ Voir le projet ]
          </Link>
        </div>
        <div style={{ borderTop: "1px solid var(--line)", paddingTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div>
            <h4 style={{ fontSize: 16, marginBottom: 8 }}>Acteur majeur du Luxe — BI RH & Juridique</h4>
            <p style={{ marginBottom: 12, lineHeight: 1.7, fontSize: 15 }}>
              Power BI/Qlik, ETL, modélisation pour coûts de formation, effectifs, conformité.
            </p>
            <Link href="/projects/lvmh-bi-rh-juridique" className="btn" style={{ fontSize: 13 }}>
              [ Voir le projet ]
            </Link>
          </div>
          <div>
            <h4 style={{ fontSize: 16, marginBottom: 8 }}>Acteur majeur de l'aéronautique — DataMRO</h4>
            <p style={{ marginBottom: 12, lineHeight: 1.7, fontSize: 15 }}>
              Power BI pour le suivi des performances de réparation et disponibilité des pièces.
            </p>
            <Link href="/projects/safran-datamro-mro" className="btn" style={{ fontSize: 13 }}>
              [ Voir le projet ]
            </Link>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 32, marginBottom: 48 }}>
        <div className="hero-card">
          <h3 style={{ marginTop: 0, marginBottom: 24, fontSize: 20 }}>Configuration</h3>
          
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", marginBottom: 8, fontSize: 13, fontFamily: "monospace", textTransform: "uppercase" }}>
              Dataset
            </label>
            <select
              value={selectedDataset}
              onChange={(e) => {
                setSelectedDataset(e.target.value);
                setKpis(null);
                setChartData(null);
              }}
              style={{ width: "100%", padding: "12px", border: "1px solid var(--line-blueprint)", fontFamily: "inherit" }}
            >
              {datasets.map((ds) => (
                <option key={ds.id} value={ds.id}>
                  {ds.name}
                </option>
              ))}
            </select>
            <p style={{ fontSize: 12, color: "var(--fg-muted)", marginTop: 8 }}>
              {datasets.find(d => d.id === selectedDataset)?.description}
            </p>
          </div>

          <button
            onClick={generateDashboard}
            disabled={isGenerating}
            className="btn primary"
            style={{ width: "100%" }}
          >
            {isGenerating ? "[ Génération... ]" : "[ Générer le dashboard ]"}
          </button>
        </div>

        <div className="hero-card">
          <h3 style={{ marginTop: 0, marginBottom: 24, fontSize: 20 }}>Dashboard BI</h3>
          
          {!kpis && !isGenerating && (
            <p style={{ color: "var(--fg-muted)", fontSize: 14, fontStyle: "italic", textAlign: "center", padding: "40px" }}>
              Sélectionnez un dataset et cliquez sur "Générer le dashboard" pour voir les KPIs et visualisations.
            </p>
          )}

          {isGenerating && (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--fg-muted)" }}>
              <div style={{ fontSize: 14, fontFamily: "monospace", marginBottom: 16 }}>Génération du dashboard...</div>
              <div style={{ fontSize: 12, color: "var(--accent)" }}>
                Extraction données → Calcul KPIs → Création visualisations
              </div>
            </div>
          )}

          {kpis && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 32 }}>
                {kpis.map((kpi, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "20px",
                      border: "1px solid var(--line-blueprint)",
                      background: "var(--bg-secondary)",
                      textAlign: "center"
                    }}
                  >
                    <div style={{ fontSize: 11, color: "var(--fg-muted)", marginBottom: 8, fontFamily: "monospace", textTransform: "uppercase" }}>
                      {kpi.label}
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 700, color: kpi.color, marginBottom: 8 }}>
                      {kpi.value}
                    </div>
                    <div style={{ fontSize: 12, color: kpi.trend.startsWith("+") ? "#22c55e" : "#ef4444", fontFamily: "monospace" }}>
                      {kpi.trend}
                    </div>
                  </div>
                ))}
              </div>

              {chartData && (
                <div>
                  <h4 style={{ fontSize: 16, marginBottom: 16, color: "var(--accent)", fontFamily: "monospace" }}>
                    Évolution mensuelle
                  </h4>
                  <div style={{
                    padding: "20px",
                    border: "1px solid var(--line-blueprint)",
                    background: "var(--bg-secondary)",
                    minHeight: "200px",
                    display: "flex",
                    alignItems: "flex-end",
                    gap: "16px",
                    justifyContent: "center"
                  }}>
                    {chartData.map((point, i) => {
                      const maxValue = Math.max(...chartData.map(p => Math.max(p.value, p.target)));
                      const valueHeight = (point.value / maxValue) * 100;
                      const targetHeight = (point.target / maxValue) * 100;
                      return (
                        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                          <div style={{ position: "relative", width: "100%", height: "150px", display: "flex", alignItems: "flex-end" }}>
                            <div style={{
                              width: "100%",
                              height: `${targetHeight}%`,
                              background: "rgba(59, 130, 246, 0.2)",
                              border: "1px dashed var(--accent)",
                              position: "absolute",
                              bottom: 0
                            }} />
                            <div style={{
                              width: "100%",
                              height: `${valueHeight}%`,
                              background: "var(--accent)",
                              marginBottom: 0
                            }} />
                          </div>
                          <div style={{ marginTop: 8, fontSize: 11, fontFamily: "monospace", textAlign: "center" }}>
                            <div>{point.month}</div>
                            <div style={{ color: "var(--fg-muted)", fontSize: 10 }}>{point.value}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}


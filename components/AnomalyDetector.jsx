"use client";
import { useState, useRef } from "react";
import Papa from "papaparse";

// Cas d'usage métier avec données d'exemple
const useCases = [
  {
    id: "fraude",
    name: "Détection de Fraude Bancaire",
    description: "Détectez les transactions suspectes dans des données bancaires",
    sampleData: [
      { transaction_id: 1, montant: 150.50, date: "2024-01-15", heure: "10:30", type: "Carte", pays: "France", client_id: "C001" },
      { transaction_id: 2, montant: 2500.00, date: "2024-01-15", heure: "14:20", type: "Virement", pays: "France", client_id: "C002" },
      { transaction_id: 3, montant: 45.20, date: "2024-01-16", heure: "09:15", type: "Carte", pays: "France", client_id: "C001" },
      { transaction_id: 4, montant: 15000.00, date: "2024-01-16", heure: "23:45", type: "Virement", pays: "États-Unis", client_id: "C003" },
      { transaction_id: 5, montant: 89.90, date: "2024-01-17", heure: "11:00", type: "Carte", pays: "France", client_id: "C001" },
      { transaction_id: 6, montant: 50000.00, date: "2024-01-17", heure: "02:30", type: "Virement", pays: "Russie", client_id: "C004" },
      { transaction_id: 7, montant: 120.75, date: "2024-01-18", heure: "15:45", type: "Carte", pays: "France", client_id: "C002" },
      { transaction_id: 8, montant: 200.00, date: "2024-01-18", heure: "16:20", type: "Carte", pays: "France", client_id: "C001" },
      { transaction_id: 9, montant: 7500.00, date: "2024-01-19", heure: "01:15", type: "Virement", pays: "Chine", client_id: "C005" },
      { transaction_id: 10, montant: 65.30, date: "2024-01-19", heure: "12:00", type: "Carte", pays: "France", client_id: "C002" }
    ],
    numericColumns: ["montant"],
    dateColumn: "date",
    anomalyReasons: {
      "montant": "Montants anormalement élevés par rapport aux transactions habituelles"
    }
  },
  {
    id: "production",
    name: "Anomalies de Production Industrielle",
    description: "Détectez les défauts et anomalies dans une chaîne de production",
    sampleData: [
      { lot: "L001", temperature: 22.5, pression: 1.2, vitesse: 150, qualite: "OK", date: "2024-01-15" },
      { lot: "L002", temperature: 23.1, pression: 1.18, vitesse: 152, qualite: "OK", date: "2024-01-15" },
      { lot: "L003", temperature: 45.8, pression: 2.5, vitesse: 180, qualite: "DÉFAUT", date: "2024-01-16" },
      { lot: "L004", temperature: 22.8, pression: 1.19, vitesse: 151, qualite: "OK", date: "2024-01-16" },
      { lot: "L005", temperature: 24.2, pression: 1.21, vitesse: 149, qualite: "OK", date: "2024-01-17" },
      { lot: "L006", temperature: 15.2, pression: 0.8, vitesse: 120, qualite: "DÉFAUT", date: "2024-01-17" },
      { lot: "L007", temperature: 23.0, pression: 1.2, vitesse: 150, qualite: "OK", date: "2024-01-18" },
      { lot: "L008", temperature: 22.7, pression: 1.19, vitesse: 153, qualite: "OK", date: "2024-01-18" },
      { lot: "L009", temperature: 50.1, pression: 3.0, vitesse: 200, qualite: "DÉFAUT", date: "2024-01-19" },
      { lot: "L010", temperature: 23.2, pression: 1.2, vitesse: 150, qualite: "OK", date: "2024-01-19" }
    ],
    numericColumns: ["temperature", "pression", "vitesse"],
    dateColumn: "date",
    anomalyReasons: {
      "temperature": "Températures anormales (trop élevées ou trop basses)",
      "pression": "Pressions hors des limites de sécurité",
      "vitesse": "Vitesses de production anormales"
    }
  },
  {
    id: "ventes",
    name: "Anomalies de Ventes",
    description: "Détectez les ventes anormales ou les opportunités de croissance",
    sampleData: [
      { jour: "Lundi", vente: 1250, clients: 45, panier_moyen: 27.78, date: "2024-01-15" },
      { jour: "Mardi", vente: 1380, clients: 52, panier_moyen: 26.54, date: "2024-01-16" },
      { jour: "Mercredi", vente: 1420, clients: 48, panier_moyen: 29.58, date: "2024-01-17" },
      { jour: "Jeudi", vente: 3500, clients: 120, panier_moyen: 29.17, date: "2024-01-18" },
      { jour: "Vendredi", vente: 1650, clients: 58, panier_moyen: 28.45, date: "2024-01-19" },
      { jour: "Samedi", vente: 2100, clients: 72, panier_moyen: 29.17, date: "2024-01-20" },
      { jour: "Dimanche", vente: 850, clients: 28, panier_moyen: 30.36, date: "2024-01-21" },
      { jour: "Lundi", vente: 1320, clients: 47, panier_moyen: 28.09, date: "2024-01-22" },
      { jour: "Mardi", vente: 1450, clients: 51, panier_moyen: 28.43, date: "2024-01-23" },
      { jour: "Mercredi", vente: 4800, clients: 150, panier_moyen: 32.00, date: "2024-01-24" }
    ],
    numericColumns: ["vente", "clients", "panier_moyen"],
    dateColumn: "date",
    anomalyReasons: {
      "vente": "Ventes anormalement élevées ou faibles",
      "clients": "Nombre de clients anormal",
      "panier_moyen": "Panier moyen hors norme"
    }
  }
];

export default function AnomalyDetector() {
  const [selectedUseCase, setSelectedUseCase] = useState(useCases[0]);
  const [data, setData] = useState(useCases[0].sampleData);
  const [anomalies, setAnomalies] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [method, setMethod] = useState("zscore");
  const fileInputRef = useRef(null);

  // Méthodes de détection d'anomalies
  const detectAnomalies = (data, numericColumns, method) => {
    const results = [];
    
    numericColumns.forEach(column => {
      const values = data.map(row => parseFloat(row[column])).filter(v => !isNaN(v));
      if (values.length === 0) return;
      
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const std = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);
      
      let anomalies = [];
      
      if (method === "zscore") {
        // Z-Score : valeurs à plus de 2 écarts-types
        data.forEach((row, idx) => {
          const value = parseFloat(row[column]);
          if (!isNaN(value)) {
            const zScore = Math.abs((value - mean) / std);
            if (zScore > 2) {
              anomalies.push({
                index: idx,
                value: value,
                zScore: zScore,
                column: column,
                reason: `Z-Score de ${zScore.toFixed(2)} (seuil: 2)`
              });
            }
          }
        });
      } else if (method === "iqr") {
        // IQR : Interquartile Range
        const sorted = [...values].sort((a, b) => a - b);
        const q1 = sorted[Math.floor(sorted.length * 0.25)];
        const q3 = sorted[Math.floor(sorted.length * 0.75)];
        const iqr = q3 - q1;
        const lowerBound = q1 - 1.5 * iqr;
        const upperBound = q3 + 1.5 * iqr;
        
        data.forEach((row, idx) => {
          const value = parseFloat(row[column]);
          if (!isNaN(value) && (value < lowerBound || value > upperBound)) {
            anomalies.push({
              index: idx,
              value: value,
              column: column,
              reason: `Hors limites IQR [${lowerBound.toFixed(2)}, ${upperBound.toFixed(2)}]`
            });
          }
        });
      } else if (method === "percentile") {
        // Percentile : valeurs en dehors du 5e et 95e percentile
        const sorted = [...values].sort((a, b) => a - b);
        const p5 = sorted[Math.floor(sorted.length * 0.05)];
        const p95 = sorted[Math.floor(sorted.length * 0.95)];
        
        data.forEach((row, idx) => {
          const value = parseFloat(row[column]);
          if (!isNaN(value) && (value < p5 || value > p95)) {
            anomalies.push({
              index: idx,
              value: value,
              column: column,
              reason: `Hors percentiles [P5: ${p5.toFixed(2)}, P95: ${p95.toFixed(2)}]`
            });
          }
        });
      }
      
      results.push({
        column: column,
        anomalies: anomalies,
        stats: {
          mean: mean,
          std: std,
          min: Math.min(...values),
          max: Math.max(...values)
        }
      });
    });
    
    return results;
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const results = detectAnomalies(data, selectedUseCase.numericColumns, method);
      setAnomalies(results);
      setIsAnalyzing(false);
    }, 500);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          setData(results.data.filter(row => Object.keys(row).some(key => row[key])));
        }
      },
      error: (error) => {
        console.error("Error parsing CSV:", error);
        alert("Erreur lors du chargement du fichier CSV");
      }
    });
  };

  const handleAddRow = () => {
    const newRow = {};
    Object.keys(data[0] || {}).forEach(key => {
      newRow[key] = "";
    });
    setData([...data, newRow]);
  };

  const handleCellChange = (rowIndex, column, value) => {
    const newData = [...data];
    newData[rowIndex][column] = value;
    setData(newData);
  };

  const handleUseCaseChange = (useCase) => {
    setSelectedUseCase(useCase);
    setData(useCase.sampleData);
    setAnomalies(null);
  };

  return (
    <div style={{
      background: "var(--bg-secondary)",
      border: "2px solid var(--line-blueprint)",
      borderRadius: "12px",
      padding: "32px",
      marginBottom: "48px"
    }}>
      <h2 style={{
        fontSize: "28px",
        fontWeight: 700,
        marginBottom: "8px",
        color: "var(--fg)"
      }}>
        Détecteur d'Anomalies — Cas d'Usage Métier
      </h2>
      <p style={{
        fontSize: "14px",
        color: "var(--fg-muted)",
        marginBottom: "32px",
        lineHeight: 1.6
      }}>
        Détectez automatiquement les anomalies dans vos données avec des méthodes statistiques avancées. Testez avec des cas d'usage métier prêts à l'emploi ou importez vos propres données.
      </p>

      {/* Sélection du cas d'usage */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{
          fontSize: "14px",
          fontWeight: 600,
          color: "var(--fg-muted)",
          textTransform: "uppercase",
          letterSpacing: "1px",
          marginBottom: "16px"
        }}>
          Cas d'Usage Métier
        </div>
        <div style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap"
        }}>
          {useCases.map(uc => (
            <button
              key={uc.id}
              onClick={() => handleUseCaseChange(uc)}
              style={{
                padding: "12px 20px",
                background: selectedUseCase.id === uc.id ? "var(--accent)" : "var(--bg)",
                border: `2px solid ${selectedUseCase.id === uc.id ? "var(--accent)" : "var(--line-blueprint)"}`,
                borderRadius: "8px",
                color: selectedUseCase.id === uc.id ? "var(--bg)" : "var(--fg)",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
                fontFamily: "monospace"
              }}
            >
              {uc.name}
            </button>
          ))}
        </div>
        <p style={{
          fontSize: "13px",
          color: "var(--fg-muted)",
          marginTop: "12px",
          fontStyle: "italic"
        }}>
          {selectedUseCase.description}
        </p>
      </div>

      {/* Méthode de détection */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{
          fontSize: "14px",
          fontWeight: 600,
          color: "var(--fg-muted)",
          textTransform: "uppercase",
          letterSpacing: "1px",
          marginBottom: "12px"
        }}>
          Méthode de Détection
        </div>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          style={{
            padding: "10px 16px",
            border: "2px solid var(--line-blueprint)",
            borderRadius: "8px",
            background: "var(--bg)",
            color: "var(--fg)",
            fontSize: "14px",
            fontFamily: "monospace",
            cursor: "pointer",
            outline: "none"
          }}
        >
          <option value="zscore">Z-Score (écarts-types)</option>
          <option value="iqr">IQR (Interquartile Range)</option>
          <option value="percentile">Percentiles (P5-P95)</option>
        </select>
      </div>

      {/* Données */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px"
        }}>
          <div style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "var(--fg-muted)",
            textTransform: "uppercase",
            letterSpacing: "1px"
          }}>
            Données ({data.length} lignes)
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: "8px 16px",
                background: "transparent",
                border: "1px solid var(--accent)",
                borderRadius: "6px",
                color: "var(--accent)",
                fontSize: "12px",
                cursor: "pointer",
                fontFamily: "monospace"
              }}
            >
              [ Importer CSV ]
            </button>
            <button
              onClick={handleAddRow}
              style={{
                padding: "8px 16px",
                background: "transparent",
                border: "1px solid var(--line-blueprint)",
                borderRadius: "6px",
                color: "var(--fg)",
                fontSize: "12px",
                cursor: "pointer",
                fontFamily: "monospace"
              }}
            >
              [ + Ligne ]
            </button>
          </div>
        </div>
        
        <div style={{
          background: "var(--bg)",
          border: "1px solid var(--line-blueprint)",
          borderRadius: "8px",
          overflowX: "auto",
          maxHeight: "400px",
          overflowY: "auto"
        }}>
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "12px"
          }}>
            <thead>
              <tr style={{
                background: "var(--bg-secondary)",
                borderBottom: "2px solid var(--line-blueprint)",
                position: "sticky",
                top: 0,
                zIndex: 10
              }}>
                {data.length > 0 && Object.keys(data[0]).map((col, idx) => (
                  <th key={idx} style={{
                    padding: "12px",
                    textAlign: "left",
                    fontWeight: 600,
                    color: selectedUseCase.numericColumns.includes(col) ? "var(--accent)" : "var(--fg)",
                    fontFamily: "monospace",
                    fontSize: "11px",
                    textTransform: "uppercase"
                  }}>
                    {col}
                    {selectedUseCase.numericColumns.includes(col) && " *"}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIdx) => (
                <tr key={rowIdx} style={{
                  borderBottom: "1px solid var(--line-blueprint)",
                  background: anomalies && anomalies.some(a => 
                    a.anomalies.some(an => an.index === rowIdx)
                  ) ? "rgba(239, 68, 68, 0.1)" : "transparent"
                }}>
                  {Object.keys(row).map((col, colIdx) => (
                    <td key={colIdx} style={{
                      padding: "8px 12px",
                      color: "var(--fg)",
                      fontFamily: "monospace"
                    }}>
                      <input
                        type="text"
                        value={row[col] || ""}
                        onChange={(e) => handleCellChange(rowIdx, col, e.target.value)}
                        style={{
                          width: "100%",
                          border: "none",
                          background: "transparent",
                          color: "var(--fg)",
                          fontFamily: "monospace",
                          fontSize: "12px",
                          outline: "none"
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{
          fontSize: "11px",
          color: "var(--fg-muted)",
          marginTop: "8px",
          fontStyle: "italic"
        }}>
          * Colonnes numériques analysées pour la détection d'anomalies
        </div>
      </div>

      {/* Bouton d'analyse */}
      <button
        onClick={handleAnalyze}
        disabled={isAnalyzing || data.length === 0}
        style={{
          padding: "12px 24px",
          background: isAnalyzing || data.length === 0 ? "var(--line-blueprint)" : "var(--accent)",
          border: "none",
          borderRadius: "8px",
          color: "var(--bg)",
          fontSize: "14px",
          fontWeight: 600,
          cursor: isAnalyzing || data.length === 0 ? "not-allowed" : "pointer",
          transition: "all 0.2s ease",
          fontFamily: "monospace",
          marginBottom: "32px"
        }}
      >
        {isAnalyzing ? "[ Analyse en cours... ]" : "[ Détecter les Anomalies ]"}
      </button>

      {/* Résultats */}
      {anomalies && (
        <div>
          <div style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "var(--fg-muted)",
            textTransform: "uppercase",
            letterSpacing: "1px",
            marginBottom: "16px"
          }}>
            Résultats de l'Analyse
          </div>
          
          {anomalies.map((result, idx) => {
            const totalAnomalies = result.anomalies.length;
            return (
              <div key={idx} style={{
                background: "var(--bg)",
                border: "1px solid var(--line-blueprint)",
                borderRadius: "8px",
                padding: "20px",
                marginBottom: "16px"
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px"
                }}>
                  <div style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "var(--accent)",
                    fontFamily: "monospace"
                  }}>
                    {result.column}
                  </div>
                  <div style={{
                    fontSize: "14px",
                    color: totalAnomalies > 0 ? "#ef4444" : "var(--fg-muted)",
                    fontWeight: 600
                  }}>
                    {totalAnomalies} anomalie{totalAnomalies > 1 ? "s" : ""} détectée{totalAnomalies > 1 ? "s" : ""}
                  </div>
                </div>
                
                <div style={{
                  fontSize: "12px",
                  color: "var(--fg-muted)",
                  marginBottom: "16px",
                  fontFamily: "monospace"
                }}>
                  Moyenne: {result.stats.mean.toFixed(2)} | 
                  Écart-type: {result.stats.std.toFixed(2)} | 
                  Min: {result.stats.min.toFixed(2)} | 
                  Max: {result.stats.max.toFixed(2)}
                </div>
                
                {totalAnomalies > 0 ? (
                  <div>
                    <div style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "var(--fg)",
                      marginBottom: "12px"
                    }}>
                      Anomalies détectées :
                    </div>
                    {result.anomalies.map((anomaly, aIdx) => (
                      <div key={aIdx} style={{
                        padding: "12px",
                        background: "rgba(239, 68, 68, 0.1)",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        borderRadius: "6px",
                        marginBottom: "8px",
                        fontSize: "13px"
                      }}>
                        <div style={{ fontWeight: 600, color: "#ef4444", marginBottom: "4px" }}>
                          Ligne {anomaly.index + 1} : Valeur = {anomaly.value}
                        </div>
                        <div style={{ color: "var(--fg-muted)", fontSize: "12px" }}>
                          {anomaly.reason}
                        </div>
                        {selectedUseCase.anomalyReasons[result.column] && (
                          <div style={{ color: "var(--fg-muted)", fontSize: "11px", marginTop: "4px", fontStyle: "italic" }}>
                            {selectedUseCase.anomalyReasons[result.column]}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    padding: "12px",
                    background: "rgba(16, 185, 129, 0.1)",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    borderRadius: "6px",
                    color: "#10b981",
                    fontSize: "13px",
                    textAlign: "center"
                  }}>
                    ✓ Aucune anomalie détectée dans cette colonne
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


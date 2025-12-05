"use client";

import { useState } from "react";

export default function DataAnonymizer() {
  const [provider, setProvider] = useState("huggingface");

  // Config providers
  const [hfApiKey, setHfApiKey] = useState("");
  const [azureEndpoint, setAzureEndpoint] = useState("");
  const [azureApiVersion, setAzureApiVersion] = useState("2024-02-15-preview");
  const [azureDeployment, setAzureDeployment] = useState("");
  const [azureApiKey, setAzureApiKey] = useState("");
  const [awsAccessKeyId, setAwsAccessKeyId] = useState("");
  const [awsSecretAccessKey, setAwsSecretAccessKey] = useState("");
  const [awsRegion, setAwsRegion] = useState("eu-west-3");
  const [bedrockModelId, setBedrockModelId] = useState("anthropic.claude-3-haiku-20240307-v1:0");

  // Données
  const [dataInput, setDataInput] = useState("");
  const [dataFormat, setDataFormat] = useState("csv");
  const [detectedColumns, setDetectedColumns] = useState([]);
  const [anonymizationConfig, setAnonymizationConfig] = useState({});
  const [fileName, setFileName] = useState("");

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnonymizing, setIsAnonymizing] = useState(false);
  const [error, setError] = useState("");
  const [anonymizedData, setAnonymizedData] = useState(null);

  const providerButtonStyle = (isActive) => ({
    padding: "8px 16px",
    background: isActive ? "var(--accent)" : "transparent",
    border: `2px solid ${isActive ? "var(--accent)" : "var(--line-blueprint)"}`,
    borderRadius: "6px",
    color: isActive ? "var(--bg)" : "var(--fg)",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "monospace"
  });

  const [previewData, setPreviewData] = useState([]);

  const handleAnalyze = async () => {
    if (!dataInput.trim()) {
      setError("Veuillez fournir des données à analyser.");
      return;
    }

    setIsAnalyzing(true);
    setError("");
    setDetectedColumns([]);
    setAnonymizationConfig({});
    setPreviewData([]);

    try {
      const res = await fetch("/api/data-anonymizer/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataInput: dataInput.trim(),
          dataFormat
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Erreur API (${res.status})`);
      }

      const data = await res.json();
      setDetectedColumns(data.columns || []);
      setPreviewData(data.previewData || []);
      
      // Initialiser la config d'anonymisation par défaut
      const defaultConfig = {};
      data.columns?.forEach(col => {
        // Par défaut, on suggère la méthode mais on ne coche pas automatiquement
        // Sauf pour les données à haut risque
        defaultConfig[col.name] = {
          anonymize: col.riskLevel === "high",
          // Prioriser les méthodes sans LLM
          method: col.riskLevel === "high" 
            ? (col.detectedType === "email" || col.detectedType === "telephone" || col.detectedType === "nom" ? "mask" : "hash")
            : col.suggestedMethod || "mask"
        };
      });
      setAnonymizationConfig(defaultConfig);
    } catch (e) {
      console.error(e);
      setError(e.message || "Erreur lors de l'analyse des données.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnonymize = async () => {
    if (!dataInput.trim() || detectedColumns.length === 0) {
      setError("Veuillez d'abord analyser les données.");
      return;
    }

    // Vérifier si une méthode nécessitant le LLM est utilisée
    const needsLLM = Object.values(anonymizationConfig).some(
      config => config.anonymize && config.method === "generate"
    );

    // Validation des clés UNIQUEMENT si la génération fictive (LLM) est utilisée
    if (needsLLM) {
      if (provider === "huggingface") {
        if (!hfApiKey) {
          setError("La méthode 'Génération fictive' nécessite une clé API Hugging Face. Configurez-la ci-dessus ou choisissez une autre méthode d'anonymisation.");
          return;
        }
      } else if (provider === "azure-openai") {
        if (!azureEndpoint || !azureDeployment || !azureApiKey) {
          setError("La méthode 'Génération fictive' nécessite une configuration Azure OpenAI complète. Configurez-la ci-dessus ou choisissez une autre méthode d'anonymisation.");
          return;
        }
      } else if (provider === "bedrock") {
        if (!awsAccessKeyId || !awsSecretAccessKey || !awsRegion) {
          setError("La méthode 'Génération fictive' nécessite une configuration AWS Bedrock complète. Configurez-la ci-dessus ou choisissez une autre méthode d'anonymisation.");
          return;
        }
      }
    }

    setIsAnonymizing(true);
    setError("");
    setAnonymizedData(null);

    try {
      const res = await fetch("/api/data-anonymizer/anonymize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          hfApiKey: hfApiKey || undefined,
          azureConfig:
            provider === "azure-openai"
              ? {
                  endpoint: azureEndpoint,
                  apiVersion: azureApiVersion,
                  deployment: azureDeployment,
                  apiKey: azureApiKey
                }
              : undefined,
          bedrockConfig:
            provider === "bedrock"
              ? {
                  accessKeyId: awsAccessKeyId,
                  secretAccessKey: awsSecretAccessKey,
                  region: awsRegion,
                  modelId: bedrockModelId
                }
              : undefined,
          dataInput: dataInput.trim(),
          dataFormat,
          anonymizationConfig
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Erreur API (${res.status})`);
      }

      const data = await res.json();
      setAnonymizedData(data.anonymizedData || []);
    } catch (e) {
      console.error(e);
      setError(e.message || "Erreur lors de l'anonymisation.");
    } finally {
      setIsAnonymizing(false);
    }
  };

  const updateAnonymizationConfig = (columnName, field, value) => {
    setAnonymizationConfig(prev => ({
      ...prev,
      [columnName]: {
        ...prev[columnName],
        [field]: value
      }
    }));
  };

  const getRiskColor = (riskLevel) => {
    if (riskLevel === "high") return "#ef4444";
    if (riskLevel === "medium") return "#eab308";
    if (riskLevel === "low") return "#22c55e";
    return "var(--fg-muted)";
  };

  const getCsvString = (data) => {
    if (!data || data.length === 0) return "";
    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(h => String(row[h] ?? "")).join(";"));
    return [headers.join(";"), ...rows].join("\n");
  };

  const downloadCsv = (data, filename) => {
    const csv = getCsvString(data);
    if (!csv) return;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || "donnees_anonymisees.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1600px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 24
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "var(--bg-secondary)",
          border: "2px solid var(--line-blueprint)",
          borderRadius: 12,
          padding: 24
        }}
      >
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            margin: 0,
            color: "var(--fg)"
          }}
        >
          Anonymiseur de Données RGPD
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "var(--fg-muted)",
            marginTop: 8,
            marginBottom: 0
          }}
        >
          Analysez vos données, détectez automatiquement les informations sensibles (PII) et anonymisez-les selon vos
          paramètres. Conforme RGPD. Branchez vos propres clés LLM (HF, Azure, Bedrock) pour la génération de données
          fictives.
        </p>
      </div>

      {/* Config provider */}
      <div
        style={{
          background: "var(--bg-secondary)",
          border: "2px solid var(--line-blueprint)",
          borderRadius: 12,
          padding: 20,
          display: "flex",
          flexDirection: "column",
          gap: 16
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap"
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 600,
                margin: 0,
                color: "var(--fg)"
              }}
            >
              Configuration du provider IA (optionnel)
            </h2>
            <p
              style={{
                fontSize: 12,
                color: "var(--fg-muted)",
                marginTop: 4,
                marginBottom: 0
              }}
            >
              Nécessaire uniquement pour la méthode "Génération fictive". Les autres méthodes (masquage, hachage, suppression, généralisation) fonctionnent sans LLM. Vos clés ne sont ni stockées ni affichées côté serveur.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setProvider("huggingface")}
              style={providerButtonStyle(provider === "huggingface")}
            >
              Hugging Face
            </button>
            <button
              type="button"
              onClick={() => setProvider("azure-openai")}
              style={providerButtonStyle(provider === "azure-openai")}
            >
              Azure OpenAI
            </button>
            <button
              type="button"
              onClick={() => setProvider("bedrock")}
              style={providerButtonStyle(provider === "bedrock")}
            >
              AWS Bedrock
            </button>
          </div>
        </div>

        {/* Config spécifique - version compacte */}
        {provider === "huggingface" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, color: "var(--fg-muted)" }}>Clé API Hugging Face</label>
            <input
              type="password"
              value={hfApiKey}
              onChange={(e) => setHfApiKey(e.target.value)}
              placeholder="hf_..."
              style={{
                padding: "10px 12px",
                background: "var(--bg)",
                border: "2px solid var(--line-blueprint)",
                borderRadius: "6px",
                color: "var(--fg)",
                fontSize: "13px",
                fontFamily: "monospace"
              }}
            />
          </div>
        )}

        {provider === "azure-openai" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                <label style={{ fontSize: 12, color: "var(--fg-muted)" }}>Endpoint</label>
                <input
                  type="text"
                  value={azureEndpoint}
                  onChange={(e) => setAzureEndpoint(e.target.value)}
                  placeholder="https://xxx.openai.azure.com"
                  style={{
                    padding: "10px 12px",
                    background: "var(--bg)",
                    border: "2px solid var(--line-blueprint)",
                    borderRadius: "6px",
                    color: "var(--fg)",
                    fontSize: "13px",
                    fontFamily: "monospace"
                  }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                <label style={{ fontSize: 12, color: "var(--fg-muted)" }}>Deployment</label>
                <input
                  type="text"
                  value={azureDeployment}
                  onChange={(e) => setAzureDeployment(e.target.value)}
                  placeholder="gpt-4"
                  style={{
                    padding: "10px 12px",
                    background: "var(--bg)",
                    border: "2px solid var(--line-blueprint)",
                    borderRadius: "6px",
                    color: "var(--fg)",
                    fontSize: "13px",
                    fontFamily: "monospace"
                  }}
                />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, color: "var(--fg-muted)" }}>Clé API Azure</label>
              <input
                type="password"
                value={azureApiKey}
                onChange={(e) => setAzureApiKey(e.target.value)}
                placeholder="..."
                style={{
                  padding: "10px 12px",
                  background: "var(--bg)",
                  border: "2px solid var(--line-blueprint)",
                  borderRadius: "6px",
                  color: "var(--fg)",
                  fontSize: "13px",
                  fontFamily: "monospace"
                }}
              />
            </div>
          </div>
        )}

        {provider === "bedrock" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                <label style={{ fontSize: 12, color: "var(--fg-muted)" }}>Access Key ID</label>
                <input
                  type="text"
                  value={awsAccessKeyId}
                  onChange={(e) => setAwsAccessKeyId(e.target.value)}
                  placeholder="AKIA..."
                  style={{
                    padding: "10px 12px",
                    background: "var(--bg)",
                    border: "2px solid var(--line-blueprint)",
                    borderRadius: "6px",
                    color: "var(--fg)",
                    fontSize: "13px",
                    fontFamily: "monospace"
                  }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                <label style={{ fontSize: 12, color: "var(--fg-muted)" }}>Secret Access Key</label>
                <input
                  type="password"
                  value={awsSecretAccessKey}
                  onChange={(e) => setAwsSecretAccessKey(e.target.value)}
                  placeholder="..."
                  style={{
                    padding: "10px 12px",
                    background: "var(--bg)",
                    border: "2px solid var(--line-blueprint)",
                    borderRadius: "6px",
                    color: "var(--fg)",
                    fontSize: "13px",
                    fontFamily: "monospace"
                  }}
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                <label style={{ fontSize: 12, color: "var(--fg-muted)" }}>Région AWS</label>
                <input
                  type="text"
                  value={awsRegion}
                  onChange={(e) => setAwsRegion(e.target.value)}
                  placeholder="eu-west-3"
                  style={{
                    padding: "10px 12px",
                    background: "var(--bg)",
                    border: "2px solid var(--line-blueprint)",
                    borderRadius: "6px",
                    color: "var(--fg)",
                    fontSize: "13px",
                    fontFamily: "monospace"
                  }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                <label style={{ fontSize: 12, color: "var(--fg-muted)" }}>Model ID</label>
                <input
                  type="text"
                  value={bedrockModelId}
                  onChange={(e) => setBedrockModelId(e.target.value)}
                  placeholder="anthropic.claude-3-haiku-20240307-v1:0"
                  style={{
                    padding: "10px 12px",
                    background: "var(--bg)",
                    border: "2px solid var(--line-blueprint)",
                    borderRadius: "6px",
                    color: "var(--fg)",
                    fontSize: "13px",
                    fontFamily: "monospace"
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Données d'entrée */}
      <div
        style={{
          background: "var(--bg-secondary)",
          border: "2px solid var(--line-blueprint)",
          borderRadius: 12,
          padding: 20
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            marginBottom: 12,
            flexWrap: "wrap"
          }}
        >
          <h2
            style={{
              fontSize: 18,
              fontWeight: 600,
              margin: 0,
              color: "var(--fg)"
            }}
          >
            Données à anonymiser
          </h2>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => setDataFormat("csv")}
              style={providerButtonStyle(dataFormat === "csv")}
            >
              CSV
            </button>
            <button
              type="button"
              onClick={() => setDataFormat("json")}
              style={providerButtonStyle(dataFormat === "json")}
            >
              JSON
            </button>
          </div>
        </div>

        {/* Upload de fichier */}
        <div style={{ marginBottom: 12 }}>
          <label
            style={{
              display: "inline-block",
              padding: "10px 16px",
              background: "var(--bg)",
              border: "2px solid var(--line-blueprint)",
              borderRadius: "6px",
              color: "var(--fg)",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "monospace",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = "var(--accent)";
              e.target.style.color = "var(--accent)";
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = "var(--line-blueprint)";
              e.target.style.color = "var(--fg)";
            }}
          >
            📁 Charger un fichier {dataFormat.toUpperCase()}
            <input
              type="file"
              accept={dataFormat === "csv" ? ".csv" : ".json"}
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setFileName(file.name);
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const content = event.target?.result;
                    if (content) {
                      setDataInput(String(content));
                    }
                  };
                  reader.readAsText(file);
                }
              }}
            />
          </label>
          {fileName && (
            <span
              style={{
                marginLeft: 12,
                fontSize: "12px",
                color: "var(--fg-muted)"
              }}
            >
              {fileName}
            </span>
          )}
        </div>

        <textarea
          value={dataInput}
          onChange={(e) => setDataInput(e.target.value)}
          placeholder={
            dataFormat === "csv"
              ? "nom;email;telephone;ville\nJean Dupont;jean@example.com;0612345678;Paris\nMarie Martin;marie@example.com;0698765432;Lyon\n\nOu utilisez le bouton ci-dessus pour charger un fichier CSV"
              : '[\n  {"nom": "Jean", "email": "jean@example.com", "telephone": "0612345678"},\n  {"nom": "Marie", "email": "marie@example.com", "telephone": "0698765432"}\n]\n\nOu utilisez le bouton ci-dessus pour charger un fichier JSON'
          }
          style={{
            width: "100%",
            minHeight: "200px",
            padding: "12px",
            background: "var(--bg)",
            border: "2px solid var(--line-blueprint)",
            borderRadius: "6px",
            color: "var(--fg)",
            fontSize: "13px",
            fontFamily: "monospace",
            resize: "vertical"
          }}
        />
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={isAnalyzing || !dataInput.trim()}
          style={{
            marginTop: 12,
            padding: "12px 24px",
            background: isAnalyzing || !dataInput.trim() ? "var(--fg-muted)" : "var(--accent)",
            border: "none",
            borderRadius: "6px",
            color: "var(--bg)",
            fontSize: "14px",
            fontWeight: 600,
            cursor: isAnalyzing || !dataInput.trim() ? "not-allowed" : "pointer",
            fontFamily: "monospace"
          }}
        >
          {isAnalyzing ? "⏳ Analyse en cours..." : "🔍 Analyser les données"}
        </button>
      </div>

      {/* Erreur */}
      {error && (
        <div
          style={{
            background: "var(--bg-secondary)",
            border: "2px solid #ef4444",
            borderRadius: 12,
            padding: 16,
            color: "#ef4444",
            fontSize: "14px"
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Prévisualisation des données */}
      {previewData.length > 0 && (
        <div
          style={{
            background: "var(--bg-secondary)",
            border: "2px solid var(--line-blueprint)",
            borderRadius: 12,
            padding: 20
          }}
        >
          <h2
            style={{
              fontSize: 18,
              fontWeight: 600,
              margin: 0,
              marginBottom: 16,
              color: "var(--fg)"
            }}
          >
            Aperçu des données ({previewData.length} lignes)
          </h2>
          <div
            style={{
              background: "var(--bg)",
              border: "2px solid var(--line-blueprint)",
              borderRadius: "8px",
              overflow: "auto",
              maxHeight: "300px"
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "13px"
              }}
            >
              <thead>
                <tr style={{ background: "var(--bg-secondary)" }}>
                  {Object.keys(previewData[0]).map((header, idx) => (
                    <th
                      key={idx}
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        fontWeight: 600,
                        color: "var(--fg)",
                        borderBottom: "2px solid var(--line-blueprint)",
                        position: "sticky",
                        top: 0,
                        background: "var(--bg-secondary)"
                      }}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.slice(0, 10).map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    style={{
                      borderBottom: "1px solid var(--line-blueprint)"
                    }}
                  >
                    {Object.keys(previewData[0]).map((header, colIdx) => (
                      <td
                        key={colIdx}
                        style={{
                          padding: "10px 12px",
                          color: "var(--fg)"
                        }}
                      >
                        {String(row[header] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {previewData.length > 10 && (
              <div
                style={{
                  padding: "12px",
                  textAlign: "center",
                  color: "var(--fg-muted)",
                  fontSize: "12px",
                  background: "var(--bg-secondary)"
                }}
              >
                Affichage des 10 premières lignes sur {previewData.length}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Configuration d'anonymisation */}
      {detectedColumns.length > 0 && (
        <div
          style={{
            background: "var(--bg-secondary)",
            border: "2px solid var(--line-blueprint)",
            borderRadius: 12,
            padding: 20
          }}
        >
          <h2
            style={{
              fontSize: 18,
              fontWeight: 600,
              margin: 0,
              marginBottom: 16,
              color: "var(--fg)"
            }}
          >
            Configuration d'anonymisation
          </h2>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", 
            gap: 12 
          }}>
            {detectedColumns.map((col, idx) => (
              <div
                key={idx}
                style={{
                  background: "var(--bg)",
                  border: "2px solid var(--line-blueprint)",
                  borderRadius: 8,
                  padding: 12
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 10,
                    gap: 8
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--fg)",
                        marginBottom: 2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {col.name}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "var(--fg-muted)"
                      }}
                    >
                      {col.detectedType} •{" "}
                      <span style={{ color: getRiskColor(col.riskLevel), fontWeight: 600 }}>
                        {col.riskLevel === "high" ? "Élevé" : col.riskLevel === "medium" ? "Moyen" : "Faible"}
                      </span>
                    </div>
                  </div>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      cursor: "pointer",
                      flexShrink: 0
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={anonymizationConfig[col.name]?.anonymize || false}
                      onChange={(e) =>
                        updateAnonymizationConfig(col.name, "anonymize", e.target.checked)
                      }
                      style={{ cursor: "pointer" }}
                    />
                    <span style={{ fontSize: "12px", color: "var(--fg)" }}>Anonymiser</span>
                  </label>
                </div>
                {anonymizationConfig[col.name]?.anonymize && (
                  <div style={{ marginTop: 8 }}>
                    <label
                      style={{
                        fontSize: "11px",
                        color: "var(--fg-muted)",
                        marginBottom: 4,
                        display: "block"
                      }}
                    >
                      Méthode
                    </label>
                    <select
                      value={anonymizationConfig[col.name]?.method || "mask"}
                      onChange={(e) => updateAnonymizationConfig(col.name, "method", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "6px 10px",
                        background: "var(--bg-secondary)",
                        border: "2px solid var(--line-blueprint)",
                        borderRadius: "6px",
                        color: "var(--fg)",
                        fontSize: "12px",
                        cursor: "pointer"
                      }}
                    >
                      <optgroup label="Sans LLM">
                        <option value="mask">🎭 Masquage</option>
                        <option value="hash">🔒 Hachage</option>
                        <option value="remove">🗑️ Suppression</option>
                        <option value="generalize">📊 Généralisation</option>
                      </optgroup>
                      <optgroup label="Avec LLM">
                        <option value="generate">🤖 Génération fictive</option>
                      </optgroup>
                    </select>
                    {anonymizationConfig[col.name]?.method === "generate" && (
                      <div
                        style={{
                          marginTop: 6,
                          padding: "6px 8px",
                          background: "var(--bg-secondary)",
                          borderRadius: "4px",
                          fontSize: "10px",
                          color: "var(--fg-muted)"
                        }}
                      >
                        ⚠️ Utilise le LLM
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleAnonymize}
            disabled={isAnonymizing}
            style={{
              marginTop: 20,
              padding: "12px 24px",
              background: isAnonymizing ? "var(--fg-muted)" : "var(--accent)",
              border: "none",
              borderRadius: "6px",
              color: "var(--bg)",
              fontSize: "14px",
              fontWeight: 600,
              cursor: isAnonymizing ? "not-allowed" : "pointer",
              fontFamily: "monospace"
            }}
          >
            {isAnonymizing ? "⏳ Anonymisation en cours..." : "🔒 Anonymiser les données"}
          </button>
        </div>
      )}

      {/* Résultats */}
      {anonymizedData && anonymizedData.length > 0 && (
        <div
          style={{
            background: "var(--bg-secondary)",
            border: "2px solid var(--line-blueprint)",
            borderRadius: 12,
            padding: 24
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16
            }}
          >
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                margin: 0,
                color: "var(--fg)"
              }}
            >
              ✅ Données anonymisées
            </h2>
            <button
              type="button"
              onClick={() => downloadCsv(anonymizedData, "donnees_anonymisees.csv")}
              style={{
                padding: "8px 16px",
                background: "var(--accent)",
                border: "none",
                borderRadius: "6px",
                color: "var(--bg)",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "monospace"
              }}
            >
              ⬇ Télécharger CSV
            </button>
          </div>
          <div
            style={{
              background: "var(--bg)",
              border: "2px solid var(--line-blueprint)",
              borderRadius: "8px",
              overflow: "auto",
              maxHeight: "500px"
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "13px"
              }}
            >
              <thead>
                <tr style={{ background: "var(--bg-secondary)" }}>
                  {Object.keys(anonymizedData[0]).map((header, idx) => (
                    <th
                      key={idx}
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        fontWeight: 600,
                        color: "var(--fg)",
                        borderBottom: "2px solid var(--line-blueprint)"
                      }}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {anonymizedData.slice(0, 50).map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    style={{
                      borderBottom: "1px solid var(--line-blueprint)"
                    }}
                  >
                    {Object.keys(anonymizedData[0]).map((header, colIdx) => (
                      <td
                        key={colIdx}
                        style={{
                          padding: "10px 12px",
                          color: "var(--fg)"
                        }}
                      >
                        {String(row[header] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {anonymizedData.length > 50 && (
              <div
                style={{
                  padding: "12px",
                  textAlign: "center",
                  color: "var(--fg-muted)",
                  fontSize: "12px"
                }}
              >
                Affichage des 50 premières lignes sur {anonymizedData.length} totales
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


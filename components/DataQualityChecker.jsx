"use client";

import { useState } from "react";

export default function DataQualityChecker() {
  const [provider, setProvider] = useState("huggingface"); // huggingface | azure-openai | bedrock

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

  // Données à analyser
  const [dataInput, setDataInput] = useState(""); // CSV ou JSON en texte
  const [dataFormat, setDataFormat] = useState("csv"); // csv | json

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [qualityReport, setQualityReport] = useState(null);

  const handleAnalyze = async () => {
    setError("");
    setQualityReport(null);

    if (!dataInput.trim()) {
      setError("Veuillez fournir des données à analyser (CSV ou JSON).");
      return;
    }

    // Validation minimale des clés par provider
    if (provider === "huggingface") {
      if (!hfApiKey) {
        setError("Veuillez renseigner votre clé API Hugging Face.");
        return;
      }
    } else if (provider === "azure-openai") {
      if (!azureEndpoint || !azureDeployment || !azureApiKey) {
        setError("Veuillez renseigner endpoint, deployment et clé API Azure OpenAI.");
        return;
      }
    } else if (provider === "bedrock") {
      if (!awsAccessKeyId || !awsSecretAccessKey || !awsRegion) {
        setError("Veuillez renseigner vos identifiants AWS Bedrock (Access Key, Secret Key, région).");
        return;
      }
    }

    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/data-quality/analyze", {
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
          dataFormat
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Erreur API (${res.status})`);
      }

      const json = await res.json();
      setQualityReport(json);
    } catch (e) {
      console.error(e);
      setError(e.message || "Erreur inconnue lors de l'analyse de qualité.");
    } finally {
      setIsAnalyzing(false);
    }
  };

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

  const getScoreColor = (score) => {
    if (score >= 80) return "#22c55e"; // green
    if (score >= 60) return "#eab308"; // yellow
    return "#ef4444"; // red
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Bon";
    if (score >= 40) return "Moyen";
    return "Faible";
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
          Évaluateur de Qualité de Données
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "var(--fg-muted)",
            marginTop: 8,
            marginBottom: 0
          }}
        >
          Analysez la qualité de vos données avec des règles précises et une évaluation LLM. Branchez vos propres clés
          (Hugging Face, Azure OpenAI ou AWS Bedrock) pour obtenir un score de qualité détaillé.
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
              1. Configuration du provider IA
            </h2>
            <p
              style={{
                fontSize: 12,
                color: "var(--fg-muted)",
                marginTop: 4,
                marginBottom: 0
              }}
            >
              Vos clés sont utilisées uniquement pour cet appel et ne sont ni stockées ni affichées côté serveur.
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

        {/* Config spécifique */}
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
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, color: "var(--fg-muted)" }}>Endpoint Azure OpenAI</label>
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
            <div style={{ display: "flex", gap: 12 }}>
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
              <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                <label style={{ fontSize: 12, color: "var(--fg-muted)" }}>API Version</label>
                <input
                  type="text"
                  value={azureApiVersion}
                  onChange={(e) => setAzureApiVersion(e.target.value)}
                  placeholder="2024-02-15-preview"
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

      {/* Données à analyser */}
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
              2. Données à analyser
            </h2>
            <p
              style={{
                fontSize: 12,
                color: "var(--fg-muted)",
                marginTop: 4,
                marginBottom: 0
              }}
            >
              Collez vos données au format CSV ou JSON dans le champ ci-dessous.
            </p>
          </div>
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
        <textarea
          value={dataInput}
          onChange={(e) => setDataInput(e.target.value)}
          placeholder={
            dataFormat === "csv"
              ? "nom;email;age;ville\nJean Dupont;jean@example.com;30;Paris\nMarie Martin;marie@example.com;25;Lyon"
              : '[\n  {"nom": "Jean", "email": "jean@example.com", "age": 30},\n  {"nom": "Marie", "email": "marie@example.com", "age": 25}\n]'
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
          disabled={isAnalyzing}
          style={{
            padding: "12px 24px",
            background: isAnalyzing ? "var(--fg-muted)" : "var(--accent)",
            border: "none",
            borderRadius: "6px",
            color: "var(--bg)",
            fontSize: "14px",
            fontWeight: 600,
            cursor: isAnalyzing ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
            fontFamily: "monospace"
          }}
        >
          {isAnalyzing ? "Analyse en cours..." : "🔍 Analyser la qualité"}
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

      {/* Rapport de qualité */}
      {qualityReport && (
        <div
          style={{
            background: "var(--bg-secondary)",
            border: "2px solid var(--line-blueprint)",
            borderRadius: 12,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 24
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                margin: 0,
                marginBottom: 16,
                color: "var(--fg)"
              }}
            >
              📊 Rapport de Qualité
            </h2>
          </div>

          {/* Score global */}
          <div
            style={{
              background: "var(--bg)",
              border: "2px solid var(--line-blueprint)",
              borderRadius: 8,
              padding: 24,
              textAlign: "center"
            }}
          >
            <div
              style={{
                fontSize: "48px",
                fontWeight: 700,
                color: getScoreColor(qualityReport.overallScore),
                marginBottom: 8
              }}
            >
              {qualityReport.overallScore.toFixed(1)}/100
            </div>
            <div
              style={{
                fontSize: "18px",
                fontWeight: 600,
                color: getScoreColor(qualityReport.overallScore)
              }}
            >
              {getScoreLabel(qualityReport.overallScore)}
            </div>
          </div>

          {/* Scores par règle */}
          <div>
            <h3
              style={{
                fontSize: 16,
                fontWeight: 600,
                margin: 0,
                marginBottom: 16,
                color: "var(--fg)"
              }}
            >
              Scores par critère (règles précises)
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {qualityReport.ruleScores?.map((rule, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "var(--bg)",
                    border: "2px solid var(--line-blueprint)",
                    borderRadius: 8,
                    padding: 16,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "var(--fg)",
                        marginBottom: 4
                      }}
                    >
                      {rule.name}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--fg-muted)"
                      }}
                    >
                      {rule.description}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: 700,
                      color: getScoreColor(rule.score),
                      minWidth: "60px",
                      textAlign: "right"
                    }}
                  >
                    {rule.score.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Évaluation LLM */}
          {qualityReport.llmEvaluation && (
            <div>
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  margin: 0,
                  marginBottom: 16,
                  color: "var(--fg)"
                }}
              >
                Évaluation LLM
              </h3>
              <div
                style={{
                  background: "var(--bg)",
                  border: "2px solid var(--line-blueprint)",
                  borderRadius: 8,
                  padding: 16,
                  fontSize: "14px",
                  color: "var(--fg)",
                  lineHeight: 1.7,
                  whiteSpace: "pre-wrap"
                }}
              >
                {qualityReport.llmEvaluation}
              </div>
            </div>
          )}

          {/* Recommandations */}
          {qualityReport.recommendations && qualityReport.recommendations.length > 0 && (
            <div>
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  margin: 0,
                  marginBottom: 16,
                  color: "var(--fg)"
                }}
              >
                💡 Recommandations
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {qualityReport.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: "var(--bg)",
                      border: "2px solid var(--line-blueprint)",
                      borderRadius: 8,
                      padding: 12,
                      fontSize: "13px",
                      color: "var(--fg)"
                    }}
                  >
                    • {rec}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


"use client";

import { useState } from "react";

export default function PromptEvaluator() {
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

  // Prompt utilisateur
  const [userPrompt, setUserPrompt] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState("");
  const [evaluation, setEvaluation] = useState(null);

  const handleEvaluate = async () => {
    if (!userPrompt.trim()) {
      setError("Veuillez saisir un prompt à évaluer.");
      return;
    }

    // Validation des clés
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
        setError("Veuillez renseigner vos identifiants AWS Bedrock.");
        return;
      }
    }

    setIsEvaluating(true);
    setError("");
    setEvaluation(null);

    try {
      const res = await fetch("/api/prompt-evaluator/evaluate", {
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
          userPrompt: userPrompt.trim()
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Erreur API (${res.status})`);
      }

      const data = await res.json();
      setEvaluation(data);
    } catch (e) {
      console.error(e);
      setError(e.message || "Erreur lors de l'évaluation du prompt.");
    } finally {
      setIsEvaluating(false);
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

  const getScoreColor = (scoreValue) => {
    if (!scoreValue) return "var(--fg-muted)";
    if (scoreValue >= 80) return "#22c55e";
    if (scoreValue >= 60) return "#eab308";
    return "#ef4444";
  };

  const getScoreLabel = (scoreValue) => {
    if (!scoreValue) return "";
    if (scoreValue >= 80) return "Excellent";
    if (scoreValue >= 60) return "Bon";
    if (scoreValue >= 40) return "Moyen";
    return "À améliorer";
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
          Évaluateur de Prompt
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "var(--fg-muted)",
            marginTop: 8,
            marginBottom: 0
          }}
        >
          Évaluez la qualité de vos prompts ! Le LLM analyse la précision, la cohérence, la complétude et le respect
          des bonnes pratiques (contexte, rôle, format attendu, etc.). Branchez vos propres clés (HF, Azure, Bedrock).
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
              Configuration du provider IA
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

      {/* Zone principale : Prompt à gauche, Évaluation à droite */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          alignItems: "start"
        }}
      >
        {/* Zone de saisie du prompt */}
        <div
          style={{
            background: "var(--bg-secondary)",
            border: "2px solid var(--line-blueprint)",
            borderRadius: 12,
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            position: "sticky",
            top: 24,
            alignSelf: "start"
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 600,
                margin: 0,
                marginBottom: 8,
                color: "var(--fg)"
              }}
            >
              Votre prompt
            </h2>
            <p
              style={{
                fontSize: 12,
                color: "var(--fg-muted)",
                margin: 0
              }}
            >
              Saisissez le prompt que vous souhaitez évaluer
            </p>
          </div>
          <textarea
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            placeholder="Exemple: Résume ce texte en 2-3 phrases en français..."
            style={{
              width: "100%",
              minHeight: "300px",
              padding: "12px",
              background: "var(--bg)",
              border: "2px solid var(--line-blueprint)",
              borderRadius: "6px",
              color: "var(--fg)",
              fontSize: "14px",
              fontFamily: "monospace",
              resize: "vertical"
            }}
          />
          <button
            type="button"
            onClick={handleEvaluate}
            disabled={isEvaluating || !userPrompt.trim()}
            style={{
              padding: "12px 24px",
              background: isEvaluating || !userPrompt.trim() ? "var(--fg-muted)" : "var(--accent)",
              border: "none",
              borderRadius: "6px",
              color: "var(--bg)",
              fontSize: "14px",
              fontWeight: 600,
              cursor: isEvaluating || !userPrompt.trim() ? "not-allowed" : "pointer",
              fontFamily: "monospace"
            }}
          >
            {isEvaluating ? "⏳ Évaluation en cours..." : "🔍 Évaluer le prompt"}
          </button>
        </div>

        {/* Zone d'évaluation */}
        <div
          style={{
            background: "var(--bg-secondary)",
            border: "2px solid var(--line-blueprint)",
            borderRadius: 12,
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 20,
            position: "sticky",
            top: 24
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
            Évaluation
          </h2>

          {!evaluation ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "var(--fg-muted)",
                fontSize: "14px"
              }}
            >
              {error ? (
                <div
                  style={{
                    background: "var(--bg)",
                    border: "2px solid #ef4444",
                    borderRadius: "6px",
                    padding: 12,
                    color: "#ef4444",
                    fontSize: "13px"
                  }}
                >
                  ⚠️ {error}
                </div>
              ) : (
                "Saisissez un prompt et cliquez sur 'Évaluer' pour voir l'analyse"
              )}
            </div>
          ) : (
            <>
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
                    color: getScoreColor(evaluation.overallScore),
                    marginBottom: 8
                  }}
                >
                  {evaluation.overallScore.toFixed(1)}/100
                </div>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: getScoreColor(evaluation.overallScore)
                  }}
                >
                  {getScoreLabel(evaluation.overallScore)}
                </div>
              </div>

              {/* Scores par critère */}
              {evaluation.criteriaScores && evaluation.criteriaScores.length > 0 && (
                <div>
                  <h3
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      margin: 0,
                      marginBottom: 12,
                      color: "var(--fg)"
                    }}
                  >
                    Scores par critère
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {evaluation.criteriaScores.map((criteria, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: "var(--bg)",
                          border: "2px solid var(--line-blueprint)",
                          borderRadius: 6,
                          padding: 10,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}
                      >
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "var(--fg)"
                          }}
                        >
                          {criteria.name}
                        </div>
                        <div
                          style={{
                            fontSize: "16px",
                            fontWeight: 700,
                            color: getScoreColor(criteria.score),
                            minWidth: "40px",
                            textAlign: "right"
                          }}
                        >
                          {criteria.score.toFixed(0)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Éléments manquants - regroupés */}
              {evaluation.missingElements && Object.values(evaluation.missingElements).some(v => v) && (
                <div>
                  <h3
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      margin: 0,
                      marginBottom: 12,
                      color: "var(--fg)"
                    }}
                  >
                    ⚠️ Éléments à améliorer
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {evaluation.missingElements.contexte && (
                      <div
                        style={{
                          background: "var(--bg)",
                          border: "2px solid #ef4444",
                          borderRadius: 6,
                          padding: 10,
                          fontSize: "12px",
                          color: "var(--fg)"
                        }}
                      >
                        • Contexte ou texte d'entrée non mentionné
                      </div>
                    )}
                    {evaluation.missingElements.role && (
                      <div
                        style={{
                          background: "var(--bg)",
                          border: "2px solid #ef4444",
                          borderRadius: 6,
                          padding: 10,
                          fontSize: "12px",
                          color: "var(--fg)"
                        }}
                      >
                        • Rôle de l'IA non défini
                      </div>
                    )}
                    {evaluation.missingElements.format && (
                      <div
                        style={{
                          background: "var(--bg)",
                          border: "2px solid #ef4444",
                          borderRadius: 6,
                          padding: 10,
                          fontSize: "12px",
                          color: "var(--fg)"
                        }}
                      >
                        • Format de sortie non spécifié
                      </div>
                    )}
                    {evaluation.missingElements.longueur && (
                      <div
                        style={{
                          background: "var(--bg)",
                          border: "2px solid #ef4444",
                          borderRadius: 6,
                          padding: 10,
                          fontSize: "12px",
                          color: "var(--fg)"
                        }}
                      >
                        • Prompt trop court, manque de détails
                      </div>
                    )}
                    {evaluation.missingElements.instructions && (
                      <div
                        style={{
                          background: "var(--bg)",
                          border: "2px solid #ef4444",
                          borderRadius: 6,
                          padding: 10,
                          fontSize: "12px",
                          color: "var(--fg)"
                        }}
                      >
                        • Instructions d'action peu claires
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Recommandations IA */}
              {evaluation.recommendations && evaluation.recommendations.length > 0 && (
                <div>
                  <h3
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      margin: 0,
                      marginBottom: 12,
                      color: "var(--fg)"
                    }}
                  >
                    💡 Recommandations pour améliorer
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {evaluation.recommendations.map((rec, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: "var(--bg)",
                          border: "2px solid var(--line-blueprint)",
                          borderRadius: 6,
                          padding: 10,
                          fontSize: "12px",
                          color: "var(--fg)",
                          lineHeight: 1.6
                        }}
                      >
                        • {rec}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Évaluation détaillée LLM */}
              {evaluation.detailedEvaluation && (
                <div>
                  <h3
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      margin: 0,
                      marginBottom: 12,
                      color: "var(--fg)"
                    }}
                  >
                    📝 Analyse détaillée
                  </h3>
                  <div
                    style={{
                      background: "var(--bg)",
                      border: "2px solid var(--line-blueprint)",
                      borderRadius: 6,
                      padding: 12,
                      fontSize: "12px",
                      color: "var(--fg)",
                      lineHeight: 1.7,
                      whiteSpace: "pre-wrap"
                    }}
                  >
                    {evaluation.detailedEvaluation}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}


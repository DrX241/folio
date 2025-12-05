"use client";

import { useState, useEffect, useRef } from "react";

export default function PromptEngineeringChallenge() {
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

  // État du challenge
  const [challenge, setChallenge] = useState(null);
  const [userPrompt, setUserPrompt] = useState("");
  const [llmResponse, setLlmResponse] = useState("");
  const [score, setScore] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Chronomètre
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerIntervalRef = useRef(null);

  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isTimerRunning]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startNewChallenge = async () => {
    setError("");
    setChallenge(null);
    setUserPrompt("");
    setLlmResponse("");
    setScore(null);
    setTimer(0);
    setIsTimerRunning(false);

    try {
      const res = await fetch("/api/prompt-challenge/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (!res.ok) {
        throw new Error("Erreur lors de la génération du challenge");
      }

      const data = await res.json();
      setChallenge(data);
      setUserPrompt(data.initialPrompt || "");
      setIsTimerRunning(true);
    } catch (e) {
      setError(e.message || "Erreur lors du démarrage du challenge");
    }
  };

  const submitPrompt = async () => {
    if (!challenge || !userPrompt.trim()) {
      setError("Veuillez saisir un prompt.");
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

    setIsSubmitting(true);
    setError("");
    setLlmResponse("");
    setScore(null);

    try {
      const res = await fetch("/api/prompt-challenge/evaluate", {
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
          challengeId: challenge.id,
          taskType: challenge.taskType,
          inputText: challenge.inputText,
          expectedOutput: challenge.expectedOutput,
          criteria: challenge.criteria,
          userPrompt,
          timeElapsed: timer
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Erreur API (${res.status})`);
      }

      const data = await res.json();
      setLlmResponse(data.llmResponse || "");
      setScore(data.score);
      setIsTimerRunning(false);
    } catch (e) {
      setError(e.message || "Erreur lors de l'évaluation");
    } finally {
      setIsSubmitting(false);
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
          Challenge Prompt Engineering
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "var(--fg-muted)",
            marginTop: 8,
            marginBottom: 0
          }}
        >
          Améliorez vos compétences en prompt engineering ! Résolvez des tâches chronométrées et obtenez un score de
          qualité basé sur des règles précises et une évaluation LLM. Branchez vos propres clés (HF, Azure, Bedrock).
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

      {/* Challenge */}
      {!challenge ? (
        <div
          style={{
            background: "var(--bg-secondary)",
            border: "2px solid var(--line-blueprint)",
            borderRadius: 12,
            padding: 48,
            textAlign: "center"
          }}
        >
          <button
            type="button"
            onClick={startNewChallenge}
            style={{
              padding: "16px 32px",
              background: "var(--accent)",
              border: "none",
              borderRadius: "8px",
              color: "var(--bg)",
              fontSize: "16px",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "monospace"
            }}
          >
            🚀 Démarrer un nouveau challenge
          </button>
        </div>
      ) : (
        <>
          {/* Chronomètre et info challenge */}
          <div
            style={{
              background: "var(--bg-secondary)",
              border: "2px solid var(--line-blueprint)",
              borderRadius: 12,
              padding: 20,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 16
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--fg-muted)",
                  marginBottom: 4
                }}
              >
                Type de tâche
              </div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "var(--fg)"
                }}
              >
                {challenge.taskType === "summarize" && "📝 Résumer un texte"}
                {challenge.taskType === "transform" && "🔄 Transformer un tableau"}
                {challenge.taskType === "extract" && "🔍 Extraire des entités"}
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--fg-muted)",
                  marginBottom: 4
                }}
              >
                Temps écoulé
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: 700,
                  color: isTimerRunning ? "var(--accent)" : "var(--fg)",
                  fontFamily: "monospace"
                }}
              >
                {formatTime(timer)}
              </div>
            </div>
            <button
              type="button"
              onClick={startNewChallenge}
              style={{
                padding: "8px 16px",
                background: "transparent",
                border: "2px solid var(--line-blueprint)",
                borderRadius: "6px",
                color: "var(--fg)",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "monospace"
              }}
            >
              Nouveau challenge
            </button>
          </div>

          {/* Texte d'entrée */}
          <div
            style={{
              background: "var(--bg-secondary)",
              border: "2px solid var(--line-blueprint)",
              borderRadius: 12,
              padding: 20
            }}
          >
            <h3
              style={{
                fontSize: 16,
                fontWeight: 600,
                margin: 0,
                marginBottom: 12,
                color: "var(--fg)"
              }}
            >
              Texte d'entrée
            </h3>
            <div
              style={{
                background: "var(--bg)",
                border: "2px solid var(--line-blueprint)",
                borderRadius: "6px",
                padding: "16px",
                fontSize: "14px",
                color: "var(--fg)",
                whiteSpace: "pre-wrap",
                maxHeight: "300px",
                overflowY: "auto"
              }}
            >
              {challenge.inputText}
            </div>
          </div>

          {/* Prompt utilisateur */}
          <div
            style={{
              background: "var(--bg-secondary)",
              border: "2px solid var(--line-blueprint)",
              borderRadius: 12,
              padding: 20
            }}
          >
            <h3
              style={{
                fontSize: 16,
                fontWeight: 600,
                margin: 0,
                marginBottom: 12,
                color: "var(--fg)"
              }}
            >
              Votre prompt
            </h3>
            <textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="Écrivez votre prompt ici..."
              style={{
                width: "100%",
                minHeight: "120px",
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
              onClick={submitPrompt}
              disabled={isSubmitting || !userPrompt.trim()}
              style={{
                marginTop: 12,
                padding: "12px 24px",
                background: isSubmitting || !userPrompt.trim() ? "var(--fg-muted)" : "var(--accent)",
                border: "none",
                borderRadius: "6px",
                color: "var(--bg)",
                fontSize: "14px",
                fontWeight: 600,
                cursor: isSubmitting || !userPrompt.trim() ? "not-allowed" : "pointer",
                fontFamily: "monospace"
              }}
            >
              {isSubmitting ? "⏳ Évaluation en cours..." : "✅ Soumettre et évaluer"}
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

          {/* Réponse LLM */}
          {llmResponse && (
            <div
              style={{
                background: "var(--bg-secondary)",
                border: "2px solid var(--line-blueprint)",
                borderRadius: 12,
                padding: 20
              }}
            >
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  margin: 0,
                  marginBottom: 12,
                  color: "var(--fg)"
                }}
              >
                Réponse du LLM
              </h3>
              <div
                style={{
                  background: "var(--bg)",
                  border: "2px solid var(--line-blueprint)",
                  borderRadius: "6px",
                  padding: "16px",
                  fontSize: "14px",
                  color: "var(--fg)",
                  whiteSpace: "pre-wrap",
                  maxHeight: "400px",
                  overflowY: "auto"
                }}
              >
                {llmResponse}
              </div>
            </div>
          )}

          {/* Score */}
          {score && (
            <div
              style={{
                background: "var(--bg-secondary)",
                border: "2px solid var(--line-blueprint)",
                borderRadius: 12,
                padding: 24
              }}
            >
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  margin: 0,
                  marginBottom: 20,
                  color: "var(--fg)"
                }}
              >
                📊 Score de Qualité
              </h3>

              {/* Score global */}
              <div
                style={{
                  background: "var(--bg)",
                  border: "2px solid var(--line-blueprint)",
                  borderRadius: 8,
                  padding: 24,
                  textAlign: "center",
                  marginBottom: 20
                }}
              >
                <div
                  style={{
                    fontSize: "48px",
                    fontWeight: 700,
                    color: getScoreColor(score.overall),
                    marginBottom: 8
                  }}
                >
                  {score.overall.toFixed(1)}/100
                </div>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: 600,
                    color: getScoreColor(score.overall)
                  }}
                >
                  {getScoreLabel(score.overall)}
                </div>
              </div>

              {/* Scores par critère */}
              {score.ruleScores && score.ruleScores.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <h4
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      margin: 0,
                      marginBottom: 12,
                      color: "var(--fg)"
                    }}
                  >
                    Scores par critère (règles précises)
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {score.ruleScores.map((rule, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: "var(--bg)",
                          border: "2px solid var(--line-blueprint)",
                          borderRadius: 6,
                          padding: 12,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: "13px",
                              fontWeight: 600,
                              color: "var(--fg)"
                            }}
                          >
                            {rule.name}
                          </div>
                          <div
                            style={{
                              fontSize: "11px",
                              color: "var(--fg-muted)"
                            }}
                          >
                            {rule.description}
                          </div>
                        </div>
                        <div
                          style={{
                            fontSize: "20px",
                            fontWeight: 700,
                            color: getScoreColor(rule.score),
                            minWidth: "50px",
                            textAlign: "right"
                          }}
                        >
                          {rule.score.toFixed(1)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Évaluation LLM */}
              {score.llmEvaluation && (
                <div>
                  <h4
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      margin: 0,
                      marginBottom: 12,
                      color: "var(--fg)"
                    }}
                  >
                    Évaluation LLM
                  </h4>
                  <div
                    style={{
                      background: "var(--bg)",
                      border: "2px solid var(--line-blueprint)",
                      borderRadius: 6,
                      padding: 12,
                      fontSize: "13px",
                      color: "var(--fg)",
                      lineHeight: 1.7,
                      whiteSpace: "pre-wrap"
                    }}
                  >
                    {score.llmEvaluation}
                  </div>
                </div>
              )}

              {/* Recommandations */}
              {score.recommendations && score.recommendations.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <h4
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      margin: 0,
                      marginBottom: 12,
                      color: "var(--fg)"
                    }}
                  >
                    💡 Recommandations
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {score.recommendations.map((rec, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: "var(--bg)",
                          border: "2px solid var(--line-blueprint)",
                          borderRadius: 6,
                          padding: 10,
                          fontSize: "12px",
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
        </>
      )}
    </div>
  );
}


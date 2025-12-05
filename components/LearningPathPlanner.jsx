"use client";

import { useState } from "react";

export default function LearningPathPlanner() {
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

  // Formulaire utilisateur
  const [currentRole, setCurrentRole] = useState("");
  const [currentLevel, setCurrentLevel] = useState("débutant");
  const [objectives, setObjectives] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState(5);
  const [duration, setDuration] = useState(6); // semaines

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [learningPath, setLearningPath] = useState(null);

  const handleGenerate = async () => {
    if (!currentRole.trim() || !objectives.trim()) {
      setError("Veuillez remplir tous les champs obligatoires.");
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

    setIsGenerating(true);
    setError("");
    setLearningPath(null);

    try {
      const res = await fetch("/api/learning-path/generate", {
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
          currentRole: currentRole.trim(),
          currentLevel,
          objectives: objectives.trim(),
          hoursPerWeek,
          duration
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Erreur API (${res.status})`);
      }

      const data = await res.json();
      setLearningPath(data);
    } catch (e) {
      console.error(e);
      setError(e.message || "Erreur lors de la génération du parcours.");
    } finally {
      setIsGenerating(false);
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
          Planificateur de Formation Data/IA
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "var(--fg-muted)",
            marginTop: 8,
            marginBottom: 0
          }}
        >
          Décrivez votre profil et vos objectifs, et obtenez un roadmap d'apprentissage personnalisé sur 4-8 semaines
          avec modules, ressources et planning hebdomadaire. Branchez vos propres clés LLM (HF, Azure, Bedrock).
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

      {/* Formulaire profil */}
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
        <h2
          style={{
            fontSize: 18,
            fontWeight: 600,
            margin: 0,
            color: "var(--fg)"
          }}
        >
          Votre profil
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--fg)" }}>
              Poste actuel <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
              placeholder="Ex: Développeur web, Analyste business, Étudiant..."
              style={{
                padding: "10px 12px",
                background: "var(--bg)",
                border: "2px solid var(--line-blueprint)",
                borderRadius: "6px",
                color: "var(--fg)",
                fontSize: "14px"
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--fg)" }}>
              Niveau actuel <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <select
              value={currentLevel}
              onChange={(e) => setCurrentLevel(e.target.value)}
              style={{
                padding: "10px 12px",
                background: "var(--bg)",
                border: "2px solid var(--line-blueprint)",
                borderRadius: "6px",
                color: "var(--fg)",
                fontSize: "14px",
                cursor: "pointer"
              }}
            >
              <option value="débutant">Débutant</option>
              <option value="intermédiaire">Intermédiaire</option>
              <option value="avancé">Avancé</option>
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--fg)" }}>
              Objectifs d'apprentissage <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <textarea
              value={objectives}
              onChange={(e) => setObjectives(e.target.value)}
              placeholder="Ex: Maîtriser SQL pour analyser des données business, comprendre les bases du machine learning, apprendre à utiliser des LLM pour automatiser des tâches..."
              style={{
                width: "100%",
                minHeight: "100px",
                padding: "10px 12px",
                background: "var(--bg)",
                border: "2px solid var(--line-blueprint)",
                borderRadius: "6px",
                color: "var(--fg)",
                fontSize: "14px",
                resize: "vertical"
              }}
            />
          </div>

          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--fg)" }}>
                Temps disponible par semaine (heures)
              </label>
              <input
                type="number"
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max="40"
                style={{
                  padding: "10px 12px",
                  background: "var(--bg)",
                  border: "2px solid var(--line-blueprint)",
                  borderRadius: "6px",
                  color: "var(--fg)",
                  fontSize: "14px"
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--fg)" }}>
                Durée du parcours (semaines)
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                style={{
                  padding: "10px 12px",
                  background: "var(--bg)",
                  border: "2px solid var(--line-blueprint)",
                  borderRadius: "6px",
                  color: "var(--fg)",
                  fontSize: "14px",
                  cursor: "pointer"
                }}
              >
                <option value="4">4 semaines</option>
                <option value="6">6 semaines</option>
                <option value="8">8 semaines</option>
              </select>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating || !currentRole.trim() || !objectives.trim()}
          style={{
            padding: "12px 24px",
            background: isGenerating || !currentRole.trim() || !objectives.trim() ? "var(--fg-muted)" : "var(--accent)",
            border: "none",
            borderRadius: "6px",
            color: "var(--bg)",
            fontSize: "14px",
            fontWeight: 600,
            cursor: isGenerating || !currentRole.trim() || !objectives.trim() ? "not-allowed" : "pointer",
            fontFamily: "monospace"
          }}
        >
          {isGenerating ? "⏳ Génération en cours..." : "🚀 Générer mon parcours"}
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

      {/* Résultat : Roadmap */}
      {learningPath && (
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
                fontSize: 24,
                fontWeight: 700,
                margin: 0,
                marginBottom: 8,
                color: "var(--fg)"
              }}
            >
              📚 Votre parcours personnalisé
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "var(--fg-muted)",
                margin: 0
              }}
            >
              {learningPath.summary || "Parcours généré sur " + duration + " semaines"}
            </p>
          </div>

          {/* Planning hebdomadaire */}
          {learningPath.weeks && learningPath.weeks.length > 0 && (
            <div>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  margin: 0,
                  marginBottom: 16,
                  color: "var(--fg)"
                }}
              >
                Planning hebdomadaire
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {learningPath.weeks.map((week, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: "var(--bg)",
                      border: "2px solid var(--line-blueprint)",
                      borderRadius: 8,
                      padding: 20
                    }}
                  >
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: 700,
                        color: "var(--accent)",
                        marginBottom: 12
                      }}
                    >
                      Semaine {week.number || idx + 1}
                    </div>
                    {week.theme && (
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "var(--fg)",
                          marginBottom: 8
                        }}
                      >
                        {week.theme}
                      </div>
                    )}
                    {week.modules && week.modules.length > 0 && (
                      <div style={{ marginTop: 12 }}>
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "var(--fg-muted)",
                            marginBottom: 8,
                            textTransform: "uppercase"
                          }}
                        >
                          Modules
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {week.modules.map((module, mIdx) => (
                            <div
                              key={mIdx}
                              style={{
                                padding: "8px 12px",
                                background: "var(--bg-secondary)",
                                borderRadius: 6,
                                fontSize: "13px",
                                color: "var(--fg)"
                              }}
                            >
                              • {module}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {week.resources && week.resources.length > 0 && (
                      <div style={{ marginTop: 12 }}>
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "var(--fg-muted)",
                            marginBottom: 8,
                            textTransform: "uppercase"
                          }}
                        >
                          Ressources
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          {week.resources.map((resource, rIdx) => (
                            <div
                              key={rIdx}
                              style={{
                                fontSize: "12px",
                                color: "var(--fg-muted)"
                              }}
                            >
                              - {resource}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {week.hours && (
                      <div
                        style={{
                          marginTop: 12,
                          fontSize: "12px",
                          color: "var(--fg-muted)",
                          fontStyle: "italic"
                        }}
                      >
                        Temps estimé : {week.hours}h
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Briques de compétences */}
          {learningPath.skills && learningPath.skills.length > 0 && (
            <div>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  margin: 0,
                  marginBottom: 12,
                  color: "var(--fg)"
                }}
              >
                Compétences couvertes
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {learningPath.skills.map((skill, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "6px 12px",
                      background: "var(--bg)",
                      border: "2px solid var(--accent)",
                      borderRadius: 6,
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "var(--accent)"
                    }}
                  >
                    {skill}
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


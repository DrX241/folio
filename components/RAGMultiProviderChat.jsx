"use client";

import { useState } from "react";

export default function RAGMultiProviderChat() {
  const [provider, setProvider] = useState("huggingface"); // huggingface | bedrock | azure-openai | generic

  // Config commune + spécifique
  const [hfApiKey, setHfApiKey] = useState("");
  const [hfBaseUrl, setHfBaseUrl] = useState("https://api-inference.huggingface.co");
  const [hfChatModel, setHfChatModel] = useState("tiiuae/falcon-7b-instruct");

  const [azureEndpoint, setAzureEndpoint] = useState("");
  const [azureApiVersion, setAzureApiVersion] = useState("2024-02-15-preview");
  const [azureEmbeddingDeployment, setAzureEmbeddingDeployment] = useState("");
  const [azureChatDeployment, setAzureChatDeployment] = useState("");
  const [azureApiKey, setAzureApiKey] = useState("");

  // Mode générique pour couvrir Bedrock via API Gateway ou tout autre endpoint HTTP
  const [genericBaseUrl, setGenericBaseUrl] = useState("");
  const [genericChatPath, setGenericChatPath] = useState("");
  const [genericAuthHeader, setGenericAuthHeader] = useState(""); // ex: "x-api-key: ABC..." ou "Authorization: Bearer xxx"

  // Config AWS Bedrock (clé d'accès / clé secrète / région / modèle)
  const [awsAccessKeyId, setAwsAccessKeyId] = useState("");
  const [awsSecretAccessKey, setAwsSecretAccessKey] = useState("");
  const [awsRegion, setAwsRegion] = useState("eu-west-3");
  const [bedrockModelId, setBedrockModelId] = useState("anthropic.claude-3-haiku-20240307-v1:0");

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([]); // { role: "user" | "assistant", content }

  const handleAsk = async () => {
    setError("");

    const question = input.trim();
    if (!question) {
      setError("Veuillez saisir un message.");
      return;
    }

    // Validation minimale par provider
    if (provider === "huggingface") {
      if (!hfApiKey) {
        setError("Veuillez renseigner votre clé API Hugging Face.");
        return;
      }
    } else if (provider === "azure-openai") {
      if (!azureEndpoint || !azureEmbeddingDeployment || !azureChatDeployment || !azureApiKey) {
        setError("Veuillez renseigner endpoint, deployments et clé API Azure OpenAI.");
        return;
      }
    } else if (provider === "generic") {
      if (!genericBaseUrl || !genericChatPath) {
        setError("Veuillez renseigner au minimum base URL et chemin chat pour le provider générique.");
        return;
      }
    }

    setIsLoading(true);
    try {
      // Ajouter le message utilisateur dans l'historique
      const newMessages = [...messages, { role: "user", content: question }];
      setMessages(newMessages);
      setInput("");

      const res = await fetch("/api/rag-multi/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          question,
          config: {
            huggingface: {
              apiKey: hfApiKey,
              baseUrl: hfBaseUrl,
              chatModel: hfChatModel
            },
            azure: {
              endpoint: azureEndpoint,
              apiVersion: azureApiVersion,
              embeddingDeployment: azureEmbeddingDeployment,
              chatDeployment: azureChatDeployment,
              apiKey: azureApiKey
            },
            generic: {
              baseUrl: genericBaseUrl,
              chatPath: genericChatPath,
              authHeader: genericAuthHeader
            },
            bedrock: {
              accessKeyId: awsAccessKeyId,
              secretAccessKey: awsSecretAccessKey,
              region: awsRegion,
              modelId: bedrockModelId
            }
          }
        })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Erreur API (${res.status})`);
      }

      const data = await res.json();
      const answer = data.answer || "";
      if (answer) {
        setMessages(prev => [...prev, { role: "assistant", content: answer }]);
      }
    } catch (e) {
      console.error(e);
      setError(e.message || "Erreur inconnue lors de l'appel au modèle.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderProviderConfig = () => {
    if (provider === "huggingface") {
      return (
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>Clé API Hugging Face</label>
            <input
              type="password"
              value={hfApiKey}
              onChange={e => setHfApiKey(e.target.value)}
              placeholder="hf_..."
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>Base URL</label>
            <input
              type="text"
              value={hfBaseUrl}
              onChange={e => setHfBaseUrl(e.target.value)}
              placeholder="https://api-inference.huggingface.co"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>Modèle de chat / génération</label>
            <input
              type="text"
              value={hfChatModel}
              onChange={e => setHfChatModel(e.target.value)}
              placeholder="tiiuae/falcon-7b-instruct"
              style={inputStyle}
            />
          </div>
        </div>
      );
    }

    if (provider === "azure-openai") {
      return (
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>Endpoint Azure OpenAI</label>
            <input
              type="text"
              value={azureEndpoint}
              onChange={e => setAzureEndpoint(e.target.value)}
              placeholder="https://votre-ressource.openai.azure.com"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>API version</label>
            <input
              type="text"
              value={azureApiVersion}
              onChange={e => setAzureApiVersion(e.target.value)}
              placeholder="2024-02-15-preview"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>Deployment embeddings</label>
            <input
              type="text"
              value={azureEmbeddingDeployment}
              onChange={e => setAzureEmbeddingDeployment(e.target.value)}
              placeholder="embedding-deployment-name"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>Deployment chat</label>
            <input
              type="text"
              value={azureChatDeployment}
              onChange={e => setAzureChatDeployment(e.target.value)}
              placeholder="gpt-4o-mini-deployment"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>Clé API Azure OpenAI</label>
            <input
              type="password"
              value={azureApiKey}
              onChange={e => setAzureApiKey(e.target.value)}
              placeholder="clé Azure OpenAI"
              style={inputStyle}
            />
          </div>
        </div>
      );
    }

    if (provider === "bedrock") {
      const bedrockModels = [
        "anthropic.claude-3-haiku-20240307-v1:0",
        "anthropic.claude-3-sonnet-20240229-v1:0",
        "anthropic.claude-3-opus-20240229-v1:0",
        "amazon.titan-text-lite-v1",
        "amazon.titan-text-express-v1"
      ];

      return (
        <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>AWS Access Key ID</label>
            <input
              type="password"
              value={awsAccessKeyId}
              onChange={e => setAwsAccessKeyId(e.target.value)}
              placeholder="AKIA..."
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>AWS Secret Access Key</label>
            <input
              type="password"
              value={awsSecretAccessKey}
              onChange={e => setAwsSecretAccessKey(e.target.value)}
              placeholder="********"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>Région Bedrock</label>
            <input
              type="text"
              value={awsRegion}
              onChange={e => setAwsRegion(e.target.value)}
              placeholder="eu-west-3"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>Modèle Bedrock</label>
            <select
              value={bedrockModelId}
              onChange={e => setBedrockModelId(e.target.value)}
              style={{ ...inputStyle, paddingRight: 24 }}
            >
              {bedrockModels.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
              <option value="__custom__">Autre (saisie manuelle)</option>
            </select>
            {bedrockModelId === "__custom__" && (
              <input
                type="text"
                onChange={e => setBedrockModelId(e.target.value)}
                placeholder="ID complet du modèle Bedrock déployé"
                style={{ ...inputStyle, marginTop: 8 }}
              />
            )}
            <p style={{ fontSize: 11, color: "var(--fg-muted)", marginTop: 4 }}>
              Les credentials sont utilisés uniquement pour signer les appels Bedrock côté serveur et ne sont pas stockés.
            </p>
          </div>
        </div>
      );
    }

    // Provider générique (permet par ex. d'appeler un endpoint API Gateway personnalisé)
    return (
      <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr", gap: "16px" }}>
        <div>
          <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>Base URL</label>
          <input
            type="text"
            value={genericBaseUrl}
            onChange={e => setGenericBaseUrl(e.target.value)}
            placeholder="https://mon-endpoint-api"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>Chemin chat</label>
          <input
            type="text"
            value={genericChatPath}
            onChange={e => setGenericChatPath(e.target.value)}
            placeholder="/chat"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>Header d'authentification (optionnel)</label>
          <input
            type="text"
            value={genericAuthHeader}
            onChange={e => setGenericAuthHeader(e.target.value)}
            placeholder="Authorization: Bearer xxx ou x-api-key: yyy"
            style={inputStyle}
          />
          <p style={{ fontSize: 11, color: "var(--fg-muted)", marginTop: 4 }}>
            Ce mode permet de brancher un endpoint personnalisé (ex : AWS Bedrock exposé via API Gateway).
          </p>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      width: "100%",
      maxWidth: "1600px",
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      gap: 24
    }}>
      {/* Header / Intro */}
      <div style={{
        background: "var(--bg-secondary)",
        border: "2px solid var(--line-blueprint)",
        borderRadius: 12,
        padding: 24
      }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: "var(--fg)" }}>
          Chatbot IA multi-fournisseurs
        </h1>
        <p style={{ fontSize: 14, color: "var(--fg-muted)", marginTop: 8, marginBottom: 0 }}>
          Branchez vos propres clés (Hugging Face, Azure OpenAI, AWS Bedrock ou endpoint personnalisé)
          et testez un chatbot IA sans aucune donnée stockée côté serveur.
        </p>
      </div>

      {/* Configuration provider */}
      <div style={{
        background: "var(--bg-secondary)",
        border: "2px solid var(--line-blueprint)",
        borderRadius: 12,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 16
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: "var(--fg)" }}>
              1. Configuration du fournisseur d'IA
            </h2>
            <p style={{ fontSize: 12, color: "var(--fg-muted)", marginTop: 4, marginBottom: 0 }}>
              Vos clés restent dans cette session. Elles ne sont ni loguées ni stockées côté serveur.
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
              onClick={() => setProvider("bedrock")}
              style={providerButtonStyle(provider === "bedrock")}
            >
              AWS Bedrock
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
              onClick={() => setProvider("generic")}
              style={providerButtonStyle(provider === "generic")}
            >
              Endpoint générique / Bedrock via API Gateway
            </button>
          </div>
        </div>
        {renderProviderConfig()}
      </div>

      {/* Zone de chat */}
      <div style={{
        background: "var(--bg-secondary)",
        border: "2px solid var(--line-blueprint)",
        borderRadius: 12,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        minHeight: 400
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: "var(--fg)" }}>
          2. Conversation
        </h2>
        <div style={{
          flex: 1,
          borderRadius: 8,
          border: "1px solid var(--line-blueprint)",
          padding: 12,
          background: "var(--bg)",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 8
        }}>
          {messages.length === 0 && (
            <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>
              Commencez la conversation en envoyant un premier message.
            </div>
          )}
          {messages.map((m, idx) => (
            <div
              key={idx}
              style={{
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "75%",
                borderRadius: 10,
                padding: 10,
                fontSize: 13,
                lineHeight: 1.5,
                background: m.role === "user" ? "var(--accent)" : "var(--bg-secondary)",
                color: m.role === "user" ? "var(--bg)" : "var(--fg)",
                border: "1px solid var(--line-blueprint)",
                whiteSpace: "pre-wrap",
                boxShadow: "0 2px 8px rgba(0,0,0,0.25)"
              }}
            >
              {m.content}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            rows={2}
            style={{
              flex: 1,
              resize: "none",
              borderRadius: 8,
              border: "1px solid var(--line-blueprint)",
              padding: 10,
              background: "var(--bg)",
              color: "var(--fg)",
              fontFamily: "monospace",
              fontSize: 13
            }}
            placeholder="Posez une question au modèle configuré..."
          />
          <button
            type="button"
            onClick={handleAsk}
            disabled={isLoading}
            style={{
              padding: "10px 18px",
              borderRadius: 8,
              border: "2px solid var(--accent)",
              background: isLoading ? "transparent" : "var(--accent)",
              color: isLoading ? "var(--accent)" : "var(--bg)",
              fontSize: 13,
              fontWeight: 600,
              cursor: isLoading ? "default" : "pointer",
              fontFamily: "monospace",
              transition: "all 0.2s ease",
              alignSelf: "flex-end",
              minWidth: 140
            }}
          >
            {isLoading ? "Génération..." : "Envoyer"}
          </button>
        </div>
        {error && (
          <div style={{
            marginTop: 4,
            padding: 8,
            borderRadius: 8,
            border: "1px solid #ef4444",
            background: "#ef444410",
            color: "#ef4444",
            fontSize: 12
          }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  borderRadius: 8,
  border: "1px solid var(--line-blueprint)",
  padding: "8px 10px",
  background: "var(--bg)",
  color: "var(--fg)",
  fontFamily: "monospace",
  fontSize: 12
};

function providerButtonStyle(active) {
  return {
    padding: "8px 14px",
    borderRadius: 999,
    border: `2px solid ${active ? "var(--accent)" : "var(--line-blueprint)"}`,
    background: active ? "var(--accent)" : "transparent",
    color: active ? "var(--bg)" : "var(--fg)",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "monospace",
    transition: "all 0.2s ease"
  };
}



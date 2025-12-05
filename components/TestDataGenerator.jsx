"use client";

import { useState } from "react";

export default function TestDataGenerator() {
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

  // Spécification du jeu de test
  const [datasetName, setDatasetName] = useState("jeu_de_test_clients");
  const [testType, setTestType] = useState("clients_b2b");
  const [businessDomain, setBusinessDomain] = useState("générique");
  const [rowCount, setRowCount] = useState(50);
  const [schemaDescription, setSchemaDescription] = useState(
    "Je veux un jeu de test de clients B2B.\n\nContexte métier : générique B2B, applicable à plusieurs secteurs.\n\nColonnes (en langage naturel) :\n- id : identifiant unique par client\n- nom : nom complet de l'entreprise (raison sociale réaliste)\n- email : email de contact réaliste\n- pays : pays francophones (France, Belgique, Suisse, Canada francophone)\n- ca_12_mois : chiffre d'affaires sur 12 mois (en euros, valeurs plausibles)\n- segment : TPE, PME, ETI ou GE\n- date_derniere_commande : date réaliste sur les 24 derniers mois"
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null); // tableau d'objets
  const [rawResponse, setRawResponse] = useState("");

  const handleGenerate = async () => {
    setError("");
    setRawResponse("");
    setData(null);

    if (!schemaDescription.trim()) {
      setError("Décrivez au minimum la structure de votre jeu de test (colonnes, types, contraintes).");
      return;
    }
    if (!rowCount || rowCount <= 0) {
      setError("Le nombre de lignes doit être supérieur à 0.");
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

    setIsGenerating(true);
    try {
      const res = await fetch("/api/test-data/generate", {
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
          datasetName,
          rowCount,
          schemaDescription
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Erreur API (${res.status})`);
      }

      const json = await res.json();
      setRawResponse(json.raw || "");
      setData(Array.isArray(json.rows) ? json.rows : null);
    } catch (e) {
      console.error(e);
      setError(e.message || "Erreur inconnue lors de la génération du jeu de test.");
    } finally {
      setIsGenerating(false);
    }
  };

  const getJsonString = () => {
    return JSON.stringify(data ?? [], null, 2);
  };

  const getCsvString = () => {
    if (!data || data.length === 0) return "";
    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(h => String(row[h] ?? "")).join(";"));
    return [headers.join(";"), ...rows].join("\n");
  };

  const copyToClipboard = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    alert(`${label} copié dans le presse-papiers.`);
  };

  const downloadCsv = () => {
    const csv = getCsvString();
    if (!csv) return;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${datasetName || "jeu_de_test"}.csv`;
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
          Générateur de jeux de test
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "var(--fg-muted)",
            marginTop: 8,
            marginBottom: 0
          }}
        >
          Décrivez la structure de votre dataset, indiquez le nombre de lignes, branchez vos propres clés
          (Hugging Face, Azure OpenAI ou AWS Bedrock) et générez instantanément des jeux de test synthétiques.
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
              onChange={e => setHfApiKey(e.target.value)}
              placeholder="hf_..."
              style={inputStyle}
            />
          </div>
        )}

        {provider === "azure-openai" && (
          <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 8 }}>
            <div>
              <label style={{ fontSize: 12, color: "var(--fg-muted)" }}>Endpoint Azure OpenAI</label>
              <input
                type="text"
                value={azureEndpoint}
                onChange={e => setAzureEndpoint(e.target.value)}
                placeholder="https://votre-ressource.openai.azure.com"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--fg-muted)" }}>API version</label>
              <input
                type="text"
                value={azureApiVersion}
                onChange={e => setAzureApiVersion(e.target.value)}
                placeholder="2024-02-15-preview"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--fg-muted)" }}>Deployment (modèle)</label>
              <input
                type="text"
                value={azureDeployment}
                onChange={e => setAzureDeployment(e.target.value)}
                placeholder="gpt-4o-mini-deployment"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--fg-muted)" }}>Clé API Azure OpenAI</label>
              <input
                type="password"
                value={azureApiKey}
                onChange={e => setAzureApiKey(e.target.value)}
                placeholder="clé Azure OpenAI"
                style={inputStyle}
              />
            </div>
          </div>
        )}

        {provider === "bedrock" && (
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1.5fr", gap: 8 }}>
            <div>
              <label style={{ fontSize: 12, color: "var(--fg-muted)" }}>AWS Access Key ID</label>
              <input
                type="password"
                value={awsAccessKeyId}
                onChange={e => setAwsAccessKeyId(e.target.value)}
                placeholder="AKIA..."
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--fg-muted)" }}>AWS Secret Access Key</label>
              <input
                type="password"
                value={awsSecretAccessKey}
                onChange={e => setAwsSecretAccessKey(e.target.value)}
                placeholder="********"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--fg-muted)" }}>Région Bedrock</label>
              <input
                type="text"
                value={awsRegion}
                onChange={e => setAwsRegion(e.target.value)}
                placeholder="eu-west-3"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--fg-muted)" }}>Modèle Bedrock</label>
              <input
                type="text"
                value={bedrockModelId}
                onChange={e => setBedrockModelId(e.target.value)}
                placeholder="anthropic.claude-3-haiku-20240307-v1:0"
                style={inputStyle}
              />
            </div>
          </div>
        )}
      </div>

      {/* Spécification dataset */}
      <div
        style={{
          background: "var(--bg-secondary)",
          border: "2px solid var(--line-blueprint)",
          borderRadius: 12,
          padding: 20,
          display: "grid",
          gridTemplateColumns: "1.3fr 1fr",
          gap: 20,
          alignItems: "flex-start"
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h2
            style={{
              fontSize: 16,
              fontWeight: 600,
              margin: 0,
              color: "var(--fg)"
            }}
          >
            2. Structure du jeu de test
          </h2>

          {/* Choix du type et du secteur métier */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label style={{ fontSize: 12, color: "var(--fg-muted)" }}>Type de jeu de test</label>
              <select
                value={testType}
                onChange={e => {
                  const value = e.target.value;
                  setTestType(value);
                  // Appliquer un template simple selon le type
                  if (value === "clients_b2b") {
                    setDatasetName("jeu_de_test_clients");
                    setSchemaDescription(
                      "Je veux un jeu de test de clients B2B.\n\nContexte métier : " +
                      businessDomain +
                      ".\n\nColonnes (en langage naturel) :\n- id : identifiant unique par client\n- nom : nom complet de l'entreprise (raison sociale réaliste)\n- email : email de contact réaliste\n- pays : pays pertinents pour ce secteur\n- ca_12_mois : chiffre d'affaires sur 12 mois (en euros, valeurs plausibles)\n- segment : TPE, PME, ETI ou GE\n- date_derniere_commande : date réaliste sur les 24 derniers mois"
                    );
                  } else if (value === "transactions_ecommerce") {
                    setDatasetName("transactions_ecommerce");
                    setSchemaDescription(
                      "Je veux un jeu de test de transactions e-commerce.\n\nContexte métier : " +
                      businessDomain +
                      ".\n\nColonnes (en langage naturel) :\n- transaction_id : identifiant unique\n- client_id : identifiant client\n- date_transaction : date et heure réalistes\n- canal : web, mobile, marketplace\n- produit : nom ou code produit\n- quantite : quantité entière\n- prix_unitaire : prix TTC par unité\n- montant_total : montant total de la transaction\n- pays : pays du client\n- moyen_paiement : CB, PayPal, virement, etc."
                    );
                  } else if (value === "tickets_support") {
                    setDatasetName("tickets_support");
                    setSchemaDescription(
                      "Je veux un jeu de test de tickets de support.\n\nContexte métier : " +
                      businessDomain +
                      ".\n\nColonnes (en langage naturel) :\n- ticket_id : identifiant unique\n- date_creation : date de création\n- client_id : identifiant client ou compte\n- canal : email, chat, téléphone, portail\n- sujet : courte description textuelle\n- description : description plus détaillée du problème\n- priorite : basse, moyenne, haute, critique\n- statut : ouvert, en cours, résolu, fermé\n- temps_resolution_heures : temps de résolution approximatif\n- agent_responsable : prénom/initiales de l'agent"
                    );
                  } else if (value === "kpis_financiers") {
                    setDatasetName("kpis_financiers");
                    setSchemaDescription(
                      "Je veux un jeu de test de KPIs financiers mensuels.\n\nContexte métier : " +
                      businessDomain +
                      ".\n\nColonnes (en langage naturel) :\n- periode : mois/année (format YYYY-MM)\n- ca : chiffre d'affaires du mois\n- marge_brute : marge brute du mois\n- couts_marketing : dépenses marketing du mois\n- couts_fix es : coûts fixes du mois\n- resultat_net : résultat net du mois\n- devise : code devise (EUR, USD, etc.)"
                    );
                  }
                }}
                style={inputStyle}
              >
                <option value="clients_b2b">Clients B2B</option>
                <option value="transactions_ecommerce">Transactions e-commerce</option>
                <option value="tickets_support">Tickets de support / helpdesk</option>
                <option value="kpis_financiers">KPIs financiers mensuels</option>
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label style={{ fontSize: 12, color: "var(--fg-muted)" }}>Secteur / métier</label>
              <select
                value={businessDomain}
                onChange={e => setBusinessDomain(e.target.value)}
                style={inputStyle}
              >
                <option value="générique">Générique / multi-secteurs</option>
                <option value="retail">Retail / e-commerce</option>
                <option value="banque_assurance">Banque / Assurance</option>
                <option value="santé">Santé</option>
                <option value="industrie">Industrie / manufacturing</option>
                <option value="saas_b2b">SaaS B2B</option>
                <option value="service_public">Service public</option>
              </select>
            </div>
          </div>
          <label style={{ fontSize: 12, color: "var(--fg-muted)" }}>Nom logique du dataset</label>
          <input
            type="text"
            value={datasetName}
            onChange={e => setDatasetName(e.target.value)}
            style={inputStyle}
          />
          <label style={{ fontSize: 12, color: "var(--fg-muted)", marginTop: 4 }}>
            Décrivez en langage naturel les colonnes, types de données, contraintes et règles métier
          </label>
          <textarea
            value={schemaDescription}
            onChange={e => setSchemaDescription(e.target.value)}
            rows={10}
            style={{
              width: "100%",
              resize: "vertical",
              borderRadius: 8,
              border: "1px solid var(--line-blueprint)",
              padding: 12,
              background: "var(--bg)",
              color: "var(--fg)",
              fontFamily: "monospace",
              fontSize: 12
            }}
          />
          <p
            style={{
              fontSize: 11,
              color: "var(--fg-muted)",
              marginTop: 4
            }}
          >
            Vous pouvez rester très métier (ex : “liste de clients B2B avec emails réalistes, CA annuel et segment TPE/PME/ETI/GE”),
            le modèle se charge de déduire le format des colonnes.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h2
            style={{
              fontSize: 16,
              fontWeight: 600,
              margin: 0,
              color: "var(--fg)"
            }}
          >
            3. Paramètres de génération
          </h2>
          <label style={{ fontSize: 12, color: "var(--fg-muted)" }}>Nombre de lignes à générer</label>
          <input
            type="number"
            value={rowCount}
            min={1}
            max={1000}
            onChange={e => setRowCount(parseInt(e.target.value || "0", 10))}
            style={inputStyle}
          />
          <p
            style={{
              fontSize: 11,
              color: "var(--fg-muted)",
              marginTop: 2
            }}
          >
            Pour une démo fluide, restez entre 10 et 200 lignes. Au-delà, la génération peut être plus lente.
          </p>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            style={{
              marginTop: 8,
              padding: "10px 18px",
              borderRadius: 8,
              border: "2px solid var(--accent)",
              background: isGenerating ? "transparent" : "var(--accent)",
              color: isGenerating ? "var(--accent)" : "var(--bg)",
              fontSize: 13,
              fontWeight: 600,
              cursor: isGenerating ? "default" : "pointer",
              fontFamily: "monospace",
              transition: "all 0.2s ease"
            }}
          >
            {isGenerating ? "Génération en cours..." : "Générer le jeu de test"}
          </button>
          {error && (
            <div
              style={{
                marginTop: 8,
                padding: 10,
                borderRadius: 8,
                border: "1px solid #ef4444",
                background: "#ef444410",
                color: "#ef4444",
                fontSize: 12
              }}
            >
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Résultats */}
      {(data || rawResponse) && (
        <div
          style={{
            background: "var(--bg-secondary)",
            border: "2px solid var(--line-blueprint)",
            borderRadius: 12,
            padding: 20,
            display: "grid",
            gridTemplateColumns: "1.3fr 1fr",
            gap: 20,
            alignItems: "flex-start"
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 600,
                margin: 0,
                color: "var(--fg)"
              }}
            >
              Jeu de test généré
            </h2>
            {data && data.length > 0 ? (
              <>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginBottom: 8,
                    flexWrap: "wrap"
                  }}
                >
                  <button
                    type="button"
                    onClick={() => copyToClipboard(getJsonString(), "JSON")}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 6,
                      border: "1px solid var(--accent)",
                      background: "transparent",
                      color: "var(--accent)",
                      fontSize: 12,
                      fontFamily: "monospace",
                      cursor: "pointer"
                    }}
                  >
                    📋 Copier en JSON
                  </button>
                  <button
                    type="button"
                    onClick={downloadCsv}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 6,
                      border: "1px solid var(--accent)",
                      background: "transparent",
                      color: "var(--accent)",
                      fontSize: 12,
                      fontFamily: "monospace",
                      cursor: "pointer"
                    }}
                  >
                    ⬇ Télécharger en CSV
                  </button>
                </div>
                <div
                  style={{
                    maxHeight: 360,
                    overflow: "auto",
                    borderRadius: 8,
                    border: "1px solid var(--line-blueprint)",
                    background: "var(--bg)"
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: 12,
                      fontFamily: "monospace"
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          background: "var(--bg-secondary)",
                          position: "sticky",
                          top: 0,
                          zIndex: 1
                        }}
                      >
                        {Object.keys(data[0]).map((key, idx) => (
                          <th
                            key={idx}
                            style={{
                              padding: "8px",
                              borderBottom: "1px solid var(--line-blueprint)",
                              textAlign: "left",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                              color: "var(--fg)"
                            }}
                          >
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((row, rIdx) => (
                        <tr
                          key={rIdx}
                          style={{
                            borderBottom: "1px solid var(--line-blueprint)"
                          }}
                        >
                          {Object.keys(data[0]).map((key, cIdx) => (
                            <td
                              key={cIdx}
                              style={{
                                padding: "8px",
                                color: "var(--fg)"
                              }}
                            >
                              {String(row[key] ?? "")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div
                style={{
                  padding: 16,
                  borderRadius: 8,
                  border: "1px solid var(--line-blueprint)",
                  background: "var(--bg)",
                  fontSize: 12,
                  color: "var(--fg-muted)"
                }}
              >
                Aucun tableau JSON structuré n’a été détecté dans la réponse du modèle.
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 600,
                margin: 0,
                color: "var(--fg)"
              }}
            >
              Réponse brute du modèle (debug)
            </h2>
            <div
              style={{
                maxHeight: 360,
                overflow: "auto",
                borderRadius: 8,
                border: "1px solid var(--line-blueprint)",
                background: "var(--bg)"
              }}
            >
              <pre
                style={{
                  margin: 0,
                  padding: 12,
                  fontFamily: "monospace",
                  fontSize: 12,
                  color: "var(--fg-muted)",
                  whiteSpace: "pre-wrap"
                }}
              >
                {rawResponse || "(Aucune réponse brute disponible)"}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: 6,
  border: "1px solid var(--line-blueprint)",
  background: "var(--bg)",
  color: "var(--fg)",
  fontFamily: "monospace",
  fontSize: 12
};

function providerButtonStyle(active) {
  return {
    padding: "6px 10px",
    borderRadius: 999,
    border: `1px solid ${active ? "var(--accent)" : "var(--line-blueprint)"}`,
    background: active ? "var(--accent)" : "transparent",
    color: active ? "var(--bg)" : "var(--fg)",
    fontSize: 11,
    fontFamily: "monospace",
    cursor: "pointer"
  };
}



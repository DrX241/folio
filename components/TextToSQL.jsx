"use client";
import { useState } from "react";

// Base de données d'exemple (simulée en mémoire)
const sampleDatabase = {
  tables: [
    {
      name: "ventes",
      columns: [
        { name: "id", type: "INTEGER", description: "Identifiant unique de la vente" },
        { name: "date_vente", type: "DATE", description: "Date de la vente" },
        { name: "client", type: "VARCHAR(100)", description: "Nom du client" },
        { name: "produit", type: "VARCHAR(100)", description: "Nom du produit" },
        { name: "quantite", type: "INTEGER", description: "Quantité vendue" },
        { name: "prix_unitaire", type: "DECIMAL(10,2)", description: "Prix unitaire" },
        { name: "ca", type: "DECIMAL(10,2)", description: "Chiffre d'affaires (quantite * prix_unitaire)" },
        { name: "region", type: "VARCHAR(50)", description: "Région de vente" }
      ],
      sampleData: [
        { id: 1, date_vente: "2024-01-15", client: "Entreprise A", produit: "Produit X", quantite: 10, prix_unitaire: 100, ca: 1000, region: "Paris" },
        { id: 2, date_vente: "2024-01-20", client: "Entreprise B", produit: "Produit Y", quantite: 5, prix_unitaire: 200, ca: 1000, region: "Lyon" },
        { id: 3, date_vente: "2024-02-10", client: "Entreprise A", produit: "Produit Z", quantite: 8, prix_unitaire: 150, ca: 1200, region: "Paris" },
        { id: 4, date_vente: "2024-02-15", client: "Entreprise C", produit: "Produit X", quantite: 15, prix_unitaire: 100, ca: 1500, region: "Marseille" },
        { id: 5, date_vente: "2024-03-01", client: "Entreprise B", produit: "Produit Y", quantite: 12, prix_unitaire: 200, ca: 2400, region: "Lyon" },
        { id: 6, date_vente: "2024-03-10", client: "Entreprise A", produit: "Produit X", quantite: 20, prix_unitaire: 100, ca: 2000, region: "Paris" },
        { id: 7, date_vente: "2024-03-15", client: "Entreprise D", produit: "Produit Z", quantite: 6, prix_unitaire: 150, ca: 900, region: "Lyon" },
        { id: 8, date_vente: "2024-04-01", client: "Entreprise B", produit: "Produit X", quantite: 8, prix_unitaire: 100, ca: 800, region: "Lyon" },
        { id: 9, date_vente: "2024-04-05", client: "Entreprise C", produit: "Produit Y", quantite: 10, prix_unitaire: 200, ca: 2000, region: "Marseille" },
        { id: 10, date_vente: "2024-04-20", client: "Entreprise A", produit: "Produit Z", quantite: 12, prix_unitaire: 150, ca: 1800, region: "Paris" }
      ]
    },
    {
      name: "clients",
      columns: [
        { name: "id", type: "INTEGER", description: "Identifiant unique du client" },
        { name: "nom", type: "VARCHAR(100)", description: "Nom du client" },
        { name: "ville", type: "VARCHAR(50)", description: "Ville du client" },
        { name: "secteur", type: "VARCHAR(50)", description: "Secteur d'activité" },
        { name: "ca_total", type: "DECIMAL(10,2)", description: "Chiffre d'affaires total avec ce client" }
      ],
      sampleData: [
        { id: 1, nom: "Entreprise A", ville: "Paris", secteur: "Technologie", ca_total: 6000 },
        { id: 2, nom: "Entreprise B", ville: "Lyon", secteur: "Commerce", ca_total: 6200 },
        { id: 3, nom: "Entreprise C", ville: "Marseille", secteur: "Industrie", ca_total: 3500 },
        { id: 4, nom: "Entreprise D", ville: "Lyon", secteur: "Services", ca_total: 900 }
      ]
    }
  ]
};

export default function TextToSQL() {
  const [question, setQuestion] = useState("");
  const [sqlQuery, setSqlQuery] = useState("");
  const [results, setResults] = useState(null);
  const [explanation, setExplanation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState("");
  const [dataMode, setDataMode] = useState("demo"); // "demo" | "custom"
  const [customData, setCustomData] = useState("");
  const [showConfig, setShowConfig] = useState(false);
  const [provider, setProvider] = useState("huggingface"); // huggingface | azure-openai | bedrock
  const [hfApiKey, setHfApiKey] = useState("");
  const [azureEndpoint, setAzureEndpoint] = useState("");
  const [azureApiVersion, setAzureApiVersion] = useState("2024-02-15-preview");
  const [azureDeployment, setAzureDeployment] = useState("");
  const [azureApiKey, setAzureApiKey] = useState("");
  const [awsAccessKeyId, setAwsAccessKeyId] = useState("");
  const [awsSecretAccessKey, setAwsSecretAccessKey] = useState("");
  const [awsRegion, setAwsRegion] = useState("eu-west-3");
  const [bedrockModelId, setBedrockModelId] = useState("anthropic.claude-3-haiku-20240307-v1:0");

  const generateSQL = async () => {
    if (!question.trim()) {
      setError("Veuillez saisir une question");
      return;
    }

    setIsLoading(true);
    setError("");
    setResults(null);
    setExplanation("");

    try {
      // Construire le contexte pour le LLM avec le schéma de la base de données
      let schemaContext = "";

      if (dataMode === "demo") {
        schemaContext = sampleDatabase.tables.map(table => {
          const columns = table.columns.map(col => `${col.name} (${col.type}) - ${col.description}`).join(", ");
          return `Table: ${table.name}\nColonnes: ${columns}`;
        }).join("\n\n");
      } else {
        const raw = customData.trim();
        if (!raw) {
          setError("En mode dataset personnalisé, collez d'abord un petit tableau (CSV ou colonnes séparées par des virgules).");
          setIsLoading(false);
          return;
        }

        const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        if (lines.length < 2) {
          setError("Le dataset personnalisé doit contenir au moins un en-tête et une ligne de données.");
          setIsLoading(false);
          return;
        }

        // On considère la première ligne comme les en-têtes de colonnes (séparateur virgule ou point-virgule)
        const headerLine = lines[0];
        const sep = headerLine.includes(";") ? ";" : ",";
        const headers = headerLine.split(sep).map(h => h.trim()).filter(Boolean);

        if (headers.length === 0) {
          setError("Impossible de détecter les colonnes. Vérifiez la première ligne de votre dataset personnalisé.");
          setIsLoading(false);
          return;
        }

        const columns = headers.map(h => `${h} (TEXT) - Colonne issue du dataset personnalisé`).join(", ");
        schemaContext = `Table: dataset_personnalise\nColonnes: ${columns}\n\nRemarque: Les valeurs sont issues d'un tableau collé manuellement (non exécuté côté base SQLite).`;
      }

      // Utiliser l'API Text-to-SQL dédiée avec post-processing intelligent
      const response = await fetch("/api/text-to-sql/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question,
          schemaContext: schemaContext,
          apiKey: hfApiKey || undefined,
          provider,
          azureConfig: provider === "azure-openai" ? {
            endpoint: azureEndpoint,
            apiVersion: azureApiVersion,
            deployment: azureDeployment,
            apiKey: azureApiKey
          } : undefined,
          bedrockConfig: provider === "bedrock" ? {
            accessKeyId: awsAccessKeyId,
            secretAccessKey: awsSecretAccessKey,
            region: awsRegion,
            modelId: bedrockModelId
          } : undefined
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setIsLoading(false);
        return;
      }

      // La requête SQL est déjà nettoyée, complétée et validée par l'API
      let generatedSQL = data.sql || "";
      
      if (!generatedSQL || generatedSQL.trim().length === 0) {
        setError("La génération SQL a échoué. Veuillez reformuler votre question plus clairement.");
        setIsLoading(false);
        return;
      }

      console.log("SQL reçu de l'API:", generatedSQL);

      setSqlQuery(generatedSQL);

      // Générer l'explication
      const explanationResponse = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Explique cette requête SQL en français de manière simple : ${generatedSQL}`,
          conversationHistory: []
        }),
      });

      const explanationData = await explanationResponse.json();
      if (explanationData.message) {
        setExplanation(explanationData.message);
      }

      // Ne pas exécuter automatiquement - l'utilisateur décidera avec le bouton
      setResults(null);

    } catch (error) {
      console.error("Error:", error);
      setError("Une erreur est survenue lors de la génération de la requête SQL");
    } finally {
      setIsLoading(false);
    }
  };

  const cleanSQLForExecution = (sql) => {
    if (!sql || typeof sql !== 'string') {
      return '';
    }

    // Nettoyer la requête SQL avant exécution
    let cleaned = sql.trim();

    // Enlever les balises markdown
    cleaned = cleaned
      .replace(/```sql/gi, '')
      .replace(/```/g, '')
      .replace(/`/g, '')
      .trim();

    // Enlever tout texte avant SELECT
    const selectIndex = cleaned.toUpperCase().indexOf('SELECT');
    if (selectIndex > 0) {
      cleaned = cleaned.substring(selectIndex);
    }

    // Enlever le point-virgule final
    cleaned = cleaned.replace(/;+$/, '').trim();

    // Nettoyer les caractères invisibles
    cleaned = cleaned
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/[""]/g, "'")
      .replace(/['']/g, "'")
      .trim();

    // Nettoyer les espaces multiples mais garder la structure
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    console.log("SQL nettoyé pour exécution:", cleaned);

    return cleaned;
  };

  const executeSQL = async (sql) => {
    if (!sql || !sql.trim()) {
      setError("Aucune requête SQL à exécuter");
      return;
    }

    console.log("=== EXÉCUTION SQL ===");
    console.log("1. SQL original:", sql);

    setIsExecuting(true);
    setError("");
    setResults(null);

    try {
      // Nettoyer la requête SQL avant envoi
      const cleanedSQL = cleanSQLForExecution(sql);
      
      console.log("2. SQL nettoyé côté client:", cleanedSQL);
      
      if (!cleanedSQL || !cleanedSQL.toUpperCase().startsWith('SELECT')) {
        setError("Requête SQL invalide ou incomplète");
        setIsExecuting(false);
        return;
      }

      // Exécuter la requête SQL sur la vraie base de données SQLite
      console.log("3. Envoi à l'API:", cleanedSQL);
      
      const response = await fetch("/api/text-to-sql/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sql: cleanedSQL }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setResults(null);
        return;
      }

      if (data.results) {
        setResults(data.results);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error("SQL Execution Error:", error);
      setError("Erreur lors de l'exécution de la requête SQL : " + error.message);
      setResults(null);
    } finally {
      setIsExecuting(false);
    }
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
        Text-to-SQL
      </h2>
      <p style={{
        fontSize: "14px",
        color: "var(--fg-muted)",
        marginBottom: "24px",
        lineHeight: 1.6
      }}>
        Posez une question en français et obtenez automatiquement la requête SQL correspondante, ou saisissez directement une requête SQL.
        Vous pouvez utiliser le dataset de démonstration intégré ou coller un petit tableau personnalisé.
      </p>

      {/* Configuration avancée (provider & clés) */}
      <div style={{
        marginBottom: "16px",
        background: "var(--bg)",
        border: "1px dashed var(--line-blueprint)",
        borderRadius: "8px",
        padding: "10px 12px"
      }}>
        <button
          type="button"
          onClick={() => setShowConfig(!showConfig)}
          style={{
            border: "none",
            background: "transparent",
            color: "var(--fg-muted)",
            fontSize: "12px",
            fontFamily: "monospace",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8
          }}
        >
          <span>{showConfig ? "▼" : "▶"}</span>
          <span>Configuration avancée (provider & clés API)</span>
        </button>
        {showConfig && (
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Choix du provider */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => setProvider("huggingface")}
                style={{
                  padding: "6px 10px",
                  borderRadius: 999,
                  border: `1px solid ${provider === "huggingface" ? "var(--accent)" : "var(--line-blueprint)"}`,
                  background: provider === "huggingface" ? "var(--accent)" : "transparent",
                  color: provider === "huggingface" ? "var(--bg)" : "var(--fg)",
                  fontSize: 11,
                  fontFamily: "monospace",
                  cursor: "pointer"
                }}
              >
                Hugging Face
              </button>
              <button
                type="button"
                onClick={() => setProvider("azure-openai")}
                style={{
                  padding: "6px 10px",
                  borderRadius: 999,
                  border: `1px solid ${provider === "azure-openai" ? "var(--accent)" : "var(--line-blueprint)"}`,
                  background: provider === "azure-openai" ? "var(--accent)" : "transparent",
                  color: provider === "azure-openai" ? "var(--bg)" : "var(--fg)",
                  fontSize: 11,
                  fontFamily: "monospace",
                  cursor: "pointer"
                }}
              >
                Azure OpenAI
              </button>
              <button
                type="button"
                onClick={() => setProvider("bedrock")}
                style={{
                  padding: "6px 10px",
                  borderRadius: 999,
                  border: `1px solid ${provider === "bedrock" ? "var(--accent)" : "var(--line-blueprint)"}`,
                  background: provider === "bedrock" ? "var(--accent)" : "transparent",
                  color: provider === "bedrock" ? "var(--bg)" : "var(--fg)",
                  fontSize: 11,
                  fontFamily: "monospace",
                  cursor: "pointer"
                }}
              >
                AWS Bedrock
              </button>
            </div>

            {/* Config spécifique provider */}
            {provider === "huggingface" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, color: "var(--fg-muted)" }}>
                  Clé API Hugging Face (utilisée seulement pour cette session, non stockée)
                </label>
                <input
                  type="password"
                  value={hfApiKey}
                  onChange={(e) => setHfApiKey(e.target.value)}
                  placeholder="hf_..."
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: "6px",
                    border: "1px solid var(--line-blueprint)",
                    background: "var(--bg-secondary)",
                    color: "var(--fg)",
                    fontFamily: "monospace",
                    fontSize: 12
                  }}
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
                    onChange={(e) => setAzureEndpoint(e.target.value)}
                    placeholder="https://votre-ressource.openai.azure.com"
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "6px",
                      border: "1px solid var(--line-blueprint)",
                      background: "var(--bg-secondary)",
                      color: "var(--fg)",
                      fontFamily: "monospace",
                      fontSize: 12
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--fg-muted)" }}>API version</label>
                  <input
                    type="text"
                    value={azureApiVersion}
                    onChange={(e) => setAzureApiVersion(e.target.value)}
                    placeholder="2024-02-15-preview"
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "6px",
                      border: "1px solid var(--line-blueprint)",
                      background: "var(--bg-secondary)",
                      color: "var(--fg)",
                      fontFamily: "monospace",
                      fontSize: 12
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--fg-muted)" }}>Deployment (modèle)</label>
                  <input
                    type="text"
                    value={azureDeployment}
                    onChange={(e) => setAzureDeployment(e.target.value)}
                    placeholder="gpt-4o-mini-deployment"
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "6px",
                      border: "1px solid var(--line-blueprint)",
                      background: "var(--bg-secondary)",
                      color: "var(--fg)",
                      fontFamily: "monospace",
                      fontSize: 12
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--fg-muted)" }}>Clé API Azure OpenAI</label>
                  <input
                    type="password"
                    value={azureApiKey}
                    onChange={(e) => setAzureApiKey(e.target.value)}
                    placeholder="clé Azure OpenAI"
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "6px",
                      border: "1px solid var(--line-blueprint)",
                      background: "var(--bg-secondary)",
                      color: "var(--fg)",
                      fontFamily: "monospace",
                      fontSize: 12
                    }}
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
                    onChange={(e) => setAwsAccessKeyId(e.target.value)}
                    placeholder="AKIA..."
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "6px",
                      border: "1px solid var(--line-blueprint)",
                      background: "var(--bg-secondary)",
                      color: "var(--fg)",
                      fontFamily: "monospace",
                      fontSize: 12
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--fg-muted)" }}>AWS Secret Access Key</label>
                  <input
                    type="password"
                    value={awsSecretAccessKey}
                    onChange={(e) => setAwsSecretAccessKey(e.target.value)}
                    placeholder="********"
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "6px",
                      border: "1px solid var(--line-blueprint)",
                      background: "var(--bg-secondary)",
                      color: "var(--fg)",
                      fontFamily: "monospace",
                      fontSize: 12
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--fg-muted)" }}>Région Bedrock</label>
                  <input
                    type="text"
                    value={awsRegion}
                    onChange={(e) => setAwsRegion(e.target.value)}
                    placeholder="eu-west-3"
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "6px",
                      border: "1px solid var(--line-blueprint)",
                      background: "var(--bg-secondary)",
                      color: "var(--fg)",
                      fontFamily: "monospace",
                      fontSize: 12
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--fg-muted)" }}>Modèle Bedrock</label>
                  <input
                    type="text"
                    value={bedrockModelId}
                    onChange={(e) => setBedrockModelId(e.target.value)}
                    placeholder="anthropic.claude-3-haiku-20240307-v1:0"
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "6px",
                      border: "1px solid var(--line-blueprint)",
                      background: "var(--bg-secondary)",
                      color: "var(--fg)",
                      fontFamily: "monospace",
                      fontSize: 12
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Schéma de la base de données */}
      <div style={{
        background: "var(--bg)",
        border: "1px solid var(--line-blueprint)",
        borderRadius: "8px",
        padding: "16px",
        marginBottom: "24px"
      }}>
        {/* Choix de la source de données */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
          gap: 12,
          flexWrap: "wrap"
        }}>
          <div style={{
            fontSize: "12px",
            fontWeight: 600,
            color: "var(--fg-muted)",
            textTransform: "uppercase",
            letterSpacing: "1px"
          }}>
            Source de données pour la génération SQL
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setDataMode("demo")}
              style={{
                padding: "6px 10px",
                borderRadius: 999,
                border: `1px solid ${dataMode === "demo" ? "var(--accent)" : "var(--line-blueprint)"}`,
                background: dataMode === "demo" ? "var(--accent)" : "transparent",
                color: dataMode === "demo" ? "var(--bg)" : "var(--fg)",
                fontSize: 11,
                fontFamily: "monospace",
                cursor: "pointer"
              }}
            >
              Dataset de démonstration
            </button>
            <button
              type="button"
              onClick={() => setDataMode("custom")}
              style={{
                padding: "6px 10px",
                borderRadius: 999,
                border: `1px solid ${dataMode === "custom" ? "var(--accent)" : "var(--line-blueprint)"}`,
                background: dataMode === "custom" ? "var(--accent)" : "transparent",
                color: dataMode === "custom" ? "var(--bg)" : "var(--fg)",
                fontSize: 11,
                fontFamily: "monospace",
                cursor: "pointer"
              }}
            >
              Dataset personnalisé (collé)
            </button>
          </div>
        </div>

        {dataMode === "demo" ? (
          <>
            {sampleDatabase.tables.map((table, idx) => (
              <div key={idx} style={{ marginBottom: idx < sampleDatabase.tables.length - 1 ? "16px" : "0" }}>
                <div style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--accent)",
                  marginBottom: "8px",
                  fontFamily: "monospace"
                }}>
                  {table.name}
                </div>
                <div style={{
                  fontSize: "12px",
                  color: "var(--fg-muted)",
                  fontFamily: "monospace",
                  lineHeight: 1.8
                }}>
                  {table.columns.map(col => col.name).join(", ")}
                </div>
              </div>
            ))}
            <div style={{ marginTop: 8, fontSize: 11, color: "var(--fg-muted)" }}>
              Les requêtes générées peuvent être exécutées directement sur cette base SQLite de démonstration.
            </div>
          </>
        ) : (
          <>
            <textarea
              value={customData}
              onChange={(e) => setCustomData(e.target.value)}
              rows={6}
              style={{
                width: "100%",
                resize: "vertical",
                borderRadius: 6,
                border: "1px solid var(--line-blueprint)",
                padding: 10,
                background: "var(--bg-secondary)",
                color: "var(--fg)",
                fontFamily: "monospace",
                fontSize: 12
              }}
              placeholder={
                "Collez ici un petit tableau CSV, par ex. :\n\nclient,ca,region\nEntreprise A,12000,Paris\nEntreprise B,8000,Lyon"
              }
            />
            <div style={{ marginTop: 8, fontSize: 11, color: "var(--fg-muted)" }}>
              Ce dataset sert de contexte pour générer la requête SQL (table fictive &lt;dataset_personnalise&gt;).
              L’exécution réelle se fait uniquement sur le dataset de démonstration.
            </div>
          </>
        )}
      </div>

      {/* Zone de saisie (texte → SQL uniquement) */}
      <div style={{ marginBottom: "24px" }}>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Exemple : Quels sont les 5 meilleurs clients par chiffre d'affaires ?"
          style={{
            width: "100%",
            minHeight: "100px",
            padding: "16px",
            border: "2px solid var(--line-blueprint)",
            borderRadius: "8px",
            background: "var(--bg)",
            color: "var(--fg)",
            fontSize: "14px",
            fontFamily: "inherit",
            resize: "vertical",
            outline: "none"
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              generateSQL();
            }
          }}
        />
        <div style={{
          fontSize: "12px",
          color: "var(--fg-muted)",
          marginTop: "8px",
          fontFamily: "monospace"
        }}>
          Appuyez sur Ctrl+Entrée pour générer la requête
        </div>
        <button
          onClick={generateSQL}
          disabled={isLoading || !question.trim()}
          style={{
            marginTop: "16px",
            padding: "12px 24px",
            background: isLoading || !question.trim() ? "var(--line-blueprint)" : "var(--accent)",
            border: "none",
            borderRadius: "8px",
            color: "var(--bg)",
            fontSize: "14px",
            fontWeight: 600,
            cursor: isLoading || !question.trim() ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
            fontFamily: "monospace",
            width: "100%"
          }}
        >
          {isLoading ? "Génération en cours..." : "[ Générer la requête SQL ]"}
        </button>
      </div>

      {/* Erreur */}
      {error && (
        <div style={{
          marginTop: "16px",
          padding: "12px",
          background: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          borderRadius: "8px",
          color: "#ef4444",
          fontSize: "14px"
        }}>
          {error}
        </div>
      )}

      {/* Layout en deux colonnes : Requête SQL à gauche, Résultats à droite */}
      {(sqlQuery || results) && (
        <div style={{
          marginTop: "32px",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
          gap: "24px",
          alignItems: "flex-start"
        }}
        className="text-to-sql-results"
        >
          {/* Colonne gauche : Requête SQL et Explication */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Requête SQL générée */}
            {sqlQuery && (
              <div>
                <div style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--fg-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: "12px"
                }}>
                  Requête SQL générée
                </div>
                <div style={{
                  background: "var(--bg)",
                  border: "1px solid var(--line-blueprint)",
                  borderRadius: "8px",
                  padding: "16px",
                  fontFamily: "monospace",
                  fontSize: "13px",
                  color: "var(--fg)",
                  overflowX: "auto",
                  overflowY: "auto",
                  maxHeight: "500px",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word"
                }}>
                  {sqlQuery}
                </div>
                <div style={{
                  marginTop: "12px",
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap"
                }}>
                  <button
                    onClick={() => executeSQL(sqlQuery)}
                    disabled={isExecuting}
                    style={{
                      padding: "10px 20px",
                      background: isExecuting ? "var(--line-blueprint)" : "var(--accent)",
                      border: "none",
                      borderRadius: "6px",
                      color: "var(--bg)",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: isExecuting ? "not-allowed" : "pointer",
                      fontFamily: "monospace",
                      transition: "all 0.2s ease"
                    }}
                  >
                    {isExecuting ? "⏳ Exécution..." : "▶ Exécuter la requête"}
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(sqlQuery);
                      alert("Requête SQL copiée dans le presse-papiers !");
                    }}
                    style={{
                      padding: "10px 20px",
                      background: "transparent",
                      border: "1px solid var(--accent)",
                      borderRadius: "6px",
                      color: "var(--accent)",
                      fontSize: "13px",
                      cursor: "pointer",
                      fontFamily: "monospace",
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--accent-light)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    📋 Copier la requête
                  </button>
                </div>
              </div>
            )}

            {/* Explication */}
            {explanation && (
              <div>
                <div style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--fg-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: "12px"
                }}>
                  Explication
                </div>
                <div style={{
                  background: "var(--bg)",
                  border: "1px solid var(--line-blueprint)",
                  borderRadius: "8px",
                  padding: "16px",
                  fontSize: "14px",
                  color: "var(--fg)",
                  lineHeight: 1.7,
                  maxHeight: "300px",
                  overflowY: "auto",
                  whiteSpace: "pre-wrap"
                }}>
                  {explanation}
                </div>
              </div>
            )}
          </div>

          {/* Colonne droite : Résultats */}
          <div>
            {results && results.length > 0 ? (
              <div>
                <div style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--fg-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: "12px"
                }}>
                  Résultats ({results.length} ligne{results.length > 1 ? "s" : ""})
                </div>
                <div style={{
                  background: "var(--bg)",
                  border: "1px solid var(--line-blueprint)",
                  borderRadius: "8px",
                  overflowX: "auto",
                  maxHeight: "600px",
                  overflowY: "auto"
                }}>
                  <table style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "13px"
                  }}>
                    <thead style={{ position: "sticky", top: 0, background: "var(--bg-secondary)", zIndex: 10 }}>
                      <tr style={{
                        background: "var(--bg-secondary)",
                        borderBottom: "2px solid var(--line-blueprint)"
                      }}>
                        {Object.keys(results[0]).map((key, idx) => (
                          <th key={idx} style={{
                            padding: "12px",
                            textAlign: "left",
                            fontWeight: 600,
                            color: "var(--fg)",
                            fontFamily: "monospace",
                            fontSize: "12px",
                            textTransform: "uppercase"
                          }}>
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((row, rowIdx) => (
                        <tr key={rowIdx} style={{
                          borderBottom: "1px solid var(--line-blueprint)"
                        }}>
                          {Object.values(row).map((value, colIdx) => (
                            <td key={colIdx} style={{
                              padding: "12px",
                              color: "var(--fg)",
                              fontFamily: "monospace"
                            }}>
                              {value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : results && results.length === 0 ? (
              <div>
                <div style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--fg-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: "12px"
                }}>
                  Résultats
                </div>
                <div style={{
                  padding: "32px",
                  background: "var(--bg)",
                  border: "1px solid var(--line-blueprint)",
                  borderRadius: "8px",
                  color: "var(--fg-muted)",
                  fontSize: "14px",
                  textAlign: "center"
                }}>
                  Aucun résultat trouvé
                </div>
              </div>
            ) : sqlQuery && !results && (
              <div style={{
                padding: "32px",
                background: "var(--bg)",
                border: "1px solid var(--line-blueprint)",
                borderRadius: "8px",
                color: "var(--fg-muted)",
                fontSize: "14px",
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "200px"
              }}>
                <div>
                  <div style={{ fontSize: "16px", marginBottom: "8px" }}>💡</div>
                  <div style={{ marginBottom: "8px", fontWeight: 600 }}>Requête SQL générée</div>
                  <div style={{ fontSize: "12px" }}>Cliquez sur "Exécuter la requête" pour voir les résultats</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


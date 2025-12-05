import { NextResponse } from "next/server";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

export const runtime = "nodejs";

// Fonction pour parser CSV
function parseCSV(csvText) {
  const lines = csvText.trim().split("\n");
  if (lines.length === 0) return { headers: [], rows: [] };
  
  const headers = lines[0].split(";").map(h => h.trim());
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(";").map(v => v.trim());
    if (values.length === headers.length) {
      const row = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx] || "";
      });
      rows.push(row);
    }
  }
  
  return { headers, rows };
}

// Fonction pour parser JSON
function parseJSON(jsonText) {
  try {
    const data = JSON.parse(jsonText);
    if (Array.isArray(data)) {
      if (data.length === 0) return { headers: [], rows: [] };
      const headers = Object.keys(data[0]);
      return { headers, rows: data };
    } else if (typeof data === "object") {
      const headers = Object.keys(data);
      return { headers, rows: [data] };
    }
    return { headers: [], rows: [] };
  } catch (e) {
    throw new Error("JSON invalide");
  }
}

// Anonymisation par masquage
function maskValue(value, type) {
  const str = String(value || "");
  if (!str) return "";

  if (type === "email") {
    const [local, domain] = str.split("@");
    if (!domain) return "***@***.***";
    return `${local.substring(0, 2)}***@***.${domain.split(".").pop()}`;
  }

  if (type === "telephone") {
    return `***.**.**.**`;
  }

  if (type === "nom" || type === "prenom" || type === "nom_propre") {
    return str.length > 2 ? `${str[0]}***` : "***";
  }

  // Masquage générique
  if (str.length <= 3) return "***";
  return `${str.substring(0, 2)}***${str.substring(str.length - 1)}`;
}

// Anonymisation par hachage
function hashValue(value) {
  const str = String(value || "");
  if (!str) return "";
  // Hash simple (en production, utiliser crypto)
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `HASH_${Math.abs(hash).toString(16).substring(0, 8)}`;
}

// Anonymisation par généralisation
function generalizeValue(value, type) {
  const str = String(value || "");
  if (!str) return "";

  if (type === "date" || type === "date_naissance") {
    // Garder seulement l'année
    const yearMatch = str.match(/\d{4}/);
    if (yearMatch) {
      return yearMatch[0];
    }
    return "****";
  }

  if (type === "adresse") {
    // Garder seulement la ville si présente
    const parts = str.split(",");
    if (parts.length > 1) {
      return parts[parts.length - 1].trim();
    }
    return "***";
  }

  return "***";
}

// Génération de données fictives via LLM
async function generateFakeValue(columnName, originalValue, type, sampleValues, provider, config) {
  const systemPrompt = `Tu es un générateur de données fictives réalistes pour l'anonymisation RGPD. 
Tu dois générer UNIQUEMENT la valeur de remplacement, sans explication, sans guillemets, sans commentaires.
La valeur générée doit être cohérente avec le type de colonne et les exemples fournis.`;

  // Construire des exemples de valeurs existantes
  const examplesText = sampleValues && sampleValues.length > 0
    ? `\n\nExemples de valeurs existantes dans cette colonne:\n${sampleValues.slice(0, 3).map(v => `- ${v}`).join('\n')}`
    : '';

  let userPrompt = "";
  
  // Priorité au nom de colonne pour comprendre le contexte
  if (type === "email") {
    userPrompt = `Génère UN email fictif mais réaliste pour remplacer "${originalValue}".
Format attendu: prenom.nom@domaine.com
Réponds uniquement avec l'email, rien d'autre.`;
  } else if (type === "telephone") {
    userPrompt = `Génère UN numéro de téléphone français fictif pour remplacer "${originalValue}".
Format attendu: 06 12 34 56 78
Réponds uniquement avec le numéro, rien d'autre.`;
  } else if (type === "nom") {
    userPrompt = `Génère UN nom de famille français fictif pour remplacer "${originalValue}".
Réponds uniquement avec le nom, rien d'autre.`;
  } else if (type === "prenom") {
    userPrompt = `Génère UN prénom français fictif pour remplacer "${originalValue}".
Réponds uniquement avec le prénom, rien d'autre.`;
  } else if (type === "nom_propre") {
    userPrompt = `Génère UN nom complet français fictif (prénom + nom) pour remplacer "${originalValue}".
Réponds uniquement avec le nom complet, rien d'autre.`;
  } else {
    // Cas générique : utiliser le nom de colonne et les exemples
    userPrompt = `Génère UNE valeur fictive réaliste pour la colonne "${columnName}".
Valeur originale à remplacer: "${originalValue}"
${examplesText}

Génère une valeur du même type et format que les exemples.
Réponds uniquement avec la valeur, rien d'autre.`;
  }

  let response = "";

  try {
    if (provider === "huggingface") {
      const apiKey = config.hfApiKey || process.env.HUGGINGFACE_API_KEY;
      if (!apiKey) throw new Error("Clé Hugging Face manquante");

      const res = await fetch("https://router.huggingface.co/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "HuggingFaceTB/SmolLM3-3B",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          max_tokens: 50,
          temperature: 0.7
        })
      });

      if (!res.ok) {
        throw new Error(`Erreur Hugging Face: ${res.status}`);
      }

      const data = await res.json();
      response = data?.choices?.[0]?.message?.content || "";
    } else if (provider === "azure-openai") {
      if (!config.azureConfig?.endpoint || !config.azureConfig?.deployment || !config.azureConfig?.apiKey) {
        throw new Error("Configuration Azure OpenAI incomplète");
      }

      const url = `${config.azureConfig.endpoint.replace(/\/$/, "")}/openai/deployments/${config.azureConfig.deployment}/chat/completions?api-version=${config.azureConfig.apiVersion || "2024-02-15-preview"}`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": config.azureConfig.apiKey
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          max_tokens: 50,
          temperature: 0.7
        })
      });

      if (!res.ok) {
        throw new Error(`Erreur Azure OpenAI: ${res.status}`);
      }

      const data = await res.json();
      response = data?.choices?.[0]?.message?.content || "";
    } else if (provider === "bedrock") {
      if (!config.bedrockConfig?.accessKeyId || !config.bedrockConfig?.secretAccessKey || !config.bedrockConfig?.region) {
        throw new Error("Configuration Bedrock incomplète");
      }

      // Nettoyer et valider les credentials
      const accessKeyId = String(config.bedrockConfig.accessKeyId).trim();
      const secretAccessKey = String(config.bedrockConfig.secretAccessKey).trim();
      const region = String(config.bedrockConfig.region).trim();

      if (!accessKeyId || !secretAccessKey || !region) {
        throw new Error("Les credentials AWS Bedrock sont invalides (champs vides)");
      }

      if (accessKeyId.includes("/")) {
        throw new Error("Format d'Access Key ID invalide. L'Access Key ID ne doit pas contenir de slashes.");
      }

      if (secretAccessKey.length < 20) {
        throw new Error("Format de Secret Access Key invalide.");
      }

      const client = new BedrockRuntimeClient({
        region: region,
        credentials: {
          accessKeyId: accessKeyId,
          secretAccessKey: secretAccessKey
        }
      });

      const modelId = config.bedrockConfig.modelId || "anthropic.claude-3-haiku-20240307-v1:0";

      const bodyBedrock = {
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 50,
        temperature: 0.7,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `${systemPrompt}\n\n${userPrompt}`
              }
            ]
          }
        ]
      };

      const command = new InvokeModelCommand({
        modelId,
        body: JSON.stringify(bodyBedrock),
        contentType: "application/json",
        accept: "application/json"
      });

      const res = await client.send(command);
      const json = JSON.parse(new TextDecoder("utf-8").decode(res.body));
      response = json?.content?.[0]?.text || "";
    }
  } catch (e) {
    console.warn("Erreur génération LLM, fallback sur masquage:", e);
    // Fallback sur masquage si LLM échoue
    return maskValue("", type);
  }

  // Nettoyer la réponse (enlever guillemets, espaces, retours à la ligne, etc.)
  let cleaned = response.trim()
    .replace(/^["']|["']$/g, "")  // Enlever guillemets
    .replace(/^\s*-\s*/, "")       // Enlever tirets au début
    .replace(/\n.*$/s, "")         // Garder seulement la première ligne
    .trim();
  
  // Limiter la longueur
  cleaned = cleaned.substring(0, 100);
  
  // Si la réponse est vide ou trop courte, fallback sur masquage
  if (!cleaned || cleaned.length < 2) {
    console.warn("LLM a retourné une valeur invalide, fallback sur masquage");
    return maskValue(originalValue, type);
  }
  
  return cleaned;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      provider = "huggingface",
      hfApiKey,
      azureConfig,
      bedrockConfig,
      dataInput,
      dataFormat = "csv",
      anonymizationConfig
    } = body || {};

    if (!dataInput || !dataInput.trim()) {
      return NextResponse.json(
        { error: "Les données à anonymiser sont obligatoires." },
        { status: 400 }
      );
    }

    if (!anonymizationConfig || Object.keys(anonymizationConfig).length === 0) {
      return NextResponse.json(
        { error: "La configuration d'anonymisation est obligatoire." },
        { status: 400 }
      );
    }

    // Parser les données
    let headers, rows;
    try {
      if (dataFormat === "csv") {
        const parsed = parseCSV(dataInput);
        headers = parsed.headers;
        rows = parsed.rows;
      } else {
        const parsed = parseJSON(dataInput);
        headers = parsed.headers;
        rows = parsed.rows;
      }
    } catch (e) {
      return NextResponse.json(
        { error: `Erreur lors du parsing des données: ${e.message}` },
        { status: 400 }
      );
    }

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Aucune donnée à anonymiser." },
        { status: 400 }
      );
    }

    // Anonymiser les données
    const anonymizedRows = [];
    const config = anonymizationConfig;

    // Collecter des échantillons de valeurs par colonne pour le LLM
    const columnSamples = {};
    headers.forEach(header => {
      columnSamples[header] = rows
        .slice(0, Math.min(5, rows.length))
        .map(r => r[header])
        .filter(v => v && String(v).trim().length > 0);
    });

    for (const row of rows) {
      const anonymizedRow = { ...row };

      for (const header of headers) {
        const colConfig = config[header];
        if (colConfig && colConfig.anonymize) {
          const method = colConfig.method || "mask";
          const originalValue = row[header];

          if (method === "remove") {
            anonymizedRow[header] = "";
          } else if (method === "hash") {
            anonymizedRow[header] = hashValue(originalValue);
          } else if (method === "generalize") {
            // Détecter le type pour la généralisation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const phoneRegex = /(\+33|0)[1-9](\d{2}){4}/;
            const dateRegex = /^\d{2}\/\d{2}\/\d{4}$|^\d{4}-\d{2}-\d{2}$/;
            
            let type = "texte";
            if (emailRegex.test(String(originalValue))) type = "email";
            else if (phoneRegex.test(String(originalValue).replace(/\s/g, ""))) type = "telephone";
            else if (dateRegex.test(String(originalValue))) type = "date";
            else if (header.toLowerCase().includes("adresse")) type = "adresse";

            anonymizedRow[header] = generalizeValue(originalValue, type);
          } else if (method === "generate") {
            // Détecter le type pour la génération
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const phoneRegex = /(\+33|0)[1-9](\d{2}){4}/;
            
            let type = "texte";
            if (emailRegex.test(String(originalValue))) type = "email";
            else if (phoneRegex.test(String(originalValue).replace(/\s/g, ""))) type = "telephone";
            else if (header.toLowerCase().includes("nom") && !header.toLowerCase().includes("utilisateur")) type = "nom";
            else if (header.toLowerCase().includes("prenom")) type = "prenom";
            else if (header.toLowerCase().includes("nom") && header.toLowerCase().includes("complet")) type = "nom_propre";

            // Générer via LLM avec contexte
            anonymizedRow[header] = await generateFakeValue(
              header,                    // Nom de la colonne
              originalValue,             // Valeur originale
              type,                      // Type détecté
              columnSamples[header],     // Exemples de valeurs
              provider, 
              {
                hfApiKey,
                azureConfig,
                bedrockConfig
              }
            );
          } else {
            // Masquage par défaut
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const phoneRegex = /(\+33|0)[1-9](\d{2}){4}/;
            
            let type = "texte";
            if (emailRegex.test(String(originalValue))) type = "email";
            else if (phoneRegex.test(String(originalValue).replace(/\s/g, ""))) type = "telephone";
            else if (header.toLowerCase().includes("nom")) type = "nom";

            anonymizedRow[header] = maskValue(originalValue, type);
          }
        }
      }

      anonymizedRows.push(anonymizedRow);
    }

    return NextResponse.json({
      success: true,
      anonymizedData: anonymizedRows,
      originalRowCount: rows.length,
      anonymizedRowCount: anonymizedRows.length
    });
  } catch (error) {
    console.error("Data anonymizer error:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de l'anonymisation des données.",
        details: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 500 }
    );
  }
}


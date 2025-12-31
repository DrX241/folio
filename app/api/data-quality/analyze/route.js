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

// Règles de qualité précises
function evaluateQualityRules(headers, rows) {
  const rules = [];
  
  if (rows.length === 0) {
    return [
      {
        name: "Données vides",
        description: "Aucune donnée à analyser",
        score: 0
      }
    ];
  }

  // 1. Complétude (taux de valeurs non vides)
  let totalCells = 0;
  let emptyCells = 0;
  rows.forEach(row => {
    headers.forEach(header => {
      totalCells++;
      const value = row[header];
      if (value === null || value === undefined || value === "" || String(value).trim() === "") {
        emptyCells++;
      }
    });
  });
  const completenessScore = totalCells > 0 ? ((totalCells - emptyCells) / totalCells) * 100 : 0;
  rules.push({
    name: "Complétude",
    description: `${emptyCells} valeurs manquantes sur ${totalCells} cellules (${(100 - completenessScore).toFixed(1)}% manquantes)`,
    score: completenessScore
  });

  // 2. Cohérence des types
  let typeConsistencyScore = 100;
  const typeIssues = [];
  headers.forEach(header => {
    const values = rows.map(r => r[header]).filter(v => v !== null && v !== undefined && v !== "");
    if (values.length === 0) {
      typeConsistencyScore -= 10;
      typeIssues.push(`Colonne "${header}": toutes valeurs vides`);
      return;
    }
    
    // Détecter le type attendu (numérique, date, email, etc.)
    const firstValue = String(values[0]);
    const isNumeric = !isNaN(parseFloat(firstValue)) && isFinite(firstValue);
    const isEmail = firstValue.includes("@") && firstValue.includes(".");
    const isDate = !isNaN(Date.parse(firstValue));
    
    let inconsistentCount = 0;
    values.forEach(val => {
      const strVal = String(val);
      if (isNumeric && (isNaN(parseFloat(strVal)) || !isFinite(strVal))) {
        inconsistentCount++;
      } else if (isEmail && (!strVal.includes("@") || !strVal.includes("."))) {
        inconsistentCount++;
      }
    });
    
    if (inconsistentCount > 0) {
      const inconsistencyRate = (inconsistentCount / values.length) * 100;
      typeConsistencyScore -= inconsistencyRate * 0.5;
      if (inconsistencyRate > 20) {
        typeIssues.push(`Colonne "${header}": ${inconsistencyRate.toFixed(1)}% d'incohérences de type`);
      }
    }
  });
  typeConsistencyScore = Math.max(0, typeConsistencyScore);
  rules.push({
    name: "Cohérence des types",
    description: typeIssues.length > 0 ? typeIssues.slice(0, 3).join("; ") : "Types cohérents",
    score: typeConsistencyScore
  });

  // 3. Doublons
  const duplicateKeys = new Set();
  const seenRows = new Map();
  rows.forEach((row, idx) => {
    const rowKey = JSON.stringify(row);
    if (seenRows.has(rowKey)) {
      duplicateKeys.add(idx);
      duplicateKeys.add(seenRows.get(rowKey));
    } else {
      seenRows.set(rowKey, idx);
    }
  });
  const uniquenessScore = duplicateKeys.size > 0 ? Math.max(0, 100 - (duplicateKeys.size / rows.length) * 100) : 100;
  rules.push({
    name: "Unicité",
    description: duplicateKeys.size > 0 ? `${duplicateKeys.size} lignes en doublon détectées` : "Aucun doublon détecté",
    score: uniquenessScore
  });

  // 4. Format des données (emails, dates, etc.)
  let formatScore = 100;
  const formatIssues = [];
  headers.forEach(header => {
    const headerLower = header.toLowerCase();
    if (headerLower.includes("email") || headerLower.includes("mail")) {
      const emails = rows.map(r => String(r[header] || "")).filter(e => e);
      const invalidEmails = emails.filter(e => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
      if (invalidEmails.length > 0) {
        const invalidRate = (invalidEmails.length / emails.length) * 100;
        formatScore -= invalidRate * 0.3;
        if (invalidRate > 10) {
          formatIssues.push(`Emails invalides dans "${header}": ${invalidRate.toFixed(1)}%`);
        }
      }
    }
  });
  formatScore = Math.max(0, formatScore);
  rules.push({
    name: "Format des données",
    description: formatIssues.length > 0 ? formatIssues.slice(0, 2).join("; ") : "Formats valides",
    score: formatScore
  });

  // 5. Distribution (détection d'anomalies basiques)
  let distributionScore = 100;
  headers.forEach(header => {
    const values = rows.map(r => r[header]).filter(v => v !== null && v !== undefined && v !== "");
    const numericValues = values.map(v => parseFloat(v)).filter(v => !isNaN(v) && isFinite(v));
    
    if (numericValues.length > 10) {
      const sorted = numericValues.sort((a, b) => a - b);
      const q1 = sorted[Math.floor(sorted.length * 0.25)];
      const q3 = sorted[Math.floor(sorted.length * 0.75)];
      const iqr = q3 - q1;
      const lowerBound = q1 - 1.5 * iqr;
      const upperBound = q3 + 1.5 * iqr;
      
      const outliers = numericValues.filter(v => v < lowerBound || v > upperBound);
      if (outliers.length > 0) {
        const outlierRate = (outliers.length / numericValues.length) * 100;
        if (outlierRate > 20) {
          distributionScore -= outlierRate * 0.2;
          distributionScore = Math.max(0, distributionScore);
        }
      }
    }
  });
  rules.push({
    name: "Distribution",
    description: "Analyse de la distribution des valeurs numériques",
    score: distributionScore
  });

  return rules;
}

// Appel LLM pour évaluation supplémentaire
async function getLLMEvaluation(dataSummary, provider, config) {
  const systemPrompt = `Tu es un expert en qualité de données. Analyse les données fournies et donne une évaluation qualitative détaillée en français.`;
  
  const userPrompt = `Voici un résumé des données analysées :
${dataSummary}

Donne une évaluation qualitative détaillée en français (3-5 phrases) sur :
- La qualité globale des données
- Les points forts
- Les points d'amélioration principaux
- Des recommandations concrètes

Sois précis et actionnable.`;

  let evaluation = "";

  try {
    if (provider === "huggingface") {
      const apiKey = config.hfApiKey || process.env.HUGGINGFACE_API_KEY;
      if (!apiKey) throw new Error("Clé Hugging Face manquante");

      const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
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
          max_tokens: 512,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur Hugging Face: ${response.status}`);
      }

      const data = await response.json();
      evaluation = data?.choices?.[0]?.message?.content || "";
    } else if (provider === "azure-openai") {
      if (!config.azureConfig?.endpoint || !config.azureConfig?.deployment || !config.azureConfig?.apiKey) {
        throw new Error("Configuration Azure OpenAI incomplète");
      }

      const url = `${config.azureConfig.endpoint.replace(/\/$/, "")}/openai/deployments/${config.azureConfig.deployment}/chat/completions?api-version=${config.azureConfig.apiVersion || "2024-02-15-preview"}`;

      const response = await fetch(url, {
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
          max_tokens: 512,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur Azure OpenAI: ${response.status}`);
      }

      const data = await response.json();
      evaluation = data?.choices?.[0]?.message?.content || "";
    } else if (provider === "bedrock") {
      if (!config.bedrockConfig?.accessKeyId || !config.bedrockConfig?.secretAccessKey || !config.bedrockConfig?.region) {
        throw new Error("Configuration Bedrock incomplète");
      }

      const client = new BedrockRuntimeClient({
        region: config.bedrockConfig.region,
        credentials: {
          accessKeyId: config.bedrockConfig.accessKeyId,
          secretAccessKey: config.bedrockConfig.secretAccessKey
        }
      });

      const modelId = config.bedrockConfig.modelId || "anthropic.claude-3-haiku-20240307-v1:0";

      const bodyBedrock = {
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 512,
        temperature: 0.3,
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

      const response = await client.send(command);
      const json = JSON.parse(new TextDecoder("utf-8").decode(response.body));
      evaluation = json?.content?.[0]?.text || "";
    }
  } catch (e) {
    console.warn("Erreur lors de l'évaluation LLM:", e);
    evaluation = `Évaluation LLM indisponible: ${e.message}`;
  }

  return evaluation;
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
      dataFormat = "csv"
    } = body || {};

    if (!dataInput || !dataInput.trim()) {
      return NextResponse.json(
        { error: "Les données à analyser sont obligatoires." },
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
        { error: "Aucune donnée à analyser après parsing." },
        { status: 400 }
      );
    }

    // Évaluer avec les règles précises
    const ruleScores = evaluateQualityRules(headers, rows);
    const overallScore = ruleScores.reduce((sum, rule) => sum + rule.score, 0) / ruleScores.length;

    // Préparer un résumé pour le LLM
    const dataSummary = `
Nombre de lignes: ${rows.length}
Nombre de colonnes: ${headers.length}
Colonnes: ${headers.join(", ")}
Résultats des règles:
${ruleScores.map(r => `- ${r.name}: ${r.score.toFixed(1)}/100 (${r.description})`).join("\n")}
Score global: ${overallScore.toFixed(1)}/100
    `.trim();

    // Appel LLM pour évaluation supplémentaire
    let llmEvaluation = "";
    try {
      llmEvaluation = await getLLMEvaluation(dataSummary, provider, {
        hfApiKey,
        azureConfig,
        bedrockConfig
      });
    } catch (e) {
      console.warn("LLM evaluation failed:", e);
      llmEvaluation = "Évaluation LLM non disponible.";
    }

    // Générer des recommandations basées sur les scores
    const recommendations = [];
    ruleScores.forEach(rule => {
      if (rule.score < 60) {
        if (rule.name === "Complétude") {
          recommendations.push("Améliorer la complétude des données en remplissant les valeurs manquantes.");
        } else if (rule.name === "Cohérence des types") {
          recommendations.push("Vérifier et corriger les incohérences de types de données.");
        } else if (rule.name === "Unicité") {
          recommendations.push("Supprimer les doublons pour améliorer l'unicité des données.");
        } else if (rule.name === "Format des données") {
          recommendations.push("Valider et corriger les formats de données (emails, dates, etc.).");
        }
      }
    });

    return NextResponse.json({
      success: true,
      overallScore: Math.round(overallScore * 10) / 10,
      ruleScores,
      llmEvaluation,
      recommendations: [...new Set(recommendations)], // Dédupliquer
      metadata: {
        rowCount: rows.length,
        columnCount: headers.length,
        columns: headers
      }
    });
  } catch (error) {
    console.error("Data quality analysis error:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de l'analyse de qualité des données.",
        details: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 500 }
    );
  }
}






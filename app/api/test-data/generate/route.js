import { NextResponse } from "next/server";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      provider = "huggingface",
      hfApiKey,
      azureConfig,
      bedrockConfig,
      datasetName,
      rowCount,
      schemaDescription,
      testType,
      businessDomain
    } = body || {};

    if (!schemaDescription || !schemaDescription.trim()) {
      return NextResponse.json(
        { error: "La description du schéma est obligatoire." },
        { status: 400 }
      );
    }
    if (!rowCount || typeof rowCount !== "number" || rowCount <= 0) {
      return NextResponse.json(
        { error: "Le nombre de lignes doit être un entier positif." },
        { status: 400 }
      );
    }

    const safeRowCount = Math.min(Math.max(rowCount, 1), 500);
    const datasetLabel = datasetName && datasetName.trim().length > 0 ? datasetName.trim() : "jeu_de_test";

    const systemPrompt = `
Tu es un générateur de données de test réalistes pour des besoins de data, BI et QA.
Tu dois produire UNIQUEMENT un tableau JSON valide (array d'objets) correspondant au schéma demandé.
`.trim();

    const userPrompt = `
Je veux générer un jeu de test nommé "${datasetLabel}".

Type de jeu de test souhaité: ${testType || "non_précisé"}
Secteur / métier ciblé: ${businessDomain || "non_précisé"}

Nombre de lignes à générer: ${safeRowCount}

Description du schéma et des contraintes (en langage métier):
${schemaDescription}

RÈGLES DE SORTIE:
- Retourne UNIQUEMENT un tableau JSON valide (array d'objets): [ { ... }, { ... }, ... ]
- Pas de texte avant ou après, pas de commentaires, pas de markdown, pas de balises.
- Les clés des objets doivent être en snake_case sans espaces.
- Les valeurs doivent respecter les types, contraintes et gammes de valeurs décrites.
- Génère exactement ${safeRowCount} lignes (ou très proche si ce n'est pas possible).
`.trim();

    let raw = "";

    if (provider === "huggingface") {
      const apiKey = hfApiKey || process.env.HUGGINGFACE_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { error: "Clé Hugging Face manquante (fournie par le client ou via variable d'environnement)." },
          { status: 500 }
        );
      }

      const requestBody = {
        model: "HuggingFaceTB/SmolLM3-3B",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 2048,
        temperature: 0.4,
        top_p: 0.95
      };

      const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        console.error("HF error:", err);
        return NextResponse.json(
          { error: err.error?.message || err.message || "Erreur Hugging Face lors de la génération de données." },
          { status: response.status || 500 }
        );
      }

      const data = await response.json();
      raw = data?.choices?.[0]?.message?.content || "";
    } else if (provider === "azure-openai") {
      if (!azureConfig?.endpoint || !azureConfig?.deployment || !azureConfig?.apiKey) {
        return NextResponse.json(
          { error: "Configuration Azure OpenAI incomplète (endpoint, deployment, apiKey requis)." },
          { status: 400 }
        );
      }

      const url = `${azureConfig.endpoint.replace(/\/$/, "")}/openai/deployments/${azureConfig.deployment}/chat/completions?api-version=${azureConfig.apiVersion || "2024-02-15-preview"}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": azureConfig.apiKey
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          max_tokens: 2048,
          temperature: 0.4,
          top_p: 0.95
        })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        console.error("Azure error:", err);
        return NextResponse.json(
          { error: err.error?.message || err.message || "Erreur Azure OpenAI lors de la génération de données." },
          { status: response.status || 500 }
        );
      }

      const data = await response.json();
      raw = data?.choices?.[0]?.message?.content || "";
    } else if (provider === "bedrock") {
      if (!bedrockConfig?.accessKeyId || !bedrockConfig?.secretAccessKey || !bedrockConfig?.region) {
        return NextResponse.json(
          { error: "Configuration Bedrock incomplète (accessKeyId, secretAccessKey, region requis)." },
          { status: 400 }
        );
      }

      const client = new BedrockRuntimeClient({
        region: bedrockConfig.region,
        credentials: {
          accessKeyId: bedrockConfig.accessKeyId,
          secretAccessKey: bedrockConfig.secretAccessKey
        }
      });

      const modelId = bedrockConfig.modelId || "anthropic.claude-3-haiku-20240307-v1:0";

      const bodyBedrock = {
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 2048,
        temperature: 0.4,
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
      const text = json?.output_text || json?.content?.[0]?.text || json;
      raw = (typeof text === "string" ? text : JSON.stringify(text)).trim();
    } else {
      return NextResponse.json(
        { error: `Provider non supporté: ${provider}` },
        { status: 400 }
      );
    }

    if (!raw || typeof raw !== "string") {
      return NextResponse.json(
        { error: "Réponse vide ou invalide du modèle." },
        { status: 500 }
      );
    }

    // Essayer d'extraire un tableau JSON à partir de la réponse brute
    let rows = [];
    try {
      let cleaned = raw.trim();
      // Enlever d'éventuelles balises markdown
      cleaned = cleaned
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      // Essayer de trouver le premier [ et le dernier ]
      const firstBracket = cleaned.indexOf("[");
      const lastBracket = cleaned.lastIndexOf("]");
      if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
        const jsonSlice = cleaned.slice(firstBracket, lastBracket + 1);
        const parsed = JSON.parse(jsonSlice);
        if (Array.isArray(parsed)) {
          rows = parsed;
        }
      }
    } catch (e) {
      console.warn("Impossible de parser la réponse en JSON strict:", e);
    }

    return NextResponse.json({
      success: true,
      rows,
      raw
    });
  } catch (error) {
    console.error("Test-data generation error:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la génération du jeu de test.",
        details: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 500 }
    );
  }
}



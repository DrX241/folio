import { NextResponse } from "next/server";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { debugError, debugLog } from "@/lib/logger";

export async function POST(request) {
  try {
    const {
      question,
      schemaContext,
      apiKey: bodyApiKey,
      provider = "huggingface",
      azureConfig,
      bedrockConfig
    } = await request.json();

    if (!question || question.trim().length === 0) {
      return NextResponse.json(
        { error: "La question ne peut pas être vide" },
        { status: 400 }
      );
    }

    const apiKey = bodyApiKey || process.env.HUGGINGFACE_API_KEY;
    if (provider === "huggingface" && !apiKey) {
      return NextResponse.json(
        { error: "Token Hugging Face non configuré. Entrez votre clé API dans la section Configuration avancée." },
        { status: 400 }
      );
    }

    // Prompt optimisé avec instruction stricte
    const systemPrompt = `Tu es un expert SQL. Ta tâche est de convertir une question en français en requête SQL.

Schéma de base de données:
${schemaContext}

RÈGLES STRICTES:
1. Réponds UNIQUEMENT avec une requête SQL complète et valide
2. Commence toujours par SELECT
3. Utilise UNIQUEMENT les tables et colonnes du schéma ci-dessus
4. Termine toujours avec un LIMIT si approprié
5. Ne mets PAS de markdown, de commentaires, ou d'explications
6. La requête doit être prête à être exécutée

Exemples de conversion:
- "top 3 clients" → SELECT * FROM clients ORDER BY ca_total DESC LIMIT 3
- "ventes à Paris" → SELECT * FROM ventes WHERE region = 'Paris' LIMIT 10
- "liste des villes" → SELECT DISTINCT ville FROM clients ORDER BY ville
- "liste des régions" → SELECT DISTINCT region FROM ventes ORDER BY region
- "total par client" → SELECT client, SUM(ca) as total FROM ventes GROUP BY client ORDER BY total DESC`;

    const userMessage = `Convertis cette question en requête SQL: "${question}"

Requête SQL:`;


    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage }
    ];

    // Paramètres optimisés pour la génération SQL
    const requestBody = {
      model: "HuggingFaceTB/SmolLM3-3B",
      messages: messages,
      max_tokens: 150,
      temperature: 0.2, // Très bas pour des réponses déterministes
      top_p: 0.95,
      stop: ["\n\n", "Question:", "Q:"]
    };

    debugLog("Génération SQL - Question:", question, "- Provider:", provider);

    let sqlQuery = "";

    if (provider === "huggingface") {
      const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        let errorData = {};
        try {
          const text = await response.text();
          errorData = text ? JSON.parse(text) : { message: text || "Erreur inconnue" };
        } catch (e) {
          errorData = { message: "Erreur lors de la lecture de la réponse" };
        }
        debugError("Hugging Face API Error:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        return NextResponse.json(
          { 
            error: errorData.error?.message || errorData.message || "Erreur lors de la génération SQL",
            details: process.env.NODE_ENV === 'development' ? JSON.stringify(errorData) : undefined
          },
          { status: response.status || 500 }
        );
      }

      let data;
      try {
        const responseText = await response.text();
        data = JSON.parse(responseText);
      } catch (parseError) {
        debugError("Erreur de parsing JSON:", parseError);
        debugError("Réponse brute reçue (premiers 500 caractères)");
        return NextResponse.json(
          { error: "Réponse API invalide (non-JSON). Vérifiez le token Hugging Face." },
          { status: 500 }
        );
      }
      
      // Extraire le contenu de la réponse
      if (data.choices && data.choices[0] && data.choices[0].message) {
        sqlQuery = data.choices[0].message.content || "";
      } else if (data.message) {
        sqlQuery = data.message;
      } else if (data.generated_text) {
        sqlQuery = data.generated_text;
      } else {
        debugError("Format de réponse inattendu:", JSON.stringify(data).substring(0, 500));
        // En cas de format inattendu, utiliser le fallback
        debugLog("Utilisation du fallback pour générer la requête SQL");
        sqlQuery = generateDefaultSQL(question, schemaContext);
        return NextResponse.json({
          success: true,
          sql: sqlQuery,
          fallback: true
        });
      }
    } else if (provider === "azure-openai") {
      if (!azureConfig?.endpoint || !azureConfig?.deployment || !azureConfig?.apiKey) {
        return NextResponse.json(
          { error: "Configuration Azure OpenAI incomplète (endpoint, deployment, apiKey requis)" },
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
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        debugError("Azure OpenAI Error:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        return NextResponse.json(
          { 
            error: errorData.error?.message || errorData.message || "Erreur Azure OpenAI lors de la génération SQL"
          },
          { status: response.status || 500 }
        );
      }

      const data = await response.json();
      sqlQuery = data?.choices?.[0]?.message?.content || "";
    } else if (provider === "bedrock") {
      if (!bedrockConfig?.accessKeyId || !bedrockConfig?.secretAccessKey || !bedrockConfig?.region) {
        return NextResponse.json(
          { error: "Configuration Bedrock incomplète (accessKeyId, secretAccessKey, region requis)" },
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

      const body = {
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 200,
        temperature: 0.2,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `${systemPrompt}\n\n${userMessage}`
              }
            ]
          }
        ]
      };

      const command = new InvokeModelCommand({
        modelId,
        body: JSON.stringify(body),
        contentType: "application/json",
        accept: "application/json"
      });

      const response = await client.send(command);
      const json = JSON.parse(new TextDecoder("utf-8").decode(response.body));
      const text = json?.output_text || json?.content?.[0]?.text || json;
      sqlQuery = (typeof text === "string" ? text : JSON.stringify(text)).trim();
    } else {
      return NextResponse.json(
        { error: `Provider non supporté: ${provider}` },
        { status: 400 }
      );
    }

    debugLog("SQL brut généré:", sqlQuery);

    if (!sqlQuery || sqlQuery.trim().length === 0) {
      debugError("SQL vide généré par le LLM, utilisation du fallback");
      sqlQuery = generateDefaultSQL(question, schemaContext);
      return NextResponse.json({
        success: true,
        sql: sqlQuery,
        fallback: true
      });
    }

    // Post-processing intelligent pour compléter les requêtes incomplètes
    sqlQuery = postProcessSQL(sqlQuery, question, schemaContext);

    debugLog("SQL après post-processing:", sqlQuery);

    if (!sqlQuery || sqlQuery.trim().length === 0) {
      return NextResponse.json(
        { error: "Impossible de générer une requête SQL valide" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      sql: sqlQuery
    });

  } catch (error) {
    debugError("Text-to-SQL Error:", error);
    debugError("Error stack:", error?.stack);
    return NextResponse.json(
      { 
        error: "Erreur lors de la génération de la requête SQL",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * Post-processing léger pour nettoyer et valider les requêtes SQL
 */
function postProcessSQL(sql, question, schemaContext) {
  // Si le SQL est vide, générer une requête par défaut
  if (!sql || typeof sql !== 'string' || sql.trim().length === 0) {
    debugLog("⚠️ SQL vide reçu du LLM, génération d'une requête par défaut");
    return generateDefaultSQL(question, schemaContext);
  }

  debugLog("📝 SQL brut reçu du LLM:", sql.substring(0, 150));

  // Nettoyer uniquement les balises markdown et espaces
  let cleaned = sql
    .replace(/```sql/gi, '')
    .replace(/```/g, '')
    .replace(/`/g, '')
    .trim();

  // Enlever le texte avant SELECT s'il y en a
  const selectIndex = cleaned.toUpperCase().indexOf('SELECT');
  if (selectIndex > 0) {
    cleaned = cleaned.substring(selectIndex);
  }

  // Enlever le point-virgule final
  cleaned = cleaned.replace(/;+$/, '').trim();

  // Si aucun SELECT trouvé après nettoyage, fallback
  if (!cleaned.toUpperCase().startsWith('SELECT')) {
    debugLog("⚠️ Pas de SELECT trouvé après nettoyage, génération d'une requête par défaut");
    return generateDefaultSQL(question, schemaContext);
  }

  // Vérifier que FROM est présent
  if (!cleaned.toUpperCase().includes(' FROM ')) {
    debugLog("⚠️ Pas de FROM trouvé, génération d'une requête par défaut");
    return generateDefaultSQL(question, schemaContext);
  }

  // Nettoyer les espaces multiples
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  debugLog("✅ SQL après post-processing:", cleaned);

  return cleaned;
}

/**
 * Générer une requête SQL par défaut basée sur la question de l'utilisateur
 */
function generateDefaultSQL(question, schemaContext) {
  const lowerQuestion = question.toLowerCase();
  
  debugLog("🔄 Génération SQL par défaut pour:", question);
  
  // 1. Questions de type "liste" (DISTINCT)
  if (lowerQuestion.includes('liste') || lowerQuestion.includes('toutes les') || lowerQuestion.includes('tous les')) {
    if (lowerQuestion.includes('ville')) {
      return `SELECT DISTINCT ville FROM clients ORDER BY ville`;
    }
    if (lowerQuestion.includes('région') || lowerQuestion.includes('region')) {
      return `SELECT DISTINCT region FROM ventes ORDER BY region`;
    }
    if (lowerQuestion.includes('produit')) {
      return `SELECT DISTINCT produit FROM ventes ORDER BY produit`;
    }
    if (lowerQuestion.includes('client')) {
      return `SELECT * FROM clients ORDER BY nom LIMIT 20`;
    }
    if (lowerQuestion.includes('vente')) {
      return `SELECT * FROM ventes ORDER BY date_vente DESC LIMIT 20`;
    }
  }
  
  // 2. Questions "top X"
  const topMatch = lowerQuestion.match(/top\s+(\d+)/i);
  if (topMatch) {
    const limit = topMatch[1];
    if (lowerQuestion.includes('client')) {
      return `SELECT * FROM clients ORDER BY ca_total DESC LIMIT ${limit}`;
    }
    return `SELECT * FROM ventes ORDER BY ca DESC LIMIT ${limit}`;
  }
  
  // 3. Questions sur les villes/régions
  if (lowerQuestion.includes('ville') || lowerQuestion.includes('villes')) {
    return `SELECT DISTINCT ville FROM clients ORDER BY ville`;
  }
  
  if (lowerQuestion.includes('région') || lowerQuestion.includes('region')) {
    return `SELECT DISTINCT region FROM ventes ORDER BY region`;
  }
  
  if (lowerQuestion.includes('produit') || lowerQuestion.includes('produits')) {
    return `SELECT DISTINCT produit FROM ventes ORDER BY produit`;
  }
  
  // 4. Questions sur totaux/sommes
  if (lowerQuestion.includes('total') || lowerQuestion.includes('somme')) {
    if (lowerQuestion.includes('client')) {
      return `SELECT client, SUM(ca) as total FROM ventes GROUP BY client ORDER BY total DESC`;
    }
    return `SELECT SUM(ca) as total_ca FROM ventes`;
  }
  
  // 5. Questions avec filtre géographique
  const parisMatch = lowerQuestion.match(/(?:à|dans|de)\s+(paris|lyon|marseille)/i);
  if (parisMatch) {
    const ville = parisMatch[1].charAt(0).toUpperCase() + parisMatch[1].slice(1);
    if (lowerQuestion.includes('client')) {
      return `SELECT * FROM clients WHERE ville = '${ville}' LIMIT 10`;
    }
    return `SELECT * FROM ventes WHERE region = '${ville}' LIMIT 10`;
  }
  
  // 6. Par défaut : clients ou ventes
  if (lowerQuestion.includes('client')) {
    return `SELECT * FROM clients ORDER BY ca_total DESC LIMIT 10`;
  }
  
  // Fallback final
  return `SELECT * FROM ventes ORDER BY date_vente DESC LIMIT 10`;
}

/**
 * Deviner la colonne pour ORDER BY basée sur le contexte
 */
function guessOrderColumn(question, schemaContext) {
  const lowerQuestion = question.toLowerCase();
  
  // Mots-clés pour identifier la colonne de tri
  if (lowerQuestion.includes('chiffre') || lowerQuestion.includes('ca') || lowerQuestion.includes('affaires')) {
    return 'ca_total';
  }
  if (lowerQuestion.includes('date')) {
    return 'date_vente';
  }
  if (lowerQuestion.includes('quantité') || lowerQuestion.includes('quantite')) {
    return 'quantite';
  }
  if (lowerQuestion.includes('prix')) {
    return 'prix_unitaire';
  }
  if (lowerQuestion.includes('nom')) {
    return 'nom';
  }
  
  // Par défaut, utiliser la première colonne numérique trouvée
  if (schemaContext.includes('ca_total')) return 'ca_total';
  if (schemaContext.includes('ca')) return 'ca';
  
  return 'id'; // Fallback
}

/**
 * Deviner la limite LIMIT basée sur la question
 */
function guessLimit(question) {
  // Chercher un nombre dans la question
  const numberMatch = question.match(/(\d+)/);
  if (numberMatch) {
    return numberMatch[1];
  }
  
  // Mots-clés pour identifier la limite
  if (question.toLowerCase().includes('tous') || question.toLowerCase().includes('toutes')) {
    return 100;
  }
  
  return 10; // Limite par défaut
}


import { NextResponse } from "next/server";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

export const runtime = "nodejs";

// Appel LLM pour générer le roadmap
async function generateLearningPath(profile, provider, config) {
  const systemPrompt = `Tu es un expert en formation Data et IA. Tu conçois des parcours d'apprentissage personnalisés, structurés et progressifs.`;

  const userPrompt = `Crée un roadmap d'apprentissage personnalisé en Data/IA.

Profil de l'utilisateur:
- Poste actuel: ${profile.currentRole}
- Niveau: ${profile.currentLevel}
- Objectifs: ${profile.objectives}
- Temps disponible: ${profile.hoursPerWeek} heures par semaine
- Durée du parcours: ${profile.duration} semaines

Génère un parcours structuré avec:
1. Un résumé du parcours (2-3 phrases)
2. Un planning hebdomadaire détaillé (${profile.duration} semaines) avec pour chaque semaine:
   - Numéro de semaine
   - Thème principal
   - Modules à couvrir (liste de 2-4 modules)
   - Ressources recommandées (cours, articles, exercices pratiques)
   - Temps estimé en heures
3. Les compétences/briques couvertes (SQL, Stats, Python, ML, LLM, MLOps, etc.)

Le parcours doit être progressif, adapté au niveau ${profile.currentLevel}, et couvrir les objectifs mentionnés.
Répartis le contenu de manière équilibrée sur les ${profile.duration} semaines.

Format de réponse JSON strict:
{
  "summary": "Résumé du parcours en 2-3 phrases",
  "skills": ["SQL", "Python", "Stats", "ML", "LLM"],
  "weeks": [
    {
      "number": 1,
      "theme": "Thème de la semaine",
      "modules": ["Module 1", "Module 2", "Module 3"],
      "resources": ["Ressource 1", "Ressource 2"],
      "hours": 5
    },
    ...
  ]
}

IMPORTANT: Retourne UNIQUEMENT du JSON valide, sans texte avant ou après.`;

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
          max_tokens: 2048,
          temperature: 0.4
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
          max_tokens: 2048,
          temperature: 0.4
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

      // Vérifier que l'Access Key ID ne contient pas de slashes
      // Les Access Key IDs bruts ne contiennent jamais de slashes
      // Si on voit des slashes, c'est probablement une chaîne de signature (format: keyid/date/region/service/term)
      if (accessKeyId.includes("/")) {
        throw new Error("Format d'Access Key ID invalide. L'Access Key ID ne doit pas contenir de slashes. Si vous voyez des slashes, vous avez probablement copié une chaîne de signature AWS au lieu de l'Access Key ID brut. Récupérez l'Access Key ID depuis AWS IAM (IAM → Users → Security credentials → Access keys).");
      }

      // La Secret Access Key peut légitimement contenir des slashes dans sa valeur brute
      // On ne vérifie que sa longueur minimale (doit être assez longue)
      if (secretAccessKey.length < 20) {
        throw new Error("Format de Secret Access Key invalide. La Secret Access Key doit être une longue chaîne (généralement 40+ caractères).");
      }

      // Vérifier le format de l'Access Key ID (commence généralement par "AKIA" ou "ASIA")
      // Format: AKIA suivi de 16 caractères alphanumériques = 20 caractères total
      // Ou ASIA pour les credentials temporaires
      if (!accessKeyId.match(/^(AKIA|ASIA)[A-Z0-9]{16}$/i)) {
        // Si ce n'est pas le format standard, on continue quand même mais on avertit
        // Certains formats peuvent être valides même s'ils ne suivent pas exactement ce pattern
        console.warn(`Access Key ID format non standard: ${accessKeyId.substring(0, 10)}...`);
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

      const res = await client.send(command);
      const json = JSON.parse(new TextDecoder("utf-8").decode(res.body));
      response = json?.content?.[0]?.text || "";
    }
  } catch (e) {
    console.warn("Erreur lors de la génération du roadmap:", e);
    throw e;
  }

  return response;
}

// Parser la réponse JSON du LLM
function parseLLMResponse(rawResponse) {
  try {
    let cleaned = rawResponse.trim();
    
    // Enlever d'éventuelles balises markdown
    cleaned = cleaned
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    // Trouver le premier { et le dernier }
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const jsonSlice = cleaned.slice(firstBrace, lastBrace + 1);
      const parsed = JSON.parse(jsonSlice);
      
      // Valider la structure
      if (parsed && typeof parsed === "object") {
        return parsed;
      }
    }
    
    throw new Error("Structure JSON invalide");
  } catch (e) {
    console.warn("Erreur parsing JSON:", e);
    // Retourner une structure par défaut si le parsing échoue
    return {
      summary: "Parcours généré avec succès. Structure détaillée disponible ci-dessous.",
      skills: ["SQL", "Python", "Stats", "ML", "LLM"],
      weeks: []
    };
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      provider = "huggingface",
      hfApiKey,
      azureConfig,
      bedrockConfig,
      currentRole,
      currentLevel,
      objectives,
      hoursPerWeek,
      duration
    } = body || {};

    if (!currentRole || !objectives) {
      return NextResponse.json(
        { error: "Le poste actuel et les objectifs sont obligatoires." },
        { status: 400 }
      );
    }

    if (!hoursPerWeek || hoursPerWeek < 1 || hoursPerWeek > 40) {
      return NextResponse.json(
        { error: "Le temps disponible par semaine doit être entre 1 et 40 heures." },
        { status: 400 }
      );
    }

    if (![4, 6, 8].includes(duration)) {
      return NextResponse.json(
        { error: "La durée doit être de 4, 6 ou 8 semaines." },
        { status: 400 }
      );
    }

    // Générer le roadmap avec le LLM
    let rawResponse = "";
    try {
      rawResponse = await generateLearningPath(
        {
          currentRole,
          currentLevel: currentLevel || "débutant",
          objectives,
          hoursPerWeek,
          duration
        },
        provider,
        {
          hfApiKey,
          azureConfig,
          bedrockConfig
        }
      );
    } catch (e) {
      return NextResponse.json(
        { error: `Erreur lors de la génération du roadmap: ${e.message}` },
        { status: 500 }
      );
    }

    if (!rawResponse || !rawResponse.trim()) {
      return NextResponse.json(
        { error: "Réponse LLM vide." },
        { status: 500 }
      );
    }

    // Parser la réponse
    const parsed = parseLLMResponse(rawResponse);

    // S'assurer que toutes les semaines sont présentes
    if (!parsed.weeks || parsed.weeks.length < duration) {
      // Compléter avec des semaines par défaut si nécessaire
      const existingWeeks = parsed.weeks || [];
      for (let i = existingWeeks.length; i < duration; i++) {
        existingWeeks.push({
          number: i + 1,
          theme: `Thème semaine ${i + 1}`,
          modules: ["Module à définir"],
          resources: ["Ressources à ajouter"],
          hours: hoursPerWeek
        });
      }
      parsed.weeks = existingWeeks;
    }

    return NextResponse.json({
      success: true,
      ...parsed,
      rawResponse // Pour debug si nécessaire
    });
  } catch (error) {
    console.error("Learning path generation error:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la génération du parcours d'apprentissage.",
        details: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 500 }
    );
  }
}


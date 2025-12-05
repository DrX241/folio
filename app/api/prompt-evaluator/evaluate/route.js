import { NextResponse } from "next/server";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

export const runtime = "nodejs";

// Évaluation par règles précises
function evaluatePromptByRules(prompt) {
  const criteria = [];
  let totalScore = 0;

  // 1. Longueur du prompt
  const promptLength = prompt.trim().length;
  let lengthScore = 100;
  if (promptLength < 20) {
    lengthScore = 30; // Trop court
  } else if (promptLength < 50) {
    lengthScore = 60;
  } else if (promptLength > 2000) {
    lengthScore = 70; // Peut-être trop long
  }
  criteria.push({
    name: "Longueur",
    description: `${promptLength} caractères`,
    score: lengthScore
  });
  totalScore += lengthScore;

  // 2. Présence d'un contexte
  const hasContext = prompt.toLowerCase().includes("contexte") ||
                     prompt.toLowerCase().includes("texte") ||
                     prompt.toLowerCase().includes("document") ||
                     prompt.toLowerCase().includes("données") ||
                     prompt.toLowerCase().includes("information");
  const contextScore = hasContext ? 100 : 40;
  criteria.push({
    name: "Contexte",
    description: hasContext ? "Contexte mentionné" : "Contexte manquant",
    score: contextScore
  });
  totalScore += contextScore;

  // 3. Présence d'un rôle
  const hasRole = prompt.toLowerCase().includes("tu es") ||
                  prompt.toLowerCase().includes("vous êtes") ||
                  prompt.toLowerCase().includes("agis comme") ||
                  prompt.toLowerCase().includes("sois") ||
                  prompt.toLowerCase().includes("rôle") ||
                  prompt.toLowerCase().includes("expert");
  const roleScore = hasRole ? 100 : 50;
  criteria.push({
    name: "Rôle",
    description: hasRole ? "Rôle défini" : "Rôle non défini",
    score: roleScore
  });
  totalScore += roleScore;

  // 4. Format de sortie spécifié
  const hasFormat = prompt.toLowerCase().includes("format") ||
                    prompt.toLowerCase().includes("json") ||
                    prompt.toLowerCase().includes("xml") ||
                    prompt.toLowerCase().includes("html") ||
                    prompt.toLowerCase().includes("markdown") ||
                    prompt.toLowerCase().includes("liste") ||
                    prompt.toLowerCase().includes("tableau") ||
                    prompt.toLowerCase().includes("phrase") ||
                    prompt.toLowerCase().includes("paragraphe");
  const formatScore = hasFormat ? 100 : 50;
  criteria.push({
    name: "Format attendu",
    description: hasFormat ? "Format spécifié" : "Format non spécifié",
    score: formatScore
  });
  totalScore += formatScore;

  // 5. Instructions claires
  const hasInstructions = prompt.toLowerCase().includes("fais") ||
                          prompt.toLowerCase().includes("génère") ||
                          prompt.toLowerCase().includes("écris") ||
                          prompt.toLowerCase().includes("résume") ||
                          prompt.toLowerCase().includes("extrais") ||
                          prompt.toLowerCase().includes("transforme") ||
                          prompt.toLowerCase().includes("analyse");
  const instructionsScore = hasInstructions ? 100 : 40;
  criteria.push({
    name: "Instructions",
    description: hasInstructions ? "Instructions présentes" : "Instructions peu claires",
    score: instructionsScore
  });
  totalScore += instructionsScore;

  // 6. Structure et organisation
  const hasStructure = prompt.includes("\n") ||
                       prompt.includes("•") ||
                       prompt.includes("-") ||
                       prompt.includes("1.") ||
                       prompt.includes(":") ||
                       prompt.length > 100; // Prompts longs sont souvent mieux structurés
  const structureScore = hasStructure ? 80 : 50;
  criteria.push({
    name: "Structure",
    description: hasStructure ? "Bien structuré" : "Structure à améliorer",
    score: structureScore
  });
  totalScore += structureScore;

  // 7. Exemples ou contraintes
  const hasExamples = prompt.toLowerCase().includes("exemple") ||
                      prompt.toLowerCase().includes("comme") ||
                      prompt.toLowerCase().includes("similaire");
  const hasConstraints = prompt.toLowerCase().includes("maximum") ||
                         prompt.toLowerCase().includes("minimum") ||
                         prompt.toLowerCase().includes("limite") ||
                         prompt.toLowerCase().includes("ne pas") ||
                         prompt.toLowerCase().includes("évite");
  const examplesConstraintsScore = (hasExamples || hasConstraints) ? 100 : 60;
  criteria.push({
    name: "Exemples/Contraintes",
    description: (hasExamples || hasConstraints) ? "Exemples ou contraintes présents" : "Manquants",
    score: examplesConstraintsScore
  });
  totalScore += examplesConstraintsScore;

  return {
    criteria,
    averageScore: totalScore / criteria.length
  };
}

// Détection des éléments manquants
function detectMissingElements(prompt) {
  const missing = [];
  const promptLower = prompt.toLowerCase();

  if (!promptLower.includes("contexte") && !promptLower.includes("texte") && !promptLower.includes("document")) {
    missing.push("Contexte ou texte d'entrée non mentionné");
  }

  if (!promptLower.includes("tu es") && !promptLower.includes("vous êtes") && !promptLower.includes("rôle")) {
    missing.push("Rôle de l'IA non défini");
  }

  if (!promptLower.includes("format") && !promptLower.includes("json") && !promptLower.includes("liste")) {
    missing.push("Format de sortie non spécifié");
  }

  if (prompt.trim().length < 50) {
    missing.push("Prompt trop court, manque de détails");
  }

  if (!promptLower.includes("fais") && !promptLower.includes("génère") && !promptLower.includes("écris")) {
    missing.push("Action/instruction principale peu claire");
  }

  return missing;
}

// Évaluation LLM détaillée
async function getLLMEvaluation(prompt, provider, config) {
  const systemPrompt = `Tu es un expert en prompt engineering et évaluation de qualité de prompts pour LLM. Analyse le prompt fourni et donne une évaluation détaillée en français.`;

  const userPrompt = `Analyse ce prompt et évalue sa qualité selon les critères suivants :
- Précision : Le prompt est-il clair et précis ?
- Cohérence : Les instructions sont-elles cohérentes entre elles ?
- Complétude : Tous les éléments nécessaires sont-ils présents (contexte, rôle, format, instructions) ?
- Bonnes pratiques : Respecte-t-il les bonnes pratiques du prompt engineering ?

Prompt à évaluer :
"""
${prompt}
"""

Donne une évaluation détaillée en français (4-6 phrases) qui couvre :
1. Les points forts du prompt
2. Les points faibles ou manquants
3. Des recommandations concrètes pour l'améliorer
4. Une note globale sur 100 (justifie la note)

Format de réponse :
- Évaluation détaillée (4-6 phrases)
- Note globale : X/100
- Justification de la note`;

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
          max_tokens: 1024,
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
          max_tokens: 1024,
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
        max_tokens: 1024,
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

// Extraire le score LLM depuis l'évaluation détaillée
function extractLLMScore(detailedEvaluation) {
  if (!detailedEvaluation) return null;
  
  // Chercher "Note globale : X/100" ou "X/100"
  const scoreMatch = detailedEvaluation.match(/Note globale\s*:\s*(\d+)\/100/i) ||
                    detailedEvaluation.match(/(\d+)\/100/);
  
  if (scoreMatch) {
    const score = parseInt(scoreMatch[1], 10);
    if (score >= 0 && score <= 100) {
      return score;
    }
  }
  
  return null;
}

// Générer des recommandations consolidées et dédupliquées
function generateRecommendations(criteriaScores, missingElements) {
  const recommendationsMap = new Map();

  // Regrouper par catégorie
  const contextIssues = [];
  const roleIssues = [];
  const formatIssues = [];
  const instructionIssues = [];
  const structureIssues = [];
  const lengthIssues = [];

  criteriaScores.forEach(criteria => {
    if (criteria.score < 60) {
      if (criteria.name === "Contexte") {
        contextIssues.push("Ajoutez une mention du contexte ou du texte d'entrée à traiter.");
      } else if (criteria.name === "Rôle") {
        roleIssues.push("Définissez le rôle de l'IA (ex: 'Tu es un expert en...').");
      } else if (criteria.name === "Format attendu") {
        formatIssues.push("Spécifiez le format de sortie attendu (JSON, liste, paragraphe, etc.).");
      } else if (criteria.name === "Instructions") {
        instructionIssues.push("Ajoutez des instructions d'action claires (fais, génère, résume, etc.).");
      } else if (criteria.name === "Structure") {
        structureIssues.push("Structurez votre prompt avec des paragraphes ou des listes à puces.");
      } else if (criteria.name === "Longueur") {
        lengthIssues.push("Développez votre prompt avec plus de détails et de précisions.");
      }
    }
  });

  // Ajouter les recommandations consolidées
  if (contextIssues.length > 0) {
    recommendationsMap.set("contexte", contextIssues[0]);
  }
  if (roleIssues.length > 0) {
    recommendationsMap.set("rôle", roleIssues[0]);
  }
  if (formatIssues.length > 0) {
    recommendationsMap.set("format", formatIssues[0]);
  }
  if (instructionIssues.length > 0) {
    recommendationsMap.set("instructions", instructionIssues[0]);
  }
  if (structureIssues.length > 0) {
    recommendationsMap.set("structure", structureIssues[0]);
  }
  if (lengthIssues.length > 0) {
    recommendationsMap.set("longueur", lengthIssues[0]);
  }

  return Array.from(recommendationsMap.values());
}

// Simplifier l'analyse détaillée LLM
function simplifyDetailedEvaluation(detailedEvaluation) {
  if (!detailedEvaluation) return "";
  
  // Enlever les sections répétitives
  let cleaned = detailedEvaluation
    .replace(/Évaluation détaillée\s*:/gi, "")
    .replace(/Note globale\s*:\s*\d+\/100/gi, "")
    .replace(/Justification de la note\s*:/gi, "")
    .replace(/Recommandations\s*:/gi, "")
    .trim();
  
  // Extraire les 2-3 premières phrases significatives (avant les recommandations)
  const sentences = cleaned.split(/[.!?]+/).filter(s => s.trim().length > 30);
  
  // Prendre les 2-3 premières phrases qui ne sont pas des listes
  let simplified = "";
  let count = 0;
  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (trimmed.length > 30 && !trimmed.match(/^[-•\d]/) && count < 3) {
      simplified += trimmed + ". ";
      count++;
    }
  }
  
  // Limiter à 250 caractères max
  if (simplified.length > 250) {
    simplified = simplified.substring(0, 247) + "...";
  }
  
  return simplified.trim() || cleaned.substring(0, 200);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      provider = "huggingface",
      hfApiKey,
      azureConfig,
      bedrockConfig,
      userPrompt
    } = body || {};

    if (!userPrompt || !userPrompt.trim()) {
      return NextResponse.json(
        { error: "Le prompt à évaluer est obligatoire." },
        { status: 400 }
      );
    }

    // Évaluer par règles précises
    const ruleEvaluation = evaluatePromptByRules(userPrompt);
    const missingElements = detectMissingElements(userPrompt);

    // Évaluation LLM
    let detailedEvaluation = "";
    try {
      detailedEvaluation = await getLLMEvaluation(userPrompt, provider, {
        hfApiKey,
        azureConfig,
        bedrockConfig
      });
    } catch (e) {
      console.warn("LLM evaluation failed:", e);
      detailedEvaluation = "Évaluation LLM non disponible.";
    }

    // Extraire le score LLM
    const llmScore = extractLLMScore(detailedEvaluation);
    
    // Score global : utiliser le score LLM si disponible, sinon combiner règles + LLM
    let overallScore;
    if (llmScore !== null) {
      // Utiliser le score LLM comme référence principale (70%) + règles (30%)
      overallScore = (llmScore * 0.7) + (ruleEvaluation.averageScore * 0.3);
    } else {
      // Si pas de score LLM, utiliser seulement les règles
      overallScore = ruleEvaluation.averageScore;
      if (missingElements.length > 0) {
        overallScore -= missingElements.length * 5;
      }
    }
    overallScore = Math.max(0, Math.min(100, Math.round(overallScore * 10) / 10));

    // Générer des recommandations consolidées
    const recommendations = generateRecommendations(
      ruleEvaluation.criteria,
      missingElements
    );

    // Simplifier l'analyse détaillée
    const simplifiedEvaluation = simplifyDetailedEvaluation(detailedEvaluation);

    // Regrouper les éléments manquants en catégories
    const groupedMissing = {
      contexte: missingElements.some(e => e.includes("Contexte") || e.includes("texte d'entrée")),
      role: missingElements.some(e => e.includes("Rôle")),
      format: missingElements.some(e => e.includes("Format")),
      longueur: missingElements.some(e => e.includes("trop court") || e.includes("détails")),
      instructions: missingElements.some(e => e.includes("Action") || e.includes("instruction"))
    };

    return NextResponse.json({
      success: true,
      overallScore,
      criteriaScores: ruleEvaluation.criteria,
      missingElements: groupedMissing,
      recommendations,
      detailedEvaluation: simplifiedEvaluation,
      llmScore: llmScore !== null ? llmScore : null
    });
  } catch (error) {
    console.error("Prompt evaluator error:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de l'évaluation du prompt.",
        details: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 500 }
    );
  }
}


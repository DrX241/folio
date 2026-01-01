import { NextResponse } from "next/server";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

export const runtime = "nodejs";

// Appel LLM pour générer la réponse
async function callLLM(prompt, inputText, provider, config) {
  const fullPrompt = `${prompt}\n\nTexte d'entrée:\n${inputText}`;

  let response = "";

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
        messages: [{ role: "user", content: fullPrompt }],
        max_tokens: 1024,
        temperature: 0.3
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
        messages: [{ role: "user", content: fullPrompt }],
        max_tokens: 1024,
        temperature: 0.3
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
              text: fullPrompt
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

  return response;
}

// Évaluation par règles précises
function evaluateByRules(taskType, inputText, expectedOutput, criteria, llmResponse) {
  const rules = [];
  let totalScore = 0;

  // 1. Longueur de la réponse
  const responseLength = llmResponse.trim().length;
  let lengthScore = 100;
  
  if (taskType === "summarize") {
    if (expectedOutput.includes("2-3 phrases")) {
      const sentences = llmResponse.split(/[.!?]+/).filter(s => s.trim().length > 0);
      if (sentences.length < 2 || sentences.length > 4) {
        lengthScore = Math.max(0, 100 - Math.abs(sentences.length - 3) * 20);
      }
    } else if (expectedOutput.includes("une phrase")) {
      const sentences = llmResponse.split(/[.!?]+/).filter(s => s.trim().length > 0);
      if (sentences.length !== 1) {
        lengthScore = Math.max(0, 100 - (sentences.length - 1) * 30);
      }
    }
  } else if (taskType === "transform") {
    if (expectedOutput.includes("JSON")) {
      // Vérifier si c'est du JSON valide
      try {
        JSON.parse(llmResponse);
        lengthScore = 100;
      } catch (e) {
        lengthScore = 50;
      }
    } else if (expectedOutput.includes("HTML")) {
      if (!llmResponse.includes("<ul>") || !llmResponse.includes("<li>")) {
        lengthScore = 50;
      }
    }
  }
  
  rules.push({
    name: "Longueur/Format",
    description: `Réponse de ${responseLength} caractères`,
    score: lengthScore
  });
  totalScore += lengthScore;

  // 2. Présence de mots-clés/éléments attendus
  let keywordScore = 0;
  const keywords = [];
  
  if (taskType === "summarize") {
    // Extraire quelques mots-clés importants de l'input
    const importantWords = inputText
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 5)
      .slice(0, 5);
    const foundKeywords = importantWords.filter(w => 
      llmResponse.toLowerCase().includes(w)
    );
    keywordScore = (foundKeywords.length / importantWords.length) * 100;
    keywords.push(...foundKeywords);
  } else if (taskType === "transform") {
    // Vérifier que les données sont présentes
    const inputLines = inputText.split("\n").filter(l => l.trim());
    const dataLines = inputLines.slice(1); // Skip header
    let foundData = 0;
    dataLines.forEach(line => {
      const values = line.split(";");
      values.forEach(val => {
        if (llmResponse.includes(val.trim())) {
          foundData++;
        }
      });
    });
    keywordScore = Math.min(100, (foundData / (dataLines.length * 2)) * 100);
  } else if (taskType === "extract") {
    // Vérifier la présence d'entités
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/;
    const phoneRegex = /0[1-9](?:[.\s-]?\d{2}){4}/;
    const dateRegex = /\d{1,2}\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+\d{4}/i;
    
    let entitiesFound = 0;
    if (emailRegex.test(llmResponse)) entitiesFound++;
    if (phoneRegex.test(llmResponse)) entitiesFound++;
    if (dateRegex.test(llmResponse)) entitiesFound++;
    if (llmResponse.match(/[A-Z][a-z]+\s+[A-Z][a-z]+/)) entitiesFound++; // Nom propre
    
    keywordScore = (entitiesFound / 4) * 100;
  }
  
  rules.push({
    name: "Contenu attendu",
    description: keywords.length > 0 ? `Mots-clés trouvés: ${keywords.slice(0, 3).join(", ")}` : "Éléments attendus présents",
    score: keywordScore
  });
  totalScore += keywordScore;

  // 3. Cohérence et qualité générale
  let coherenceScore = 100;
  if (llmResponse.trim().length < 10) {
    coherenceScore = 20;
  } else if (llmResponse.trim().length > 2000 && taskType === "summarize") {
    coherenceScore = 60; // Trop long pour un résumé
  }
  
  rules.push({
    name: "Cohérence",
    description: "Qualité générale de la réponse",
    score: coherenceScore
  });
  totalScore += coherenceScore;

  return {
    rules,
    averageScore: totalScore / rules.length
  };
}

// Évaluation LLM
async function getLLMEvaluation(taskType, inputText, expectedOutput, criteria, llmResponse, provider, config) {
  const systemPrompt = `Tu es un expert en évaluation de qualité de réponses générées par LLM. Évalue la réponse fournie selon les critères demandés.`;
  
  const userPrompt = `Type de tâche: ${taskType === "summarize" ? "Résumer" : taskType === "transform" ? "Transformer" : "Extraire"}
Résultat attendu: ${expectedOutput}
Critères: ${criteria.join(", ")}

Réponse générée par le LLM:
${llmResponse}

Donne une évaluation détaillée en français (3-4 phrases) sur la qualité de cette réponse par rapport aux critères.`;

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
      challengeId,
      taskType,
      inputText,
      expectedOutput,
      criteria,
      userPrompt,
      timeElapsed
    } = body || {};

    if (!userPrompt || !inputText) {
      return NextResponse.json(
        { error: "Le prompt utilisateur et le texte d'entrée sont obligatoires." },
        { status: 400 }
      );
    }

    // Appeler le LLM avec le prompt utilisateur
    let llmResponse = "";
    try {
      llmResponse = await callLLM(userPrompt, inputText, provider, {
        hfApiKey,
        azureConfig,
        bedrockConfig
      });
    } catch (e) {
      return NextResponse.json(
        { error: `Erreur lors de l'appel LLM: ${e.message}` },
        { status: 500 }
      );
    }

    if (!llmResponse || !llmResponse.trim()) {
      return NextResponse.json(
        { error: "Réponse LLM vide." },
        { status: 500 }
      );
    }

    // Évaluer par règles précises
    const ruleEvaluation = evaluateByRules(taskType, inputText, expectedOutput, criteria, llmResponse);

    // Évaluation LLM
    let llmEvaluation = "";
    try {
      llmEvaluation = await getLLMEvaluation(
        taskType,
        inputText,
        expectedOutput,
        criteria,
        llmResponse,
        provider,
        { hfApiKey, azureConfig, bedrockConfig }
      );
    } catch (e) {
      console.warn("LLM evaluation failed:", e);
      llmEvaluation = "Évaluation LLM non disponible.";
    }

    // Score global (moyenne des règles + bonus temps si rapide)
    let overallScore = ruleEvaluation.averageScore;
    if (timeElapsed < 60) {
      overallScore += 5; // Bonus pour rapidité
    } else if (timeElapsed > 300) {
      overallScore -= 5; // Pénalité si trop lent
    }
    overallScore = Math.max(0, Math.min(100, overallScore));

    // Recommandations
    const recommendations = [];
    ruleEvaluation.rules.forEach(rule => {
      if (rule.score < 60) {
        if (rule.name === "Longueur/Format") {
          recommendations.push("Ajustez la longueur de votre prompt pour obtenir le format attendu.");
        } else if (rule.name === "Contenu attendu") {
          recommendations.push("Incluez des instructions plus précises sur les éléments à inclure dans la réponse.");
        } else if (rule.name === "Cohérence") {
          recommendations.push("Améliorez la clarté et la structure de votre prompt.");
        }
      }
    });

    return NextResponse.json({
      success: true,
      llmResponse,
      score: {
        overall: Math.round(overallScore * 10) / 10,
        ruleScores: ruleEvaluation.rules,
        llmEvaluation,
        recommendations: [...new Set(recommendations)],
        timeElapsed
      }
    });
  } catch (error) {
    console.error("Prompt challenge evaluation error:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de l'évaluation du challenge.",
        details: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 500 }
    );
  }
}







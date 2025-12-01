export const runtime = "nodejs";

// Pour garder le code simple et auto-contenu, on implémente tout ici.

import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

async function generateAnswerWithProvider(question, provider, config) {
  const systemPrompt = `
Tu es un assistant métier francophone. 
Tu peux répondre en t'appuyant sur tes connaissances générales et sur la question. Réponds de manière claire et structurée.
`.trim();

  if (provider === "huggingface") {
    const { huggingface } = config;
    const url = `${huggingface.baseUrl.replace(/\/$/, "")}/models/${huggingface.chatModel}`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${huggingface.apiKey}`
      },
      body: JSON.stringify({
        inputs: `${systemPrompt}\n\nQuestion: ${question}\nRéponse en français:`,
        parameters: {
          max_new_tokens: 400,
          temperature: 0.3
        }
      })
    });

    if (!res.ok) {
      throw new Error(`Erreur Hugging Face génération: ${res.status}`);
    }

    const data = await res.json();
    const text = Array.isArray(data) ? data[0]?.generated_text : data.generated_text;
    return (text || "").toString().trim();
  }

  if (provider === "azure-openai") {
    const { azure } = config;
    const url = `${azure.endpoint.replace(/\/$/, "")}/openai/deployments/${azure.chatDeployment}/chat/completions?api-version=${azure.apiVersion}`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": azure.apiKey
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question }
        ],
        max_tokens: 400,
        temperature: 0.3
      })
    });

    if (!res.ok) {
      throw new Error(`Erreur Azure OpenAI chat: ${res.status}`);
    }

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    return (text || "").toString().trim();
  }

  if (provider === "generic") {
    const { generic } = config;
    const headers = {
      "Content-Type": "application/json"
    };
    if (generic.authHeader) {
      const [name, ...rest] = generic.authHeader.split(":");
      if (name && rest.length) {
        headers[name.trim()] = rest.join(":").trim();
      }
    }

    const url = `${generic.baseUrl.replace(/\/$/, "")}${generic.chatPath}`;
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        question: question
      })
    });

    if (!res.ok) {
      throw new Error(`Erreur provider générique chat: ${res.status}`);
    }

    const data = await res.json();
    const text = data.answer || data.output || data.choices?.[0]?.message?.content || data;
    return (typeof text === "string" ? text : JSON.stringify(text)).trim();
  }

  if (provider === "bedrock") {
    const { bedrock } = config;
    const client = new BedrockRuntimeClient({
      region: bedrock.region,
      credentials: {
        accessKeyId: bedrock.accessKeyId,
        secretAccessKey: bedrock.secretAccessKey
      }
    });

    // On suppose ici un modèle Claude 3 (Anthropic) sur Bedrock.
    const modelId = bedrock.modelId || "anthropic.claude-3-haiku-20240307-v1:0";

    const promptContent = [
      {
        type: "text",
        text: `${systemPrompt}\n\nQuestion: ${question}\nRéponse en français:`
      }
    ];

    const body = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 400,
      temperature: 0.3,
      messages: [
        {
          role: "user",
          content: promptContent
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
    return (typeof text === "string" ? text : JSON.stringify(text)).trim();
  }

  throw new Error(`Provider non supporté pour le chat: ${provider}`);
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { provider, question, config } = body || {};

    if (!provider || !question) {
      return Response.json(
        { error: "Requête invalide. Fournir au minimum provider et question." },
        { status: 400 }
      );
    }

    // Sécurité minimale : on ne logue jamais les clés
    const safeConfig = {
      huggingface: config?.huggingface || {},
      azure: config?.azure || {},
      generic: config?.generic || {},
      bedrock: config?.bedrock || {}
    };

    const answer = await generateAnswerWithProvider(
      question,
      provider,
      safeConfig
    );

    return Response.json({
      answer
    });
  } catch (err) {
    console.error("Erreur RAG multi-provider:", err);
    return Response.json(
      { error: err.message || "Erreur interne RAG multi-provider" },
      { status: 500 }
    );
  }
}



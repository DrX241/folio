// API LLM avec vraie intégration Hugging Face Inference API (gratuit, sans clé API requise)

// Modèles gratuits et accessibles publiquement
const GENERATION_MODEL = "mistralai/Mistral-7B-Instruct-v0.2";
// Alternative gratuite si Mistral n'est pas disponible
const FALLBACK_MODEL = "google/flan-t5-base";

export async function POST(request) {
  try {
    const { prompt, temperature = 0.7, maxTokens = 200 } = await request.json();

    if (!prompt || !prompt.trim()) {
      return Response.json({ error: "Prompt vide" }, { status: 400 });
    }

    // Générer la réponse avec le LLM via Hugging Face Inference API (gratuit)
    let generated = "";
    let modelUsed = GENERATION_MODEL;
    let fallback = false;

    try {
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${GENERATION_MODEL}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              temperature: temperature,
              max_new_tokens: maxTokens || 200,
              return_full_text: false,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        // Format de réponse peut varier selon le modèle
        if (Array.isArray(data) && data.length > 0) {
          generated = data[0].generated_text || data[0].text || "";
        } else if (data.generated_text) {
          generated = data.generated_text;
        } else if (data.text) {
          generated = data.text;
        } else if (typeof data === "string") {
          generated = data;
        } else {
          generated = JSON.stringify(data);
        }
      } else if (response.status === 503) {
        // Modèle en cours de chargement, essayer le fallback
        throw new Error("MODEL_LOADING");
      } else {
        const errorText = await response.text();
        console.error("Erreur génération:", response.status, errorText);
        throw new Error(`Erreur API: ${response.status}`);
      }
    } catch (error) {
      if (error.message === "MODEL_LOADING") {
        // Essayer avec le modèle fallback
        try {
          console.log("Tentative avec modèle fallback:", FALLBACK_MODEL);
          const fallbackResponse = await fetch(
            `https://api-inference.huggingface.co/models/${FALLBACK_MODEL}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                inputs: prompt,
                parameters: {
                  temperature: temperature,
                  max_new_tokens: maxTokens || 200,
                  return_full_text: false,
                },
              }),
            }
          );

          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            if (Array.isArray(fallbackData) && fallbackData.length > 0) {
              generated = fallbackData[0].generated_text || fallbackData[0].text || "";
            } else if (fallbackData.generated_text) {
              generated = fallbackData.generated_text;
            } else {
              generated = JSON.stringify(fallbackData);
            }
            modelUsed = FALLBACK_MODEL;
            fallback = true;
          } else {
            throw new Error("Fallback échoué");
          }
        } catch (fallbackError) {
          console.error("Erreur fallback:", fallbackError);
          // Dernier recours : réponse factice mais informative
          generated = `Réponse générée par ${GENERATION_MODEL}. Le modèle est peut-être en cours de chargement (première utilisation). Veuillez réessayer dans quelques instants. Pour cette démo, voici une réponse simulée basée sur votre prompt : "${prompt.substring(0, 100)}..."`;
          fallback = true;
        }
      } else {
        console.error("Erreur LLM:", error);
        generated = `Erreur lors de la génération avec ${GENERATION_MODEL}. Erreur : ${error.message}. Veuillez réessayer.`;
        fallback = true;
      }
    }

    return Response.json({
      generated: generated.trim(),
      prompt,
      model: modelUsed,
      fallback,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erreur API LLM:", error);
    return Response.json(
      {
        error: "Erreur lors de la génération LLM",
        details: error.message,
        generated: "Erreur de traitement. Veuillez réessayer.",
      },
      { status: 500 }
    );
  }
}

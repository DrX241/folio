// API RAG simple avec Hugging Face (embeddings + génération)

import { simpleCorpus } from "@/lib/simple-corpus";
import { simpleChunk, simpleSearch, simpleGenerate } from "@/lib/simple-rag";

const HF_API_TOKEN = process.env.HUGGINGFACE_API_KEY;
const EMBEDDING_MODEL = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2";
const GENERATION_MODEL = "mistralai/Mistral-7B-Instruct-v0.2";
const FALLBACK_MODEL = "google/flan-t5-base"; // Plus léger, fallback si Mistral échoue

// Similarité cosinus pour comparer les embeddings
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magnitudeA += vecA[i] * vecA[i];
    magnitudeB += vecB[i] * vecB[i];
  }
  const magnitude = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);
  return magnitude ? dotProduct / magnitude : 0;
}

export async function POST(request) {
  try {
    const { query, topK = 3 } = await request.json();

    if (!query || !query.trim()) {
      return Response.json({ error: "Requête vide" }, { status: 400 });
    }

    // 1. Chunking de tous les documents
    const allChunks = [];
    simpleCorpus.forEach(doc => {
      const chunks = simpleChunk(doc.text);
      chunks.forEach(chunk => {
        allChunks.push({
          ...chunk,
          docId: doc.id,
          docTitle: doc.title
        });
      });
    });

    let useHuggingFace = !!HF_API_TOKEN;
    let topChunks = [];
    let generated = "";
    let mode = "simple";

    if (useHuggingFace) {
      // Mode Hugging Face : vraies embeddings
      try {
        // Embedding de la requête avec retry
        let queryEmbedding = null;
        let queryResponse = await fetch(
          `https://api-inference.huggingface.co/pipeline/feature-extraction/${EMBEDDING_MODEL}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(HF_API_TOKEN && { "Authorization": `Bearer ${HF_API_TOKEN}` })
            },
            body: JSON.stringify({ inputs: query }),
          }
        );

        if (queryResponse.status === 503) {
          // Modèle en chargement, attendre et réessayer une fois
          await new Promise(resolve => setTimeout(resolve, 3000));
          queryResponse = await fetch(
            `https://api-inference.huggingface.co/pipeline/feature-extraction/${EMBEDDING_MODEL}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(HF_API_TOKEN && { "Authorization": `Bearer ${HF_API_TOKEN}` })
              },
              body: JSON.stringify({ inputs: query }),
            }
          );
        }

        if (queryResponse.ok) {
          let embeddingData = await queryResponse.json();
          if (Array.isArray(embeddingData) && embeddingData.length > 0) {
            embeddingData = Array.isArray(embeddingData[0]) ? embeddingData[0] : embeddingData[0];
          }
          if (Array.isArray(embeddingData) && embeddingData.length > 0 && typeof embeddingData[0] === 'number') {
            queryEmbedding = embeddingData;
          }
        }

        if (queryEmbedding && Array.isArray(queryEmbedding) && queryEmbedding.length > 0) {
          // Embeddings des chunks (limiter à 15 pour éviter trop d'appels)
          const chunksToEmbed = allChunks.slice(0, 15);
          const chunkEmbeddings = await Promise.all(
            chunksToEmbed.map(async (chunk, chunkIdx) => {
              let retryCount = 0;
              while (retryCount < 2) {
                try {
                  const chunkResponse = await fetch(
                    `https://api-inference.huggingface.co/pipeline/feature-extraction/${EMBEDDING_MODEL}`,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        ...(HF_API_TOKEN && { "Authorization": `Bearer ${HF_API_TOKEN}` })
                      },
                      body: JSON.stringify({ inputs: chunk.text }),
                    }
                  );

                  if (chunkResponse.status === 503 && retryCount < 1) {
                    // Modèle en chargement, attendre et réessayer
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    retryCount++;
                    continue;
                  }

                  if (chunkResponse.ok) {
                    let embedding = await chunkResponse.json();
                    if (Array.isArray(embedding) && embedding.length > 0) {
                      embedding = Array.isArray(embedding[0]) ? embedding[0] : embedding[0];
                    }
                    if (Array.isArray(embedding) && embedding.length > 0 && typeof embedding[0] === 'number') {
                      return embedding;
                    }
                  }
                  break; // Sortir de la boucle si pas 503
                } catch (err) {
                  console.error(`Erreur embedding chunk ${chunkIdx}:`, err);
                  break;
                }
              }
              return null;
            })
          );

          // Calculer les similarités
          const similarities = chunkEmbeddings
            .map((emb, idx) => {
              if (!emb) return null;
              return {
                idx,
                similarity: cosineSimilarity(queryEmbedding, emb)
              };
            })
            .filter(Boolean);

          // Sélectionner top-K
          topChunks = similarities
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, topK)
            .map((item) => ({
              text: allChunks[item.idx].text,
              score: item.similarity,
              docId: allChunks[item.idx].docId,
              start: allChunks[item.idx].start,
              docTitle: allChunks[item.idx].docTitle
            }));

          mode = "huggingface";
        }
      } catch (err) {
        console.error("Erreur Hugging Face embeddings:", err);
        useHuggingFace = false;
      }
    }

    // Fallback : recherche simple par mots-clés
    if (topChunks.length === 0) {
      topChunks = simpleSearch(query, allChunks, topK);
      mode = "simple";
    }

    // 2. Génération de la réponse
    if (useHuggingFace && topChunks.length > 0) {
      // Génération avec Hugging Face
      try {
        const context = topChunks.map(chunk => chunk.text).join("\n\n");
        const prompt = `<s>[INST] Tu es un assistant expert. Réponds à la question en t'appuyant UNIQUEMENT sur les passages fournis. Cite tes sources à la fin.

Passages de contexte :
${context}

Question : ${query}

Réponds de manière précise et cite tes sources. [/INST]`;

        const genResponse = await fetch(
          `https://api-inference.huggingface.co/models/${GENERATION_MODEL}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(HF_API_TOKEN && { "Authorization": `Bearer ${HF_API_TOKEN}` })
            },
            body: JSON.stringify({
              inputs: prompt,
              parameters: {
                temperature: 0.7,
                max_new_tokens: 300,
                return_full_text: false,
              },
            }),
          }
        );

        if (genResponse.ok) {
          const genData = await genResponse.json();
          if (Array.isArray(genData) && genData.length > 0) {
            generated = genData[0].generated_text || genData[0].text || genData[0] || "";
          } else if (genData.generated_text) {
            generated = genData.generated_text;
          } else if (genData.text) {
            generated = genData.text;
          }

          generated = generated.replace(/\[INST\].*?\[\/INST\]/g, '').trim();
          generated = generated.replace(/Passages de contexte :.*?Question :/gs, '').trim();

          if (generated.length === 0) {
            throw new Error("Réponse vide");
          }

          mode = "huggingface";
        } else if (genResponse.status === 503) {
          // Modèle en chargement, attendre et réessayer une fois
          await new Promise(resolve => setTimeout(resolve, 5000));
          const retryGenResponse = await fetch(
            `https://api-inference.huggingface.co/models/${GENERATION_MODEL}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(HF_API_TOKEN && { "Authorization": `Bearer ${HF_API_TOKEN}` })
              },
              body: JSON.stringify({
                inputs: prompt,
                parameters: {
                  temperature: 0.7,
                  max_new_tokens: 300,
                  return_full_text: false,
                },
              }),
            }
          );

          if (retryGenResponse.ok) {
            const retryGenData = await retryGenResponse.json();
            if (Array.isArray(retryGenData) && retryGenData.length > 0) {
              generated = retryGenData[0].generated_text || retryGenData[0].text || retryGenData[0] || "";
            } else if (retryGenData.generated_text) {
              generated = retryGenData.generated_text;
            } else if (retryGenData.text) {
              generated = retryGenData.text;
            }
            generated = generated.replace(/\[INST\].*?\[\/INST\]/g, '').trim();
            generated = generated.replace(/Passages de contexte :.*?Question :/gs, '').trim();
            if (generated.length > 0) {
              mode = "huggingface";
            } else {
              throw new Error("Réponse vide après retry");
            }
          } else {
            throw new Error("Modèle toujours en chargement après retry");
          }
        } else {
          throw new Error(`Erreur génération: ${genResponse.status}`);
        }
      } catch (genError) {
        console.error("Erreur génération Hugging Face:", genError);
        // Fallback : génération simple
        generated = simpleGenerate(query, topChunks);
        mode = "simple";
      }
    } else {
      // Génération simple
      generated = simpleGenerate(query, topChunks);
      mode = "simple";
    }

    // Références
    const references = topChunks.map(chunk => `${chunk.docId} — paragraphe ${Math.floor(chunk.start / 100) + 1}`);

    return Response.json({
      query,
      chunks: topChunks,
      generated,
      references,
      mode
    });
  } catch (error) {
    console.error("Erreur RAG:", error);
    return Response.json(
      { error: "Erreur lors du traitement", details: error.message },
      { status: 500 }
    );
  }
}


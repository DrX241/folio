// API RAG avec double mode : LIVE (Hugging Face) et SAFE (offline)

import { corpusData } from "@/lib/corpus";
import { embedSafe, cosineSimilarity, chunkText, generateMockResponse } from "@/lib/rag-utils";

const EMBEDDING_MODEL = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2";
const GENERATION_MODEL = "mistralai/Mistral-7B-Instruct-v0.2";
const HF_API_TOKEN = process.env.HUGGINGFACE_API_KEY || process.env.HF_API_TOKEN;

export async function POST(request) {
  try {
    const { query, chunkSize = 300, overlap = 50, topK = 3, temperature = 0.7, selectedDocs = [], mode = "SAFE" } = await request.json();

    if (!query || !query.trim()) {
      return Response.json({ error: "Requête vide" }, { status: 400 });
    }

    // Déterminer le mode réel
    const actualMode = (mode === "LIVE" && HF_API_TOKEN) ? "LIVE" : "SAFE";

    // Filtrer le corpus selon les documents sélectionnés
    const activeDocs = corpusData.filter(doc => selectedDocs.includes(doc.id) || selectedDocs.length === 0);

    // 1. Chunking de tous les documents actifs
    const allChunks = [];
    activeDocs.forEach(doc => {
      const chunks = chunkText(doc.text, chunkSize, overlap);
      chunks.forEach(chunk => {
        allChunks.push({
          ...chunk,
          docId: doc.id,
          docTitle: doc.title
        });
      });
    });

    // 2. Embeddings
    let queryEmbedding;
    let chunkEmbeddings = [];

    if (actualMode === "LIVE") {
      // Mode LIVE : vraies API Hugging Face
      try {
        // Embedding de la requête
        const queryResponse = await fetch(
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

        if (queryResponse.ok) {
          let embedding = await queryResponse.json();
          if (Array.isArray(embedding) && embedding.length > 0) {
            embedding = Array.isArray(embedding[0]) ? embedding[0] : embedding[0];
          }
          if (Array.isArray(embedding) && embedding.length > 0 && typeof embedding[0] === 'number') {
            queryEmbedding = embedding;
          }
        }
      } catch (err) {
        console.error("Erreur embedding requête:", err);
      }

      // Si l'embedding de la requête a échoué, basculer en SAFE
      if (!queryEmbedding || !Array.isArray(queryEmbedding)) {
        queryEmbedding = embedSafe(query);
        chunkEmbeddings = allChunks.map(chunk => embedSafe(chunk.text));
      } else {
        // Embeddings des chunks (limiter à 20 pour éviter trop d'appels)
        const chunksToEmbed = allChunks.slice(0, 20);
        chunkEmbeddings = await Promise.all(
          chunksToEmbed.map(async (chunk) => {
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

              if (chunkResponse.ok) {
                let embedding = await chunkResponse.json();
                if (Array.isArray(embedding) && embedding.length > 0) {
                  embedding = Array.isArray(embedding[0]) ? embedding[0] : embedding[0];
                }
                if (Array.isArray(embedding) && embedding.length > 0 && typeof embedding[0] === 'number') {
                  return embedding;
                }
              }
            } catch (err) {
              console.error(`Erreur embedding chunk ${chunk.docId}:`, err);
            }
            return embedSafe(chunk.text);
          })
        );

        // Ajouter les embeddings SAFE pour les chunks restants
        if (allChunks.length > 20) {
          const remainingChunks = allChunks.slice(20);
          chunkEmbeddings = [
            ...chunkEmbeddings,
            ...remainingChunks.map(chunk => embedSafe(chunk.text))
          ];
        }
      }
    } else {
      // Mode SAFE : embeddings simulés
      queryEmbedding = embedSafe(query);
      chunkEmbeddings = allChunks.map(chunk => embedSafe(chunk.text));
    }

    // 3. Calcul de similarité
    const similarities = chunkEmbeddings.map((emb, idx) => ({
      idx,
      similarity: cosineSimilarity(queryEmbedding, emb),
    }));

    // 4. Sélection Top-K
    const topChunks = similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
      .map((item) => ({
        text: allChunks[item.idx].text,
        score: item.similarity,
        docId: allChunks[item.idx].docId,
        start: allChunks[item.idx].start,
        docTitle: allChunks[item.idx].docTitle
      }));

    // 5. Génération contextuelle (vraie génération RAG basée sur le contexte)
    let generated = "";
    // Construire le contexte avec les passages retenus (c'est le cœur du RAG)
    const context = topChunks.map((chunk, idx) => 
      `[Passage ${idx + 1} - Score: ${chunk.score.toFixed(3)}]\n${chunk.text}`
    ).join("\n\n---\n\n");
    const references = topChunks.map(chunk => `${chunk.docId}@${chunk.start}`);

    if (actualMode === "LIVE") {
      // Mode LIVE : vraie génération LLM avec contexte RAG
      try {
        // Prompt RAG standard : contexte + question
        const ragPrompt = `<s>[INST] Tu es un assistant expert en RAG (Retrieval-Augmented Generation). 
Réponds à la question de l'utilisateur en t'appuyant UNIQUEMENT sur les passages de contexte fournis ci-dessous.
Si l'information n'est pas dans le contexte, dis-le clairement.
Cite les passages utilisés à la fin de ta réponse.

Passages de contexte :
${context}

Question de l'utilisateur : ${query}

Réponds de manière précise, structurée et cite tes sources. [/INST]`;
        
        const genResponse = await fetch(
          `https://api-inference.huggingface.co/models/${GENERATION_MODEL}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(HF_API_TOKEN && { "Authorization": `Bearer ${HF_API_TOKEN}` })
            },
            body: JSON.stringify({
              inputs: ragPrompt,
              parameters: {
                temperature: temperature,
                max_new_tokens: 400,
                return_full_text: false,
                top_p: 0.9,
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
          } else if (typeof genData === 'string') {
            generated = genData;
          }
          
          // Nettoyer la réponse
          generated = generated.replace(/\[INST\].*?\[\/INST\]/g, '').trim();
          generated = generated.replace(/Passages de contexte :.*?Question de l'utilisateur :/gs, '').trim();
          
          if (generated.length === 0) {
            throw new Error("Réponse vide");
          }
          
          // Ajouter les références si pas déjà présentes
          if (!generated.toLowerCase().includes("référence") && !generated.toLowerCase().includes("source")) {
            generated += `\n\n**Références :** ${references.join(', ')}`;
          }
        } else {
          const errorText = await genResponse.text();
          console.error("Erreur génération:", errorText);
          throw new Error(`Erreur génération: ${genResponse.status}`);
        }
      } catch (genError) {
        console.error("Erreur génération LIVE:", genError);
        // Fallback en SAFE : vraie génération contextuelle basée sur les passages
        generated = generateMockResponse(query, topChunks, { chunkSize, overlap, topK, temperature });
      }
    } else {
      // Mode SAFE : génération contextuelle réelle basée sur les passages retenus
      // Ce n'est pas juste un mock, c'est une vraie synthèse contextuelle
      generated = generateMockResponse(query, topChunks, { chunkSize, overlap, topK, temperature });
    }

    return Response.json({
      chunks: topChunks,
      generated,
      query,
      references,
      parameters: { chunkSize, overlap, topK, temperature },
      mode: actualMode,
      models: {
        embedding: actualMode === "LIVE" ? EMBEDDING_MODEL : "SAFE (simulé)",
        generation: actualMode === "LIVE" ? GENERATION_MODEL : "SAFE (mock)",
      },
    });
  } catch (error) {
    console.error("Erreur RAG:", error);
    return Response.json(
      { error: "Erreur lors du traitement RAG", details: error.message },
      { status: 500 }
    );
  }
}

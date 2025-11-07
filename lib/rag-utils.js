// Utilitaires RAG : chunking, embeddings, similarité, génération

// Chunking avec overlap
export function chunkText(text, chunkSize = 500, overlap = 100) {
  if (!text || text.length === 0) return [];
  
  const chunks = [];
  let start = 0;
  
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunkText = text.slice(start, end).trim();
    
    if (chunkText.length > 0) {
      chunks.push({
        chunkId: `chunk_${chunks.length}`,
        text: chunkText,
        start: start,
        end: end
      });
    }
    
    // Avancer avec overlap
    start += chunkSize - overlap;
    if (start >= text.length) break;
  }
  
  return chunks.length > 0 ? chunks : [{ chunkId: 'chunk_0', text: text.trim(), start: 0, end: text.length }];
}

// Similarité cosinus
export function cosineSimilarity(vecA, vecB) {
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

// Embedding local simple (fallback sans HF)
export function embedLocal(text) {
  // Approche bag-of-words simplifiée
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const vocab = new Set(words);
  const vector = Array.from(vocab).map(word => {
    const count = words.filter(w => w === word).length;
    return count / words.length; // TF simple
  });
  
  // Normaliser
  const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
  return magnitude > 0 ? vector.map(v => v / magnitude) : vector;
}

// Génération locale (fallback sans HF)
export function generateLocal(query, topChunks) {
  if (topChunks.length === 0) {
    return "Je n'ai pas trouvé de passages pertinents dans le document pour répondre à cette question.";
  }
  
  let response = `D'après les passages du document :\n\n`;
  
  topChunks.forEach((chunk, idx) => {
    response += `[${idx + 1}] ${chunk.text}\n\n`;
  });
  
  response += `---\n\n`;
  response += `Références:\n`;
  topChunks.forEach((chunk, idx) => {
    response += `- [${chunk.chunkId}@${chunk.start}]\n`;
  });
  
  return response;
}

// Appel Hugging Face pour embeddings (OBLIGATOIRE - pas de fallback)
export async function embedHF(text, apiToken, model = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2") {
  if (!apiToken) {
    throw new Error("HF_API_TOKEN requis. Configurez votre token Hugging Face dans .env.local");
  }
  
  try {
    const response = await fetch(
      `https://api-inference.huggingface.co/pipeline/feature-extraction/${model}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiToken}`
        },
        body: JSON.stringify({ inputs: text }),
      }
    );
    
    if (response.status === 503) {
      // Modèle en chargement, attendre et réessayer
      await new Promise(resolve => setTimeout(resolve, 5000));
      const retryResponse = await fetch(
        `https://api-inference.huggingface.co/pipeline/feature-extraction/${model}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiToken}`
          },
          body: JSON.stringify({ inputs: text }),
        }
      );
      
      if (!retryResponse.ok) {
        throw new Error(`HF API error: ${retryResponse.status}`);
      }
      
      const data = await retryResponse.json();
      return Array.isArray(data[0]) ? data[0] : data;
    }
    
    if (!response.ok) {
      throw new Error(`HF API error: ${response.status}`);
    }
    
    const data = await response.json();
    return Array.isArray(data[0]) ? data[0] : data;
  } catch (error) {
    console.error('[HF Embed] Erreur:', error);
    throw new Error(`Erreur Hugging Face embeddings: ${error.message}. Vérifiez votre token et votre connexion.`);
  }
}

// Appel Hugging Face pour génération (OBLIGATOIRE - pas de fallback)
export async function generateHF(prompt, apiToken, model = "mistralai/Mistral-7B-Instruct-v0.2", maxTokens = 300, temperature = 0.3) {
  if (!apiToken) {
    throw new Error("HF_API_TOKEN requis. Configurez votre token Hugging Face dans .env.local");
  }
  
  try {
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiToken}`
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: maxTokens,
            temperature: temperature
          }
        }),
      }
    );
    
    if (response.status === 503) {
      // Modèle en chargement
      await new Promise(resolve => setTimeout(resolve, 10000));
      const retryResponse = await fetch(
        `https://api-inference.huggingface.co/models/${model}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiToken}`
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_new_tokens: maxTokens,
              temperature: temperature
            }
          }),
        }
      );
      
      if (!retryResponse.ok) {
        throw new Error(`HF API error: ${retryResponse.status}`);
      }
      
      const data = await retryResponse.json();
      return extractGeneratedText(data);
    }
    
    if (!response.ok) {
      throw new Error(`HF API error: ${response.status}`);
    }
    
    const data = await response.json();
    return extractGeneratedText(data);
  } catch (error) {
    console.error('[HF Generate] Erreur:', error);
    throw new Error(`Erreur Hugging Face génération: ${error.message}. Vérifiez votre token et votre connexion.`);
  }
}

// Extraire le texte généré de la réponse HF
function extractGeneratedText(data) {
  if (typeof data === 'string') return data;
  if (data.generated_text) return data.generated_text;
  if (Array.isArray(data) && data[0]?.generated_text) return data[0].generated_text;
  if (Array.isArray(data) && typeof data[0] === 'string') return data[0];
  return JSON.stringify(data);
}

// Construire le prompt pour la génération
export function buildPrompt(question, topChunks) {
  let prompt = `Tu es un assistant qui répond uniquement à partir des passages fournis.
Si une information ne se trouve pas dans les passages, dis-le clairement.

Question:
${question}

Passages (ne pas réécrire intégralement; utilise-les pour répondre):\n`;

  topChunks.forEach((chunk, idx) => {
    prompt += `[${idx + 1}] (chunkId=${chunk.chunkId}, start=${chunk.start})\n${chunk.text}\n\n`;
  });

  prompt += `Contraintes:
- Réponds en français, clairement et sans jargon.
- Appuie chaque affirmation importante sur les passages fournis.
- Termine par une section "Références:" listant les chunks utilisés au format [chunkId@start].

Réponds maintenant.`;

  return prompt;
}

// RAG simple et pédagogique - sans embeddings complexes

import { simpleCorpus } from "./simple-corpus";

// Découpage simple par phrases
export function simpleChunk(text, chunkSize = 200) {
  const chunks = [];
  const sentences = text.split(/[.!?]+\s+/).filter(s => s.trim().length > 0);
  
  let currentChunk = "";
  let start = 0;
  
  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length <= chunkSize) {
      currentChunk += (currentChunk ? " " : "") + sentence;
    } else {
      if (currentChunk) {
        chunks.push({
          text: currentChunk.trim(),
          start: start,
          length: currentChunk.trim().length
        });
        start += currentChunk.length;
      }
      currentChunk = sentence;
    }
  }
  
  if (currentChunk) {
    chunks.push({
      text: currentChunk.trim(),
      start: start,
      length: currentChunk.trim().length
    });
  }
  
  return chunks;
}

// Recherche simple par mots-clés (scoring manuel)
export function simpleSearch(query, chunks, topK = 3) {
  if (!query || !chunks || chunks.length === 0) {
    return [];
  }

  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  
  // Si pas de mots-clés valides, retourner les premiers chunks
  if (queryWords.length === 0) {
    return chunks.slice(0, topK).map(chunk => ({ ...chunk, score: 0.1 }));
  }
  
  const scored = chunks.map(chunk => {
    if (!chunk || !chunk.text) return { ...chunk, score: 0 };
    
    const chunkLower = chunk.text.toLowerCase();
    let score = 0;
    
    // Compter les mots de la requête présents dans le chunk
    queryWords.forEach(word => {
      const regex = new RegExp(word, 'gi');
      const matches = chunkLower.match(regex);
      if (matches) {
        score += matches.length;
      }
    });
    
    // Bonus si plusieurs mots correspondent
    const matchingWords = queryWords.filter(word => chunkLower.includes(word)).length;
    score += matchingWords * 2;
    
    // Normaliser par la longueur du chunk (éviter division par zéro)
    const chunkLength = chunk.text.length || 1;
    score = chunkLength > 0 ? score / (chunkLength / 100) : score;
    
    return {
      ...chunk,
      score: score || 0
    };
  });
  
  // Trier par score décroissant et prendre le top-K
  const sorted = scored.sort((a, b) => (b.score || 0) - (a.score || 0));
  const topResults = sorted.slice(0, topK);
  
  // Si aucun résultat avec score > 0, retourner quand même les premiers (même avec score 0)
  if (topResults.length === 0 || topResults.every(item => (item.score || 0) === 0)) {
    return chunks.slice(0, topK).map(chunk => ({ ...chunk, score: 0.1 }));
  }
  
  return topResults;
}

// Génération simple de réponse (combinaison logique des passages)
export function simpleGenerate(query, topChunks) {
  if (topChunks.length === 0) {
    return "Je n'ai pas trouvé de passages pertinents dans le corpus pour répondre à cette question.";
  }
  
  let response = "D'après les documents du corpus :\n\n";
  
  // Combiner les passages de manière logique
  topChunks.forEach((chunk, idx) => {
    response += `${idx + 1}. ${chunk.text}\n\n`;
  });
  
  response += "---\n\n";
  response += "Cette réponse a été construite en combinant les passages les plus pertinents trouvés dans le corpus.";
  
  return response;
}

// Fonction principale du RAG simple
export function runSimpleRAG(query, topK = 3) {
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
  
  // 2. Recherche
  const topChunks = simpleSearch(query, allChunks, topK);
  
  // 3. Génération
  const generated = simpleGenerate(query, topChunks);
  
  // 4. Références
  const references = topChunks.map(chunk => `${chunk.docId} — paragraphe ${Math.floor(chunk.start / 100) + 1}`);
  
  return {
    query,
    chunks: topChunks,
    generated,
    references
  };
}


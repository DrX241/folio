// API RAG Ask - Question → Retrieval → Génération

import { getDocument } from "@/lib/doc-storage";
import { embedHF, cosineSimilarity, generateHF, buildPrompt } from "@/lib/rag-utils";

export const runtime = 'nodejs';
export const maxDuration = 120;

const HF_API_TOKEN = process.env.HUGGINGFACE_API_KEY || process.env.HF_API_TOKEN;
const EMBEDDING_MODEL = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2";
const GENERATION_MODEL = "mistralai/Mistral-7B-Instruct-v0.2";

export async function POST(request) {
  try {
    const { fileId, question, topK = 3 } = await request.json();
    
    if (!fileId) {
      return Response.json({ error: "fileId requis" }, { status: 400 });
    }

    if (!question || !question.trim()) {
      return Response.json({ error: "Question vide" }, { status: 400 });
    }

    const doc = getDocument(fileId);
    if (!doc) {
      return Response.json({ error: "Document non trouvé" }, { status: 404 });
    }

    if (!doc.chunks || doc.chunks.length === 0) {
      return Response.json({ 
        error: "Document sans chunks. Vérifiez l'upload." 
      }, { status: 400 });
    }

    // OBLIGATOIRE : le document doit être indexé avec des embeddings
    if (!doc.embedded) {
      return Response.json({ 
        error: "Document non indexé. Utilisez /api/rag/embed d'abord pour générer les embeddings." 
      }, { status: 400 });
    }

    if (!HF_API_TOKEN) {
      return Response.json({ 
        error: "HF_API_TOKEN requis. Configurez votre token Hugging Face dans .env.local" 
      }, { status: 500 });
    }

    console.log('[RAG ASK] Question:', question.substring(0, 50));
    console.log('[RAG ASK] Mode: LIVE (Hugging Face)');

    // 1. Embedding de la question (OBLIGATOIRE via HF)
    const questionEmbedding = await embedHF(question, HF_API_TOKEN, EMBEDDING_MODEL);
    console.log('[RAG ASK] Embedding question généré (dimension:', questionEmbedding.length, ')');

    // 2. Similarité cosinus avec tous les chunks (OBLIGATOIRE : tous les chunks doivent avoir des vectors)
    const chunksWithScores = doc.chunks
      .filter(chunk => {
        if (!chunk.vector || !Array.isArray(chunk.vector)) {
          console.warn('[RAG ASK] Chunk sans vector ignoré:', chunk.chunkId);
          return false;
        }
        return true;
      })
      .map(chunk => {
        const similarity = cosineSimilarity(questionEmbedding, chunk.vector);
        return {
          ...chunk,
          score: similarity
        };
      })
      .filter(item => item.score > 0) // Garder seulement les chunks avec similarité > 0
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    console.log('[RAG ASK] Top-K chunks trouvés:', chunksWithScores.length);

    if (chunksWithScores.length === 0) {
      return Response.json({ 
        error: "Aucun passage pertinent trouvé dans le document" 
      }, { status: 400 });
    }

    // 3. Génération de la réponse (OBLIGATOIRE via HF Mistral)
    const prompt = buildPrompt(question, chunksWithScores);
    const answer = await generateHF(prompt, HF_API_TOKEN, GENERATION_MODEL, 300, 0.3);
    console.log('[RAG ASK] Réponse générée via Mistral-7B');

    // 4. Extraire les références de la réponse ou les construire
    const references = chunksWithScores.map(chunk => ({
      chunkId: chunk.chunkId,
      start: chunk.start,
      score: chunk.score
    }));

    // Extraire les références citées dans la réponse si présentes
    const citedRefs = [];
    const refPattern = /\[chunkId[^@]*@(\d+)\]/g;
    let match;
    while ((match = refPattern.exec(answer)) !== null) {
      citedRefs.push(parseInt(match[1]));
    }

    console.log('[RAG ASK] Réponse générée, mode:', mode);

    return Response.json({
      success: true,
      answer: answer,
      references: references,
      topKPreview: chunksWithScores.map(chunk => ({
        chunkId: chunk.chunkId,
        score: chunk.score,
        excerpt: chunk.text.substring(0, 150) + '...',
        start: chunk.start
      })),
      mode: 'LIVE',
      fileId: fileId
    });
  } catch (error) {
    console.error("[RAG ASK] Erreur complète:", error);
    console.error("[RAG ASK] Stack:", error.stack);
    return Response.json({ 
      error: error.message || "Erreur lors du traitement de la question",
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}


// API RAG Embed - Génération des embeddings via Hugging Face

import { getDocument, saveDocument } from "@/lib/doc-storage";
import { embedHF } from "@/lib/rag-utils";

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes max pour l'indexation

const HF_API_TOKEN = process.env.HUGGINGFACE_API_KEY || process.env.HF_API_TOKEN;
const EMBEDDING_MODEL = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2";

export async function POST(request) {
  try {
    const { fileId } = await request.json();
    
    if (!fileId) {
      return Response.json({ error: "fileId requis" }, { status: 400 });
    }

    const doc = getDocument(fileId);
    if (!doc) {
      return Response.json({ error: "Document non trouvé" }, { status: 404 });
    }

    if (doc.embedded && doc.chunks?.every(c => c.vector)) {
      console.log('[RAG EMBED] Document déjà indexé:', fileId);
      return Response.json({ 
        success: true, 
        fileId, 
        embedded: true,
        message: "Document déjà indexé" 
      });
    }

    if (!doc.chunks || doc.chunks.length === 0) {
      return Response.json({ error: "Aucun chunk trouvé dans le document" }, { status: 400 });
    }

    if (!HF_API_TOKEN) {
      return Response.json({ 
        error: "HF_API_TOKEN requis. Configurez votre token Hugging Face dans .env.local" 
      }, { status: 500 });
    }

    console.log('[RAG EMBED] Début indexation:', fileId, 'chunks:', doc.chunks.length);
    console.log('[RAG EMBED] Mode: LIVE (Hugging Face)');

    // Générer les embeddings pour chaque chunk
    const chunksWithVectors = [];
    let processed = 0;

    for (const chunk of doc.chunks) {
      try {
        const vector = await embedHF(chunk.text, HF_API_TOKEN, EMBEDDING_MODEL);
        chunksWithVectors.push({
          ...chunk,
          vector: vector
        });
        processed++;
        
        // Log progression tous les 10 chunks
        if (processed % 10 === 0) {
          console.log('[RAG EMBED] Progression:', processed, '/', doc.chunks.length);
        }
        
        // Petit délai pour éviter de surcharger l'API HF
        if (HF_API_TOKEN && processed % 5 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error('[RAG EMBED] Erreur chunk:', chunk.chunkId, error);
        // Continuer avec les autres chunks
        chunksWithVectors.push({
          ...chunk,
          vector: null
        });
      }
    }

    // Mettre à jour le document
    doc.chunks = chunksWithVectors;
    doc.embedded = true;
    saveDocument(fileId, doc);

    console.log('[RAG EMBED] Indexation terminée:', fileId, 'chunks indexés:', chunksWithVectors.filter(c => c.vector).length);

    return Response.json({
      success: true,
      fileId: fileId,
      embedded: true,
      chunksIndexed: chunksWithVectors.filter(c => c.vector).length,
      totalChunks: chunksWithVectors.length,
      mode: 'LIVE'
    });
  } catch (error) {
    console.error("[RAG EMBED] Erreur complète:", error);
    console.error("[RAG EMBED] Stack:", error.stack);
    return Response.json({ 
      error: error.message || "Erreur lors de l'indexation",
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}


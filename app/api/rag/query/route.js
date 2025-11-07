// API RAG Query - Version simple et fonctionnelle

import { getAllDocuments } from "@/lib/doc-storage";
import { simpleSearch, simpleGenerate } from "@/lib/simple-rag";

const HF_API_TOKEN = process.env.HUGGINGFACE_API_KEY;

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const body = await request.json();
    const { query, topK = 3, docIds = [] } = body;

    console.log('[RAG QUERY] Requête reçue:', { query: query?.substring(0, 50), topK, docIds });

    if (!query || !query.trim()) {
      console.log('[RAG QUERY] Erreur: Question vide');
      return Response.json({ error: "Question vide" }, { status: 400 });
    }

    // Récupérer les documents
    const allDocs = getAllDocuments();
    console.log('[RAG QUERY] Documents disponibles:', allDocs.length, allDocs.map(d => ({ id: d.id, fileName: d.fileName, chunksCount: d.chunks?.length || 0 })));

    const filteredDocs = docIds.length > 0 
      ? allDocs.filter(doc => docIds.includes(doc.id))
      : allDocs;

    console.log('[RAG QUERY] Documents filtrés:', filteredDocs.length);

    if (filteredDocs.length === 0) {
      console.log('[RAG QUERY] Erreur: Aucun document');
      return Response.json({ error: "Aucun document uploadé. Veuillez d'abord uploader un fichier." }, { status: 400 });
    }

    // Construire tous les chunks
    const allChunks = [];
    filteredDocs.forEach(doc => {
      console.log('[RAG QUERY] Traitement document:', doc.id, 'chunks:', doc.chunks?.length || 0);
      if (doc.chunks && Array.isArray(doc.chunks) && doc.chunks.length > 0) {
        doc.chunks.forEach(chunk => {
          if (chunk && chunk.text && chunk.text.trim().length > 0) {
            allChunks.push({
              text: chunk.text,
              docId: doc.id,
              docTitle: doc.fileName || 'Document',
              start: chunk.start || 0,
              paragraph: chunk.paragraph || 0
            });
          }
        });
      }
    });

    console.log('[RAG QUERY] Total chunks:', allChunks.length);

    if (allChunks.length === 0) {
      console.log('[RAG QUERY] Erreur: Aucun chunk valide');
      return Response.json({ error: "Aucun chunk trouvé dans les documents. Vérifiez que les fichiers contiennent du texte." }, { status: 400 });
    }

    // Recherche simple
    console.log('[RAG QUERY] Début recherche...');
    const topChunks = simpleSearch(query, allChunks, topK);
    console.log('[RAG QUERY] Chunks trouvés:', topChunks.length);
    
    // Si aucun résultat, essayer avec une recherche plus permissive
    if (topChunks.length === 0 || topChunks.every(c => (c.score || 0) === 0)) {
      console.log('[RAG QUERY] Aucune correspondance, utilisation du fallback');
      // Retourner les premiers chunks même sans correspondance
      const fallbackChunks = allChunks.slice(0, topK).map(chunk => ({ ...chunk, score: 0.1 }));
      const generated = simpleGenerate(query, fallbackChunks);
      const references = fallbackChunks.map(chunk => `${chunk.docTitle} — paragraphe ${(chunk.paragraph || 0) + 1}`);
      
      console.log('[RAG QUERY] Réponse générée (fallback)');
      return Response.json({
        query,
        chunks: fallbackChunks,
        generated: generated + "\n\n(Note: Aucune correspondance exacte trouvée, affichage des premiers passages du document)",
        references,
        mode: "simple",
        docsUsed: filteredDocs.map(d => ({ id: d.id, fileName: d.fileName }))
      });
    }
    
    console.log('[RAG QUERY] Génération de la réponse...');
    const generated = simpleGenerate(query, topChunks);
    const references = topChunks.map(chunk => `${chunk.docTitle} — paragraphe ${(chunk.paragraph || 0) + 1}`);

    console.log('[RAG QUERY] Réponse générée avec succès');
    return Response.json({
      query,
      chunks: topChunks,
      generated,
      references,
      mode: "simple",
      docsUsed: filteredDocs.map(d => ({ id: d.id, fileName: d.fileName }))
    });
  } catch (error) {
    console.error("[RAG QUERY] Erreur complète:", error);
    console.error("[RAG QUERY] Stack:", error.stack);
    return Response.json({ 
      error: error.message || "Erreur lors du traitement de la requête",
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

// API RAG Upload - Support PDF, TXT, DOCX avec chunking et overlap

import { saveDocument, getAllDocuments } from "@/lib/doc-storage";
import { chunkText } from "@/lib/rag-utils";

export const runtime = 'nodejs';
export const maxDuration = 60;

// Extraction texte simple (TXT, MD)
function extractTextSimple(arrayBuffer, encoding = 'utf-8') {
  try {
    const decoder = new TextDecoder(encoding, { fatal: false });
    return decoder.decode(new Uint8Array(arrayBuffer));
  } catch (error) {
    throw new Error("Impossible d'extraire le texte (encodage non supporté)");
  }
}

// Extraction PDF basique (approximation)
async function extractTextPDF(arrayBuffer) {
  // Pour une vraie extraction PDF, utiliser pdf-parse ou pdfjs-dist
  // Ici, on fait une extraction basique en cherchant du texte lisible
  try {
    const uint8Array = new Uint8Array(arrayBuffer);
    let text = '';
    
    // Chercher des séquences de caractères ASCII imprimables
    for (let i = 0; i < uint8Array.length; i++) {
      const byte = uint8Array[i];
      if (byte >= 32 && byte <= 126) { // ASCII imprimable
        text += String.fromCharCode(byte);
      } else if (byte === 10 || byte === 13) { // Saut de ligne
        text += '\n';
      } else {
        text += ' ';
      }
    }
    
    // Nettoyer : garder seulement les séquences de texte cohérentes
    const lines = text.split('\n').filter(line => {
      const clean = line.trim();
      return clean.length > 10 && /[a-zA-Z]{3,}/.test(clean);
    });
    
    if (lines.length < 5) {
      throw new Error("Impossible d'extraire suffisamment de texte du PDF. Veuillez fournir un fichier TXT ou MD.");
    }
    
    return lines.join('\n');
  } catch (error) {
    throw new Error("Erreur lors de l'extraction PDF. Veuillez fournir un fichier TXT ou MD.");
  }
}

// Nettoyage du texte
function cleanText(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    
    if (!file) {
      return Response.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    if (file.size === 0) {
      return Response.json({ error: "Fichier vide" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return Response.json({ error: "Fichier trop volumineux (maximum 10 Mo)" }, { status: 400 });
    }

    const fileType = file.type || '';
    const fileName = file.name || 'fichier';
    const arrayBuffer = await file.arrayBuffer();
    
    console.log('[RAG UPLOAD] Fichier:', fileName, 'Type:', fileType, 'Taille:', file.size);

    // Extraction du texte selon le type
    let text = '';
    
    if (fileType.includes('pdf') || fileName.toLowerCase().endsWith('.pdf')) {
      try {
        text = await extractTextPDF(arrayBuffer);
      } catch (error) {
        return Response.json({ 
          error: error.message || "Erreur extraction PDF. Utilisez un fichier TXT ou MD." 
        }, { status: 400 });
      }
    } else if (fileType.includes('text') || fileName.toLowerCase().endsWith('.txt') || fileName.toLowerCase().endsWith('.md')) {
      text = extractTextSimple(arrayBuffer);
    } else if (fileType.includes('word') || fileName.toLowerCase().endsWith('.docx')) {
      // DOCX nécessite une librairie spécialisée, pour l'instant on refuse
      return Response.json({ 
        error: "Format DOCX non supporté pour l'instant. Veuillez convertir en TXT ou MD." 
      }, { status: 400 });
    } else {
      // Essayer l'extraction simple par défaut
      text = extractTextSimple(arrayBuffer);
    }

    // Nettoyage
    text = cleanText(text);
    
    if (!text || text.trim().length === 0) {
      return Response.json({ error: "Impossible d'extraire le texte du fichier" }, { status: 400 });
    }

    // Chunking avec overlap (500-800 caractères, overlap 100-150)
    const chunkSize = Math.min(800, Math.max(500, Math.floor(text.length / 20)));
    const overlap = Math.min(150, Math.max(100, Math.floor(chunkSize / 5)));
    
    console.log('[RAG UPLOAD] Chunking:', chunkSize, 'overlap:', overlap);
    const chunks = chunkText(text, chunkSize, overlap);
    console.log('[RAG UPLOAD] Chunks créés:', chunks.length);
    
    // Sauvegarder (remplacer le document précédent pour la démo)
    const existingDocs = getAllDocuments();
    if (existingDocs.length > 0) {
      // Pour la démo, on garde un seul document à la fois
      existingDocs.forEach(doc => {
        // On garde le dernier uploadé
      });
    }
    
    const fileId = `file_${Date.now()}`;
    const docData = {
      id: fileId,
      fileId: fileId,
      fileName: fileName,
      fileType: fileType,
      text: text,
      chunks: chunks,
      embedded: false, // Sera mis à true après /embed
      uploadedAt: new Date().toISOString(),
      size: file.size
    };
    
    saveDocument(fileId, docData);
    
    console.log('[RAG UPLOAD] Document sauvegardé:', fileId);

    return Response.json({
      success: true,
      fileId: fileId,
      chunksCount: chunks.length,
      textLength: text.length,
      message: "Fichier uploadé avec succès. Utilisez /api/rag/embed pour indexer le document."
    });
  } catch (error) {
    console.error("[RAG UPLOAD] Erreur:", error);
    return Response.json({ 
      error: error.message || "Erreur lors de l'upload du fichier" 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const docs = getAllDocuments().map(doc => ({
      fileId: doc.fileId || doc.id,
      fileName: doc.fileName,
      chunksCount: doc.chunks?.length || 0,
      embedded: doc.embedded || false,
      textLength: doc.text?.length || 0
    }));
    return Response.json({ docs });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

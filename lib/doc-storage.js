// Stockage en mémoire partagé pour les documents uploadés
// En production, utiliser une base de données (PostgreSQL, MongoDB, etc.)
// NOTE: En Next.js, le stockage en mémoire persiste entre les requêtes dans le même processus
// mais peut être réinitialisé lors d'un redémarrage ou d'un rechargement de module

// Utiliser une variable globale pour garantir la persistance
if (typeof global.documents === 'undefined') {
  global.documents = new Map();
}

const documents = global.documents;

export function saveDocument(docId, docData) {
  console.log('[DOC STORAGE] Sauvegarde:', docId, 'chunks:', docData.chunks?.length || 0);
  documents.set(docId, docData);
  console.log('[DOC STORAGE] Total documents:', documents.size);
  return docData;
}

export function getDocument(docId) {
  const doc = documents.get(docId);
  console.log('[DOC STORAGE] Récupération:', docId, doc ? 'trouvé' : 'non trouvé');
  return doc;
}

export function getAllDocuments() {
  const all = Array.from(documents.values());
  console.log('[DOC STORAGE] Tous les documents:', all.length);
  return all;
}

export function getDocumentByFileId(fileId) {
  const doc = Array.from(documents.values()).find(d => d.fileId === fileId || d.id === fileId);
  console.log('[DOC STORAGE] Récupération par fileId:', fileId, doc ? 'trouvé' : 'non trouvé');
  return doc;
}

export function deleteDocument(docId) {
  const deleted = documents.delete(docId);
  console.log('[DOC STORAGE] Suppression:', docId, deleted ? 'OK' : 'non trouvé');
  return deleted;
}

export function clearAllDocuments() {
  documents.clear();
  console.log('[DOC STORAGE] Tous les documents supprimés');
}


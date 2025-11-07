"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function RAGStudioPage() {
  const [file, setFile] = useState(null);
  const [fileId, setFileId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const [question, setQuestion] = useState("");
  const [topK, setTopK] = useState(3);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("LIVE"); // Toujours LIVE avec Hugging Face

  // Vérifier le mode au montage
  useEffect(() => {
    checkMode();
  }, []);

  const checkMode = async () => {
    // Le mode sera déterminé par la présence du token HF côté serveur
    // On l'affichera dans les résultats
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validation
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("Fichier trop volumineux (maximum 10 Mo)");
      return;
    }

    const ext = selectedFile.name.toLowerCase().split('.').pop();
    if (!['txt', 'md', 'pdf'].includes(ext)) {
      setError("Format non supporté. Utilisez .txt, .md ou .pdf");
      return;
    }

    setFile(selectedFile);
    setError(null);
    setResults(null);
    setFileId(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Veuillez sélectionner un fichier");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/rag/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de l'upload");
      }

      const data = await response.json();
      const uploadedFileId = data.fileId;
      setFileId(uploadedFileId);
      setError(null);
      
      // Auto-indexer après upload (avec le fileId correct)
      setIsIndexing(true);
      try {
        const embedResponse = await fetch("/api/rag/embed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileId: uploadedFileId }),
        });
        
        if (!embedResponse.ok) {
          const errorData = await embedResponse.json();
          throw new Error(errorData.error || "Erreur lors de l'indexation");
        }
        
        const embedData = await embedResponse.json();
        setMode(embedData.mode || "LIVE");
      } catch (embedErr) {
        console.error("Erreur indexation auto:", embedErr);
        setError(`Upload réussi mais indexation échouée: ${embedErr.message}. Vous pouvez réessayer manuellement.`);
      } finally {
        setIsIndexing(false);
      }
    } catch (err) {
      setError(err.message);
      console.error("Erreur upload:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleIndex = async () => {
    if (!fileId) {
      setError("Aucun fichier uploadé");
      return;
    }

    setIsIndexing(true);
    setError(null);

    try {
      const response = await fetch("/api/rag/embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de l'indexation");
      }

      const data = await response.json();
      setMode(data.mode || "DÉMO");
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Erreur indexation:", err);
    } finally {
      setIsIndexing(false);
    }
  };

  const handleAsk = async () => {
    if (!question.trim()) {
      setError("Veuillez entrer une question");
      return;
    }

    if (!fileId) {
      setError("Veuillez d'abord uploader et indexer un fichier");
      return;
    }

    setIsAsking(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch("/api/rag/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId, question, topK }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors du traitement");
      }

      const data = await response.json();
      setResults(data);
      setMode(data.mode || "LIVE");
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Erreur question:", err);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 16px 80px" }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/labs" style={{ color: "var(--accent)", fontSize: 14, fontFamily: "monospace" }}>
          ← Retour aux Labs
        </Link>
      </div>

      <h1 className="section-title" style={{ fontSize: 42, marginTop: 0, marginBottom: 16 }}>
        RAG Studio — Démonstration interactive
      </h1>

      {/* Badge Mode */}
      <div style={{ marginBottom: 32, display: "flex", alignItems: "center", gap: 16 }}>
        <span
          style={{
            fontSize: 12,
            fontFamily: "monospace",
            padding: "6px 12px",
            border: "2px solid #22c55e",
            background: "#dcfce7",
            color: "#22c55e",
            fontWeight: "bold",
          }}
        >
          ✓ Mode LIVE — Hugging Face API
        </span>
      </div>

      {/* Bloc 1 — Upload */}
      <div className="hero-card" style={{ marginBottom: 32 }}>
        <h2 style={{ marginTop: 0, marginBottom: 24, fontSize: 24 }}>1. Uploader et indexer un document</h2>
        
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 300px" }}>
            <input
              type="file"
              accept=".txt,.md,.pdf"
              onChange={handleFileSelect}
              disabled={isUploading || isIndexing}
              style={{
                width: "100%",
                padding: "12px",
                border: "2px solid var(--line-blueprint)",
                fontFamily: "inherit",
                fontSize: 15,
                background: "var(--bg)",
              }}
            />
            {file && (
              <p style={{ marginTop: 8, fontSize: 13, color: "var(--fg-muted)", fontFamily: "monospace" }}>
                Fichier sélectionné: {file.name} ({(file.size / 1024).toFixed(1)} Ko)
              </p>
            )}
          </div>
          
          <button
            onClick={handleUpload}
            disabled={!file || isUploading || isIndexing}
            className="btn primary"
            style={{ minWidth: 180 }}
          >
            {isUploading ? "[ Upload en cours... ]" : isIndexing ? "[ Indexation... ]" : "[ Uploader et indexer ]"}
          </button>
        </div>

        {fileId && (
          <div style={{ marginTop: 16, padding: "12px", background: "var(--bg-secondary)", border: "1px solid var(--accent)", fontSize: 13, fontFamily: "monospace" }}>
            ✓ Fichier uploadé (ID: {fileId}). Indexation {isIndexing ? "en cours..." : "terminée"}.
          </div>
        )}
      </div>

      {/* Bloc 2 — Question */}
      <div className="hero-card" style={{ marginBottom: 32 }}>
        <h2 style={{ marginTop: 0, marginBottom: 24, fontSize: 24 }}>2. Poser une question</h2>
        
        <div style={{ marginBottom: 16 }}>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ex: Quels sont les points clés du document ? Quelle est la conclusion ?"
            rows={4}
            disabled={!fileId || isAsking}
            style={{
              width: "100%",
              padding: "12px",
              border: "2px solid var(--line-blueprint)",
              fontFamily: "inherit",
              fontSize: 15,
              background: "var(--bg)",
              resize: "vertical",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 200px" }}>
            <label style={{ display: "block", marginBottom: 8, fontSize: 13, fontFamily: "monospace", textTransform: "uppercase" }}>
              Nombre de passages (Top-K): {topK}
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={topK}
              onChange={(e) => setTopK(Number(e.target.value))}
              disabled={isAsking}
              style={{ width: "100%" }}
            />
          </div>

          <button
            onClick={handleAsk}
            disabled={!fileId || !question.trim() || isAsking}
            className="btn primary"
            style={{ minWidth: 150 }}
          >
            {isAsking ? "[ Recherche... ]" : "[ Lancer la recherche ]"}
          </button>
        </div>
      </div>

      {/* Bloc 3 — Résultats */}
      {error && (
        <div className="hero-card" style={{ marginBottom: 32, background: "#fee", border: "2px solid #fcc", color: "#c00" }}>
          <strong>Erreur:</strong> {error}
        </div>
      )}

      {results && (
        <>
          {/* Top-K Preview */}
          <div className="hero-card" style={{ marginBottom: 24 }}>
            <h3 style={{ marginTop: 0, marginBottom: 20, fontSize: 20 }}>
              Passages les plus pertinents (Top-{results.topKPreview?.length || topK})
            </h3>
            {results.topKPreview?.map((chunk, idx) => (
              <div
                key={idx}
                style={{
                  marginBottom: 16,
                  padding: "16px",
                  border: "1px solid var(--line-blueprint)",
                  background: "var(--bg-secondary)",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    fontSize: 10,
                    color: "var(--accent)",
                    fontFamily: "monospace",
                    background: "var(--accent-light)",
                    padding: "4px 8px",
                    border: "1px solid var(--accent)",
                  }}
                >
                  Score: {chunk.score ? chunk.score.toFixed(3) : 'N/A'}
                </div>
                <div style={{ fontSize: 11, color: "var(--fg-muted)", marginBottom: 8, fontFamily: "monospace", marginTop: 20 }}>
                  {chunk.chunkId} @ {chunk.start}
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.7, color: "var(--fg)" }}>
                  {chunk.excerpt}
                </div>
              </div>
            ))}
          </div>

          {/* Réponse générée */}
          <div className="hero-card" style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 20 }}>Réponse générée</h3>
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "monospace",
                  color: "#22c55e",
                  background: "#dcfce7",
                  padding: "4px 8px",
                  border: "1px solid #22c55e",
                }}
              >
                ✓ Hugging Face Mistral-7B
              </span>
            </div>
            <div
              style={{
                padding: "24px",
                border: "2px solid var(--accent)",
                background: "var(--accent-light)",
                lineHeight: 1.8,
                fontSize: 15,
                whiteSpace: "pre-wrap",
                color: "var(--fg)",
              }}
            >
              {results.answer}
            </div>
          </div>

          {/* Références */}
          <div className="hero-card">
            <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: 18 }}>Références citées</h3>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {results.references?.map((ref, idx) => (
                <span
                  key={idx}
                  className="badge"
                  style={{
                    fontSize: 12,
                    fontFamily: "monospace",
                    padding: "6px 12px",
                    border: "1px solid var(--accent)",
                    background: "var(--accent-light)",
                  }}
                >
                  [{ref.chunkId}@{ref.start}]
                </span>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Bloc latéral — Explication */}
      <div className="hero-card" style={{ marginTop: 48, background: "var(--bg-secondary)" }}>
        <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: 18, color: "var(--accent)" }}>
          Étapes du RAG
        </h3>
        <ol style={{ margin: 0, paddingLeft: 20, lineHeight: 2, color: "var(--fg-muted)" }}>
          <li><strong style={{ color: "var(--fg)" }}>Upload</strong> : Téléchargement du fichier (PDF, TXT, MD)</li>
          <li><strong style={{ color: "var(--fg)" }}>Chunking</strong> : Découpage en segments de 500-800 caractères avec overlap</li>
          <li><strong style={{ color: "var(--fg)" }}>Embeddings</strong> : Vectorisation de chaque chunk (Hugging Face ou local)</li>
          <li><strong style={{ color: "var(--fg)" }}>Similarité</strong> : Comparaison cosinus entre la question et les chunks</li>
          <li><strong style={{ color: "var(--fg)" }}>Génération</strong> : Construction de la réponse à partir des Top-K passages (Mistral-7B ou local)</li>
          <li><strong style={{ color: "var(--fg)" }}>Citations</strong> : Références aux chunks utilisés [chunkId@start]</li>
        </ol>
      </div>
    </div>
  );
}

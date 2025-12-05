"use client";
import Link from "next/link";
import { useState } from "react";

const tools = [
  {
    id: "rag-multi-chat",
    name: "Chatbot IA multi-fournisseurs",
    description: "Branchez vos propres clés (Hugging Face, Azure OpenAI, Bedrock via API) et testez un chatbot IA configurable en temps réel.",
    category: "IA & LLM",
    color: "#0ea5e9"
  },
  {
    id: "anomaly-detector",
    name: "Détecteur d'Anomalies",
    description: "Détectez automatiquement les anomalies dans vos données avec des méthodes statistiques avancées. Testez avec des cas d'usage métier prêts à l'emploi.",
    category: "Data Science",
    color: "#ef4444"
  },
  {
    id: "test-data-generator",
    name: "Générateur de jeux de test",
    description: "Définissez la structure de vos datasets (colonnes, types, contraintes) et générez des jeux de test synthétiques, propulsés par vos propres clés LLM (HF, Azure, Bedrock).",
    category: "Data Science",
    color: "#22c55e"
  },
  {
    id: "text-to-sql",
    name: "Text-to-SQL",
    description: "Posez une question en français et obtenez automatiquement la requête SQL correspondante, puis visualisez les résultats.",
    category: "IA & LLM",
    color: "#8b5cf6"
  },
  {
    id: "prompt-engineering-challenge",
    name: "Évaluateur de Prompt",
    description: "Évaluez la qualité de vos prompts ! Le LLM analyse la précision, la cohérence, la complétude et le respect des bonnes pratiques (contexte, rôle, format attendu, etc.) avec un score détaillé et des recommandations.",
    category: "IA & LLM",
    color: "#ec4899"
  },
  {
    id: "learning-path-planner",
    name: "Planificateur de Formation Data/IA",
    description: "Décrivez votre profil et vos objectifs, et obtenez un roadmap d'apprentissage personnalisé sur 4-8 semaines avec modules, ressources et planning hebdomadaire. Branchez vos propres clés LLM.",
    category: "IA & LLM",
    color: "#10b981"
  },
  {
    id: "data-anonymizer",
    name: "Anonymiseur de Données RGPD",
    description: "Analysez vos données, détectez automatiquement les informations sensibles (PII) et anonymisez-les selon vos paramètres. Conforme RGPD. Support multi-providers LLM pour génération de données fictives.",
    category: "Data Science",
    color: "#6366f1"
  }
];

export default function LabPage() {
  const [selectedCategory, setSelectedCategory] = useState("Tous");

  const categories = ["Tous", ...new Set(tools.map(t => t.category))];
  const filteredTools = selectedCategory === "Tous" 
    ? tools 
    : tools.filter(t => t.category === selectedCategory);

  return (
    <div style={{ 
      width: "100%", 
      minHeight: "100vh",
      background: "var(--bg)"
    }}>
      {/* Header */}
      <div className="lab-header" style={{
        background: "var(--bg-secondary)",
        borderBottom: "2px solid var(--line-blueprint)",
        padding: "32px 24px",
        position: "sticky",
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: "1400px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div>
            <h1 className="lab-title" style={{
              fontSize: "32px",
              fontWeight: 700,
              marginBottom: "8px",
              color: "var(--fg)"
            }}>
              LAB — Outils Techniques
            </h1>
            <p className="lab-subtitle" style={{
              fontSize: "14px",
              color: "var(--fg-muted)",
              margin: 0
            }}>
              Découvrez mes outils techniques développés pour démontrer mon expertise
            </p>
          </div>
          <Link
            href="/"
            style={{
              padding: "10px 20px",
              background: "transparent",
              border: "2px solid var(--line-blueprint)",
              borderRadius: "8px",
              color: "var(--fg)",
              fontSize: "14px",
              fontWeight: 600,
              textDecoration: "none",
              fontFamily: "monospace",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = "var(--accent)";
              e.target.style.color = "var(--accent)";
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = "var(--line-blueprint)";
              e.target.style.color = "var(--fg)";
            }}
          >
            [ Retour ]
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "48px 24px"
      }}>
        {/* Filtres par catégorie */}
        <div style={{ marginBottom: "32px" }}>
          <div className="lab-category-filters" style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap"
          }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="lab-category-btn"
                style={{
                  padding: "10px 20px",
                  background: selectedCategory === cat ? "var(--accent)" : "var(--bg-secondary)",
                  border: `2px solid ${selectedCategory === cat ? "var(--accent)" : "var(--line-blueprint)"}`,
                  borderRadius: "8px",
                  color: selectedCategory === cat ? "var(--bg)" : "var(--fg)",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  fontFamily: "monospace",
                  textTransform: "uppercase",
                  letterSpacing: "1px"
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grille d'outils */}
        <div className="lab-tool-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
          gap: "24px"
        }}>
          {filteredTools.map(tool => (
            <Link
              key={tool.id}
              href={`/lab/${tool.id}`}
              className="lab-tool-card"
              style={{
                textDecoration: "none",
                display: "block"
              }}
            >
              <div style={{
                background: "var(--bg-secondary)",
                border: "2px solid var(--line-blueprint)",
                borderRadius: "12px",
                padding: "32px",
                height: "100%",
                transition: "all 0.3s ease",
                cursor: "pointer"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = tool.color;
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = `0 8px 24px ${tool.color}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--line-blueprint)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
              >
                <div style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "8px",
                  background: `${tool.color}20`,
                  border: `2px solid ${tool.color}`,
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <div style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "4px",
                    background: tool.color
                  }} />
                </div>
                <div style={{
                  fontSize: "12px",
                  color: tool.color,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: "8px",
                  fontFamily: "monospace"
                }}>
                  {tool.category}
                </div>
                <h3 style={{
                  fontSize: "24px",
                  fontWeight: 700,
                  marginBottom: "12px",
                  color: "var(--fg)"
                }}>
                  {tool.name}
                </h3>
                <p style={{
                  fontSize: "14px",
                  color: "var(--fg-muted)",
                  lineHeight: 1.7,
                  marginBottom: "24px"
                }}>
                  {tool.description}
                </p>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  color: tool.color,
                  fontSize: "14px",
                  fontWeight: 600,
                  fontFamily: "monospace"
                }}>
                  Accéder à l'outil →
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredTools.length === 0 && (
          <div style={{
            textAlign: "center",
            padding: "64px",
            color: "var(--fg-muted)"
          }}>
            Aucun outil dans cette catégorie
          </div>
        )}
      </div>
    </div>
  );
}

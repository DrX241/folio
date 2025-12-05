"use client";
import { useParams } from "next/navigation";
import TextToSQL from "@/components/TextToSQL";
import AnomalyDetector from "@/components/AnomalyDetector";
import RAGMultiProviderChat from "@/components/RAGMultiProviderChat";
import TestDataGenerator from "@/components/TestDataGenerator";
import PromptEvaluator from "@/components/PromptEvaluator";
import LearningPathPlanner from "@/components/LearningPathPlanner";
import DataAnonymizer from "@/components/DataAnonymizer";
import Link from "next/link";

const toolComponents = {
  "text-to-sql": TextToSQL,
  "anomaly-detector": AnomalyDetector,
  "rag-multi-chat": RAGMultiProviderChat,
  "test-data-generator": TestDataGenerator,
  "prompt-engineering-challenge": PromptEvaluator,
  "learning-path-planner": LearningPathPlanner,
  "data-anonymizer": DataAnonymizer
};

const toolNames = {
  "text-to-sql": "Text-to-SQL",
  "anomaly-detector": "Détecteur d'Anomalies",
  "rag-multi-chat": "Chatbot IA multi-fournisseurs",
  "test-data-generator": "Générateur de jeux de test",
  "prompt-engineering-challenge": "Évaluateur de Prompt",
  "learning-path-planner": "Planificateur de Formation Data/IA",
  "data-anonymizer": "Anonymiseur de Données RGPD"
};

export default function ToolPage() {
  const params = useParams();
  const toolId = params.tool;
  const ToolComponent = toolComponents[toolId];

  if (!ToolComponent) {
    return (
      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "80px 24px",
        textAlign: "center"
      }}>
        <h1 style={{ fontSize: "48px", marginBottom: "16px" }}>Outil non trouvé</h1>
        <p style={{ color: "var(--fg-muted)", marginBottom: "32px" }}>
          L'outil demandé n'existe pas.
        </p>
        <Link
          href="/lab"
          className="btn primary"
        >
          Retour au LAB
        </Link>
      </div>
    );
  }

  return (
    <div style={{
      width: "100%",
      minHeight: "100vh",
      background: "var(--bg)"
    }}>
      {/* Header avec navigation */}
      <div style={{
        background: "var(--bg-secondary)",
        borderBottom: "2px solid var(--line-blueprint)",
        padding: "24px",
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
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link
              href="/lab"
              style={{
                padding: "8px 16px",
                background: "transparent",
                border: "1px solid var(--line-blueprint)",
                borderRadius: "6px",
                color: "var(--fg)",
                fontSize: "12px",
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
              ← LAB
            </Link>
            <div style={{
              width: "1px",
              height: "24px",
              background: "var(--line-blueprint)"
            }} />
            <h1 style={{
              fontSize: "24px",
              fontWeight: 700,
              margin: 0,
              color: "var(--fg)"
            }}>
              {toolNames[toolId]}
            </h1>
          </div>
          <Link
            href="/"
            style={{
              padding: "8px 16px",
              background: "transparent",
              border: "1px solid var(--line-blueprint)",
              borderRadius: "6px",
              color: "var(--fg)",
              fontSize: "12px",
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
            [ Accueil ]
          </Link>
        </div>
      </div>

      {/* Contenu de l'outil */}
      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "48px 24px"
      }}>
        <ToolComponent />
      </div>
    </div>
  );
}


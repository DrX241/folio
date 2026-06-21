"use client";
import { useEffect, useRef, useState } from "react";

const EXPERIENCES = [
  {
    period: "2025 — Présent",
    title: "Expert & Tech Lead IA",
    subtitle: "Stratégie, architecture et déploiement",
    sector: "Infrastructures énergétiques",
    description: "Programme de transformation des processus métiers d'un acteur majeur, avec intégration de l'IA dans les chaînes de décision, d'exploitation et de performance opérationnelle.",
    items: [
      "Pilotage transverse des initiatives IA à l'échelle groupe",
      "Définition de la stratégie IA et feuilles de route pluriannuelles",
      "Développement d'agents IA sur Microsoft Copilot Studio",
      "Intégration et exploitation de données via Snowflake",
    ],
    tags: ["Tech Lead IA", "Copilot Studio", "Snowflake", "Gouvernance IA"],
    color: "#2563eb",
    metric: null,
  },
  {
    period: "2024 — 2025",
    title: "Tech Lead IA Générative",
    subtitle: "Programme R&D et innovation",
    sector: "Énergie & R&D",
    description: "Accélération de la recherche scientifique par l'intégration de l'IA générative dans les processus d'idéation et d'exploration technologique.",
    items: [
      "Pilotage d'un portefeuille de 120+ projets IA",
      "Conception de plateformes LLM et architectures RAG sécurisées",
      "Formation et acculturation de 200+ chercheurs",
    ],
    tags: ["IA Générative", "RAG", "LLM", "R&D"],
    color: "#8b5cf6",
    metric: { value: "120+", label: "projets IA" },
  },
  {
    period: "2021 — Présent",
    title: "Manager & Tech Lead Data & IA",
    subtitle: "Transformation et industrialisation",
    sector: "Conseil grands comptes",
    description: "Conseil auprès de grands groupes dans leurs programmes de transformation Data & IA visant l'industrialisation des usages.",
    items: [
      "Structuration de stratégies IA pour grands comptes",
      "Déploiement de plateformes GenAI et moteurs RAG",
      "Cadrage d'architectures Data & IA",
    ],
    tags: ["Manager", "GenAI", "Consulting"],
    color: "#f59e0b",
    metric: null,
  },
  {
    period: "2022 — 2024",
    title: "Chef de projet MOE Data & BI",
    subtitle: "Pilotage de la performance contractuelle",
    sector: "Transport public",
    description: "Pilotage des dispositifs Data soutenant le suivi de la performance financière et opérationnelle, dans un environnement multi-SI complexe.",
    items: [
      "Gouvernance Data et pilotage de 300+ indicateurs stratégiques",
      "Conception de dispositifs décisionnels Power BI",
      "Structuration et fiabilisation de flux multi-SI",
    ],
    tags: ["Power BI", "Gouvernance Data", "MOE"],
    color: "#10b981",
    metric: { value: "300+", label: "indicateurs" },
  },
  {
    period: "2020 — 2021",
    title: "IT Project Manager",
    subtitle: "Solutions décisionnelles Groupe",
    sector: "Luxe & Retail",
    description: "Pilotage de solutions décisionnelles stratégiques au sein de la DSI Groupe pour les directions RH et Juridique.",
    items: [
      "Pilotage de projets décisionnels RH et Juridique",
      "Conception de solutions BI pour le pilotage des effectifs",
      "Structuration de reportings exécutifs",
    ],
    tags: ["BI", "DSI Groupe", "Luxe"],
    color: "#ef4444",
    metric: null,
  },
  {
    period: "2018 — 2020",
    title: "Master Data & AI Manager",
    subtitle: "Data engineering industriel",
    sector: "Industrie aéronautique",
    description: "Structuration des fondations Data industrielles pour permettre les futurs usages IA et la maintenance prédictive sur des systèmes critiques.",
    items: [
      "Structuration des fondations data pour usages IA industriels",
      "Développement d'analyses prédictives pour maintenance moteurs",
      "Préparation et fiabilisation de données techniques à grande échelle",
    ],
    tags: ["Data Engineering", "ML", "Maintenance prédictive"],
    color: "#06b6d4",
    metric: null,
  },
];

function ExperienceCard({ exp, index, isVisible }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "140px 1fr",
        gap: 0,
        marginBottom: 0,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "none" : "translateX(-20px)",
        transition: `opacity 0.6s ease ${index * 100}ms, transform 0.6s ease ${index * 100}ms`,
      }}
    >
      {/* Colonne date */}
      <div style={{
        paddingTop: 28,
        paddingRight: 32,
        textAlign: "right",
        position: "relative",
      }}>
        <div style={{
          fontSize: 11, fontFamily: "monospace",
          color: hovered ? exp.color : "var(--fg-muted)",
          fontWeight: 600, letterSpacing: "1px",
          transition: "color 0.2s",
          whiteSpace: "nowrap",
        }}>
          {exp.period}
        </div>
        <div style={{
          fontSize: 10, fontFamily: "monospace",
          color: "var(--fg-muted)", opacity: 0.6,
          marginTop: 4, textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}>
          {exp.sector}
        </div>
        {/* Dot sur la timeline */}
        <div style={{
          position: "absolute",
          right: -8,
          top: 34,
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: hovered ? exp.color : "var(--bg)",
          border: `2px solid ${hovered ? exp.color : "var(--line-blueprint)"}`,
          transition: "all 0.3s ease",
          zIndex: 2,
          boxShadow: hovered ? `0 0 12px ${exp.color}60` : "none",
        }} />
      </div>

      {/* Ligne verticale */}
      <div style={{ position: "relative", paddingLeft: 40 }}>
        <div style={{
          position: "absolute",
          left: 0, top: 0, bottom: 0,
          width: "2px",
          background: `linear-gradient(to bottom, ${exp.color}60, var(--line-blueprint)20)`,
          transition: "opacity 0.3s",
          opacity: hovered ? 1 : 0.4,
        }} />

        {/* Card */}
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            padding: "28px 32px",
            border: `1px solid ${hovered ? exp.color : "var(--line)"}`,
            background: hovered ? `${exp.color}06` : "var(--bg-secondary)",
            marginBottom: 2,
            cursor: "default",
            transition: "all 0.3s ease",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Accent bar gauche */}
          <div style={{
            position: "absolute", left: 0, top: 0, bottom: 0,
            width: hovered ? 3 : 0,
            background: exp.color,
            transition: "width 0.3s ease",
          }} />

          {/* Metric badge */}
          {exp.metric && (
            <div style={{
              position: "absolute", top: 24, right: 24,
              padding: "6px 14px",
              border: `1px solid ${exp.color}40`,
              background: `${exp.color}10`,
              fontSize: 13, fontWeight: 800, fontFamily: "monospace",
              color: exp.color, letterSpacing: "-0.5px",
            }}>
              {exp.metric.value} <span style={{ fontWeight: 400, fontSize: 11 }}>{exp.metric.label}</span>
            </div>
          )}

          <h3 style={{
            fontSize: 22, fontWeight: 800, margin: "0 0 4px",
            color: "var(--fg)", letterSpacing: "-0.5px",
          }}>
            {exp.title}
          </h3>
          <div style={{
            fontSize: 13, color: exp.color, fontFamily: "monospace",
            marginBottom: 14, fontWeight: 600,
          }}>
            {exp.subtitle}
          </div>
          <p style={{
            fontSize: 14, color: "var(--fg-muted)", lineHeight: 1.7,
            margin: "0 0 16px", maxWidth: 560,
          }}>
            {exp.description}
          </p>

          {hovered && (
            <ul style={{
              margin: "0 0 18px", paddingLeft: 16,
              fontSize: 13, color: "var(--fg-muted)", lineHeight: 1.8,
            }}>
              {exp.items.map((item, i) => (
                <li key={i} style={{ marginBottom: 4 }}>{item}</li>
              ))}
            </ul>
          )}

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {exp.tags.map((tag, i) => (
              <span key={i} style={{
                fontSize: 11, fontFamily: "monospace",
                padding: "3px 10px",
                border: `1px solid ${exp.color}40`,
                color: exp.color,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TimelineSection() {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.05 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="experiences"
      style={{
        width: "100%", background: "var(--bg)",
        padding: "120px 0", position: "relative",
      }}
    >
      {/* Ligne verticale blueprint gauche */}
      <div style={{
        position: "absolute", left: "5%", top: 0, bottom: 0,
        width: "2px", background: "var(--line-blueprint)", opacity: 0.3,
      }} />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>

        {/* Header section */}
        <div style={{
          marginBottom: 72,
          opacity: visible ? 1 : 0,
          transform: visible ? "none" : "translateY(16px)",
          transition: "opacity 0.7s ease, transform 0.7s ease",
        }}>
          <div style={{
            fontSize: 11, fontFamily: "monospace", fontWeight: 600,
            letterSpacing: "3px", textTransform: "uppercase",
            color: "var(--accent)", marginBottom: 16,
          }}>
            Expériences clés
          </div>
          <h2 style={{
            fontSize: "clamp(36px, 5vw, 64px)",
            fontWeight: 900, letterSpacing: "-2px",
            lineHeight: 1, margin: 0, color: "var(--fg)",
          }}>
            7 ans de terrain,<br />
            <span style={{ color: "var(--accent)" }}>secteurs exigeants.</span>
          </h2>
        </div>

        {/* Timeline */}
        <div>
          {EXPERIENCES.map((exp, i) => (
            <ExperienceCard key={i} exp={exp} index={i} isVisible={visible} />
          ))}
        </div>
      </div>
    </section>
  );
}

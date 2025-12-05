"use client";
import { useEffect, useState, useRef, useCallback } from "react";

export default function CaseStudyCard({ project, index }) {
  const [isVisible, setIsVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [counters, setCounters] = useState({});
  const cardRef = useRef(null);

  const animateCounters = useCallback(() => {
    if (!project?.metrics) return;
    
    project.metrics.forEach((metric) => {
      const target = metric.value;
      const duration = 2000;
      const steps = 60;
      const increment = target / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        setCounters((prev) => ({
          ...prev,
          [metric.key]: Math.floor(current)
        }));
      }, duration / steps);
    });
  }, [project?.metrics]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Démarrer l'animation des compteurs
          animateCounters();
        }
      },
      { threshold: 0.2 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, [animateCounters]);

  // Vérification de sécurité après les hooks
  if (!project) {
    return null;
  }

  const steps = [
    { label: "Problème", content: project.problem, icon: "⚠️" },
    { label: "Solution", content: project.solution, icon: "🔧" },
    { label: "Résultat", content: project.result, icon: "✅" }
  ];

  return (
    <div
      ref={cardRef}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(30px)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
        transitionDelay: `${index * 0.1}s`
      }}
    >
      <div
        className="case-study-card"
        style={{
          border: "2px solid var(--line-blueprint)",
          background: "var(--bg-secondary)",
          padding: "32px",
          position: "relative",
          marginBottom: "40px"
        }}
      >
        {/* Coin décoratif */}
        <div
          style={{
            position: "absolute",
            top: "-2px",
            left: "-2px",
            width: "20px",
            height: "20px",
            borderTop: "2px solid var(--accent)",
            borderLeft: "2px solid var(--accent)"
          }}
        />

        {/* En-tête */}
        <div style={{ marginBottom: "24px" }}>
          <div
            className="case-study-subtitle"
            style={{
              fontSize: 11,
              color: "var(--accent)",
              fontFamily: "monospace",
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginBottom: "8px"
            }}
          >
            {project.client} • {project.period}
          </div>
          <h3
            className="case-study-title"
            style={{
              margin: 0,
              fontSize: 28,
              fontWeight: 700,
              marginBottom: "8px",
              color: "var(--fg)"
            }}
          >
            {project.title}
          </h3>
          <div
            style={{
              fontSize: 14,
              color: "var(--fg-muted)",
              lineHeight: 1.6
            }}
          >
            {project.role}
          </div>
        </div>

        {/* Timeline narrative (Problème → Solution → Résultat) */}
        <div style={{ marginBottom: "32px" }}>
          <div
            className="case-study-steps"
            style={{
              display: "flex",
              gap: "16px",
              marginBottom: "20px",
              flexWrap: "wrap"
            }}
          >
            {steps.map((step, idx) => (
              <button
                key={idx}
                onClick={() => setActiveStep(idx)}
                className="case-study-step-btn"
                style={{
                  flex: 1,
                  minWidth: "120px",
                  padding: "12px 16px",
                  border: "2px solid",
                  borderColor:
                    activeStep === idx
                      ? "var(--accent)"
                      : "var(--line-blueprint)",
                  background:
                    activeStep === idx
                      ? "var(--accent-light)"
                      : "transparent",
                  color:
                    activeStep === idx ? "var(--accent)" : "var(--fg-muted)",
                  fontFamily: "monospace",
                  fontSize: 12,
                  fontWeight: activeStep === idx ? 600 : 400,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
                onMouseEnter={(e) => {
                  if (activeStep !== idx) {
                    e.target.style.borderColor = "var(--accent)";
                    e.target.style.color = "var(--accent)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeStep !== idx) {
                    e.target.style.borderColor = "var(--line-blueprint)";
                    e.target.style.color = "var(--fg-muted)";
                  }
                }}
              >
                <span>{step.icon}</span>
                <span>{step.label}</span>
              </button>
            ))}
          </div>

          {/* Contenu de l'étape active */}
          <div
            style={{
              padding: "20px",
              background: "var(--bg)",
              border: "1px solid var(--line)",
              minHeight: "100px",
              fontSize: 15,
              lineHeight: 1.8,
              color: "var(--fg-muted)"
            }}
          >
            {steps[activeStep].content}
          </div>
        </div>

        {/* Métriques animées */}
        {project.metrics && project.metrics.length > 0 && (
          <div
            className="case-study-metrics"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "16px",
              marginBottom: "32px",
              padding: "20px",
              background: "var(--bg)",
              border: "1px solid var(--line)"
            }}
          >
            {project.metrics.map((metric) => (
              <div key={metric.key} className="case-study-metric" style={{ textAlign: "center" }}>
                <div
                  className="case-study-metric-value"
                  style={{
                    fontSize: 32,
                    fontWeight: 700,
                    color: "var(--accent)",
                    fontFamily: "monospace",
                    marginBottom: "4px"
                  }}
                >
                  {counters[metric.key] !== undefined
                    ? counters[metric.key]
                    : 0}
                  {metric.suffix}
                </div>
                <div
                  className="case-study-metric-label"
                  style={{
                    fontSize: 12,
                    color: "var(--fg-muted)",
                    fontFamily: "monospace",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}
                >
                  {metric.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stack technique */}
        {project.stack && (
          <div style={{ marginBottom: "24px" }}>
            <div
              style={{
                fontSize: 12,
                color: "var(--fg-muted)",
                fontFamily: "monospace",
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "12px"
              }}
            >
              Stack technique
            </div>
            <div
              className="case-study-tags"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px"
              }}
            >
              {project.stack.map((tech, idx) => (
                <span
                  key={idx}
                  className="badge case-study-tag"
                  style={{
                    fontSize: 13,
                    padding: "6px 12px"
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Timeline des phases */}
        {project.phases && project.phases.length > 0 && (
          <div>
            <div
              style={{
                fontSize: 12,
                color: "var(--fg-muted)",
                fontFamily: "monospace",
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "16px"
              }}
            >
              Phases du projet
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                position: "relative",
                paddingLeft: "24px"
              }}
            >
              {/* Ligne verticale */}
              <div
                style={{
                  position: "absolute",
                  left: "8px",
                  top: "0",
                  bottom: "0",
                  width: "2px",
                  background: "var(--line-blueprint)"
                }}
              />
              {project.phases.map((phase, idx) => (
                <div
                  key={idx}
                  style={{
                    position: "relative",
                    paddingLeft: "20px"
                  }}
                >
                  {/* Point */}
                  <div
                    style={{
                      position: "absolute",
                      left: "-16px",
                      top: "6px",
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      background: "var(--accent)",
                      border: "3px solid var(--bg-secondary)",
                      zIndex: 2
                    }}
                  />
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--accent)",
                      fontFamily: "monospace",
                      marginBottom: "4px"
                    }}
                  >
                    {phase.period}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      marginBottom: "4px",
                      color: "var(--fg)"
                    }}
                  >
                    {phase.title}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--fg-muted)",
                      lineHeight: 1.6
                    }}
                  >
                    {phase.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


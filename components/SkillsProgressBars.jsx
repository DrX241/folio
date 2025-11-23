"use client";
import { useEffect, useState, useRef } from "react";

export default function SkillsProgressBars({ technologies, isVisible, selectedSkill, skillToTechnologies }) {
  const [animatedLevels, setAnimatedLevels] = useState({});
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (isVisible && !hasAnimated.current) {
      hasAnimated.current = true;
      technologies.forEach((tech, index) => {
        setTimeout(() => {
          let current = 0;
          const target = tech.level;
          const duration = 1500;
          const steps = 60;
          const increment = target / steps;

          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              current = target;
              clearInterval(timer);
            }
            setAnimatedLevels((prev) => ({
              ...prev,
              [tech.name]: Math.floor(current)
            }));
          }, duration / steps);
        }, index * 100);
      });
    }
  }, [isVisible, technologies]);

  // Filtrer les technologies selon la compétence sélectionnée
  const getFilteredTechnologies = () => {
    if (!selectedSkill || !skillToTechnologies) {
      return technologies;
    }

    const relatedTechs = skillToTechnologies[selectedSkill.id] || [];
    if (relatedTechs.length === 0) {
      return technologies; // Si pas de mapping, afficher toutes
    }

    return technologies.filter((tech) => relatedTechs.includes(tech.name));
  };

  const filteredTechs = getFilteredTechnologies();

  // Group by category
  const groupedTechs = filteredTechs.reduce((acc, tech) => {
    if (!acc[tech.category]) {
      acc[tech.category] = [];
    }
    acc[tech.category].push(tech);
    return acc;
  }, {});

  return (
    <div style={{ width: "100%" }}>
      {selectedSkill && (
        <div
          style={{
            marginBottom: "24px",
            padding: "12px",
            background: "var(--bg-secondary)",
            border: "1px solid var(--accent)",
            borderRadius: "4px",
            fontSize: "12px",
            color: "var(--fg-muted)",
            fontFamily: "monospace"
          }}
        >
          Technologies liées à : <strong style={{ color: "var(--accent)" }}>{selectedSkill.name}</strong>
        </div>
      )}
      {Object.keys(groupedTechs).length > 0 ? (
        Object.entries(groupedTechs).map(([category, techs]) => (
          <div key={category} style={{ marginBottom: "32px" }}>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: 600,
                marginBottom: "16px",
                color: "var(--accent)",
                fontFamily: "monospace",
                textTransform: "uppercase",
                letterSpacing: "1px"
              }}
            >
              {category}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {techs.map((tech) => {
                const level = animatedLevels[tech.name] || 0;
                const isHighlighted = selectedSkill && skillToTechnologies && 
                  (skillToTechnologies[selectedSkill.id] || []).includes(tech.name);
                
                return (
                  <div 
                    key={tech.name} 
                    style={{ 
                      position: "relative",
                      opacity: selectedSkill && !isHighlighted ? 0.3 : 1,
                      transition: "opacity 0.3s ease"
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "8px"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span
                          style={{
                            fontSize: "14px",
                            fontWeight: 500,
                            color: "var(--fg)"
                          }}
                        >
                          {tech.name}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: "14px",
                          fontFamily: "monospace",
                          color: isHighlighted ? selectedSkill.color : "var(--accent)",
                          fontWeight: 600
                        }}
                      >
                        {level}%
                      </span>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: "8px",
                        background: "var(--line-blueprint)",
                        borderRadius: "4px",
                        overflow: "hidden",
                        position: "relative"
                      }}
                    >
                      <div
                        style={{
                          width: `${level}%`,
                          height: "100%",
                          background: isHighlighted ? selectedSkill.color : "var(--accent)",
                          borderRadius: "4px",
                          transition: "width 0.3s ease, background 0.3s ease",
                          position: "relative",
                          overflow: "hidden"
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background:
                              "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                            animation: "shimmer 2s infinite"
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      ) : (
        <div
          style={{
            padding: "24px",
            textAlign: "center",
            color: "var(--fg-muted)",
            fontFamily: "monospace",
            fontSize: "14px"
          }}
        >
          Aucune technologie associée à cette compétence
        </div>
      )}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}

"use client";
import { useEffect, useRef, useState } from "react";
import SkillsRadarChart from "./SkillsRadarChart";
import SkillsProgressBars from "./SkillsProgressBars";
import { skills, technologies, skillToTechnologies } from "@/lib/skills";

export default function SkillsSection() {
  // Sélectionner une compétence par défaut pour activer le filtre "Expertise & Technologies"
  const defaultSkill = skills.find((skill) => skill.id === "strategie-ia") || skills[0] || null;
  const [selectedSkill, setSelectedSkill] = useState(defaultSkill);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  const handleSkillClick = (skill) => {
    if (!skill) return;
    if (selectedSkill?.id === skill.id) {
      setSelectedSkill(null);
      return;
    }
    setSelectedSkill(skill);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        width: "100%",
        background: "var(--bg)",
        padding: "0",
        position: "relative",
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(30px)",
        transition: "opacity 0.8s ease, transform 0.8s ease"
      }}
    >
      {/* Ligne de connexion verticale */}
      <div
        style={{
          position: "absolute",
          left: "5%",
          top: 0,
          bottom: 0,
          width: "2px",
          background: "var(--line-blueprint)",
          zIndex: 0
        }}
      />

      <div
        className="skills-section"
        style={{
          maxWidth: "1400px",
          width: "100%",
          margin: "0 auto",
          padding: "120px 24px",
          position: "relative",
          zIndex: 1
        }}
      >
        {/* Titre de section */}
        <div
          style={{
            marginBottom: "80px",
            paddingLeft: "48px",
            position: "relative"
          }}
        >
          {/* Point de connexion */}
          <div
            style={{
              position: "absolute",
              left: "-48px",
              top: "8px",
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: "var(--accent)",
              border: "3px solid var(--bg)",
              zIndex: 2
            }}
          />
          <div
            style={{
              fontSize: 14,
              color: "var(--accent)",
              fontWeight: 600,
              letterSpacing: "2px",
              fontFamily: "monospace",
              textTransform: "uppercase",
              marginBottom: "16px"
            }}
          >
            Compétences
          </div>
          <h2
            className="skills-title"
            style={{
              fontSize: 48,
              fontWeight: 700,
              margin: 0,
              marginBottom: "16px",
              color: "var(--fg)"
            }}
          >
            Expertise & Technologies
          </h2>
          <p
            style={{
              fontSize: 18,
              lineHeight: 1.8,
              color: "var(--fg-muted)"
            }}
          >
            Cliquez sur une compétence pour filtrer les technologies correspondantes.
          </p>
        </div>

        {/* Contenu principal */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "80px",
            paddingLeft: "48px"
          }}
        >
          {/* Colonne gauche - Graphique radar (STICKY) */}
          <div
            className="skills-radar"
            style={{
              position: "sticky",
              top: "100px",
              alignSelf: "flex-start",
              height: "fit-content"
            }}
          >
            <SkillsRadarChart
              skills={skills}
              selectedSkill={selectedSkill}
              onSkillClick={handleSkillClick}
            />
          </div>

          {/* Colonne droite - Barres de progression */}
          <div>
            {/* Texte contextuel au-dessus des technologies */}
            {selectedSkill && selectedSkill.contextDescription && (
              <div
                style={{
                  marginBottom: "32px",
                  padding: "24px",
                  border: `2px solid ${selectedSkill.color}`,
                  background: "var(--bg-secondary)",
                  borderRadius: "12px",
                  boxShadow: `0 4px 20px ${selectedSkill.color}20`
                }}
              >
                <h3
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    marginBottom: "16px",
                    color: selectedSkill.color,
                    fontFamily: "monospace",
                    textTransform: "uppercase",
                    letterSpacing: "1px"
                  }}
                >
                  {selectedSkill.name}
                </h3>

                <p
                  style={{
                    fontSize: "14px",
                    color: "var(--fg)",
                    lineHeight: 1.7,
                    margin: 0
                  }}
                >
                  {selectedSkill.contextDescription}
                </p>
              </div>
            )}

            <SkillsProgressBars 
              technologies={technologies} 
              isVisible={isVisible}
              selectedSkill={selectedSkill}
              skillToTechnologies={skillToTechnologies}
            />
          </div>
        </div>
      </div>
    </section>
  );
}


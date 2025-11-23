"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import TypewriterTitle from "@/components/TypewriterTitle";
import CaseStudyCard from "@/components/CaseStudyCard";
import SkillsSection from "@/components/SkillsSection";
import { caseStudies } from "@/lib/case-studies";
import { skillToProjects } from "@/lib/skills";

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [scrollY, setScrollY] = useState(0);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [filteredProjects, setFilteredProjects] = useState(caseStudies);

  useEffect(() => {
    setIsVisible(true);
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (selectedSkill) {
      const projectIds = skillToProjects[selectedSkill.id] || [];
      const filtered = caseStudies.filter((project) =>
        projectIds.includes(project.id)
      );
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects(caseStudies);
    }
  }, [selectedSkill]);

  const handleSkillFilter = (skill) => {
    setSelectedSkill(skill);
  };

  return (
    <div style={{ width: "100%", maxWidth: "100%", margin: 0, padding: 0 }}>
      {/* Hero Section - Full Width avec profil fixe et expériences défilantes */}
      <section style={{ 
        width: "100%",
        minHeight: "200vh", // Hauteur suffisante pour permettre le scroll
        display: "flex",
        position: "relative",
        background: "var(--bg)",
        padding: "0"
      }}>
        {/* Ligne de connexion verticale à gauche */}
        <div style={{
          position: "fixed",
          left: "5%",
          top: 0,
          bottom: 0,
          width: "2px",
          background: "var(--line-blueprint)",
          zIndex: 0
        }} />

        <div style={{ 
          maxWidth: "1400px",
          width: "100%",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gap: 80,
          padding: "80px 24px",
          position: "relative",
          zIndex: 1
        }}>
          {/* Colonne gauche - Profil FIXE */}
          <div style={{ 
            position: "sticky",
            top: "80px",
            alignSelf: "flex-start",
            height: "fit-content",
            opacity: isVisible ? 1 : 0,
            transition: "opacity 1s ease"
          }}>
            {/* Point de connexion */}
            <div style={{
              position: "absolute",
              left: "-60px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              background: "var(--accent)",
              border: "3px solid var(--bg)",
              zIndex: 2
            }} />
            
            {/* Titre fixe en haut */}
            <div style={{ 
              fontSize: 14, 
              color: "var(--accent)", 
              fontWeight: 600, 
              letterSpacing: "2px", 
              fontFamily: "monospace", 
              textTransform: "uppercase", 
              marginBottom: 24,
              position: "sticky",
              top: "80px",
              background: "var(--bg)",
              paddingBottom: "16px",
              paddingTop: "16px",
              zIndex: 10,
              borderBottom: "1px solid var(--line)",
              marginTop: "-16px"
            }}>
              EDDY MISSONI
            </div>
            <TypewriterTitle />
            <div style={{
              padding: "24px",
              border: "2px solid var(--line-blueprint)",
              background: "var(--bg-secondary)",
              marginBottom: 32,
              position: "relative"
            }}>
              <div style={{
                position: "absolute",
                top: "-2px",
                left: "-2px",
                width: "20px",
                height: "20px",
                borderTop: "2px solid var(--accent)",
                borderLeft: "2px solid var(--accent)"
              }} />
              <p style={{ 
                fontSize: 16, 
                lineHeight: 1.8, 
                margin: 0,
                fontStyle: "italic",
                color: "var(--fg-muted)"
              }}>
                Je construis des projets <strong style={{ color: "var(--accent)" }}>Data, IA et SI</strong> en commençant toujours par l'essentiel : <strong style={{ color: "var(--accent)" }}>comprendre, cadrer, simplifier</strong>.<br />
                J'assure le <strong style={{ color: "var(--accent)" }}>"quoi"</strong> et le <strong style={{ color: "var(--accent)" }}>"quand"</strong> en tant que <strong style={{ color: "var(--accent)" }}>chef de projet</strong>, et le <strong style={{ color: "var(--accent)" }}>"comment bien"</strong> en tant que <strong style={{ color: "var(--accent)" }}>Tech Lead</strong>.
              </p>
            </div>
            <div className="actions" style={{ flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
              <Link className="btn primary" href="/about" style={{ fontSize: 16, padding: "16px 32px", width: "100%", textAlign: "center" }}>
                [ En savoir plus ]
              </Link>
              <Link className="btn" href="/lab" style={{ fontSize: 16, padding: "16px 32px", width: "100%", textAlign: "center", border: "2px solid var(--accent)", background: "transparent", color: "var(--accent)" }}>
                [ Accès au LAB ]
              </Link>
            </div>
          </div>

          {/* Colonne droite - Expériences DÉFILANTES */}
          <div style={{ 
            position: "relative",
            paddingTop: "0"
          }}>
            {/* Ligne de timeline verticale - s'étend sur toute la hauteur */}
            <div style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: "2px",
              background: "var(--line-blueprint)",
              zIndex: 0
            }} />

            <div style={{ paddingLeft: "48px", position: "relative", paddingTop: "0" }}>
              <div style={{ 
                fontSize: 14, 
                color: "var(--accent)", 
                fontWeight: 600, 
                letterSpacing: "2px", 
                fontFamily: "monospace", 
                textTransform: "uppercase", 
                marginBottom: 24,
                position: "sticky",
                top: "80px",
                background: "var(--bg)",
                paddingBottom: "16px",
                paddingTop: "16px",
                zIndex: 10,
                borderBottom: "1px solid var(--line)",
                marginTop: "-16px"
              }}>
                Expériences clés
              </div>
              
              {/* Expérience 1 */}
              <div style={{ marginBottom: 80, position: "relative" }}>
                <div style={{
                  position: "absolute",
                  left: "-48px",
                  top: "8px",
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  background: "var(--accent)",
                  border: "3px solid var(--bg)",
                  zIndex: 2
                }} />
                <div style={{ fontSize: 11, color: "var(--fg-muted)", fontFamily: "monospace", marginBottom: 8 }}>
                  01/2025 — En cours
                </div>
                <h3 style={{ marginTop: 0, marginBottom: 8, fontSize: 24, fontWeight: 700 }}>
                  Tech Lead — Stream IA & Data Science
                </h3>
                <div style={{ fontSize: 14, color: "var(--accent)", fontFamily: "monospace", marginBottom: 12 }}>
                  Cabinet de conseil
                </div>
                <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--fg-muted)", marginBottom: 16 }}>
                  J'accompagne la structuration et le pilotage de l'ensemble des projets IA du cabinet, de l'idée à l'industrialisation. 
                  Je coordonne la communauté Data & IA, développe des solutions d'IA générative comme le RAG multi-modèles, 
                  et j'ai créé le média IA'ctualités pour diffuser la culture IA en interne et auprès des écoles partenaires.
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span className="badge">Tech Lead</span>
                  <span className="badge">IA Générative</span>
                  <span className="badge">RAG</span>
                  <span className="badge">Formation</span>
                </div>
              </div>

              {/* Expérience 2 */}
              <div style={{ marginBottom: 80, position: "relative" }}>
                <div style={{
                  position: "absolute",
                  left: "-48px",
                  top: "8px",
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  background: "var(--accent)",
                  border: "3px solid var(--bg)",
                  zIndex: 2
                }} />
                <div style={{ fontSize: 11, color: "var(--fg-muted)", fontFamily: "monospace", marginBottom: 8 }}>
                  05/2024 — En cours
                </div>
                <h3 style={{ marginTop: 0, marginBottom: 8, fontSize: 24, fontWeight: 700 }}>
                  Chef de Projet & Expert IA — AI4R&T
                </h3>
                <div style={{ fontSize: 14, color: "var(--accent)", fontFamily: "monospace", marginBottom: 12 }}>
                  Acteur majeur de l'énergie
                </div>
                <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--fg-muted)", marginBottom: 16 }}>
                  Je pilote plus de quarante cas d'usage d'intelligence artificielle au sein de la R&D, 
                  en concevant une plateforme technique d'idéation fondée sur des architectures RAG et l'intégration de modèles comme GPT-4, Mistral, Claude ou Gemini. 
                  Cette plateforme permet aux chercheurs de trouver de nouvelles solutions industrielles à partir de problèmes techniques complexes. 
                  J'assure la cohérence technique, la sécurité, la conformité, l'acculturation à l'IA et la formation des chercheurs à ces nouveaux outils.
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span className="badge">RAG</span>
                  <span className="badge">Multi-modèles</span>
                  <span className="badge">R&D</span>
                  <span className="badge">Propriété Intellectuelle</span>
                </div>
              </div>

              {/* Expérience 3 */}
              <div style={{ marginBottom: 80, position: "relative" }}>
                <div style={{
                  position: "absolute",
                  left: "-48px",
                  top: "8px",
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  background: "var(--accent)",
                  border: "3px solid var(--bg)",
                  zIndex: 2
                }} />
                <div style={{ fontSize: 11, color: "var(--fg-muted)", fontFamily: "monospace", marginBottom: 8 }}>
                  05/2022 — 04/2024
                </div>
                <h3 style={{ marginTop: 0, marginBottom: 8, fontSize: 24, fontWeight: 700 }}>
                  Chef de projet AMOA/AMOE Data & BI
                </h3>
                <div style={{ fontSize: 14, color: "var(--accent)", fontFamily: "monospace", marginBottom: 12 }}>
                  Acteur majeur du transport
                </div>
                <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--fg-muted)", marginBottom: 16 }}>
                  J'ai encadré le suivi de centaines d'indicateurs économiques et contractuels avec Île-de-France Mobilités, 
                  tout en développant des tableaux de bord pour le pilotage des coûts et de la performance. 
                  J'ai contribué à automatiser les traitements de données et à maintenir l'infocentre économique utilisé par les instances dirigeantes.
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span className="badge">BI</span>
                  <span className="badge">Power BI</span>
                  <span className="badge">Performance</span>
                  <span className="badge">MCO</span>
                </div>
              </div>

              {/* Expérience 4 - LVMH */}
              <div style={{ marginBottom: 80, position: "relative" }}>
                <div style={{
                  position: "absolute",
                  left: "-48px",
                  top: "8px",
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  background: "var(--accent)",
                  border: "3px solid var(--bg)",
                  zIndex: 2
                }} />
                <div style={{ fontSize: 11, color: "var(--fg-muted)", fontFamily: "monospace", marginBottom: 8 }}>
                  01/2020 — 10/2021
                </div>
                <h3 style={{ marginTop: 0, marginBottom: 8, fontSize: 24, fontWeight: 700 }}>
                  Chef de projet SI
                </h3>
                <div style={{ fontSize: 14, color: "var(--accent)", fontFamily: "monospace", marginBottom: 12 }}>
                  Acteur majeur du Luxe
                </div>
                <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--fg-muted)", marginBottom: 16 }}>
                  J'ai conduit plusieurs projets décisionnels dans les domaines RH et Juridique, 
                  en mettant en place des tableaux de bord clairs et utiles pour le suivi des effectifs et des coûts de formation. 
                  J'ai également supervisé la qualité des données et coordonné les échanges entre les équipes métiers, techniques et la DSI.
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span className="badge">BI</span>
                  <span className="badge">RH</span>
                  <span className="badge">Juridique</span>
                  <span className="badge">ETL</span>
                </div>
              </div>

              {/* Expérience 5 - Safran */}
              <div style={{ marginBottom: 80, position: "relative" }}>
                <div style={{
                  position: "absolute",
                  left: "-48px",
                  top: "8px",
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  background: "var(--accent)",
                  border: "3px solid var(--bg)",
                  zIndex: 2
                }} />
                <div style={{ fontSize: 11, color: "var(--fg-muted)", fontFamily: "monospace", marginBottom: 8 }}>
                  01/2019 — 12/2019
                </div>
                <h3 style={{ marginTop: 0, marginBottom: 8, fontSize: 24, fontWeight: 700 }}>
                  Master Data Manager / Data Science
                </h3>
                <div style={{ fontSize: 14, color: "var(--accent)", fontFamily: "monospace", marginBottom: 12 }}>
                  Acteur majeur de l'aéronautique
                </div>
                <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--fg-muted)", marginBottom: 16 }}>
                  J'ai participé à la mise en place d'algorithmes d'analyse prédictive pour la maintenance des moteurs d'avion 
                  et à la fiabilisation des données de production. Mon rôle consistait à structurer les bases de données, 
                  améliorer la qualité des informations critiques et concevoir des indicateurs de performance destinés aux ateliers de réparation.
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span className="badge">Data Science</span>
                  <span className="badge">ML</span>
                  <span className="badge">Maintenance</span>
                  <span className="badge">Aéronautique</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ligne de séparation horizontale */}
      <div style={{
        width: "100%",
        position: "relative",
        padding: "80px 0",
        margin: "0"
      }}>
        {/* Ligne verticale de référence (même position que dans les sections) */}
        <div style={{
          position: "absolute",
          left: "5%",
          top: 0,
          bottom: 0,
          width: "2px",
          background: "var(--line-blueprint)",
          zIndex: 0
        }} />
        
        <div style={{
          maxWidth: "1400px",
          width: "100%",
          margin: "0 auto",
          padding: "0 24px",
          position: "relative"
        }}>
          {/* Ligne horizontale qui part de la ligne verticale */}
          <div style={{
            position: "relative",
            height: "2px",
            background: "var(--line-blueprint)",
            left: "calc(5% - 24px)",
            width: "calc(100% - 5% + 24px)"
          }}>
            {/* Point de connexion à gauche (à l'intersection avec la ligne verticale) */}
            <div style={{
              position: "absolute",
              left: "0",
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: "var(--accent)",
              border: "3px solid var(--bg)",
              zIndex: 2
            }} />
          </div>
        </div>
      </div>

      {/* Section Compétences */}
      <SkillsSection onFilterChange={handleSkillFilter} />

      {/* Section Réalisations */}
      <section
        style={{
          width: "100%",
          background: "var(--bg)",
          padding: "0",
          position: "relative"
        }}
      >
        {/* Ligne de connexion verticale à gauche */}
        <div style={{
          position: "absolute",
          left: "5%",
          top: 0,
          bottom: 0,
          width: "2px",
          background: "var(--line-blueprint)",
          zIndex: 0
        }} />

        <div style={{ 
          maxWidth: "1400px",
          width: "100%",
          margin: "0 auto",
          padding: "120px 24px",
          position: "relative",
          zIndex: 1
        }}>
          {/* Titre de section - aligné avec la colonne droite de la section Hero */}
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
              Réalisations
            </div>
            <h2
              style={{
                fontSize: 48,
                fontWeight: 700,
                margin: 0,
                marginBottom: "16px",
                color: "var(--fg)"
              }}
            >
              Projets en détail
            </h2>
            <p
              style={{
                fontSize: 18,
                lineHeight: 1.8,
                color: "var(--fg-muted)",
                whiteSpace: "nowrap"
              }}
            >
              Découvrez comment j'ai transformé des défis complexes en solutions concrètes, en alliant vision stratégique et expertise technique.
            </p>
          </div>

          {/* Filtre actif */}
          {selectedSkill && (
            <div
              style={{
                paddingLeft: "48px",
                marginBottom: "32px",
                display: "flex",
                alignItems: "center",
                gap: "16px"
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  color: "var(--fg-muted)",
                  fontFamily: "monospace"
                }}
              >
                Filtre actif :
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  background: "var(--bg-secondary)",
                  border: "2px solid var(--accent)",
                  borderRadius: "4px"
                }}
              >
                <span style={{ fontSize: "20px" }}>{selectedSkill.icon}</span>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "var(--accent)"
                  }}
                >
                  {selectedSkill.name}
                </span>
                <button
                  onClick={() => handleSkillFilter(null)}
                  style={{
                    marginLeft: "8px",
                    background: "transparent",
                    border: "none",
                    color: "var(--fg-muted)",
                    cursor: "pointer",
                    fontSize: "18px",
                    padding: "0",
                    width: "20px",
                    height: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = "var(--accent)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = "var(--fg-muted)";
                  }}
                >
                  ×
                </button>
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: "var(--fg-muted)",
                  fontFamily: "monospace"
                }}
              >
                {filteredProjects.length} projet{filteredProjects.length > 1 ? "s" : ""} trouvé{filteredProjects.length > 1 ? "s" : ""}
              </div>
            </div>
          )}

          {/* Cartes de cas d'usage - alignées avec la colonne droite */}
          <div style={{ paddingLeft: "48px" }}>
            {filteredProjects && filteredProjects.length > 0 ? (
              filteredProjects.map((project, index) => (
                <CaseStudyCard key={project.id} project={project} index={index} />
              ))
            ) : (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--fg-muted)" }}>
                Aucun projet trouvé pour cette compétence.
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}

"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import TypewriterTitle from "@/components/TypewriterTitle";
import SkillsSection from "@/components/SkillsSection";
import { labTools } from "@/lib/lab-tools";

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
        <div className="homepage-vertical-line-fixed" style={{
          position: "fixed",
          left: "5%",
          top: 0,
          bottom: 0,
          width: "2px",
          background: "var(--line-blueprint)",
          zIndex: 0
        }} />

        <div className="homepage-hero-grid" style={{ 
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
          <div className="homepage-profile-sticky" style={{ 
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
            <div className="homepage-hero-title" style={{ 
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
            <div className="homepage-intro-box" style={{
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
            <div className="actions homepage-actions" style={{ flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
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
            <div className="homepage-timeline-line" style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: "2px",
              background: "var(--line-blueprint)",
              zIndex: 0
            }} />

            <div className="homepage-experiences" style={{ paddingLeft: "48px", position: "relative", paddingTop: "0" }}>
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
                <div className="homepage-connection-dot" style={{
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
                <div className="homepage-exp-date" style={{ fontSize: 11, color: "var(--fg-muted)", fontFamily: "monospace", marginBottom: 8 }}>
                  01/2025 — En cours
                </div>
                <h3 className="homepage-exp-title" style={{ marginTop: 0, marginBottom: 8, fontSize: 24, fontWeight: 700 }}>
                  Tech Lead — Stream IA & Data Science
                </h3>
                <div className="homepage-exp-company" style={{ fontSize: 14, color: "var(--accent)", fontFamily: "monospace", marginBottom: 12 }}>
                  Cabinet de conseil
                </div>
                <p className="homepage-exp-description" style={{ fontSize: 15, lineHeight: 1.8, color: "var(--fg-muted)", marginBottom: 16 }}>
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
      {/* Section Marketplace (aperçu des réalisations techniques) */}
      <section
        style={{
          width: "100%",
          background: "var(--bg)",
          padding: "0",
          position: "relative"
        }}
      >
        {/* Ligne de connexion verticale à gauche */}
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
          style={{
            maxWidth: "1400px",
            width: "100%",
            margin: "0 auto",
            padding: "60px 24px",
            position: "relative",
            zIndex: 1
          }}
        >
          <div
            style={{
              marginBottom: "32px",
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
              MARKETPLACE
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                gap: "16px",
                flexWrap: "wrap"
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: 48,
                    fontWeight: 700,
                    margin: 0,
                    marginBottom: "12px",
                    color: "var(--fg)"
                  }}
                >
                  Marketplace
                </h2>
                <p
                  style={{
                    fontSize: 18,
                    lineHeight: 1.8,
                    color: "var(--fg-muted)",
                    margin: 0
                  }}
                >
                  Aperçu de mes réalisations techniques — outils IA & LLM, Data Science utilisables avec vos propres clés.
                </p>
              </div>

              <Link
                href="/lab"
                className="btn"
                style={{
                  border: "2px solid var(--accent)",
                  background: "transparent",
                  color: "var(--accent)"
                }}
              >
                [ Voir tout le LAB ]
              </Link>
            </div>
          </div>

          {/* Grille d'outils (réutilise les styles responsive du LAB) */}
          <div
            className="lab-tool-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
              gap: "24px",
              paddingLeft: "48px"
            }}
          >
            {labTools.map((tool) => (
              <Link
                key={tool.id}
                href={`/lab/${tool.id}`}
                className="lab-tool-card"
                style={{
                  textDecoration: "none",
                  display: "block"
                }}
              >
                <div
                  style={{
                    background: "var(--bg-secondary)",
                    border: "2px solid var(--line-blueprint)",
                    borderRadius: "12px",
                    padding: "28px",
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
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "8px",
                      background: `${tool.color}20`,
                      border: `2px solid ${tool.color}`,
                      marginBottom: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <div
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "4px",
                        background: tool.color
                      }}
                    />
                  </div>

                  <div
                    style={{
                      fontSize: "12px",
                      color: tool.color,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      marginBottom: "8px",
                      fontFamily: "monospace"
                    }}
                  >
                    {tool.category}
                  </div>

                  <h3
                    style={{
                      fontSize: "22px",
                      fontWeight: 700,
                      marginBottom: "10px",
                      color: "var(--fg)"
                    }}
                  >
                    {tool.name}
                  </h3>

                  <p
                    style={{
                      fontSize: "14px",
                      color: "var(--fg-muted)",
                      lineHeight: 1.7,
                      marginBottom: 0
                    }}
                  >
                    {tool.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SkillsSection />

    </div>
  );
}

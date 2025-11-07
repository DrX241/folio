"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
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
              EDDY MISSONI IDEMBI
            </div>
            <h1 style={{ 
              fontSize: 64, 
              fontWeight: 700, 
              marginBottom: 24,
              letterSpacing: "-3px",
              lineHeight: 1.1,
              color: "var(--fg)"
            }}>
              Chef de projet
              <br />
              <span style={{ color: "var(--accent)" }}>Tech Lead</span>
              <br />
              Data & IA
            </h1>
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
              <Link className="btn primary" href="#expertise" style={{ fontSize: 16, padding: "16px 32px", width: "100%", textAlign: "center" }}>
                [ Découvrir mon expertise ]
              </Link>
              <Link className="btn" href="/projects" style={{ fontSize: 16, padding: "16px 32px", width: "100%", textAlign: "center" }}>
                [ Voir mes projets ]
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
                fontSize: 12, 
                color: "var(--accent)", 
                fontFamily: "monospace", 
                marginBottom: 64, 
                textTransform: "uppercase", 
                letterSpacing: "2px",
                position: "sticky",
                top: "80px",
                background: "var(--bg)",
                paddingBottom: "16px",
                paddingTop: "16px",
                zIndex: 1,
                borderBottom: "1px solid var(--line)"
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
                  en concevant des plateformes d'idéation fondées sur des architectures RAG et l'intégration de modèles comme GPT-4, Mistral, Claude ou Gemini. 
                  J'assure la cohérence technique, la sécurité, la conformité et la formation des chercheurs à ces nouveaux outils.
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

      {/* Section Expertise - Full Width avec connexions */}
      <section id="expertise" style={{ 
        width: "100%",
        minHeight: "100vh",
        position: "relative",
        padding: "120px 24px",
        background: "var(--bg-secondary)"
      }}>
        {/* Ligne de connexion horizontale en haut */}
        <div style={{
          position: "absolute",
          top: 0,
          left: "5%",
          right: "5%",
          height: "2px",
          background: "var(--line-blueprint)",
          zIndex: 0
        }} />

        {/* Point de connexion central */}
        <div style={{
          position: "absolute",
          top: "-8px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "16px",
          height: "16px",
          borderRadius: "50%",
          background: "var(--accent)",
          border: "3px solid var(--bg-secondary)",
          zIndex: 2
        }} />

        <div style={{ maxWidth: "1600px", margin: "0 auto", width: "100%" }}>
          <div style={{ textAlign: "center", marginBottom: 80 }}>
            <h2 style={{ fontSize: 56, fontWeight: 700, marginBottom: 24, letterSpacing: "-2px" }}>
              6 Espaces d'expertise
            </h2>
            <p style={{ fontSize: 20, color: "var(--fg-muted)", maxWidth: 800, margin: "0 auto", lineHeight: 1.8 }}>
              Expérimentez mes compétences à travers des démonstrations interactives fonctionnelles, 
              reliées à mes expériences professionnelles concrètes dans l'énergie, le luxe, le transport et la R&D.
            </p>
          </div>

          {/* Grille des Labs avec connexions */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(3, 1fr)", 
            gap: 40,
            position: "relative"
          }}>
            {/* Lignes de connexion entre les cartes */}
            <div style={{
              position: "absolute",
              top: "50%",
              left: "33.33%",
              width: "33.33%",
              height: "2px",
              background: "var(--line-blueprint)",
              opacity: 0.3,
              zIndex: 0
            }} />

            {[
              { href: "/labs/rag-studio", title: "RAG Studio", desc: "IA Générative & Knowledge", tags: ["RAG", "Hugging Face", "Vectorisation"], num: "01" },
              { href: "/labs/gen-lab", title: "GEN Lab", desc: "LLM Engineering & Agents", tags: ["LLM", "Agents", "Orchestration"], num: "02" },
              { href: "/labs/fyne", title: "FYNE", desc: "Plateforme immersive & Gestion de projet", tags: ["Immersif", "Gamification", "Projet"], num: "03" },
              { href: "/labs/data-cloud", title: "DATA & CLOUD", desc: "Industrialisation & Architecture", tags: ["Cloud", "Architecture", "DevOps"], num: "04" },
              { href: "/labs/bi-studio", title: "BI Studio", desc: "Business Intelligence & Décisionnel", tags: ["BI", "Dashboards", "KPIs"], num: "05" },
              { href: "/labs/data-science", title: "Data Science", desc: "Analyse & Modélisation", tags: ["ML", "Analyse", "Prédiction"], num: "06" },
            ].map((lab, index) => (
              <Link
                key={lab.href}
                href={lab.href}
                className="card"
                style={{ 
                  display: "block",
                  padding: "40px",
                  position: "relative",
                  textDecoration: "none",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={() => setActiveSection(index)}
                onMouseLeave={() => setActiveSection(null)}
              >
                {/* Numéro en haut à gauche */}
                <div style={{
                  position: "absolute",
                  top: "-12px",
                  left: "-12px",
                  width: "48px",
                  height: "48px",
                  background: "var(--accent)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  fontWeight: 700,
                  fontFamily: "monospace",
                  border: "3px solid var(--bg-secondary)",
                  zIndex: 2
                }}>
                  {lab.num}
                </div>

                {/* Ligne de connexion depuis le numéro */}
                <div style={{
                  position: "absolute",
                  top: "12px",
                  left: "36px",
                  width: activeSection === index ? "100px" : "40px",
                  height: "2px",
                  background: activeSection === index ? "var(--accent)" : "var(--line-blueprint)",
                  transition: "all 0.3s ease",
                  zIndex: 1
                }} />

                <h3 style={{ fontSize: 28, marginTop: 24, marginBottom: 12, fontWeight: 700 }}>
                  {lab.title}
                </h3>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--fg-muted)", marginBottom: 24 }}>
                  {lab.desc}
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
                  {lab.tags.map(tag => (
                    <span key={tag} className="badge" style={{ fontSize: 11 }}>
                      {tag}
                    </span>
                  ))}
                </div>
                <div style={{ 
                  fontSize: 13, 
                  color: "var(--accent)", 
                  fontFamily: "monospace",
                  textTransform: "uppercase",
                  letterSpacing: "1px"
                }}>
                  → Expérimenter
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

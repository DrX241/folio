"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import TypewriterTitle from "@/components/TypewriterTitle";
import SkillsSection from "@/components/SkillsSection";
import WelcomeTour from "@/components/WelcomeTour";
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
      <WelcomeTour />
      {/* Hero Section - Full Width avec profil fixe et expériences défilantes */}
      <section id="accueil" style={{ 
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
                J'accélère le <strong style={{ color: "var(--accent)" }}>développement et le déploiement de solutions IA</strong> (dont IA générative) et j'accompagne les équipes sur la <strong style={{ color: "var(--accent)" }}>stratégie et les cas d'usage</strong>. Je structure les feuilles de route IA, priorise les initiatives et valorise les résultats auprès des métiers et de la direction.<br />
                J'assure le <strong style={{ color: "var(--accent)" }}>"quoi"</strong> et le <strong style={{ color: "var(--accent)" }}>"quand"</strong> en tant que <strong style={{ color: "var(--accent)" }}>chef de projet</strong>, et le <strong style={{ color: "var(--accent)" }}>"comment bien"</strong> en tant que <strong style={{ color: "var(--accent)" }}>Tech Lead</strong>, en commençant toujours par <strong style={{ color: "var(--accent)" }}>comprendre, cadrer, simplifier</strong>.
              </p>
            </div>
            {/* Ce que j'apporte — aligné offre Expert IA */}
            <div style={{
              padding: "20px",
              border: "1px solid var(--line-blueprint)",
              background: "var(--bg)",
              marginBottom: 24,
              fontSize: 14,
              lineHeight: 1.7,
              color: "var(--fg-muted)"
            }}>
              <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600, letterSpacing: "1px", fontFamily: "monospace", marginBottom: 12, textTransform: "uppercase" }}>
                Ce que j'apporte
              </div>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>Stratégie IA & feuilles de route</li>
                <li>Cas d'usage concrets & déploiement (dont IA générative)</li>
                <li>Accompagnement d'équipes & priorisation des initiatives</li>
                <li>Valorisation et communication des résultats (rapports, présentations)</li>
              </ul>
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

            <div id="experiences" className="homepage-experiences" style={{ paddingLeft: "48px", position: "relative", paddingTop: "0" }}>
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
              
              {/* Expérience 1 - NaTran */}
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
                  Sept 2025 — Présent
                </div>
                <h3 className="homepage-exp-title" style={{ marginTop: 0, marginBottom: 8, fontSize: 24, fontWeight: 700 }}>
                  Expert & Tech Lead IA — Stratégie, architecture et déploiement
                </h3>
                <div className="homepage-exp-company" style={{ fontSize: 14, color: "var(--accent)", fontFamily: "monospace", marginBottom: 12 }}>
                  NaTran (ex-GRTgaz) · Mission mc2i
                </div>
                <p className="homepage-exp-description" style={{ fontSize: 15, lineHeight: 1.8, color: "var(--fg-muted)", marginBottom: 12 }}>
                  Programme de transformation des processus métiers d'un acteur majeur des infrastructures énergétiques, avec intégration de l'IA dans les chaînes de décision, d'exploitation et de performance opérationnelle.
                </p>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", marginBottom: 8 }}>Réalisations :</div>
                <ul style={{ fontSize: 14, lineHeight: 1.7, color: "var(--fg-muted)", margin: "0 0 16px 20px", paddingLeft: 8 }}>
                  <li>Pilotage transverse des initiatives IA à l'échelle groupe</li>
                  <li>Définition de la stratégie IA et élaboration de feuilles de route pluriannuelles</li>
                  <li>Priorisation des cas d'usage à fort impact opérationnel et industriel</li>
                  <li>Mise en place de standards technologiques et gouvernance IA (risques, conformité, sécurité)</li>
                </ul>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span className="badge">Tech Lead IA</span>
                  <span className="badge">Stratégie IA</span>
                  <span className="badge">Gouvernance IA</span>
                  <span className="badge">Énergie</span>
                </div>
              </div>

              {/* Expérience 2 - TotalEnergies */}
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
                  Avr 2024 — Août 2025
                </div>
                <h3 style={{ marginTop: 0, marginBottom: 8, fontSize: 24, fontWeight: 700 }}>
                  Tech Lead IA générative — Programme R&D et innovation
                </h3>
                <div style={{ fontSize: 14, color: "var(--accent)", fontFamily: "monospace", marginBottom: 12 }}>
                  TotalEnergies · Mission mc2i
                </div>
                <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--fg-muted)", marginBottom: 12 }}>
                  Accélération de la recherche scientifique par l'intégration de l'IA générative dans les processus d'idéation, d'analyse et d'exploration technologique des équipes R&D.
                </p>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", marginBottom: 8 }}>Réalisations :</div>
                <ul style={{ fontSize: 14, lineHeight: 1.7, color: "var(--fg-muted)", margin: "0 0 16px 20px", paddingLeft: 8 }}>
                  <li>Pilotage d'un portefeuille de 120+ projets IA en environnement R&D</li>
                  <li>Coordination d'équipes expertes Data, IA et chercheurs</li>
                  <li>Intégration de l'IA générative dans les processus d'idéation scientifique</li>
                  <li>Conception de plateformes LLM internes et architectures RAG sécurisées</li>
                </ul>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span className="badge">IA Générative</span>
                  <span className="badge">RAG</span>
                  <span className="badge">LLM</span>
                  <span className="badge">R&D</span>
                </div>
              </div>

              {/* Expérience 3 - mc2i */}
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
                  Oct 2021 — Présent
                </div>
                <h3 style={{ marginTop: 0, marginBottom: 8, fontSize: 24, fontWeight: 700 }}>
                  Manager & Tech Lead Data & IA — Transformation et industrialisation
                </h3>
                <div style={{ fontSize: 14, color: "var(--accent)", fontFamily: "monospace", marginBottom: 12 }}>
                  mc2i
                </div>
                <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--fg-muted)", marginBottom: 12 }}>
                  Conseil auprès de grands groupes dans leurs programmes de transformation Data & IA visant l'industrialisation des usages, l'alignement stratégique métiers/IT et le passage à l'échelle des solutions d'intelligence artificielle.
                </p>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", marginBottom: 8 }}>Réalisations :</div>
                <ul style={{ fontSize: 14, lineHeight: 1.7, color: "var(--fg-muted)", margin: "0 0 16px 20px", paddingLeft: 8 }}>
                  <li>Pilotage de programmes Data & IA multi-clients et coordination métiers / IT</li>
                  <li>Structuration de stratégies IA et priorisation de portefeuilles de cas d'usage</li>
                  <li>Cadrage d'architectures Data & IA et mise en production de solutions industrialisées</li>
                  <li>Déploiement de plateformes GenAI, moteurs RAG et assistants métiers basés sur LLM</li>
                </ul>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span className="badge">Manager</span>
                  <span className="badge">Tech Lead</span>
                  <span className="badge">GenAI</span>
                  <span className="badge">Consulting</span>
                </div>
              </div>

              {/* Expérience 4 - RATP */}
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
                  Mai 2022 — Avr 2024
                </div>
                <h3 style={{ marginTop: 0, marginBottom: 8, fontSize: 24, fontWeight: 700 }}>
                  Chef de projet MOE Data & BI — Pilotage de la performance contractuelle
                </h3>
                <div style={{ fontSize: 14, color: "var(--accent)", fontFamily: "monospace", marginBottom: 12 }}>
                  RATP · Mission mc2i
                </div>
                <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--fg-muted)", marginBottom: 12 }}>
                  Pilotage des dispositifs Data soutenant le suivi de la performance financière et opérationnelle du contrat RATP–IDFM, dans un environnement multi-SI complexe.
                </p>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", marginBottom: 8 }}>Réalisations :</div>
                <ul style={{ fontSize: 14, lineHeight: 1.7, color: "var(--fg-muted)", margin: "0 0 16px 20px", paddingLeft: 8 }}>
                  <li>Gouvernance Data et pilotage de 300+ indicateurs stratégiques</li>
                  <li>Conception de dispositifs décisionnels pour pilotage financier et opérationnel</li>
                  <li>Structuration et fiabilisation de flux de données multi-SI complexes</li>
                  <li>Appui analytique aux directions métiers et instances de pilotage</li>
                </ul>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span className="badge">BI</span>
                  <span className="badge">Power BI</span>
                  <span className="badge">Gouvernance Data</span>
                  <span className="badge">MOE</span>
                </div>
              </div>

              {/* Expérience 5 - COJOP */}
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
                  Oct 2021 — Mars 2022
                </div>
                <h3 style={{ marginTop: 0, marginBottom: 8, fontSize: 24, fontWeight: 700 }}>
                  Product Owner digital — Plateforme nationale JO Paris 2024
                </h3>
                <div style={{ fontSize: 14, color: "var(--accent)", fontFamily: "monospace", marginBottom: 12 }}>
                  COJOP Paris 2024 · Mission mc2i
                </div>
                <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--fg-muted)", marginBottom: 12 }}>
                  Conception et pilotage d'une plateforme digitale nationale à forte exposition publique, au service de l'expérience utilisateur et du rayonnement des Jeux Olympiques.
                </p>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", marginBottom: 8 }}>Réalisations :</div>
                <ul style={{ fontSize: 14, lineHeight: 1.7, color: "var(--fg-muted)", margin: "0 0 16px 20px", paddingLeft: 8 }}>
                  <li>Pilotage produit d'une plateforme digitale nationale</li>
                  <li>Définition des besoins métiers et conception fonctionnelle des services numériques</li>
                  <li>Pilotage de la roadmap et coordination équipes UX/UI & techniques</li>
                  <li>Supervision des tests et amélioration continue de l'expérience utilisateur</li>
                </ul>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span className="badge">Product Owner</span>
                  <span className="badge">UX/UI</span>
                  <span className="badge">Roadmap</span>
                  <span className="badge">JO Paris 2024</span>
                </div>
              </div>

              {/* Expérience 6 - LVMH */}
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
                  Avr 2020 — Sept 2021
                </div>
                <h3 style={{ marginTop: 0, marginBottom: 8, fontSize: 24, fontWeight: 700 }}>
                  IT Project Manager — Solutions décisionnelles Groupe
                </h3>
                <div style={{ fontSize: 14, color: "var(--accent)", fontFamily: "monospace", marginBottom: 12 }}>
                  LVMH
                </div>
                <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--fg-muted)", marginBottom: 12 }}>
                  Pilotage de solutions décisionnelles stratégiques au sein de la DSI Groupe pour soutenir les directions RH et Juridique dans leurs enjeux de pilotage et de conformité.
                </p>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", marginBottom: 8 }}>Réalisations :</div>
                <ul style={{ fontSize: 14, lineHeight: 1.7, color: "var(--fg-muted)", margin: "0 0 16px 20px", paddingLeft: 8 }}>
                  <li>Pilotage de projets décisionnels stratégiques RH et Juridique</li>
                  <li>Conception de solutions BI pour le pilotage des effectifs et de la performance</li>
                  <li>Structuration de reportings exécutifs et fiabilisation des données</li>
                  <li>Intégration de briques analytiques au système d'information Groupe</li>
                </ul>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span className="badge">IT Project Manager</span>
                  <span className="badge">BI</span>
                  <span className="badge">DSI Groupe</span>
                  <span className="badge">Luxe</span>
                </div>
              </div>

              {/* Expérience 7 - Safran */}
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
                  Fév 2018 — Mars 2020
                </div>
                <h3 style={{ marginTop: 0, marginBottom: 8, fontSize: 24, fontWeight: 700 }}>
                  Master Data & AI Manager — Data engineering industriel
                </h3>
                <div style={{ fontSize: 14, color: "var(--accent)", fontFamily: "monospace", marginBottom: 12 }}>
                  Safran Aircraft Engines
                </div>
                <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--fg-muted)", marginBottom: 12 }}>
                  Structuration des fondations Data industrielles pour permettre les futurs usages IA et la maintenance prédictive sur des systèmes critiques aéronautiques.
                </p>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", marginBottom: 8 }}>Réalisations :</div>
                <ul style={{ fontSize: 14, lineHeight: 1.7, color: "var(--fg-muted)", margin: "0 0 16px 20px", paddingLeft: 8 }}>
                  <li>Structuration des fondations data pour usages IA industriels</li>
                  <li>Préparation et fiabilisation de données techniques à grande échelle</li>
                  <li>Développement d'analyses prédictives pour maintenance moteurs</li>
                  <li>Structuration d'indicateurs de performance industriels</li>
                </ul>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span className="badge">Data Engineering</span>
                  <span className="badge">ML</span>
                  <span className="badge">Maintenance prédictive</span>
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
        id="realisations"
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
              CAS D'USAGE IA
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
                  Cas d'usage IA & solutions déployables
                </h2>
                <p
                  style={{
                    fontSize: 18,
                    lineHeight: 1.8,
                    color: "var(--fg-muted)",
                    margin: 0
                  }}
                >
                  Démonstrateurs : développement, mise en œuvre et déploiement de solutions IA (dont génératives), utilisables avec vos propres clés.
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
                      marginBottom: tool.impact ? "10px" : 0
                    }}
                  >
                    {tool.description}
                  </p>
                  {tool.impact && (
                    <p
                      style={{
                        fontSize: "13px",
                        color: "var(--accent)",
                        lineHeight: 1.5,
                        margin: 0,
                        fontStyle: "italic"
                      }}
                    >
                      → {tool.impact}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div id="competences">
        <SkillsSection />
      </div>

    </div>
  );
}

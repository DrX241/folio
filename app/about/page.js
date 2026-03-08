import Link from "next/link";

export const metadata = { title: "À propos — EMI" };

export default function AboutPage() {
  return (
    <>
      <h1 className="section-title" style={{ fontSize: 48, marginTop: 0 }}>
        À propos
      </h1>
      <div className="prose">
        <p style={{ fontSize: 18, lineHeight: 1.8, marginBottom: 32, textAlign: "justify" }}>
          Avec plus de six ans d'expérience dans la Data et l'IA, j'accélère le <strong>déploiement de solutions IA et IA générative</strong>, 
          j'accompagne les équipes et priorise les initiatives en les alignant sur la stratégie métier. Je structure les <strong>feuilles de route IA</strong>, 
          identifie les opportunités d'intégration et développe des <strong>cas d'usage concrets</strong> pour maximiser l'impact et favoriser l'adoption. 
          Convaincu que la réussite repose à <strong>80% sur le cadrage et la compréhension du besoin</strong> et à <strong>20% sur la technologie</strong>, 
          j'associe la vision du chef de projet à la maîtrise du Tech Lead et à une <strong>veille technologique</strong> continue pour anticiper les évolutions.
        </p>

        <div className="hero-card" style={{ marginBottom: 32 }}>
          <h2 style={{ marginTop: 0, marginBottom: 12, fontSize: 20 }}>Au quotidien</h2>
          <p style={{ marginBottom: 0, color: "var(--fg-muted)", lineHeight: 1.7, textAlign: "justify" }}>
            Au quotidien, je m'appuie sur une communication claire pour rendre accessibles les sujets techniques et produire des supports utiles à la prise de décision. Je travaille en collaboration étroite avec les équipes métiers et techniques afin d'aligner les objectifs, les priorités et les livrables. J'adopte une posture proactive pour anticiper les besoins, suivre les évolutions et adapter les choix en conséquence. J'exerce un leadership de terrain qui permet de mobiliser les équipes autour d'une vision commune et d'objectifs IA concrets. Enfin, je garde un esprit d'analyse exigeant pour formuler des recommandations solides, argumentées et actionnables.
          </p>
        </div>

        <div className="hero-card" style={{ marginBottom: 48 }}>
          <h2 style={{ marginTop: 0, marginBottom: 16, fontSize: 20 }}>CV & Documents</h2>
          <p style={{ marginBottom: 20, color: "var(--fg-muted)", lineHeight: 1.7 }}>
            Téléchargez mon CV complet au format PDF pour plus de détails sur mon parcours, mes compétences et mes réalisations.
          </p>
          <Link 
            href="/cv.pdf" 
            target="_blank"
            className="btn primary"
          >
            [ Télécharger le CV (PDF) ]
          </Link>
        </div>

        <h2 id="coordonnees">Coordonnées</h2>
        <ul>
          <li><strong>Téléphone :</strong> <a href="tel:0765661994" style={{ color: "var(--accent)" }}>0765661994</a></li>
          <li><strong>Email :</strong> <a href="mailto:eddymissoni.pro@gmail.com" style={{ color: "var(--accent)" }}>eddymissoni.pro@gmail.com</a></li>
        </ul>

        <h2>Formation</h2>
        <ul>
          <li><strong>Master - Intelligence des Systèmes d'Information</strong></li>
        </ul>

        <h2>Certifications</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "16px" }}>
          <span className="badge">IBM AI Engineering Professional Certificate (IBM)</span>
          <span className="badge">ML Practitioner Certificate (DATAIKU)</span>
          <span className="badge">Spécialiste IA & Machine Learning (LinkedIn)</span>
          <span className="badge">Generative AI Applications with RAG and LangChain (IBM)</span>
          <span className="badge">Generative AI and LLMs: Architecture and Data Preparation (IBM)</span>
          <span className="badge">Generative AI Advance Fine-Tuning for LLMs (IBM)</span>
        </div>

        <h2>Expertises fonctionnelles et stratégiques</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "16px" }}>
          <span className="badge">BI & Décisionnel</span>
          <span className="badge">Data & Intelligence Artificielle</span>
          <span className="badge">Fonctions support</span>
          <span className="badge">Industrie & Énergie</span>
          <span className="badge">R&D et Innovation</span>
          <span className="badge">Transformation digitale</span>
          <span className="badge">Architecture de données</span>
          <span className="badge">Gouvernance des données</span>
          <span className="badge">Stratégie IA et feuille de route</span>
          <span className="badge">Coordination IA transverse</span>
          <span className="badge">Priorisation du portefeuille de cas d'usage</span>
          <span className="badge">Gouvernance IA et conformité</span>
          <span className="badge">Pilotage par la valeur métier</span>
          <span className="badge">Communication exécutive et reporting</span>
        </div>

        <h2>Expertises méthodologiques et delivery IA</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "16px" }}>
          <span className="badge">Étude amont & cadrage de besoin</span>
          <span className="badge">Homologation & Conception</span>
          <span className="badge">Planification et cadrage de projet</span>
          <span className="badge">Conduite du changement & Formation</span>
          <span className="badge">Méthodologie agile</span>
          <span className="badge">Architecture technique & Design</span>
          <span className="badge">Gestion des risques & Qualité</span>
          <span className="badge">Pilotage de projet & Reporting</span>
          <span className="badge">Cadrage de programmes IA générative</span>
          <span className="badge">Industrialisation de POC IA</span>
          <span className="badge">Qualification valeur, risque et faisabilité</span>
          <span className="badge">Animation des comités métiers et IT</span>
          <span className="badge">Veille technologique appliquée</span>
          <span className="badge">Accompagnement des équipes projet IA</span>
        </div>

        <h2>Outils et technologies</h2>
        <div style={{ marginTop: "24px" }}>
          <h3 style={{ fontSize: "18px", marginBottom: "12px", color: "var(--accent)" }}>Langages de développement</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "24px" }}>
            <span className="badge">Python</span>
            <span className="badge">SQL</span>
            <span className="badge">HTML</span>
            <span className="badge">CSS</span>
            <span className="badge">VBA</span>
            <span className="badge">DAX</span>
            <span className="badge">R</span>
          </div>

          <h3 style={{ fontSize: "18px", marginBottom: "12px", color: "var(--accent)" }}>Frameworks & Plateformes</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "24px" }}>
            <span className="badge">Django</span>
            <span className="badge">Streamlit</span>
            <span className="badge">FastAPI</span>
            <span className="badge">Power BI</span>
            <span className="badge">Power Automate</span>
            <span className="badge">Power Apps</span>
            <span className="badge">QlikView</span>
            <span className="badge">Cognos Analytics</span>
            <span className="badge">Alteryx Intelligence Suite</span>
            <span className="badge">Apple Combine</span>
          </div>

          <h3 style={{ fontSize: "18px", marginBottom: "12px", color: "var(--accent)" }}>IA & Cloud</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "24px" }}>
            <span className="badge">Azure OpenAI</span>
            <span className="badge">AWS Bedrock</span>
            <span className="badge">Claude (Anthropic)</span>
            <span className="badge">Copilot Studio</span>
            <span className="badge">Dataiku</span>
          </div>

          <h3 style={{ fontSize: "18px", marginBottom: "12px", color: "var(--accent)" }}>Bases de données & Outils</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "24px" }}>
            <span className="badge">SQL Server</span>
            <span className="badge">Oracle Essbase</span>
            <span className="badge">FAISS</span>
            <span className="badge">ChromaDB</span>
            <span className="badge">Git</span>
            <span className="badge">Docker</span>
            <span className="badge">Jira</span>
            <span className="badge">Confluence</span>
            <span className="badge">Algolia</span>
            <span className="badge">Salesforce CMS</span>
          </div>
        </div>

        <h2>Synthèse des expériences</h2>
        <ul>
          <li><strong>NaTran (ex-GRTgaz)</strong> – Tech Lead IA — Stratégie, Architecture et Déploiement Data/IA – (09/2025 – En cours)</li>
          <li><strong>TotalEnergies</strong> – Tech Lead IA Générative — Programmes R&D & Innovation – 1 an et 4 mois (05/2024 – 08/2025)</li>
          <li><strong>mc2i</strong> – Tech Lead Data & IA — Transformation et Industrialisation – (01/2024 – En cours)</li>
          <li><strong>RATP</strong> – Chef de projet Data & BI — Pilotage de la Performance – 2 ans (05/2022 – 04/2024)</li>
          <li><strong>COJOP Paris 2024</strong> – Product Owner Digital — Plateforme nationale – 6 mois (10/2021 – 03/2022)</li>
          <li><strong>LVMH</strong> – Chef de projet SI / BI — Solutions Décisionnelles Groupe – 1 an et 10 mois (01/2020 – 10/2021)</li>
          <li><strong>Safran Aircraft Engines</strong> – Master Data & AI Manager — Data Engineering Industriel – 1 an (01/2019 – 12/2019)</li>
        </ul>

        <h2>Compétences (synthèse)</h2>
        <ul>
          <li><strong>AI Strategy & Leadership</strong> — Stratégie IA, feuilles de route, gouvernance IA, pilotage programmes</li>
          <li><strong>AI Engineering & Architecture</strong> — LLM, RAG, plateformes GenAI, Azure OpenAI, Mistral, Claude</li>
          <li><strong>Data & Analytics</strong> — Power BI, QlikView, Cognos, SQL, DAX, Python</li>
          <li><strong>Automation & Integration</strong> — Orchestration Data/IA, workflows, Power Automate</li>
          <li><strong>Delivery & Methods</strong> — Industrialisation IA, cadrage technologique, Agile, AMOA/AMOE</li>
        </ul>
      </div>
    </>
  );
}

import Link from "next/link";

export const metadata = { title: "À propos — EMI" };

export default function AboutPage() {
  return (
    <>
      <h1 className="section-title" style={{ fontSize: 48, marginTop: 0 }}>
        À propos
      </h1>
      <div className="prose">
        <p style={{ fontSize: 18, lineHeight: 1.8, marginBottom: 32 }}>
          Avec plus de six ans d'expérience dans la Data et l'IA, j'accompagne les entreprises dans leurs projets de
          transformation numérique dans l'énergie, le luxe, le transport et la R&D. Convaincu que la réussite d'un projet
          repose à <strong>80% sur le cadrage, l'écoute et la compréhension du besoin</strong> et à <strong>20% sur la technologie</strong>, 
          je privilégie la clarté des besoins, la valeur d'usage et la qualité du delivery. Polyvalent, j'associe la vision 
          du chef de projet à la maîtrise du Tech Lead pour concevoir des solutions fiables, performantes et alignées sur les enjeux métiers.
        </p>

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

        <h2>Coordonnées</h2>
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

        <h2>Langues</h2>
        <ul>
          <li><strong>Français</strong> – Langue maternelle</li>
          <li><strong>Anglais</strong> – Intermédiaire</li>
        </ul>

        <h2>Expertises fonctionnelles</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "16px" }}>
          <span className="badge">BI & Décisionnel</span>
          <span className="badge">Data & Intelligence Artificielle</span>
          <span className="badge">Fonctions support</span>
          <span className="badge">Industrie & Énergie</span>
          <span className="badge">R&D et Innovation</span>
          <span className="badge">Transformation digitale</span>
          <span className="badge">Architecture de données</span>
          <span className="badge">Gouvernance des données</span>
        </div>

        <h2>Expertises méthodologiques</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "16px" }}>
          <span className="badge">Étude amont & cadrage de besoin</span>
          <span className="badge">Homologation & Conception</span>
          <span className="badge">Planification et cadrage de projet</span>
          <span className="badge">Conduite du changement & Formation</span>
          <span className="badge">Méthodologie agile</span>
          <span className="badge">Architecture technique & Design</span>
          <span className="badge">Gestion des risques & Qualité</span>
          <span className="badge">Pilotage de projet & Reporting</span>
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
          <li><strong>mc2i</strong> – Tech Lead du Stream IA & Data Science – 10 mois (01/2025 – En cours)</li>
          <li><strong>Acteur majeur de l'énergie</strong> – Chef de Projet & Expert en Intelligence Artificielle – 1 an et 6 mois (05/2024 – En cours)</li>
          <li><strong>RATP</strong> – Chef de projet AMOA / AMOE Data & BI – 2 ans (05/2022 – 04/2024)</li>
          <li><strong>COJOP</strong> – Product Owner – 6 mois (10/2021 – 03/2022)</li>
          <li><strong>Acteur majeur de l'industrie du LUXE</strong> – Chef de projet SI – 1 an et 10 mois (01/2020 – 10/2021)</li>
          <li><strong>Équipementier aéronautique mondial</strong> – Master Data & AI Manager – 1 an (01/2019 – 12/2019)</li>
          <li><strong>VIF Software</strong> – Chef de projet ERP – 6 mois (06/2018 – 11/2018)</li>
        </ul>
      </div>
    </>
  );
}

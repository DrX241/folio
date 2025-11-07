export const metadata = { 
  title: "Médias & Formation — Eddy MISSONI Idembi",
  description: "IA'ctualités, formations, talks et podcasts sur l'IA générative, la Data Science et l'innovation."
};

export default function MediaPage() {
  return (
    <>
      <h1 className="section-title" style={{ fontSize: 48, marginTop: 0 }}>
        Médias & Formation
      </h1>
      <p style={{ color: "var(--fg-muted)", marginTop: 0, fontSize: 17, maxWidth: 700, marginBottom: 48 }}>
        Veille, tribunes, analyses et formations sur l'IA générative, la Data Science et l'innovation.
      </p>

      <div className="hero-card" style={{ marginBottom: 32 }}>
        <h2 style={{ marginTop: 0, marginBottom: 16, fontSize: 24 }}>IA'ctualités</h2>
        <p style={{ marginBottom: 16, lineHeight: 1.8 }}>
          Média interne mc2i dédié à la veille, la vulgarisation et la réflexion stratégique sur les usages de l'IA.
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          <li style={{ padding: "8px 0", fontSize: 15, lineHeight: 1.7 }}>
            → Tribunes et analyses IA (sélection à venir)
          </li>
          <li style={{ padding: "8px 0", fontSize: 15, lineHeight: 1.7 }}>
            → Retours d'expérience projets RAG et LLM
          </li>
          <li style={{ padding: "8px 0", fontSize: 15, lineHeight: 1.7 }}>
            → Veille technologique et éthique
          </li>
        </ul>
      </div>

      <div className="hero-card" style={{ marginBottom: 32 }}>
        <h2 style={{ marginTop: 0, marginBottom: 16, fontSize: 24 }}>Formations</h2>
        <p style={{ marginBottom: 16, lineHeight: 1.8 }}>
          Conception et animation de formations sur les fondamentaux de la Data Science et de l'IA générative.
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          <li style={{ padding: "8px 0", fontSize: 15, lineHeight: 1.7 }}>
            → Formations internes mc2i (Data Science, IA générative, RAG)
          </li>
          <li style={{ padding: "8px 0", fontSize: 15, lineHeight: 1.7 }}>
            → Interventions dans les grandes écoles partenaires
          </li>
          <li style={{ padding: "8px 0", fontSize: 15, lineHeight: 1.7 }}>
            → Modules "Créer votre premier algorithme" (article + notebook)
          </li>
        </ul>
      </div>

      <div className="hero-card">
        <h2 style={{ marginTop: 0, marginBottom: 16, fontSize: 24 }}>Talks & Podcasts</h2>
        <p style={{ marginBottom: 16, lineHeight: 1.8 }}>
          Interventions sur l'IA générative, la R&D, la propriété intellectuelle, le RAG et la sécurité/déploiement.
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          <li style={{ padding: "8px 0", fontSize: 15, lineHeight: 1.7 }}>
            → Conférences R&D et innovation (à lister)
          </li>
          <li style={{ padding: "8px 0", fontSize: 15, lineHeight: 1.7 }}>
            → Podcasts sur l'industrialisation IA (à lister)
          </li>
          <li style={{ padding: "8px 0", fontSize: 15, lineHeight: 1.7 }}>
            → Webinaires et retours d'expérience (à lister)
          </li>
        </ul>
      </div>
    </>
  );
}

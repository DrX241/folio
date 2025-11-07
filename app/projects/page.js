import ProjectCard from "@/components/ProjectCard";
import { getProjects } from "@/lib/projects";

export default function ProjectsPage() {
  // Utiliser uniquement les données JSON pour l'instant
  // Le support Markdown sera ajouté plus tard si nécessaire
  const data = getProjects();

  // Séparer les projets clients et internes
  const clientProjects = data.filter(p => 
    !p.slug.includes("iactualites") && 
    !p.slug.includes("rao-rfp") && 
    !p.slug.includes("rag-as-a-service") && 
    !p.slug.includes("cursor-llm") && 
    !p.slug.includes("mc2i-innovation-hub") && 
    !p.slug.includes("chatbot-full-online") && 
    !p.slug.includes("fyne-by-mc2i") && 
    !p.slug.includes("cyber-15-niveaux") && 
    !p.slug.includes("crisis-sim") && 
    !p.slug.includes("escape-game-cyber") && 
    !p.slug.includes("dc-validator") && 
    !p.slug.includes("pinecone") && 
    !p.slug.includes("odin") && 
    !p.slug.includes("un-lien") && 
    !p.slug.includes("i-am-data-ia") && 
    !p.slug.includes("kits-premier-algorithme") && 
    !p.slug.includes("templates-standards") && 
    !p.slug.includes("blind-prospection") && 
    !p.slug.includes("mobilite-innovation")
  );
  
  const internalProjects = data.filter(p => 
    p.slug.includes("iactualites") || 
    p.slug.includes("rao-rfp") || 
    p.slug.includes("rag-as-a-service") || 
    p.slug.includes("cursor-llm") || 
    p.slug.includes("mc2i-innovation-hub") || 
    p.slug.includes("chatbot-full-online") || 
    p.slug.includes("fyne-by-mc2i") || 
    p.slug.includes("cyber-15-niveaux") || 
    p.slug.includes("crisis-sim") || 
    p.slug.includes("escape-game-cyber") || 
    p.slug.includes("dc-validator") || 
    p.slug.includes("pinecone") || 
    p.slug.includes("odin") || 
    p.slug.includes("un-lien") || 
    p.slug.includes("i-am-data-ia") || 
    p.slug.includes("kits-premier-algorithme") || 
    p.slug.includes("templates-standards") || 
    p.slug.includes("blind-prospection") || 
    p.slug.includes("mobilite-innovation")
  );

  return (
    <>
      <h1 className="section-title" style={{ fontSize: 48, marginTop: 0 }}>
        Projets
      </h1>
      <p style={{ color: "var(--fg-muted)", marginTop: 0, fontSize: 18, maxWidth: 700, marginBottom: 48 }}>
        Sélection de réalisations en tant que Chef de projet / Tech Lead : projets clients et innovations internes mc2i.
      </p>

      <section style={{ marginBottom: 64 }}>
        <h2 className="section-title" style={{ fontSize: 32, marginTop: 0, marginBottom: 24 }}>
          Projets clients
        </h2>
        <div className="grid" style={{ marginTop: 0 }}>
          {clientProjects.map((p, index) => (
            <div
              key={p.slug}
              style={{
                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
              }}
            >
              <ProjectCard project={p} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="section-title" style={{ fontSize: 32, marginTop: 0, marginBottom: 24 }}>
          Innovations internes mc2i
        </h2>
        <p style={{ color: "var(--fg-muted)", marginBottom: 32, fontSize: 16 }}>
          Projets techniques internes développés au sein du Lab mc2i : plateformes IA, outils Data/Cloud, formations cyber, acculturation.
        </p>
        <div className="grid" style={{ marginTop: 0 }}>
          {internalProjects.map((p, index) => (
            <div
              key={p.slug}
              style={{
                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
              }}
            >
              <ProjectCard project={p} />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import Badge from "@/components/Badge";
import { getProject } from "@/lib/projects";

export default async function ProjectDetail({ params }) {
  const { slug } = await params;
  const project = getProject(slug);
  
  if (!project) return notFound();

  // Déterminer le Lab associé si applicable
  const labLink = 
    project.slug.includes("totalenergies") ? "/labs/rag-studio" :
    (project.slug.includes("rao-rfp") || project.slug.includes("iactualites")) ? "/labs/gen-lab" :
    project.slug.includes("fyne") ? "/labs/fyne" :
    (project.slug.includes("dc-validator") || project.slug.includes("pinecone") || project.slug.includes("odin")) ? "/labs/data-cloud" :
    null;

  return (
    <article className="prose">
      <div style={{ marginBottom: 24, fontSize: 14, color: "var(--accent)", fontWeight: 600, letterSpacing: "1px", fontFamily: "monospace", textTransform: "uppercase" }}>
        {project.year} — {project.role}
      </div>
      <h1 style={{ marginBottom: 24 }}>{project.title}</h1>
      <p style={{ marginTop: 24, fontSize: 20, lineHeight: 1.8, color: "var(--fg-muted)" }}>
        {project.teaser}
      </p>
      
      <h2>Contexte</h2>
      <p>{project.context}</p>
      
      <h2>Actions clés</h2>
      <ul>
        {project.actions?.map((a, i) => (
          <li key={i}>{a}</li>
        ))}
      </ul>
      
      <h2>Impact</h2>
      <ul>
        {project.impact?.map((a, i) => (
          <li key={i}>{a}</li>
        ))}
      </ul>
      
      <h2>Stack & mots-clés</h2>
      <div className="badges" style={{ marginBottom: 16 }}>
        {project.stack?.map((s) => (
          <Badge key={s}>{s}</Badge>
        ))}
      </div>
      <div className="badges">
        {project.tags?.map((s) => (
          <Badge key={s}>{s}</Badge>
        ))}
      </div>
      
      {project.kpis && project.kpis.length > 0 && (
        <>
          <h2 style={{ marginTop: 48 }}>Indicateurs clés</h2>
          <div className="kpis" style={{ marginTop: 16 }}>
            {project.kpis.map((k) => (
              <span className="kpi" key={k}>
                <strong>{k.split(":")[0]}:</strong> {k.split(":")[1]}
              </span>
            ))}
          </div>
        </>
      )}

      {labLink && (
        <div style={{ marginTop: 48, padding: "24px", border: "1px solid var(--line-blueprint)", background: "var(--accent-light)" }}>
          <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: 18 }}>Démonstration interactive</h3>
          <p style={{ marginBottom: 16, fontSize: 15, lineHeight: 1.7 }}>
            Découvrez une démonstration pédagogique de ce projet dans les Labs.
          </p>
          <Link href={labLink} className="btn primary">
            [ Voir la démo ]
          </Link>
        </div>
      )}
    </article>
  );
}

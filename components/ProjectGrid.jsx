import Link from "next/link";
import ProjectArt from "./ProjectArt";
import { explorations } from "@/lib/explorations";
export default function ProjectGrid({ items = explorations, headingLevel = 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return <div className={"u-project-grid" + (items.length === 4 ? " is-four" : "")}>{items.map(project => <Link className="u-project-card" href={"/projets/" + project.slug} key={project.slug}>
    <ProjectArt motif={project.motif} number={project.number} />
    <div className="u-project-caption"><span className="u-label">{project.category} / DÉMONSTRATEUR</span><span aria-hidden="true">↗</span></div>
    <Heading>{project.title}</Heading><p>{project.description}</p><div className="u-project-details"><span>{project.steps} étapes · environ {project.duration}</span><span>Lire la méthode et les limites ↗</span></div>
  </Link>)}</div>;
}

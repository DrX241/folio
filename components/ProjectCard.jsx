"use client";
import Link from "next/link";
import Badge from "./Badge";
import { useState } from "react";

export default function ProjectCard({ project }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="card"
      style={{ display: "block" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start", marginBottom: 12 }}>
        <h3 style={{ flex: 1 }}>{project.title}</h3>
        <span
          className="kpi"
          style={{
            transition: "all 0.3s ease",
            transform: isHovered ? "scale(1.1)" : "scale(1)",
          }}
        >
          <strong>{project.year}</strong>
        </span>
      </div>
      <p>{project.teaser}</p>
      <div className="badges">
        {project.tags?.slice(0, 5).map((t) => (
          <Badge key={t}>{t}</Badge>
        ))}
      </div>
      {project.kpis && project.kpis.length > 0 && (
        <div className="kpis">
          {project.kpis.map((k) => (
            <span className="kpi" key={k}>
              <strong>{k.split(":")[0]}:</strong> {k.split(":")[1]}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}

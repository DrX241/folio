"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { labTools } from "@/lib/lab-tools";

const FEATURED = labTools.slice(0, 6);

function ToolCard({ tool, index, visible }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/lab/${tool.id}`}
      style={{ textDecoration: "none", display: "block" }}
    >
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          padding: "28px",
          border: `1px solid ${hovered ? tool.color : "var(--line)"}`,
          background: hovered ? `${tool.color}08` : "var(--bg-secondary)",
          height: "100%",
          position: "relative",
          overflow: "hidden",
          cursor: "pointer",
          transition: "all 0.3s ease",
          opacity: visible ? 1 : 0,
          transform: visible ? "none" : "translateY(24px)",
          transitionDelay: `${index * 80}ms`,
        }}
      >
        {/* Corner accent */}
        <div style={{
          position: "absolute", top: 0, right: 0,
          width: 0, height: 0,
          borderStyle: "solid",
          borderWidth: `0 ${hovered ? 40 : 0}px ${hovered ? 40 : 0}px 0`,
          borderColor: `transparent ${tool.color} transparent transparent`,
          transition: "border-width 0.3s ease",
        }} />

        {/* Category pill */}
        <div style={{
          display: "inline-block",
          fontSize: 10, fontFamily: "monospace", fontWeight: 600,
          letterSpacing: "1.5px", textTransform: "uppercase",
          color: tool.color, marginBottom: 16,
          padding: "3px 10px",
          border: `1px solid ${tool.color}30`,
          background: `${tool.color}10`,
        }}>
          {tool.category}
        </div>

        <h3 style={{
          fontSize: 18, fontWeight: 800, letterSpacing: "-0.5px",
          color: "var(--fg)", margin: "0 0 10px",
          lineHeight: 1.2,
        }}>
          {tool.name}
        </h3>

        <p style={{
          fontSize: 13, color: "var(--fg-muted)", lineHeight: 1.7,
          margin: "0 0 16px",
        }}>
          {tool.description}
        </p>

        {/* Impact line */}
        <div style={{
          fontSize: 12, color: tool.color,
          fontStyle: "italic", lineHeight: 1.5,
          paddingTop: 12,
          borderTop: `1px solid ${tool.color}20`,
          display: "flex", alignItems: "flex-start", gap: 8,
        }}>
          <span style={{ opacity: 0.6 }}>→</span>
          {tool.impact}
        </div>

        {/* Launch indicator */}
        <div style={{
          position: "absolute", bottom: 20, right: 20,
          fontSize: 10, fontFamily: "monospace",
          color: hovered ? tool.color : "transparent",
          transition: "color 0.2s ease",
          letterSpacing: "1px",
        }}>
          LANCER ↗
        </div>
      </div>
    </Link>
  );
}

export default function LabShowcase() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.05 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      id="lab"
      style={{
        width: "100%",
        background: "var(--bg-secondary)",
        padding: "120px 0",
        position: "relative",
        borderTop: "1px solid var(--line)",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px" }}>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "flex-end",
          justifyContent: "space-between", gap: 24,
          marginBottom: 64, flexWrap: "wrap",
          opacity: visible ? 1 : 0,
          transform: visible ? "none" : "translateY(16px)",
          transition: "opacity 0.7s ease, transform 0.7s ease",
        }}>
          <div>
            <div style={{
              fontSize: 11, fontFamily: "monospace", fontWeight: 600,
              letterSpacing: "3px", textTransform: "uppercase",
              color: "var(--accent)", marginBottom: 16,
            }}>
              LAB — Démonstrateurs IA
            </div>
            <h2 style={{
              fontSize: "clamp(32px, 4.5vw, 56px)",
              fontWeight: 900, letterSpacing: "-2px",
              lineHeight: 1.05, margin: 0, color: "var(--fg)",
            }}>
              Cas d&apos;usage IA<br />
              <span style={{ color: "var(--accent)" }}>déployables.</span>
            </h2>
          </div>

          <Link
            href="/lab"
            style={{
              padding: "14px 28px",
              border: "2px solid var(--accent)",
              color: "var(--accent)",
              fontFamily: "monospace", fontWeight: 700,
              fontSize: 12, letterSpacing: "1px",
              textDecoration: "none", textTransform: "uppercase",
              display: "inline-block", whiteSpace: "nowrap",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--accent)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--accent)"; }}
          >
            [ Voir tout le LAB ]
          </Link>
        </div>

        {/* Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: 2,
        }}>
          {FEATURED.map((tool, i) => (
            <ToolCard key={tool.id} tool={tool} index={i} visible={visible} />
          ))}
        </div>
      </div>
    </section>
  );
}

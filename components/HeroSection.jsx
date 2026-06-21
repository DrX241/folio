"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const METRICS = [
  { value: 40, suffix: "+", label: "Projets IA livrés" },
  { value: 200, suffix: "+", label: "Utilisateurs formés" },
  { value: 300, suffix: "+", label: "Indicateurs pilotés" },
  { value: 7, suffix: " ans", label: "d'expérience Data & IA" },
];

function useCountUp(target, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

function MetricCard({ value, suffix, label, delay, active }) {
  const count = useCountUp(value, 1600, active);
  return (
    <div style={{
      padding: "24px 28px",
      border: "1px solid var(--line-blueprint)",
      background: "var(--bg-secondary)",
      position: "relative",
      overflow: "hidden",
      opacity: active ? 1 : 0,
      transform: active ? "translateY(0)" : "translateY(20px)",
      transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0,
        width: "3px", height: "100%",
        background: "var(--accent)",
      }} />
      <div style={{
        fontSize: 48, fontWeight: 800, letterSpacing: "-2px",
        color: "var(--fg)", lineHeight: 1, marginBottom: 6,
        fontVariantNumeric: "tabular-nums",
      }}>
        {count}{suffix}
      </div>
      <div style={{
        fontSize: 12, color: "var(--fg-muted)",
        fontFamily: "monospace", textTransform: "uppercase",
        letterSpacing: "1px",
      }}>
        {label}
      </div>
    </div>
  );
}

// SVG particles — neurons connectés en blueprint
function NeuralCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = canvas.offsetWidth;
    let h = canvas.offsetHeight;
    canvas.width = w;
    canvas.height = h;

    const NODE_COUNT = 28;
    const nodes = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 2 + 1.5,
      pulse: Math.random() * Math.PI * 2,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy; n.pulse += 0.02;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      });
      // Edges
      nodes.forEach((a, i) => {
        nodes.slice(i + 1).forEach(b => {
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(59,130,246,${(1 - dist / 180) * 0.18})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });
      // Nodes
      nodes.forEach(n => {
        const pulse = 0.7 + 0.3 * Math.sin(n.pulse);
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59,130,246,${0.4 * pulse})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * pulse * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59,130,246,${0.06 * pulse})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();

    const onResize = () => {
      w = canvas.offsetWidth; h = canvas.offsetHeight;
      canvas.width = w; canvas.height = h;
    };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);

  return (
    <canvas ref={canvasRef} style={{
      position: "absolute", inset: 0, width: "100%", height: "100%",
      opacity: 0.7, pointerEvents: "none",
    }} />
  );
}

export default function HeroSection() {
  const [visible, setVisible] = useState(false);
  const [metricsActive, setMetricsActive] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const metricsRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });

    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setMetricsActive(true); },
      { threshold: 0.3 }
    );
    if (metricsRef.current) obs.observe(metricsRef.current);

    return () => { clearTimeout(t); window.removeEventListener("scroll", onScroll); obs.disconnect(); };
  }, []);

  const parallax = scrollY * 0.15;

  return (
    <section style={{
      width: "100%", minHeight: "100vh",
      display: "flex", flexDirection: "column", justifyContent: "center",
      position: "relative", overflow: "hidden",
      background: "var(--bg)",
    }}>
      {/* Canvas neural background */}
      <NeuralCanvas />

      {/* Ligne verticale blueprint */}
      <div style={{
        position: "absolute", left: "5%", top: 0, bottom: 0,
        width: "2px", background: "var(--line-blueprint)",
        opacity: 0.5, zIndex: 0,
      }} />

      {/* Contenu principal */}
      <div style={{
        maxWidth: 1400, width: "100%", margin: "0 auto",
        padding: "120px 24px 80px",
        position: "relative", zIndex: 1,
        transform: `translateY(${-parallax}px)`,
      }}>
        {/* Eyebrow */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          marginBottom: 32,
          opacity: visible ? 1 : 0,
          transform: visible ? "none" : "translateY(12px)",
          transition: "opacity 0.7s ease, transform 0.7s ease",
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "var(--accent)",
            boxShadow: "0 0 0 3px rgba(37,99,235,0.2)",
            animation: "heroPulse 2s ease-in-out infinite",
          }} />
          <span style={{
            fontSize: 11, fontFamily: "monospace", fontWeight: 600,
            letterSpacing: "3px", textTransform: "uppercase",
            color: "var(--accent)",
          }}>
            EDDY MISSONI — PARIS
          </span>
        </div>

        {/* Titre principal */}
        <h1 style={{
          fontSize: "clamp(56px, 8vw, 112px)",
          fontWeight: 900,
          lineHeight: 0.95,
          letterSpacing: "-4px",
          margin: "0 0 24px",
          color: "var(--fg)",
          opacity: visible ? 1 : 0,
          transform: visible ? "none" : "translateY(20px)",
          transition: "opacity 0.8s ease 0.1s, transform 0.8s ease 0.1s",
        }}>
          Tech Lead<br />
          <span style={{
            color: "transparent",
            WebkitTextStroke: "2px var(--accent)",
            display: "inline-block",
          }}>
            Data & IA
          </span>
        </h1>

        {/* Accroche */}
        <p style={{
          fontSize: "clamp(16px, 2vw, 22px)",
          color: "var(--fg-muted)",
          lineHeight: 1.7,
          maxWidth: 580,
          margin: "0 0 48px",
          opacity: visible ? 1 : 0,
          transform: visible ? "none" : "translateY(16px)",
          transition: "opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s",
        }}>
          Je déploie des systèmes IA en production — de la stratégie au code.{" "}
          <strong style={{ color: "var(--fg)" }}>80% cadrage, 20% technologie.</strong>
        </p>

        {/* CTAs */}
        <div style={{
          display: "flex", gap: 16, flexWrap: "wrap",
          marginBottom: 80,
          opacity: visible ? 1 : 0,
          transform: visible ? "none" : "translateY(12px)",
          transition: "opacity 0.8s ease 0.3s, transform 0.8s ease 0.3s",
        }}>
          <Link href="/lab" style={{
            padding: "16px 36px", background: "var(--accent)",
            color: "#fff", fontFamily: "monospace", fontWeight: 700,
            fontSize: 14, letterSpacing: "1px", textTransform: "uppercase",
            textDecoration: "none", border: "2px solid var(--accent)",
            transition: "all 0.2s ease",
            display: "inline-block",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--accent)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--accent)"; e.currentTarget.style.color = "#fff"; }}
          >
            [ Explorer le LAB ]
          </Link>
          <Link href="/about" style={{
            padding: "16px 36px",
            color: "var(--fg)", fontFamily: "monospace", fontWeight: 700,
            fontSize: 14, letterSpacing: "1px", textTransform: "uppercase",
            textDecoration: "none", border: "2px solid var(--line-blueprint)",
            transition: "all 0.2s ease",
            display: "inline-block",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line-blueprint)"; e.currentTarget.style.color = "var(--fg)"; }}
          >
            [ Mon parcours ]
          </Link>
        </div>

        {/* Métriques */}
        <div ref={metricsRef} style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 2,
          maxWidth: 800,
        }}>
          {METRICS.map((m, i) => (
            <MetricCard key={i} {...m} delay={i * 120} active={metricsActive} />
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: "absolute", bottom: 32, left: "50%",
        transform: "translateX(-50%)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        opacity: visible ? (scrollY > 50 ? 0 : 0.6) : 0,
        transition: "opacity 0.4s ease",
      }}>
        <span style={{ fontSize: 10, fontFamily: "monospace", letterSpacing: "2px", color: "var(--fg-muted)", textTransform: "uppercase" }}>
          scroll
        </span>
        <div style={{
          width: 1, height: 48,
          background: "linear-gradient(to bottom, var(--accent), transparent)",
          animation: "scrollLine 1.5s ease-in-out infinite",
        }} />
      </div>

      <style>{`
        @keyframes heroPulse {
          0%, 100% { box-shadow: 0 0 0 3px rgba(37,99,235,0.2); }
          50% { box-shadow: 0 0 0 6px rgba(37,99,235,0); }
        }
        @keyframes scrollLine {
          0% { transform: scaleY(0); transform-origin: top; }
          50% { transform: scaleY(1); transform-origin: top; }
          51% { transform: scaleY(1); transform-origin: bottom; }
          100% { transform: scaleY(0); transform-origin: bottom; }
        }
      `}</style>
    </section>
  );
}

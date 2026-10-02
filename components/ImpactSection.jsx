"use client";
import { useEffect, useRef, useState } from "react";

const METRICS = [
  { value: 40, suffix: "+", label: "Projets IA livrés", pos: "top" },
  { value: 200, suffix: "+", label: "Collaborateurs formés", pos: "left" },
  { value: 300, suffix: "+", label: "Indicateurs pilotés", pos: "right" },
  { value: 7, suffix: " ans", label: "D'expertise terrain", pos: "bottom" },
];

function useCountUp(target, duration, active) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = null;
    const step = ts => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setN(Math.floor((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [active, target, duration]);
  return n;
}

function MetricItem({ value, suffix, label, active, delay }) {
  const n = useCountUp(value, 1400, active);
  return (
    <div style={{
      textAlign: "center",
      opacity: active ? 1 : 0,
      transform: active ? "none" : "scale(0.85)",
      transition: `opacity 0.7s ${delay}ms, transform 0.7s ${delay}ms`,
    }}>
      <div style={{
        fontSize: "clamp(48px,6vw,84px)", fontWeight: 900,
        letterSpacing: "-3px", lineHeight: 1,
        color: "#f0f0f5", fontVariantNumeric: "tabular-nums",
      }}>
        {n}{suffix}
      </div>
      <div style={{
        fontSize: 11, fontFamily: "monospace",
        color: "#8888a0", letterSpacing: "2px",
        textTransform: "uppercase", marginTop: 10,
      }}>
        {label}
      </div>
    </div>
  );
}

export default function ImpactSection() {
  const ref = useRef(null);
  const canvasRef = useRef(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setActive(true); },
      { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);

    // Canvas : halo pulsant central
    const canvas = canvasRef.current;
    if (!canvas) return () => obs.disconnect();
    const ctx = canvas.getContext("2d");
    let W = canvas.offsetWidth, H = canvas.offsetHeight;
    canvas.width = W; canvas.height = H;
    let phase = 0, raf;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2;
      // Anneaux concentriques qui pulsent
      for (let i = 3; i >= 0; i--) {
        const r = 80 + i * 60 + 20 * Math.sin(phase - i * 0.5);
        const alpha = (0.04 - i * 0.008) * (1 + 0.3 * Math.sin(phase));
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, `rgba(99,102,241,${alpha * 2})`);
        g.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }
      phase += 0.018;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { obs.disconnect(); cancelAnimationFrame(raf); };
  }, []);

  return (
    <section ref={ref} style={{
      width: "100%", background: "#111116",
      padding: "100px 24px",
      position: "relative", overflow: "hidden",
      borderTop: "1px solid #1e1e28",
    }}>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", textAlign: "center" }}>

        {/* Surtitle */}
        <div style={{
          fontFamily: "monospace", fontSize: 11,
          color: "#444458", letterSpacing: "3px",
          textTransform: "uppercase", marginBottom: 72,
          opacity: active ? 1 : 0, transition: "opacity 0.6s 0ms",
        }}>
          {"// Ce que 7 ans de terrain produisent"}
        </div>

        {/* Layout losange — desktop : grille 3×3 avec positions */}
        <div style={{ position: "relative", display: "none" }} className="diamond-desktop" />

        {/* Fallback flex pour tous */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "60px 80px",
          maxWidth: 700, margin: "0 auto",
        }}>
          {METRICS.map((m, i) => (
            <MetricItem key={i} {...m} active={active} delay={i * 120} />
          ))}
        </div>

        {/* Séparateur central */}
        <div style={{
          margin: "72px auto 0",
          width: 1, height: 40,
          background: "linear-gradient(to bottom, #6366f1, transparent)",
          opacity: active ? 0.5 : 0,
          transition: "opacity 0.8s 600ms",
        }} />
        <div style={{
          fontFamily: "monospace", fontSize: 12,
          color: "#444458", letterSpacing: "2px",
          marginTop: 16,
          opacity: active ? 1 : 0,
          transition: "opacity 0.8s 700ms",
        }}>
          Voici comment ces résultats ont été construits ↓
        </div>
      </div>
    </section>
  );
}

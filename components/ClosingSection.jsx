"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function ClosingSection() {
  const canvasRef = useRef(null);
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (ref.current) obs.observe(ref.current);

    // Canvas : champ de particules avec gravité vers le centre
    const canvas = canvasRef.current;
    if (!canvas) return () => obs.disconnect();
    const ctx = canvas.getContext("2d");
    let W = canvas.offsetWidth, H = canvas.offsetHeight;
    canvas.width = W; canvas.height = H;

    const count = 70;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      alpha: 0.03 + Math.random() * 0.06,
      r: 1 + Math.random() * 1.5,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2;

      particles.forEach(p => {
        // Gravité douce vers le centre
        const dx = cx - p.x, dy = cy - p.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        const force = 0.00015 * d;
        p.vx += dx * force;
        p.vy += dy * force;
        // Friction légère
        p.vx *= 0.995;
        p.vy *= 0.995;
        p.x += p.vx;
        p.y += p.vy;
        // Rebond
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,102,241,${p.alpha})`;
        ctx.fill();
      });

      // Lignes entre particules proches
      particles.forEach((a, i) => {
        particles.slice(i + 1, i + 6).forEach(b => {
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 100) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(99,102,241,${0.04 * (1 - d / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      raf = requestAnimationFrame(draw);
    };
    draw();

    const onResize = () => {
      W = canvas.offsetWidth; H = canvas.offsetHeight;
      canvas.width = W; canvas.height = H;
    };
    window.addEventListener("resize", onResize);
    return () => { obs.disconnect(); cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);

  return (
    <section ref={ref} style={{
      width: "100%", minHeight: "90vh",
      background: "#0c0c0f",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
      borderTop: "1px solid #1e1e28",
      padding: "80px 24px",
      textAlign: "center",
    }}>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />

      {/* Halo central */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        width: "60vw", height: "60vh",
        background: "radial-gradient(ellipse, rgba(99,102,241,0.07) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 800 }}>

        {/* Eyebrow */}
        <div style={{
          fontFamily: "monospace", fontSize: 11,
          color: "#6366f1", letterSpacing: "3px",
          textTransform: "uppercase", marginBottom: 48,
          opacity: visible ? 1 : 0, transition: "opacity 0.7s 0ms",
        }}>
          Vous avez une idée. J&apos;ai l&apos;architecture.
        </div>

        {/* Titre massif */}
        <h2 style={{ margin: "0 0 40px", lineHeight: 0.88, letterSpacing: "-4px" }}>
          <span style={{
            display: "block",
            fontSize: "clamp(52px,8vw,100px)", fontWeight: 900,
            color: "#f0f0f5",
            opacity: visible ? 1 : 0,
            transform: visible ? "none" : "translateY(30px)",
            transition: "opacity 0.9s 100ms, transform 0.9s 100ms",
          }}>Construisons</span>
          <span style={{
            display: "block",
            fontSize: "clamp(52px,8vw,100px)", fontWeight: 900,
            color: "transparent", WebkitTextStroke: "2px #6366f1",
            opacity: visible ? 1 : 0,
            transform: visible ? "none" : "translateY(30px)",
            transition: "opacity 0.9s 220ms, transform 0.9s 220ms",
          }}>quelque chose</span>
          <span style={{
            display: "block",
            fontSize: "clamp(28px,4vw,52px)", fontWeight: 900,
            color: "#f0f0f5",
            opacity: visible ? 1 : 0,
            transform: visible ? "none" : "translateY(30px)",
            transition: "opacity 0.9s 340ms, transform 0.9s 340ms",
          }}>d&apos;ambitieux.</span>
        </h2>

        {/* Sous-titre */}
        <p style={{
          fontSize: 16, color: "#8888a0", lineHeight: 1.7,
          maxWidth: 500, margin: "0 auto 56px",
          opacity: visible ? 1 : 0, transition: "opacity 0.8s 460ms",
        }}>
          Vous avez un projet IA. J&apos;ai l&apos;expérience pour le transformer en réalité opérationnelle.
        </p>

        {/* CTAs */}
        <div style={{
          display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap",
          opacity: visible ? 1 : 0, transition: "opacity 0.8s 560ms",
        }}>
          <a
            href="https://www.linkedin.com/in/eddy-missoni/"
            target="_blank" rel="noopener noreferrer"
            style={{
              padding: "14px 32px",
              border: "1px solid #1e1e28",
              color: "#8888a0", fontFamily: "monospace",
              fontWeight: 600, fontSize: 13, letterSpacing: "0.5px",
              textDecoration: "none", textTransform: "uppercase",
              transition: "border-color 0.2s, color 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.color = "#f0f0f5"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e1e28"; e.currentTarget.style.color = "#8888a0"; }}
          >
            LinkedIn ↗
          </a>
          <Link
            href="/about"
            style={{
              padding: "14px 32px",
              background: "#6366f1", color: "#fff",
              fontFamily: "monospace", fontWeight: 700,
              fontSize: 13, letterSpacing: "0.5px",
              textDecoration: "none", textTransform: "uppercase",
              border: "1px solid #6366f1",
              transition: "background 0.2s, border-color 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#818cf8"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#6366f1"; }}
          >
            Écrire →
          </Link>
        </div>

        {/* Signature */}
        <div style={{
          marginTop: 80,
          fontFamily: "monospace", fontSize: 10,
          color: "#2a2a3a", letterSpacing: "2px",
          textTransform: "uppercase",
          opacity: visible ? 1 : 0, transition: "opacity 1s 800ms",
        }}>
          Eddy Missoni · Tech Lead Data &amp; IA · Paris · 2026
        </div>
      </div>
    </section>
  );
}

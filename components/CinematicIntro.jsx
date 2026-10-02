"use client";
import { useEffect, useRef, useState } from "react";

export default function CinematicIntro({ onDone }) {
  const canvasRef = useRef(null);
  const [displayed, setDisplayed] = useState("");
  const [cursor, setCursor] = useState(true);
  const [phase, setPhase] = useState("typing");
  const full = "> initializing MISSONI.sys...";

  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i++;
      setDisplayed(full.slice(0, i));
      if (i >= full.length) {
        clearInterval(t);
        setTimeout(() => setPhase("fading"), 800);
        setTimeout(() => onDone(), 1700);
      }
    }, 52);
    return () => clearInterval(t);
  }, [onDone]);

  useEffect(() => {
    const t = setInterval(() => setCursor(c => !c), 480);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W = canvas.offsetWidth, H = canvas.offsetHeight;
    canvas.width = W; canvas.height = H;
    let frame = 0, raf;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const scanY = (frame * 1.5) % H;
      const g = ctx.createLinearGradient(0, scanY - 60, 0, scanY + 60);
      g.addColorStop(0, "transparent");
      g.addColorStop(0.5, "rgba(99,102,241,0.05)");
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      for (let y = 0; y < H; y += 3) {
        ctx.fillStyle = "rgba(0,0,0,0.12)";
        ctx.fillRect(0, y, W, 1);
      }
      frame++;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      onClick={() => { setPhase("fading"); setTimeout(onDone, 600); }}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "#000",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        cursor: "pointer",
        opacity: phase === "fading" ? 0 : 1,
        transition: "opacity 0.9s ease",
        pointerEvents: phase === "fading" ? "none" : "auto",
      }}
    >
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <div style={{ fontFamily: "monospace", fontSize: "clamp(13px,1.8vw,18px)", color: "#6366f1", letterSpacing: "2px", minHeight: "1.6em" }}>
          {displayed}<span style={{ opacity: cursor ? 1 : 0 }}>█</span>
        </div>
        <div style={{ marginTop: 40, fontSize: 10, fontFamily: "monospace", color: "#2a2a3a", letterSpacing: "4px", textTransform: "uppercase" }}>
          cliquer pour passer
        </div>
      </div>
    </div>
  );
}

"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Confetti from "@/components/Confetti";

const PADDING = 16;
const TOOLTIP_WIDTH = 360;
const TOOLTIP_HEIGHT = 340; // hauteur max estimée du tooltip
const TOOLTIP_GAP = 20;
const MARGIN = 16; // distance minimale des bords

const TOUR_STEPS = [
  {
    selector: null,
    scrollTo: "top",
    tag: "BIENVENUE",
    icon: "◈",
    title: "Eddy MISSONI — Tech Lead Data & IA",
    description:
      "Bienvenue ! Ce portfolio présente mes expériences, mes compétences et des démonstrateurs IA interactifs testables en direct. Je vais vous guider pas à pas.",
  },
  {
    selector: ".homepage-profile-sticky",
    scrollTo: "top",
    maxHeight: 480,
    tag: "PROFIL",
    icon: "◎",
    title: "Profil & positionnement",
    description:
      "À gauche, mon profil reste affiché pendant tout votre scroll : qui je suis, ce que j'apporte, et les liens vers mon profil complet.",
  },
  {
    selector: "#experiences",
    scrollTo: "#experiences",
    maxHeight: 420,
    tag: "EXPÉRIENCES",
    icon: "◉",
    title: "Fil d'expériences",
    description:
      "À droite, un fil chronologique de mes expériences clés. Scrollez pour les parcourir : NaTran, TotalEnergies, mc2i, RATP, LVMH, Safran…",
  },
  {
    selector: "#realisations",
    scrollTo: "#realisations",
    maxHeight: 380,
    tag: "LAB — CAS D'USAGE IA",
    icon: "⬡",
    title: "Démonstrateurs IA interactifs",
    description:
      "La section LAB regroupe des outils IA testables en live : Text-to-SQL, RAG multi-provider, générateur de données, anonymiseur… Utilisables avec vos propres clés API.",
  },
  {
    selector: "#competences",
    scrollTo: "#competences",
    maxHeight: 360,
    tag: "COMPÉTENCES",
    icon: "◆",
    title: "Compétences techniques",
    description:
      "Une vue d'ensemble de mes compétences : LLM, RAG, architectures Data/IA, gestion de projet, accompagnement des équipes et pilotage technique.",
  },
  {
    selector: "#nav-about",
    scrollTo: "top",
    tag: "À PROPOS",
    icon: "◐",
    title: "Ma vision & méthode",
    description:
      "La page À propos détaille mon approche, ma méthode de travail et mon positionnement en tant que Tech Lead & Chef de projet IA.",
  },
  {
    selector: ".chatbot-button",
    scrollTo: "bottom",
    tag: "CHATBOT",
    icon: "✦",
    title: "Posez vos questions",
    description:
      "Le chatbot en bas à droite est disponible à tout moment pour répondre à vos questions sur mon profil, mes expériences ou mes projets.",
  },
];

function computeSpotlight(el, maxHeight) {
  const raw = el.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const x = Math.max(0, raw.left - PADDING);
  const y = Math.max(0, raw.top - PADDING);
  const right = Math.min(vw, raw.right + PADDING);
  const bottom = maxHeight
    ? Math.min(vh, raw.top + maxHeight + PADDING)
    : Math.min(vh, raw.bottom + PADDING);

  return { x, y, w: right - x, h: bottom - y };
}

function computeTooltipPos(spot) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Fonctions de clamping garantissant que le tooltip reste dans le viewport
  const clampLeft = (l) =>
    Math.min(Math.max(l, MARGIN), vw - TOOLTIP_WIDTH - MARGIN);
  const clampTop = (t) =>
    Math.min(Math.max(t, MARGIN), vh - TOOLTIP_HEIGHT - MARGIN);

  const spaceRight = vw - (spot.x + spot.w) - MARGIN;
  const spaceLeft  = spot.x - MARGIN;
  const spaceBottom = vh - (spot.y + spot.h) - MARGIN;

  let placement;
  if (spaceRight >= TOOLTIP_WIDTH + TOOLTIP_GAP)        placement = "right";
  else if (spaceLeft >= TOOLTIP_WIDTH + TOOLTIP_GAP)    placement = "left";
  else if (spaceBottom >= TOOLTIP_HEIGHT + TOOLTIP_GAP) placement = "bottom";
  else                                                   placement = "top";

  const halfW = spot.x + spot.w / 2;

  if (placement === "right")
    return { left: spot.x + spot.w + TOOLTIP_GAP, top: clampTop(spot.y) };
  if (placement === "left")
    return { left: spot.x - TOOLTIP_WIDTH - TOOLTIP_GAP, top: clampTop(spot.y) };
  if (placement === "bottom")
    return { left: clampLeft(halfW - TOOLTIP_WIDTH / 2), top: clampTop(spot.y + spot.h + TOOLTIP_GAP) };
  // top
  return { left: clampLeft(halfW - TOOLTIP_WIDTH / 2), top: clampTop(spot.y - TOOLTIP_HEIGHT - TOOLTIP_GAP) };
}

export default function WelcomeTour() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);
  const [spotlight, setSpotlight] = useState(null); // { x, y, w, h }
  const [tooltipPos, setTooltipPos] = useState(null); // { top, left }
  const [transitioning, setTransitioning] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const stepRef = useRef(step);

  useEffect(() => { stepRef.current = step; }, [step]);

  useEffect(() => {
    const hasVisited = localStorage.getItem("portfolio_visited");
    if (!hasVisited) setTimeout(() => setShow(true), 900);
  }, []);

  const applySpotlight = useCallback((targetStep) => {
    const s = TOUR_STEPS[targetStep];
    if (!s.selector) {
      setSpotlight(null);
      setTooltipPos(null);
      return;
    }
    const el = document.querySelector(s.selector);
    if (!el) { setSpotlight(null); setTooltipPos(null); return; }

    const spot = computeSpotlight(el, s.maxHeight);
    const pos = computeTooltipPos(spot);
    setSpotlight(spot);
    setTooltipPos(pos);
  }, []);

  const scrollAndApply = useCallback((targetStep) => {
    const s = TOUR_STEPS[targetStep];

    if (s.scrollTo === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (s.scrollTo === "bottom") {
      // chatbot est fixed, pas besoin de scroll
    } else if (s.scrollTo && s.scrollTo !== "top") {
      const anchor = document.querySelector(s.scrollTo);
      if (anchor) {
        const y = anchor.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }

    // Attendre la fin du scroll avant de calculer la position
    setTimeout(() => applySpotlight(targetStep), 650);
  }, [applySpotlight]);

  // Recalcule spotlight si resize
  useEffect(() => {
    if (!show) return;
    const onResize = () => applySpotlight(stepRef.current);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [show, applySpotlight]);

  // Applique le spotlight au premier affichage
  useEffect(() => {
    if (show) scrollAndApply(0);
  }, [show]); // eslint-disable-line

  const goTo = useCallback((next) => {
    setTransitioning(true);
    setTimeout(() => {
      setStep(next);
      setTransitioning(false);
      scrollAndApply(next);
    }, 200);
  }, [scrollAndApply]);

  const dismiss = (withConfetti = false) => {
    localStorage.setItem("portfolio_visited", "true");
    if (withConfetti) {
      setConfetti(true);
      setTimeout(() => setConfetti(false), 3500);
    }
    setShow(false);
    setSpotlight(null);
  };

  if (!show && !confetti) return null;
  if (!show && confetti) return <Confetti active={confetti} />;

  const current = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;

  // Tooltip centré si pas de spotlight
  const isCentered = !spotlight || !tooltipPos;
  const tooltipStyle = isCentered
    ? {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translateX(-50%) translateY(-50%)",
        width: TOOLTIP_WIDTH,
        zIndex: 10001,
      }
    : {
        position: "fixed",
        top: tooltipPos.top,
        left: tooltipPos.left,
        width: TOOLTIP_WIDTH,
        zIndex: 10001,
        transform: "none",
      };

  return (
    <>
      <Confetti active={confetti} />
      {/* Overlay SVG avec découpe spotlight */}
      <svg
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 9998,
          pointerEvents: "all",
          cursor: "default",
        }}
        onClick={(e) => {
          // Clic sur le fond sombre = fermer
          if (e.target.tagName === "rect" && e.target.getAttribute("fill")?.includes("rgba")) dismiss();
        }}
      >
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            {spotlight && (
              <rect
                x={spotlight.x}
                y={spotlight.y}
                width={spotlight.w}
                height={spotlight.h}
                rx="6"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(10,14,39,0.82)"
          mask="url(#tour-mask)"
        />
      </svg>

      {/* Bordure lumineuse autour du spotlight */}
      {spotlight && (
        <div
          style={{
            position: "fixed",
            left: spotlight.x,
            top: spotlight.y,
            width: spotlight.w,
            height: spotlight.h,
            border: "2px solid var(--accent)",
            borderRadius: "6px",
            zIndex: 9999,
            pointerEvents: "none",
            boxShadow: "0 0 0 4px rgba(37,99,235,0.18), 0 0 24px rgba(37,99,235,0.25)",
            transition: "all 0.4s ease",
          }}
        />
      )}

      {/* Tooltip */}
      <div
        style={{
          ...tooltipStyle,
          background: "var(--bg)",
          border: "2px solid var(--line-blueprint)",
          padding: "32px",
          opacity: transitioning ? 0 : 1,
          transition: "opacity 0.2s ease",
          pointerEvents: "all",
        }}
      >
        {/* Coins décoratifs */}
        {[
          { top: -2, left: -2, borderTop: "2px solid var(--accent)", borderLeft: "2px solid var(--accent)" },
          { top: -2, right: -2, borderTop: "2px solid var(--accent)", borderRight: "2px solid var(--accent)" },
          { bottom: -2, left: -2, borderBottom: "2px solid var(--accent)", borderLeft: "2px solid var(--accent)" },
          { bottom: -2, right: -2, borderBottom: "2px solid var(--accent)", borderRight: "2px solid var(--accent)" },
        ].map((s, i) => (
          <div key={i} style={{ position: "absolute", width: 20, height: 20, ...s }} />
        ))}

        {/* Tag */}
        <div style={{ fontSize: 10, color: "var(--accent)", fontFamily: "monospace", fontWeight: 700, letterSpacing: "2px", marginBottom: 14 }}>
          {current.tag} — {step + 1}/{TOUR_STEPS.length}
        </div>

        {/* Icône + Titre */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <span style={{ fontSize: 28, color: "var(--accent)", lineHeight: 1 }}>{current.icon}</span>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "var(--fg)", lineHeight: 1.3 }}>
            {current.title}
          </h2>
        </div>

        {/* Description */}
        <p style={{ fontSize: 14, lineHeight: 1.75, color: "var(--fg-muted)", margin: "0 0 20px 0" }}>
          {current.description}
        </p>

        {/* Barre de progression */}
        <div style={{ display: "flex", gap: 5, marginBottom: 22, alignItems: "center" }}>
          {TOUR_STEPS.map((_, i) => (
            <div
              key={i}
              onClick={() => goTo(i)}
              title={TOUR_STEPS[i].tag}
              style={{
                width: i === step ? 24 : 8,
                height: 7,
                borderRadius: 4,
                background: i <= step ? "var(--accent)" : "var(--line-blueprint)",
                opacity: i === step ? 1 : i < step ? 0.55 : 0.2,
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
            />
          ))}
        </div>

        {/* Boutons */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button
            onClick={dismiss}
            style={{
              background: "transparent", border: "none",
              color: "var(--fg-muted)", fontSize: 11,
              fontFamily: "monospace", cursor: "pointer",
              padding: 0, textDecoration: "underline", textUnderlineOffset: "3px",
            }}
          >
            Passer
          </button>
          <div style={{ display: "flex", gap: 8 }}>
            {step > 0 && (
              <button
                onClick={() => goTo(step - 1)}
                style={{
                  padding: "8px 16px",
                  border: "1px solid var(--line-blueprint)",
                  background: "transparent", color: "var(--fg)",
                  fontSize: 12, fontFamily: "monospace", cursor: "pointer",
                }}
              >
                ←
              </button>
            )}
            <button
              onClick={isLast ? () => dismiss(true) : () => goTo(step + 1)}
              style={{
                padding: "8px 18px",
                border: "2px solid var(--accent)",
                background: "var(--accent)", color: "#fff",
                fontSize: 12, fontFamily: "monospace",
                cursor: "pointer", fontWeight: 700,
              }}
            >
              {isLast ? "[ Explorer ]" : "Suivant →"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

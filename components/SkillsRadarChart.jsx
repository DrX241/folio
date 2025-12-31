"use client";
import { useEffect, useRef, useState } from "react";

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : "59, 130, 246";
}

export default function SkillsRadarChart({ skills, selectedSkill, onSkillClick }) {
  const canvasRef = useRef(null);
  const [hoveredSkill, setHoveredSkill] = useState(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [pulseAnimation, setPulseAnimation] = useState({});

  // Animation de croissance du polygone
  useEffect(() => {
    const duration = 1500;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimationProgress(eased);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }, [skills]);

  // Animation de pulsation pour les points
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseAnimation((prev) => ({
        ...prev,
        timestamp: Date.now()
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 2 - 80;
    const numSkills = skills.length;
    const angleStep = (2 * Math.PI) / numSkills;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get CSS variables
    const getCSSVariable = (varName) => {
      return getComputedStyle(document.documentElement)
        .getPropertyValue(varName)
        .trim();
    };
    
    const lineColor = getCSSVariable("--line-blueprint") || "#e5e7eb";
    const accentColor = getCSSVariable("--accent") || "#3b82f6";
    const bgColor = getCSSVariable("--bg") || "#ffffff";

    // Draw grid circles avec effet de fade
    for (let i = 1; i <= 5; i++) {
      const opacity = 0.3 + (i / 5) * 0.4;
      ctx.strokeStyle = lineColor;
      ctx.globalAlpha = opacity;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, (radius * i) / 5, 0, 2 * Math.PI);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Draw grid lines avec animation de vague
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1;
    for (let i = 0; i < numSkills; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      // Effet de vague subtil
      const waveOffset = Math.sin(Date.now() / 2000 + i) * 0.1;
      ctx.globalAlpha = 0.4 + waveOffset * 0.2;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Draw data polygon avec animation de croissance
    const fillColor = selectedSkill
      ? `rgba(${hexToRgb(selectedSkill.color)}, 0.25)`
      : `rgba(${hexToRgb(accentColor)}, 0.25)`;
    const strokeColor = selectedSkill
      ? selectedSkill.color
      : accentColor;
    
    ctx.fillStyle = fillColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 3;

    ctx.beginPath();
    skills.forEach((skill, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const skillRadius = (radius * skill.level * animationProgress) / 100;
      const x = centerX + Math.cos(angle) * skillRadius;
      const y = centerY + Math.sin(angle) * skillRadius;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Effet shimmer sur le polygone
    if (animationProgress >= 1) {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      const shimmerPos = (Date.now() / 2000) % 1;
      gradient.addColorStop(Math.max(0, shimmerPos - 0.1), "transparent");
      gradient.addColorStop(shimmerPos, "rgba(255, 255, 255, 0.3)");
      gradient.addColorStop(Math.min(1, shimmerPos + 0.1), "transparent");
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      skills.forEach((skill, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const skillRadius = (radius * skill.level) / 100;
        const x = centerX + Math.cos(angle) * skillRadius;
        const y = centerY + Math.sin(angle) * skillRadius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fill();
    }

    // Draw skill points avec pulsation
    skills.forEach((skill, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const skillRadius = (radius * skill.level) / 100;
      const x = centerX + Math.cos(angle) * skillRadius;
      const y = centerY + Math.sin(angle) * skillRadius;

      const isSelected = selectedSkill?.id === skill.id;
      const isHovered = hoveredSkill?.id === skill.id;
      const isActive = isSelected || isHovered;

      // Effet de pulsation
      const pulse = isActive ? 1 + Math.sin(Date.now() / 300) * 0.2 : 1;
      const pointSize = (isActive ? 10 : 6) * pulse;

      // Glow effect pour les points actifs
      if (isActive) {
        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, 20);
        glowGradient.addColorStop(0, skill.color);
        glowGradient.addColorStop(0.5, `${skill.color}80`);
        glowGradient.addColorStop(1, `${skill.color}00`);
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Point principal
      ctx.fillStyle = isActive ? skill.color : accentColor;
      ctx.beginPath();
      ctx.arc(x, y, pointSize, 0, 2 * Math.PI);
      ctx.fill();

      // Cercle extérieur pour les points actifs
      if (isActive) {
        ctx.strokeStyle = skill.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, pointSize + 4, 0, 2 * Math.PI);
        ctx.stroke();
      }
    });
  }, [skills, selectedSkill, hoveredSkill, animationProgress, pulseAnimation]);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 2 - 80;
    const numSkills = skills.length;
    const angleStep = (2 * Math.PI) / numSkills;

    let found = false;
    skills.forEach((skill, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const skillRadius = (radius * skill.level) / 100;
      const skillX = centerX + Math.cos(angle) * skillRadius;
      const skillY = centerY + Math.sin(angle) * skillRadius;

      const distance = Math.sqrt(
        Math.pow(x - skillX, 2) + Math.pow(y - skillY, 2)
      );

      if (distance < 25 && !found) {
        setHoveredSkill(skill);
        found = true;
      }
    });

    if (!found) {
      setHoveredSkill(null);
    }
  };

  const handleClick = (e) => {
    if (hoveredSkill && onSkillClick) {
      onSkillClick(hoveredSkill);
    }
  };

  // Calcul des positions des labels
  const getLabelPosition = (skill, index) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 2 - 80;
    const numSkills = skills.length;
    const angleStep = (2 * Math.PI) / numSkills;
    const angle = index * angleStep - Math.PI / 2;
    const labelRadius = radius + 70;
    
    return {
      x: centerX + Math.cos(angle) * labelRadius,
      y: centerY + Math.sin(angle) * labelRadius,
      angle: angle
    };
  };

  return (
    <div 
      style={{ 
        position: "relative", 
        width: "100%", 
        maxWidth: "750px", 
        margin: "0 auto",
        aspectRatio: "1/1"
      }}
    >
      <canvas
        ref={canvasRef}
        width={750}
        height={750}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        style={{
          cursor: hoveredSkill && onSkillClick ? "pointer" : "default",
          width: "100%",
          height: "100%",
          display: "block"
        }}
      />
      
      {/* Labels HTML au premier plan */}
      {skills.map((skill, index) => {
        const pos = getLabelPosition(skill, index);
        const isSelected = selectedSkill?.id === skill.id;
        const isHovered = hoveredSkill?.id === skill.id;
        const isActive = isSelected || isHovered;
        
        return (
          <div
            key={skill.id}
            onClick={onSkillClick ? () => onSkillClick(skill) : undefined}
            style={{
              position: "absolute",
              left: `${(pos.x / 750) * 100}%`,
              top: `${(pos.y / 750) * 100}%`,
              transform: "translate(-50%, -50%)",
              zIndex: isActive ? 20 : 15,
              cursor: onSkillClick ? "pointer" : "default",
              transition: "all 0.3s ease",
              transformOrigin: "center",
              scale: isActive ? "1.1" : "1"
            }}
            onMouseEnter={() => setHoveredSkill(skill)}
            onMouseLeave={() => setHoveredSkill(null)}
          >
            <div
              style={{
                background: isActive 
                  ? `linear-gradient(135deg, ${skill.color}15, ${skill.color}25)`
                  : "var(--bg-secondary)",
                border: `2px solid ${isActive ? skill.color : "var(--line-blueprint)"}`,
                padding: "8px 16px",
                borderRadius: "8px",
                boxShadow: isActive 
                  ? `0 4px 20px ${skill.color}40, 0 0 0 2px ${skill.color}20`
                  : "0 2px 8px rgba(0,0,0,0.1)",
                transition: "all 0.3s ease",
                whiteSpace: "nowrap",
                backdropFilter: "blur(10px)"
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: isActive ? 700 : 600,
                  color: isActive ? skill.color : "var(--fg)",
                  fontFamily: "monospace",
                  textAlign: "center",
                  letterSpacing: "0.5px",
                  textShadow: isActive ? `0 0 10px ${skill.color}60` : "none",
                  transition: "all 0.3s ease"
                }}
              >
                {skill.name}
              </div>
              {isActive && (
                <div
                  style={{
                    fontSize: "11px",
                    color: skill.color,
                    fontFamily: "monospace",
                    textAlign: "center",
                    marginTop: "4px",
                    fontWeight: 600,
                    animation: "fadeIn 0.3s ease"
                  }}
                >
                  {skill.level}%
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Tooltip central animé */}
      {hoveredSkill && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%) scale(1)",
            background: "var(--bg-secondary)",
            border: `2px solid ${hoveredSkill.color}`,
            padding: "20px",
            borderRadius: "12px",
            pointerEvents: "none",
            zIndex: 30,
            textAlign: "center",
            minWidth: "220px",
            boxShadow: `0 8px 32px ${hoveredSkill.color}30`,
            animation: "scaleIn 0.3s ease",
            backdropFilter: "blur(10px)"
          }}
        >
          <div
            style={{
              fontSize: "18px",
              fontWeight: 700,
              marginBottom: "8px",
              color: hoveredSkill.color,
              fontFamily: "monospace"
            }}
          >
            {hoveredSkill.name}
          </div>
          <div
            style={{
              fontSize: "16px",
              color: "var(--accent)",
              fontFamily: "monospace",
              marginBottom: "6px",
              fontWeight: 600
            }}
          >
            {hoveredSkill.level}% • {hoveredSkill.years} ans
          </div>
          <div
            style={{
              fontSize: "13px",
              color: "var(--fg-muted)",
              lineHeight: 1.5
            }}
          >
            {hoveredSkill.projects} projets
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `}</style>
    </div>
  );
}

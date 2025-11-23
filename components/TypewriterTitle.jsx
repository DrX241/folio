"use client";
import { useEffect, useState } from "react";

export default function TypewriterTitle() {
  const [currentDescriptionIndex, setCurrentDescriptionIndex] = useState(0);
  const [displayedDescription, setDisplayedDescription] = useState("");
  const [descCharIndex, setDescCharIndex] = useState(0);
  const [isDescDeleting, setIsDescDeleting] = useState(false);

  const titles = ["Chef de projet", "Tech Lead", "Data & IA"];
  const descriptions = [
    "Curieux et force de proposition",
    "Orienté impact client",
    "Passionné par l'IA et la Data",
    "Facilitateur entre tech et métier",
    "Promoteur de l'innovation utile",
    "Attentif à la qualité et à la valeur"
  ];

  // Animation de la description uniquement
  useEffect(() => {
    const currentDesc = descriptions[currentDescriptionIndex];
    const typingSpeed = 80;
    const deletingSpeed = 40;
    const pauseAfterComplete = 3000;
    const pauseAfterDelete = 500;

    let timeout;

    if (!isDescDeleting && descCharIndex < currentDesc.length) {
      // Typing
      timeout = setTimeout(() => {
        setDisplayedDescription(currentDesc.substring(0, descCharIndex + 1));
        setDescCharIndex(descCharIndex + 1);
      }, typingSpeed);
    } else if (!isDescDeleting && descCharIndex === currentDesc.length) {
      // Pause après avoir complété la description
      timeout = setTimeout(() => {
        setIsDescDeleting(true);
      }, pauseAfterComplete);
    } else if (isDescDeleting && descCharIndex > 0) {
      // Deleting
      timeout = setTimeout(() => {
        setDisplayedDescription(currentDesc.substring(0, descCharIndex - 1));
        setDescCharIndex(descCharIndex - 1);
      }, deletingSpeed);
    } else if (isDescDeleting && descCharIndex === 0) {
      // Pause après avoir supprimé, puis passer à la description suivante
      timeout = setTimeout(() => {
        setIsDescDeleting(false);
        setCurrentDescriptionIndex((currentDescriptionIndex + 1) % descriptions.length);
        setDescCharIndex(0);
      }, pauseAfterDelete);
    }

    return () => clearTimeout(timeout);
  }, [currentDescriptionIndex, descCharIndex, isDescDeleting]);

  return (
    <>
      <h1 style={{ 
        fontSize: 64, 
        fontWeight: 700, 
        marginBottom: 16,
        letterSpacing: "-3px",
        lineHeight: 1.1,
        color: "var(--fg)"
      }}>
        {titles[0]}
        <br />
        <span style={{ color: "var(--accent)" }}>{titles[1]}</span>
        <br />
        {titles[2]}
      </h1>
      <div style={{
        fontSize: 20,
        color: "var(--accent)",
        fontFamily: "monospace",
        marginTop: 8,
        marginBottom: 24,
        minHeight: "32px",
        display: "flex",
        alignItems: "center"
      }}>
        <span style={{ marginRight: 8 }}>→</span>
        <span>
          {displayedDescription}
          {!isDescDeleting && descCharIndex < descriptions[currentDescriptionIndex].length && (
            <span style={{ opacity: 0.5 }}>|</span>
          )}
        </span>
      </div>
    </>
  );
}


"use client";
import { useState } from "react";
export default function ContactForm() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus("");
    const formData = new FormData(e.target);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
    };
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok) {
        setStatus("Message envoyé avec succès !");
        e.target.reset();
      } else {
        setStatus(result.error || "Erreur lors de l'envoi");
      }
    } catch (error) {
      setStatus("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }
  return (
    <>
      <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="name" style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Nom</label>
          <input type="text" id="name" name="name" required style={{ width: "100%", maxWidth: 400, padding: 8, border: "1px solid var(--line)", borderRadius: 6 }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="email" style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Email</label>
          <input type="email" id="email" name="email" required style={{ width: "100%", maxWidth: 400, padding: 8, border: "1px solid var(--line)", borderRadius: 6 }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="message" style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Message</label>
          <textarea id="message" name="message" required rows={6} style={{ width: "100%", maxWidth: 400, padding: 8, border: "1px solid var(--line)", borderRadius: 6, fontFamily: "inherit" }}></textarea>
        </div>
        <button type="submit" className="btn primary" disabled={loading}>
          {loading ? "Envoi..." : "Envoyer"}
        </button>
      </form>
      {status && (
        <p style={{ marginTop: 16, color: status.includes("succès") ? "green" : "var(--muted)" }}>
          {status}
        </p>
      )}
      <p style={{ marginTop: 16, fontSize: 14, color: "var(--muted)" }}>
        Alternative : <a href="mailto:contact@example.com">contact@example.com</a> (à remplacer)
      </p>
    </>
  );
}












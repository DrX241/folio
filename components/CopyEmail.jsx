"use client";
import { useState } from "react";
import { site } from "@/lib/site";
export default function CopyEmail({ email = site.email }) {
  const [status, setStatus] = useState("");
  async function copy() {
    try { await navigator.clipboard.writeText(email); setStatus("Adresse copiée."); }
    catch { setStatus("La copie n’est pas disponible. Vous pouvez sélectionner l’adresse ci-dessus."); }
  }
  return <div><button type="button" className="u-button u-button-quiet" onClick={copy}>Copier l’adresse</button><p role="status">{status}</p></div>;
}

"use client";
import Link from "next/link";
export default function ErrorPage({ reset }) { return <section className="u-wrap u-error"><span className="u-label">UNE INTERRUPTION IMPRÉVUE</span><h1>Reprenons<br /><em>le fil.</em></h1><p>Le contenu n’a pas pu se charger. Vous pouvez réessayer ou revenir à l’accueil.</p><div className="u-action-row"><button className="u-button" onClick={reset}>Réessayer ↗</button><Link className="u-link" href="/">Retour à l’accueil</Link></div></section>; }

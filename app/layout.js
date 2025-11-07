import "./globals.css";
import Script from "next/script";
import Link from "next/link";
export const metadata = {
  title: "Eddy MISSONI Idembi – Tech Lead | Data & IA",
  description: "Tech Lead — Data & IA. Je conçois et pilote des solutions IA (RAG, LLM), Data/BI et plateformes immersives.",
  robots: { index: true, follow: true },
};
export default function RootLayout({ children }) {
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  return (
    <html lang="fr">
      <body>
        {plausibleDomain && (
          <Script
            defer
            data-domain={plausibleDomain}
            src="https://plausible.io/js/script.js"
            strategy="afterInteractive"
          />
        )}
        <div className="navbar">
          <div className="container navbar-inner">
            <Link className="brand" href="/" aria-label="Accueil">
              EMI — Tech Lead
            </Link>
            <nav className="navlinks" aria-label="Navigation principale">
              <Link href="/projects">Projets</Link>
              <Link href="/labs">Labs</Link>
              <Link href="/media">Médias</Link>
              <Link href="/about">À propos</Link>
            </nav>
          </div>
        </div>
        <main style={{ width: "100%", maxWidth: "100%", margin: 0, padding: 0 }}>{children}</main>
        <footer className="footer">
          <div className="container">© {new Date().getFullYear()} Eddy MISSONI Idembi — Tech Lead.</div>
        </footer>
      </body>
    </html>
  );
}


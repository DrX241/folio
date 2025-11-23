import "./globals.css";
import Script from "next/script";
import Link from "next/link";
import Chatbot from "@/components/Chatbot";
export const metadata = {
  title: "Eddy MISSONI – Tech Lead | Data & IA",
  description: "Tech Lead — Data & IA. Je conçois et pilote des solutions IA (RAG, LLM), Data/BI et plateformes immersives.",
  keywords: ["Tech Lead", "Data", "IA", "RAG", "LLM", "Chef de projet", "Next.js", "React"],
  authors: [{ name: "Eddy MISSONI" }],
  openGraph: {
    title: "Eddy MISSONI – Tech Lead | Data & IA",
    description: "Tech Lead — Data & IA. Solutions IA, Data/BI et plateformes immersives.",
    type: "website",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eddy MISSONI – Tech Lead | Data & IA",
    description: "Tech Lead — Data & IA. Solutions IA, Data/BI et plateformes immersives.",
  },
  robots: { 
    index: true, 
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    }
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0e27' }
  ]
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
              <Link href="/about">À propos</Link>
            </nav>
          </div>
        </div>
        <main style={{ width: "100%", maxWidth: "100%", margin: 0, padding: 0 }}>{children}</main>
        <Chatbot />
        <footer className="footer">
          <div className="container">© {new Date().getFullYear()} Eddy MISSONI — Tech Lead.</div>
        </footer>
      </body>
    </html>
  );
}


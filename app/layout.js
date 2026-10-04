import "./globals.css";
import "./universe.css";
import "./lab.css";
import "./lab-responsive.css";
import "./lab-learning.css";
import "./admin.css";
import "./cms.css";
import "./journal-editor.css";
import "./journal-studio.css";
import { publicContent } from "@/lib/cms-store.mjs";
import { themeCss } from "@/lib/cms-schema.mjs";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { site } from "@/lib/site";

// Global navigation and appearance come from the live CMS, including on 404 pages.
export const dynamic = 'force-dynamic';

export const metadata = {
  metadataBase: new URL(site.url),
  title: { default: "Eddy Missoni — Penser, construire, transmettre", template: "%s — Eddy Missoni" },
  description: site.description,
  authors: [{ name: site.name }],
  openGraph: { title: "Eddy Missoni — Penser, construire, transmettre", description: site.description, type: "website", locale: "fr_FR", siteName: site.name },
  twitter: { card: "summary_large_image" },
  alternates: { types: { "application/rss+xml": "/feed.xml" } },
};
export const viewport = { width: "device-width", initialScale: 1, themeColor: "#f3f0e8" };
export default async function RootLayout({ children }) {
  const settings = (await publicContent()).cms.settings;
  const schema = { "@context": "https://schema.org", "@type": "Person", name: site.name, url: site.url, jobTitle: "Tech Lead Data & IA", sameAs: [site.linkedin] };
  return <html lang="fr"><body>
    <style>{themeCss(settings)}</style>
    <a className="u-skip" href="#main-content">Aller au contenu</a>
    <SiteHeader settings={settings} />
    <main id="main-content" tabIndex={-1}>{children}</main>
    <SiteFooter settings={settings} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
  </body></html>;
}


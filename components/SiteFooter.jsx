import Link from "next/link";
import { defaultSettings } from "@/lib/cms-schema.mjs";
export default function SiteFooter({ settings = defaultSettings, preview = false }) {
  const navigation = settings.navigation;
  const site = settings;
  return <footer className="u-footer">
    <div className="u-wrap"><div className="u-footer-top"><div><p className="u-label">{settings.footerLabel}</p><Link className="u-footer-invite" href={settings.contactHref}>{settings.footerInvite} <span aria-hidden="true">↗</span></Link></div><a className="u-footer-mail" href={"mailto:" + site.email}>{site.email}</a></div>
    <div className="u-footer-middle"><Link className="u-footer-signature" href="/">{settings.brand}<span>.</span></Link><nav aria-label={preview ? "Explorer les pages dans l’aperçu" : "Explorer"}>{navigation.map(item => <Link key={item.href} href={item.href}>{item.label}</Link>)}</nav><div className="u-footer-social"><a href={site.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗<span className="u-sr-only"> (nouvel onglet)</span></a><a href={settings.cv}>Parcours / CV (PDF) ↗</a><Link href="/feed.xml">Flux RSS ↗</Link></div></div>
    <div className="u-footer-bottom"><span>© {new Date().getFullYear()} {settings.name} · {settings.copyright}</span><nav aria-label={preview ? "Informations du site dans l’aperçu" : "Informations du site"}><Link href="/mentions-legales">Mentions légales</Link><Link href="/confidentialite">Confidentialité</Link><Link href="/accessibilite">Accessibilité</Link><Link href="/plan-du-site">Plan du site</Link><Link href="/admin" prefetch={false}>Administration</Link></nav><a href="#main-content">En haut ↑</a></div></div>
  </footer>;
}

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { defaultSettings } from "@/lib/cms-schema.mjs";

export default function SiteHeader({ settings = defaultSettings, preview = false }) {
  const navigation = settings.navigation;
  const pathname = usePathname();
  const dialog = useRef(null);
  const trigger = useRef(null);
  const [open, setOpen] = useState(false);
  const close = () => dialog.current?.close();
  useEffect(() => { dialog.current?.close(); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [open]);
  const active = href => pathname === href || pathname.startsWith(href + "/");
  return (
    <header className="u-header">
      <div className="u-header-inner">
        <Link className="u-wordmark" href="/" aria-label={settings.name + ", accueil"}>{settings.brand}<span>·</span><small>{settings.tagline}</small></Link>
        <nav className="u-desktop-nav" aria-label={preview ? "Navigation principale de l’aperçu" : "Navigation principale"}>{navigation.map(item => <Link key={item.href} href={item.href} aria-current={active(item.href) ? "page" : undefined}>{item.label}</Link>)}</nav>
        <div className="u-nav-actions"><Link href="/recherche" className="u-search-link" aria-label="Rechercher dans le site"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="10" cy="10" r="6.5" /><path d="m15 15 6 6" /></svg></Link><Link className="u-nav-contact" href={settings.contactHref}>{settings.contactLabel} <span aria-hidden="true">↗</span></Link><button className="u-menu-trigger" ref={trigger} aria-haspopup="dialog" aria-controls="site-menu" aria-expanded={open} onClick={() => { dialog.current.showModal(); setOpen(true); }}>Menu <span aria-hidden="true">☰</span></button></div>
      </div>
      <dialog id="site-menu" className="u-menu" ref={dialog} aria-labelledby="menu-title" onClose={() => { setOpen(false); trigger.current?.focus(); }} onClick={event => { if (event.target === event.currentTarget) close(); }}>
        <div className="u-menu-top"><span id="menu-title" className="u-label">EXPLORER L’UNIVERS</span><button autoFocus onClick={close} aria-label="Fermer le menu">Fermer ×</button></div>
        <nav aria-label={preview ? "Navigation mobile de l’aperçu" : "Navigation mobile"}>{navigation.map((item, i) => <Link key={item.href} href={item.href} onClick={close} aria-current={active(item.href) ? "page" : undefined}><small>0{i+1}</small>{item.label}<span aria-hidden="true">↗</span></Link>)}</nav>
        <Link className="u-button" href={settings.contactHref} onClick={close}>{settings.contactLabel} ↗</Link>
      </dialog>
    </header>
  );
}

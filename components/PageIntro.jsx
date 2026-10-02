import Link from "next/link";
export default function PageIntro({ label, title, italic, description }) {
  return <header className="u-page-intro u-wrap"><nav className="u-breadcrumb" aria-label="Fil d’Ariane"><Link href="/">Accueil</Link><span aria-hidden="true">/</span><span aria-current="page">{label}</span></nav><p className="u-label">{label}</p><h1>{title}<br /><em>{italic}</em></h1>{description && <p className="u-page-description">{description}</p>}</header>;
}

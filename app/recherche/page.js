import { publicContent } from "@/lib/cms-store.mjs";
import Link from "next/link";
import PageIntro from "@/components/PageIntro";
import { explorations } from "@/lib/explorations";
import { publishedArticles } from "@/lib/journal";
import { pageMetadata } from "@/lib/site";
export const metadata = { ...pageMetadata("Recherche", "Retrouver une idée, un projet ou une page dans l’univers d’Eddy Missoni.", "/recherche"), robots:{ index:false,follow:true } };
const normalize = value => value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
export const dynamic = "force-dynamic";
export default async function SearchPage({ searchParams }) {
  const params=await searchParams; const query=(typeof params.q==="string" ? params.q : "").trim().slice(0,150);
  const cms = (await publicContent()).cms;
  const index=[
    ...Object.values(cms.documents).filter(doc => doc.enabled !== false && !doc.path.startsWith("/lab/") && !doc.path.startsWith("/projets/")).map(doc => ({ title: doc.title, description: doc.description, category: "Page", href: doc.path })),
    ...Object.values(cms.documents).filter(doc => doc.enabled !== false && doc.path.startsWith("/projets/")).map(doc => ({ title: doc.title, description: doc.description, category: "Projet", href: doc.path })),
    ...(await publishedArticles()).map(item=>({ title:item.title,description:item.summary,category:"Article",href:"/journal/"+item.slug })),
  ];
  const unique = [...new Map(index.map(item => [item.href, item])).values()];
  const words=normalize(query).split(/\s+/);
  const results=query ? unique.filter(item=>words.every(word=>normalize(item.title+" "+item.description+" "+item.category).includes(word))) : unique;
  return <><PageIntro label="Recherche" title="Suivre" italic="une idée." /><section className="u-wrap u-content-section" aria-label="Recherche dans les contenus"><form className="u-search-form" action="/recherche" method="get" role="search"><div><label htmlFor="site-search">Un sujet, un projet, un mot-clé</label><input id="site-search" type="search" name="q" defaultValue={query} maxLength={150} placeholder="Ex. : données, vision, 3D…" /></div><button className="u-button" type="submit">Rechercher ↗</button></form><p className="u-search-count">{results.length} résultat{results.length>1?"s":""}{query ? " pour « "+query+" »" : " à explorer"}</p>{results.length ? <ul className="u-results">{results.map(item=><li key={item.href}><Link href={item.href}><span className="u-label">{item.category}</span><h2>{item.title} ↗</h2><p>{item.description}</p></Link></li>)}</ul> : <div className="u-empty"><h2>Aucun résultat pour le moment.</h2><p>Essayez un terme plus court, comme « Data », « projet » ou « IA ».</p><Link className="u-link" href="/recherche">Afficher tous les contenus ↗</Link></div>}</section></>;
}

export const site = {
  name: "Eddy Missoni",
  url: "https://www.eddy-missoni.fr",
  email: "eddymissoni.pro@gmail.com",
  linkedin: "https://www.linkedin.com/in/eddy-missoni/",
  description: "Idées, projets et explorations d’Eddy Missoni, à la croisée de la Data, de l’intelligence artificielle et des usages.",
};
export function pageMetadata(title, description, path) {
  return {
    title, description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, type: "website", locale: "fr_FR", siteName: site.name, images: [{ url: "/opengraph-image", width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description, images: ["/opengraph-image"] },
  };
}
export const navigation = [
  { href: "/journal", label: "Journal" },
  { href: "/projets", label: "Projets" },
  { href: "/vision", label: "Vision" },
  { href: "/a-propos", label: "À propos" },
  { href: "/lab", label: "Le LAB" },
];

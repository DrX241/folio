import { site } from "@/lib/site";
import { publicContent } from "@/lib/cms-store.mjs";
export const dynamic = "force-dynamic";
export default async function sitemap() {
  const { cms, articles } = await publicContent();
  return [...Object.values(cms.documents).filter(doc => doc.enabled !== false).map(doc => doc.path), ...articles.map(article => "/journal/" + article.slug)]
    .map(path => ({ url: site.url + (path === "/" ? "" : path), changeFrequency: "monthly", priority: path === "/" ? 1 : 0.6 }));
}


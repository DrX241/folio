import { publicContent } from './cms-store.mjs';

export async function publishedArticles() {
  return (await publicContent()).articles
    .sort((a, b) => b.date.localeCompare(a.date));
}
export function readingMinutes(article) {
  const words = article.sections.flatMap(section => [section.heading, ...section.paragraphs]).join(" ").split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

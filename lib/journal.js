import { publicContent } from './cms-store.mjs';
import { articlePlainText } from './article-blocks.mjs';

export async function publishedArticles() {
  return (await publicContent()).articles
    .sort((a, b) => b.date.localeCompare(a.date));
}
export function readingMinutes(article) {
  const words = articlePlainText(article).split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

import { site } from "@/lib/site";
import { publishedArticles } from "@/lib/journal";
const escape = value => String(value).replace(/[<>&"']/g,c=>({"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;","'":"&apos;"}[c]));
export const dynamic = "force-dynamic";
export async function GET(){const items=(await publishedArticles()).map(a=>`<item><title>${escape(a.title)}</title><link>${site.url}/journal/${escape(a.slug)}</link><guid>${site.url}/journal/${escape(a.slug)}</guid><description>${escape(a.summary)}</description><pubDate>${new Date(a.date).toUTCString()}</pubDate></item>`).join("");return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Eddy Missoni — Journal</title><link>${site.url}/journal</link><description>Data, intelligence artificielle et construction utile.</description><language>fr</language>${items}</channel></rss>`,{headers:{"Content-Type":"application/rss+xml; charset=utf-8","Cache-Control":"no-cache"}});}


export default function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
  return [
    { url: `${base}/`, changefreq: "monthly", priority: 1.0 },
    { url: `${base}/about`, changefreq: "yearly", priority: 0.6 },
  ];
}



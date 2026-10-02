import { getMedia } from '@/lib/cms-store.mjs';
export const runtime = 'nodejs';
export async function GET(request, { params }) {
  try {
    const { file } = await params;
    const buffer = await getMedia(file);
    const types = { png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif' };
    return new Response(new Uint8Array(buffer), { headers: { 'Content-Type': types[file.split('.').pop()], 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' } });
  } catch { return new Response('Image introuvable', { status: 404 }); }
}

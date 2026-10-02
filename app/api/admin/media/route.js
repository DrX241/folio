import { NextResponse } from 'next/server';
import { CmsError, addMedia, sessionAccount } from '@/lib/cms-store.mjs';
export const runtime = 'nodejs';
export async function POST(request) {
  try {
    const origin = request.headers.get('origin');
    if (!origin || new URL(origin).host !== request.headers.get('host')) throw new CmsError('Origine incorrecte.', 403);
    const token = request.cookies.get('eddy_admin')?.value;
    if (!(await sessionAccount(token))) throw new CmsError('Connectez-vous pour ajouter une image.', 401);
    const file = (await request.formData()).get('file');
    if (!file || typeof file.arrayBuffer !== 'function' || file.size > 8 * 1024 * 1024) throw new CmsError('Choisissez une image de moins de 8 Mo.');
    const buffer = Buffer.from(await file.arrayBuffer());
    let extension;
    if (buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) extension = 'png';
    else if (buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255) extension = 'jpg';
    else if (buffer.subarray(0, 4).toString() === 'RIFF' && buffer.subarray(8, 12).toString() === 'WEBP') extension = 'webp';
    else if (['GIF87a','GIF89a'].includes(buffer.subarray(0, 6).toString())) extension = 'gif';
    if (!extension) throw new CmsError('Formats acceptés : PNG, JPEG, WebP et GIF.');
    return NextResponse.json(await addMedia(token, buffer, extension), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return NextResponse.json({ error: error instanceof CmsError ? error.message : 'L’image n’a pas pu être enregistrée.' }, { status: error.status || 500 }); }
}

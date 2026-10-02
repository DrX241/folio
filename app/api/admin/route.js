import { NextResponse } from 'next/server';
import { CmsError, createAccount, login, logout, adminContent, saveArticle, savePage, saveCms } from '@/lib/cms-store.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const cookieName = 'eddy_admin';
const noCache = { 'Cache-Control': 'no-store' };
export async function GET(request) {
  try { return NextResponse.json(await adminContent(request.cookies.get(cookieName)?.value), { headers: noCache }); }
  catch (error) { return failure(error); }
}
function failure(error) {
  if (!(error instanceof CmsError)) console.error('Admin request failed:', error.message);
  return NextResponse.json({ error: error instanceof CmsError ? error.message : 'L’enregistrement a échoué. Vos modifications restent dans l’éditeur.' }, { status: error.status || 500, headers: noCache });
}
export async function POST(request) {
  try {
    const origin = request.headers.get('origin');
    if (!origin || new URL(origin).host !== request.headers.get('host') || request.headers.get('sec-fetch-site') === 'cross-site') throw new CmsError('Cette requête ne vient pas du site.', 403);
    if (!request.headers.get('content-type')?.startsWith('application/json')) throw new CmsError('Format de requête incorrect.', 415);
    const raw = await request.text();
    if (Buffer.byteLength(raw) > 2 * 1024 * 1024) throw new CmsError('Le contenu dépasse la taille autorisée.', 413);
    let body;
    try { body = JSON.parse(raw); } catch { throw new CmsError('Requête incorrecte.'); }
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new CmsError('Requête incorrecte.');
    const token = request.cookies.get(cookieName)?.value;
    let newToken;
    let result = { ok: true };
    if (body.action === 'setup') newToken = await createAccount(body);
    else if (body.action === 'login') newToken = await login(body);
    else if (body.action === 'logout') await logout(token);
    else if (body.action === 'article') result = await saveArticle(token, body.article);
    else if (body.action === 'page') result = await savePage(token, body);
    else if (body.action === 'cms') result = await saveCms(token, body);
    else throw new CmsError('Action inconnue.');
    const response = NextResponse.json(result, { headers: noCache });
    if (newToken || body.action === 'logout') response.cookies.set(cookieName, newToken || '', { httpOnly: true, sameSite: 'strict', secure: request.nextUrl.protocol === 'https:', path: '/', maxAge: newToken ? 8 * 60 * 60 : 0 });
    return response;
  } catch (error) { return failure(error); }
}

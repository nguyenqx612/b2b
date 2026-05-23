import { NextRequest, NextResponse } from 'next/server';

function isValidProductImageKey(key: string) {
  return key.startsWith('products/') && !key.startsWith('/') && !key.includes('..') && !key.includes('\\');
}

async function fetchPublicImageUrl(apiUrl: string, key: string) {
  const res = await fetch(
    `${apiUrl}/api/public/products/image-url?key=${encodeURIComponent(key)}`,
    { cache: 'no-store' },
  );
  if (!res.ok) return null;
  const body = await res.json();
  return body.url as string;
}

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key');

  if (!key || !isValidProductImageKey(key)) {
    return NextResponse.json({ error: 'Invalid image key' }, { status: 400 });
  }

  const apiUrl = process.env.API_URL ?? 'http://api:3001';
  const url = await fetchPublicImageUrl(apiUrl, key);

  if (!url) {
    return NextResponse.json({ error: 'Image not available' }, { status: 404 });
  }

  return NextResponse.redirect(url, {
    headers: { 'Cache-Control': 'public, max-age=300' },
  });
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

function isValidProductImageKey(key: string) {
  return key.startsWith('products/') && !key.startsWith('/') && !key.includes('..') && !key.includes('\\');
}

async function fetchAuthenticatedImageUrl(apiUrl: string, key: string, token: string) {
  const res = await fetch(
    `${apiUrl}/api/products/image-url?key=${encodeURIComponent(key)}`,
    {
      cache: 'no-store',
      headers: { Authorization: `Bearer ${token}` },
    },
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

  const session = await auth();
  const token = session?.user?.accessToken;
  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const apiUrl = process.env.API_URL ?? 'http://localhost:3001';
  const url = await fetchAuthenticatedImageUrl(apiUrl, key, token);

  if (!url) {
    return NextResponse.json({ error: 'Image not available' }, { status: 404 });
  }

  return NextResponse.redirect(url, {
    headers: { 'Cache-Control': 'private, max-age=300' },
  });
}

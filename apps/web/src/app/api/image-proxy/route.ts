import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

function isValidProductImageKey(key: string) {
  return key.startsWith('products/') && !key.startsWith('/') && !key.includes('..') && !key.includes('\\');
}

export async function GET(req: NextRequest) {
  const session = await auth();
  const token = (session?.user as any)?.accessToken;
  const key = req.nextUrl.searchParams.get('key');

  if (!token) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  if (!key || !isValidProductImageKey(key)) {
    return NextResponse.json({ error: 'Invalid image key' }, { status: 400 });
  }

  const apiUrl = process.env.API_URL || 'http://b2b-api-1:3001';
  const signedUrlRes = await fetch(`${apiUrl}/api/messages/s3-signed-url?key=${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!signedUrlRes.ok) {
    return NextResponse.json({ error: 'Image not available' }, { status: signedUrlRes.status });
  }

  const { url } = await signedUrlRes.json();
  return NextResponse.redirect(url);
}

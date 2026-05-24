#!/usr/bin/env node

const email = process.argv[2] ?? 'thewynliving@gmail.com';
const password = process.argv[3] ?? 'password123';

const cookies = new Map();

function storeCookies(res) {
  const raw = typeof res.headers.getSetCookie === 'function'
    ? res.headers.getSetCookie()
    : [res.headers.get('set-cookie')].filter(Boolean);
  for (const header of raw) {
    const pair = header.split(';')[0];
    const idx = pair.indexOf('=');
    if (idx === -1) continue;
    cookies.set(pair.slice(0, idx), pair.slice(idx + 1));
  }
}

function cookieHeader() {
  return [...cookies.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
}

async function main() {
  const csrfRes = await fetch('http://localhost:3000/api/auth/csrf');
  storeCookies(csrfRes);
  const { csrfToken } = await csrfRes.json();

  const body = new URLSearchParams({
    csrfToken,
    email,
    password,
    redirect: 'false',
    json: 'true',
  });

  const res = await fetch('http://localhost:3000/api/auth/callback/credentials', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: cookieHeader(),
    },
    body,
    redirect: 'manual',
  });
  storeCookies(res);

  const text = await res.text();
  console.log('status:', res.status);
  console.log('cookies:', [...cookies.keys()].join(', ') || '(none)');
  console.log('body:', text.slice(0, 400));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

#!/usr/bin/env node

const email = process.argv[2] ?? 'thewynliving@gmail.com';
const password = process.argv[3] ?? 'password123';

async function main() {
  const csrfRes = await fetch('http://localhost:3000/api/auth/csrf');
  const { csrfToken } = await csrfRes.json();

  const body = new URLSearchParams({
    csrfToken,
    email,
    password,
    redirect: 'false',
  });

  const res = await fetch('http://localhost:3000/api/auth/callback/credentials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    redirect: 'manual',
  });

  const text = await res.text();
  console.log('status:', res.status);
  console.log('set-cookie:', res.headers.get('set-cookie')?.slice(0, 80) ?? '(none)');
  console.log('body:', text.slice(0, 300));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const envPath = path.join(root, '.env');
const examplePath = path.join(root, '.env.example');

if (!fs.existsSync(envPath) && fs.existsSync(examplePath)) {
  fs.copyFileSync(examplePath, envPath);
  console.log('Created .env from .env.example');
}

if (!fs.existsSync(envPath)) {
  process.exit(0);
}

function detectCodespaceName() {
  if (process.env.CODESPACE_NAME) return process.env.CODESPACE_NAME;
  const nameFile = path.join(__dirname, '.codespace-name');
  if (fs.existsSync(nameFile)) {
    return fs.readFileSync(nameFile, 'utf8').trim();
  }
  if (process.env.GITHUB_CODESPACES === 'true' || process.env.CODESPACES === 'true') {
    return null;
  }
  if (fs.existsSync('/workspaces/b2b')) return null;
  return null;
}

const codespaceName = detectCodespaceName();
const domain = process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN || 'app.github.dev';

let content = fs.readFileSync(envPath, 'utf8');

function setEnv(key, value) {
  const re = new RegExp(`^${key}=.*$`, 'm');
  const line = `${key}=${value}`;
  content = re.test(content) ? content.replace(re, line) : `${content.trimEnd()}\n${line}\n`;
}

if (codespaceName) {
  fs.writeFileSync(path.join(__dirname, '.codespace-name'), `${codespaceName}\n`);
  const webUrl = `https://${codespaceName}-3000.${domain}`;
  const apiPublicUrl = `https://${codespaceName}-3001.${domain}`;
  setEnv('NEXTAUTH_URL', webUrl);
  setEnv('AUTH_URL', webUrl);
  setEnv('NEXT_PUBLIC_API_URL', apiPublicUrl);
  setEnv('NEXT_PUBLIC_WS_URL', apiPublicUrl);
  setEnv('API_URL', 'http://localhost:3001');
  setEnv('AUTH_TRUST_HOST', 'true');
  console.log(`Codespaces URLs: web=${webUrl} api=${apiPublicUrl} (server API_URL=http://localhost:3001)`);
} else {
  console.log('Local devcontainer — .env URLs unchanged');
}

fs.writeFileSync(envPath, content);

// Next.js reads env from apps/web — mirror server-side auth vars from root .env.
const webEnvPath = path.join(root, 'apps/web/.env.local');
const keysForWeb = [
  'API_URL',
  'AUTH_SECRET',
  'AUTH_URL',
  'NEXTAUTH_URL',
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_WS_URL',
  'AUTH_TRUST_HOST',
];
const webLines = keysForWeb
  .map((key) => {
    const match = content.match(new RegExp(`^${key}=(.*)$`, 'm'));
    return match ? `${key}=${match[1]}` : null;
  })
  .filter(Boolean);
fs.writeFileSync(webEnvPath, `${webLines.join('\n')}\n`);
console.log(`Synced ${webLines.length} vars to apps/web/.env.local`);

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

const os = require('os');

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

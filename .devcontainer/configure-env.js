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

const codespaceName = process.env.CODESPACE_NAME;
const domain = process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN || 'app.github.dev';

let content = fs.readFileSync(envPath, 'utf8');

function setEnv(key, value) {
  const re = new RegExp(`^${key}=.*$`, 'm');
  const line = `${key}=${value}`;
  content = re.test(content) ? content.replace(re, line) : `${content.trimEnd()}\n${line}\n`;
}

if (codespaceName) {
  const webUrl = `https://${codespaceName}-3000.${domain}`;
  const apiUrl = `https://${codespaceName}-3001.${domain}`;
  setEnv('NEXTAUTH_URL', webUrl);
  setEnv('AUTH_URL', webUrl);
  setEnv('NEXT_PUBLIC_API_URL', apiUrl);
  setEnv('NEXT_PUBLIC_WS_URL', apiUrl);
  setEnv('AUTH_TRUST_HOST', 'true');
  console.log(`Codespaces URLs: web=${webUrl} api=${apiUrl}`);
} else {
  console.log('Local devcontainer — .env URLs unchanged');
}

fs.writeFileSync(envPath, content);

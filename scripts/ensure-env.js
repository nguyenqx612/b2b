#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const envFile = path.join(rootDir, '.env');
const envExampleFile = path.join(rootDir, '.env.example');

// If .env already exists, do nothing
if (fs.existsSync(envFile)) {
  process.exit(0);
}

// If .env.example doesn't exist, silently exit (we're likely in Docker build)
if (!fs.existsSync(envExampleFile)) {
  process.exit(0);
}

// Copy .env.example to .env
try {
  fs.copyFileSync(envExampleFile, envFile);
  console.log('✓ Created .env from .env.example');
  console.log('⚠️  Update secret values in .env before deploying to production');
  process.exit(0);
} catch (err) {
  console.error('✗ Failed to create .env:', err.message);
  process.exit(1);
}

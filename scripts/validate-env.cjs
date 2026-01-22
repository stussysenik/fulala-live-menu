#!/usr/bin/env node

/**
 * Build-time environment validation
 * Ensures required environment variables are set before building
 *
 * Checks both process.env and .env.local file for local development
 */

const fs = require('fs');
const path = require('path');

const required = ['VITE_CONVEX_URL'];

// Load .env.local if it exists (for local development)
const envLocalPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && !process.env[key]) {
        process.env[key] = valueParts.join('=');
      }
    }
  });
}

const missing = required.filter(key => !process.env[key]);

if (missing.length > 0) {
  console.error('❌ Missing required environment variables:');
  missing.forEach(key => console.error(`   - ${key}`));
  console.error('\nFor Vercel: Add these in Project Settings → Environment Variables');
  console.error('For local: Add to .env.local file');
  process.exit(1);
}

console.log('✓ All required environment variables are set');

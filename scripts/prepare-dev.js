#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local file
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  
  content.split('\n').forEach(line => {
    // Remove comments and trim
    line = line.split('#')[0].trim();
    if (!line) return;
    
    // Parse KEY=VALUE format
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      env[key] = value;
    }
  });
  
  return env;
}

// Load .env.local file
const rootDir = path.join(__dirname, '..');
const envLocalPath = path.join(rootDir, '.env.local');
const envLocal = loadEnvFile(envLocalPath);

// Merge with process.env (process.env takes precedence)
const env = { ...envLocal, ...process.env };

// Read the index.html file from root
const indexPath = path.join(rootDir, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.warn('index.html not found, skipping API key injection');
  process.exit(0);
}

const indexHtml = fs.readFileSync(indexPath, 'utf8');

// Get the GEMINI_API_KEY from environment variable or .env.local
const apiKey = env.GEMINI_API_KEY || '';

// Check if placeholder exists and replace it
if (indexHtml.includes("{{GEMINI_API_KEY}}")) {
  const updatedHtml = indexHtml.replace(
    "window.GEMINI_API_KEY = '{{GEMINI_API_KEY}}';",
    `window.GEMINI_API_KEY = '${apiKey}';`
  );
  
  // Write the updated file
  fs.writeFileSync(indexPath, updatedHtml, 'utf8');
  
  if (apiKey) {
    console.log('✓ Gemini API key injected into index.html');
  } else {
    console.warn('⚠ GEMINI_API_KEY not set. Gemini features will be disabled.');
    console.warn('  Set it in .env.local file or with: export GEMINI_API_KEY=your_key_here');
    if (!fs.existsSync(envLocalPath)) {
      console.warn(`  Create .env.local file with: GEMINI_API_KEY=your_key_here`);
    }
  }
} else {
  console.log('ℹ API key placeholder not found in index.html (may already be processed)');
}

// Ensure site.webmanifest is accessible at root for dev server
// Copy from public/ to root so Angular dev server can serve it
const manifestSource = path.join(rootDir, 'public/site.webmanifest');
const manifestDest = path.join(rootDir, 'site.webmanifest');

if (fs.existsSync(manifestSource)) {
  // Always copy (not symlink) to ensure Angular dev server can serve it
  fs.copyFileSync(manifestSource, manifestDest);
} else {
  console.warn('⚠ site.webmanifest not found in public/ folder');
}

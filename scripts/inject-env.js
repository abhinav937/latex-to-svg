#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the index.html file
const indexPath = path.join(__dirname, '../dist/index.html');
const indexHtml = fs.readFileSync(indexPath, 'utf8');

// Get the GEMINI_API_KEY from environment variable
const apiKey = process.env.GEMINI_API_KEY || '';

// Replace the placeholder with the actual API key
const updatedHtml = indexHtml.replace(
  "window.GEMINI_API_KEY = '{{GEMINI_API_KEY}}';",
  `window.GEMINI_API_KEY = '${apiKey}';`
);

// Write the updated file
fs.writeFileSync(indexPath, updatedHtml, 'utf8');

if (apiKey) {
  console.log('✓ Environment variable injected successfully');
} else {
  console.warn('⚠ GEMINI_API_KEY not found in environment variables');
  console.warn('  Make sure to set GEMINI_API_KEY in Vercel environment variables for production');
}

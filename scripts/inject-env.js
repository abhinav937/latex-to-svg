#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

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

console.log('Environment variable injected successfully');

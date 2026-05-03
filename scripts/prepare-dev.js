#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '..');

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

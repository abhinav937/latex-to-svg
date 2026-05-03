#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const manifestSource = path.join(rootDir, 'public', 'site.webmanifest');
const manifestDest = path.join(rootDir, 'dist', 'site.webmanifest');

if (!fs.existsSync(manifestSource)) {
  console.warn('⚠ public/site.webmanifest not found, skipping manifest copy');
  process.exit(0);
}

fs.copyFileSync(manifestSource, manifestDest);
console.log('✓ Copied site.webmanifest to dist/');

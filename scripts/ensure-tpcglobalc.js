#!/usr/bin/env node

/**
 * Deploy Safety Check - TPC Global
 * Ensures deployment only happens to tpcglobalc project
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_NAME = 'tpcglobalc';

// Check environment variable
const envProjectName = process.env.CF_PAGES_PROJECT_NAME;

if (envProjectName && envProjectName !== PROJECT_NAME) {
  console.error(`❌ DEPLOY BLOCKED: Wrong project detected!`);
  console.error(`   Expected: ${PROJECT_NAME}`);
  console.error(`   Found: ${envProjectName}`);
  console.error(`   Set CF_PAGES_PROJECT_NAME=${PROJECT_NAME} or remove the variable`);
  process.exit(1);
}

// Check if we're in the right directory
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error(`❌ DEPLOY BLOCKED: Not in project root directory!`);
  console.error(`   Expected to find package.json in: ${process.cwd()}`);
  process.exit(1);
}

// Check if dist folder exists (build output)
const distPath = path.join(process.cwd(), 'dist');
if (!fs.existsSync(distPath)) {
  console.error(`❌ DEPLOY BLOCKED: Build output not found!`);
  console.error(`   Run 'npm run build' first`);
  process.exit(1);
}

console.log(`✅ OK: Deploying to ${PROJECT_NAME}`);
console.log(`📁 Build output: ${distPath}`);
console.log(`🚀 Ready for deployment`);

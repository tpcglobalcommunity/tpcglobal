#!/usr/bin/env node

/**
 * Environment Validation - TPC Global
 * Validates Supabase ENV before build
 * Blocks deployment if ENV missing
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check required environment variables
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

let allValid = true;

console.log('🔍 Validating Supabase Environment Variables...');

for (const envVar of requiredEnvVars) {
  const value = process.env[envVar];
  
  if (!value || value.trim() === '') {
    console.error(`❌ MISSING: ${envVar}`);
    allValid = false;
  } else {
    // Mask sensitive values for logging
    const maskedValue = envVar.includes('KEY') 
      ? value.substring(0, 8) + '...' + value.substring(value.length - 4)
      : value;
    
    console.log(`✅ OK: ${envVar} = ${maskedValue}`);
  }
}

// Validate Supabase URL format
const supabaseUrl = process.env.VITE_SUPABASE_URL;
if (supabaseUrl) {
  try {
    const url = new URL(supabaseUrl);
    if (!url.hostname.includes('supabase')) {
      console.error(`❌ INVALID: Supabase URL must contain 'supabase' in hostname`);
      allValid = false;
    }
  } catch {
    console.error(`❌ INVALID: Supabase URL format is invalid`);
    allValid = false;
  }
}

if (!allValid) {
  console.error('\n❌ ENV VALIDATION FAILED - Deployment blocked');
  console.error('Please set the required environment variables in your build system.');
  process.exit(1);
}

console.log('\n✅ ENV OK: Supabase production detected');
console.log('🚀 Build can proceed safely');

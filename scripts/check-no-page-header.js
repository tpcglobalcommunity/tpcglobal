#!/usr/bin/env node

/**
 * Anti Double Header Guard
 * 
 * This script enforces the architecture rule that header components
 * should only be rendered in Layout components, never in Page components.
 * 
 * Violations will cause the build to fail.
 */

import fs from 'fs';
import path from 'path';

// Forbidden patterns that indicate header rendering in pages
const FORBIDDEN_PATTERNS = [
  '<AppHeader',
  '<PublicHeader', 
  '<Header',
  '<TopNav'
];

// Directories to scan (only pages, not layouts)
const SCAN_DIRECTORIES = [
  'src/pages'
];

// File extensions to check
const FILE_EXTENSIONS = ['.ts', '.tsx'];

function scanDirectory(dir, results = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      scanDirectory(filePath, results);
    } else if (FILE_EXTENSIONS.some(ext => file.endsWith(ext))) {
      results.push(filePath);
    }
  }
  
  return results;
}

function checkFileForViolations(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const violations = [];
    
    for (const pattern of FORBIDDEN_PATTERNS) {
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (line.includes(pattern)) {
          violations.push({
            pattern,
            line: index + 1,
            content: line.trim()
          });
        }
      });
    }
    
    return violations;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return [];
  }
}

function main() {
  console.log('🔍 Checking for header rendering violations in pages...\n');
  
  let hasViolations = false;
  let totalFilesChecked = 0;
  
  for (const scanDir of SCAN_DIRECTORIES) {
    if (!fs.existsSync(scanDir)) {
      console.log(`⚠️  Directory ${scanDir} does not exist, skipping...`);
      continue;
    }
    
    console.log(`📁 Scanning ${scanDir}...`);
    const files = scanDirectory(scanDir);
    totalFilesChecked += files.length;
    
    for (const file of files) {
      const violations = checkFileForViolations(file);
      
      if (violations.length > 0) {
        hasViolations = true;
        console.log(`\n❌ VIOLATION in ${file}:`);
        
        violations.forEach(violation => {
          console.log(`   Line ${violation.line}: ${violation.content}`);
          console.log(`   Pattern: ${violation.pattern}`);
        });
      }
    }
  }
  
  console.log(`\n📊 Scan complete: ${totalFilesChecked} files checked`);
  
  if (hasViolations) {
    console.log('\n🚨 BUILD FAILED: Header rendering violations detected!');
    console.log('\n📋 Architecture Rule:');
    console.log('   Header components (AppHeader/PublicHeader/Header/TopNav)');
    console.log('   MUST ONLY be rendered in Layout components, never in Pages.');
    console.log('\n🔧 How to fix:');
    console.log('   1. Remove header rendering from page components');
    console.log('   2. Use appropriate Layout component that includes header');
    console.log('   3. For pages without header, create dedicated Layout without header');
    console.log('\n📖 See: docs/ARCHITECTURE_RULES.md');
    
    process.exit(1);
  } else {
    console.log('✅ OK: No header rendering violations found in pages');
    console.log('🎯 Architecture rule compliance verified');
    process.exit(0);
  }
}

// Run the guard
main();

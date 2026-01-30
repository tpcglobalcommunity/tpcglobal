#!/usr/bin/env node

import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

async function optimizeLogo() {
  try {
    const inputPath = path.join(import.meta.dirname, '../public/favicons/android-chrome-512x512.png');
    const outputPath = path.join(import.meta.dirname, '../public/favicons/logo-ui-128.png');
    
    console.log('🎨 Optimizing logo for UI...');
    
    // Check if input exists
    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input file not found: ${inputPath}`);
    }
    
    // Resize and optimize
    await sharp(inputPath)
      .resize(128, 128, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png({
        quality: 80,
        compressionLevel: 9,
        progressive: true
      })
      .toFile(outputPath);
    
    // Get file size
    const stats = fs.statSync(outputPath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    
    console.log(`✅ Logo optimized successfully!`);
    console.log(`📁 Output: ${outputPath}`);
    console.log(`📏 Size: ${sizeKB} KB`);
    console.log(`🖼️  Resolution: 128x128px`);
    
    if (parseFloat(sizeKB) > 100) {
      console.warn(`⚠️  Warning: File size is ${sizeKB}KB (target <100KB)`);
    } else {
      console.log(`🎉 Perfect: File size is under 100KB!`);
    }
    
  } catch (error) {
    console.error('❌ Error optimizing logo:', error.message);
    process.exit(1);
  }
}

optimizeLogo();

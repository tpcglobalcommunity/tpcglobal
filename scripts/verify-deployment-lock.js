#!/usr/bin/env node

/**
 * 🤖 WINDSURF CODING AGENT - DEPLOYMENT LOCK VERIFICATION
 * 
 * Script ini untuk memverifikasi bahwa deployment sudah terkunci ke tpcglobalc
 * Jalankan di browser console atau Node.js
 */

const DEPLOYMENT_CONFIG = {
  targetProject: 'tpcglobalc',
  targetDomain: 'tpcglobal.io',
  targetSupabase: 'watoxiwtdnkpxdirkvvf.supabase.co',
  repo: 'ekodaeng/tpcglobal',
  branch: 'main'
};

// 🌐 Browser Console Verification
if (typeof window !== 'undefined') {
  console.log('🔍 DEPLOYMENT LOCK VERIFICATION - BROWSER');
  console.log('===========================================');
  
  // 1. Check Supabase URL
  const supabaseUrl = window.supabase?.supabaseUrl || 'unknown';
  console.log('📍 Supabase URL:', supabaseUrl);
  console.log('✅ Expected:', DEPLOYMENT_CONFIG.targetSupabase);
  console.log('🎯 Match:', supabaseUrl.includes(DEPLOYMENT_CONFIG.targetSupabase) ? '✅' : '❌');
  
  // 2. Test RPC Function
  if (window.supabase) {
    window.supabase.rpc('get_app_settings').then(result => {
      console.log('📍 RPC Test Result:', result);
      console.log('🎯 Status:', result ? '✅ SUCCESS' : '❌ FAILED');
    }).catch(error => {
      console.log('❌ RPC Error:', error);
    });
  }
  
  // 3. Check Network Requests
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    if (typeof url === 'string' && url.includes('supabase')) {
      console.log('📍 Supabase Request:', url);
      console.log('🎯 Correct Project:', url.includes(DEPLOYMENT_CONFIG.targetSupabase) ? '✅' : '❌');
    }
    return originalFetch.apply(this, args);
  };
  
  console.log('🔍 Monitoring network requests...');
  console.log('📋 Refresh page atau trigger action untuk melihat requests');
}

// 🖥️ Node.js Verification
if (typeof module !== 'undefined' && module.exports) {
  console.log('🔍 DEPLOYMENT LOCK VERIFICATION - NODE.JS');
  console.log('==========================================');
  
  const https = require('https');
  const { URL } = require('url');
  
  // Check domain resolution
  function checkDomain(domain) {
    return new Promise((resolve) => {
      const options = {
        hostname: domain,
        port: 443,
        path: '/',
        method: 'HEAD'
      };
      
      const req = https.request(options, (res) => {
        console.log(`📍 ${domain}: ${res.statusCode}`);
        console.log(`📍 Server: ${res.headers.server || 'unknown'}`);
        console.log(`📍 CF-RAY: ${res.headers['cf-ray'] || 'no-cf-ray'}`);
        resolve(res.statusCode === 200);
      });
      
      req.on('error', (err) => {
        console.log(`❌ ${domain}: ${err.message}`);
        resolve(false);
      });
      
      req.end();
    });
  }
  
  // Run checks
  async function runVerification() {
    console.log('🌐 Checking domain resolution...');
    await checkDomain(DEPLOYMENT_CONFIG.targetDomain);
    
    console.log('\n📋 DEPLOYMENT CONFIG SUMMARY:');
    console.log(`🎯 Target Project: ${DEPLOYMENT_CONFIG.targetProject}`);
    console.log(`🎯 Target Domain: ${DEPLOYMENT_CONFIG.targetDomain}`);
    console.log(`🎯 Target Supabase: ${DEPLOYMENT_CONFIG.targetSupabase}`);
    console.log(`🎯 Repository: ${DEPLOYMENT_CONFIG.repo}`);
    console.log(`🎯 Branch: ${DEPLOYMENT_CONFIG.branch}`);
    
    console.log('\n✅ VERIFICATION COMPLETE');
    console.log('📋 Manual verification still required for Cloudflare Pages config');
  }
  
  runVerification();
}

module.exports = DEPLOYMENT_CONFIG;

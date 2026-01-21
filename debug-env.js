// Debug environment variables
// Paste this in browser console or run as Node.js script

console.log('=== Environment Variables Debug ===');

// Check if we're in browser or Node.js
const isBrowser = typeof window !== 'undefined';

if (isBrowser) {
    // Browser environment - check import.meta.env
    console.log('Running in browser');
    console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('VITE_SUPABASE_ANON_KEY exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
    console.log('All VITE_ env vars:', Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));
    
    // Check if supabase client is configured
    import('./src/lib/supabase.js').then(({ supabase, isSupabaseConfigured }) => {
        console.log('Supabase configured:', isSupabaseConfigured);
        console.log('Supabase URL:', supabase.supabaseUrl);
        console.log('Supabase client exists:', !!supabase);
    }).catch(err => {
        console.error('Error loading supabase:', err);
    });
} else {
    // Node.js environment
    console.log('Running in Node.js');
    require('dotenv').config();
    console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL);
    console.log('VITE_SUPABASE_ANON_KEY exists:', !!process.env.VITE_SUPABASE_ANON_KEY);
}

// Test URL construction
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || process.env?.VITE_SUPABASE_URL;
if (supabaseUrl) {
    const rpcUrl = `${supabaseUrl}/rest/v1/rpc/validate_referral_code_public`;
    console.log('RPC URL:', rpcUrl);
    
    // Test fetch
    fetch(rpcUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env?.VITE_SUPABASE_ANON_KEY || process.env?.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env?.VITE_SUPABASE_ANON_KEY || process.env?.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ p_code: 'TEST-CODE' })
    })
    .then(res => res.json())
    .then(data => {
        console.log('RPC Test Response:', data);
    })
    .catch(err => {
        console.error('RPC Test Error:', err);
    });
} else {
    console.error('❌ VITE_SUPABASE_URL not found!');
}

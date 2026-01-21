// Paste this code in browser console on your website
(async () => {
    try {
        // Import supabase from the website
        const { supabase } = await import('./src/lib/supabase.js');
        
        const email = 'ctgoldbtc@gmail.com';
        console.log('Checking for user:', email);
        
        // Check in profiles table
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', email);
        
        if (error) {
            console.error('Error:', error);
            return;
        }
        
        if (profiles && profiles.length > 0) {
            console.log('✅ User found:', profiles[0]);
        } else {
            console.log('❌ User not found in profiles table');
            
            // Try checking if there are any recent users
            const { data: recentUsers } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);
            
            console.log('Recent users:', recentUsers);
        }
        
    } catch (error) {
        console.error('Error:', error);
    }
})();

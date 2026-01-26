// FINAL FRONTEND UPSERT SNIPPET - CompleteProfile
// This is already correctly implemented in CompleteProfilePage.tsx

// Get current user session
const { data: { session } } = await supabase.auth.getSession();
if (!session?.user) {
  setError('No authenticated session found. Please sign in again.');
  setTimeout(() => {
    navigate(`/${lang}/signin`);
  }, 2000);
  return;
}

// Prepare update data with correct field names
const updateData = {
  id: session.user.id,  // ALWAYS include user ID
  full_name: formData.full_name.trim(),
  phone: formData.phone.trim(),
  telegram: formData.telegram.trim(),
  city: formData.city.trim(),
  updated_at: new Date().toISOString()
};

// Update profile with upsert
const { error: updateError } = await supabase
  .from('profiles')
  .upsert(updateData, {
    onConflict: 'id',
    ignoreDuplicates: false
  });

if (updateError) {
  console.error('[CompleteProfile] Supabase error:', updateError);
  throw updateError;
}

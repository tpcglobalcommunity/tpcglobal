import { supabase } from "./supabase";
import { User } from "@supabase/supabase-js";

export async function ensureProfile(user: User) {
  try {
    // Check if user email is verified - ONLY CREATE PROFILE IF VERIFIED
    const isVerified = Boolean(user.email_confirmed_at || user.confirmed_at);
    if (!isVerified) {
      console.log('[ensureProfile] Email not verified, skipping profile creation');
      return null;
    }

    // Check if profile already exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 = "not found", which is expected for new users
      console.error("Error fetching profile:", fetchError);
      throw fetchError;
    }

    if (existingProfile) {
      // Profile exists, update if username/referral_code is missing
      const metadata = user.user_metadata || {};
      const updates: any = {};
      
      if (!existingProfile.username && metadata.username) {
        updates.username = metadata.username;
      }
      
      if (!existingProfile.referral_code && metadata.referral_code) {
        updates.referral_code = metadata.referral_code;
      }

      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase
          .from("profiles")
          .update(updates)
          .eq("id", user.id);

        if (updateError) {
          console.error("Error updating profile:", updateError);
          throw updateError;
        }
      }

      return existingProfile;
    }

    // Create new profile (ONLY IF EMAIL VERIFIED)
    const metadata = user.user_metadata || {};
    const { data: newProfile, error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email || "",
        username: metadata.username || "",
        referral_code: metadata.referral_code || "",
        role: "MEMBER",
        status: "PENDING",
        verified: false,
        can_invite: false,
        profile_required_completed: false, // Add this field
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating profile:", insertError);
      throw insertError;
    }

    return newProfile;
  } catch (error) {
    console.error("ensureProfile error:", error);
    throw error;
  }
}

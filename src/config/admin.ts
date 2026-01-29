// TPC Global Admin Configuration
// UUID WHITELIST ONLY - NON-NEGOTIABLE SECURITY

// Admin User IDs - Only these UUIDs can access admin
export const ADMIN_USER_IDS: string[] = [
  "cd6d5d3d-e59d-4fd0-8543-93da9e3d87c1",
];

// Required admin email (optional secondary gate)
export const REQUIRE_ADMIN_EMAIL = "tpcglobal.io@gmail.com";

// Check if user ID is in admin whitelist
export const isAdminUUID = (userId: string | undefined): boolean => {
  if (!userId) return false;
  return ADMIN_USER_IDS.includes(userId);
};

// Full admin validation (UUID + email)
export const isValidAdmin = (
  userId: string | undefined,
  email: string | undefined
): boolean => {
  if (!userId || !email) return false;
  return isAdminUUID(userId) && email === REQUIRE_ADMIN_EMAIL;
};

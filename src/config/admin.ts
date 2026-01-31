// TPC Global Admin Configuration
// UUID WHITELIST ONLY - NON-NEGOTIABLE SECURITY

// Admin User IDs - Only these UUIDs can access admin
export const ADMIN_USER_IDS: string[] = [
  "518694f6-bb50-4724-b4a5-77ad30152e0e",
];

// Check if user ID is in admin whitelist
export const isAdminUUID = (userId: string | undefined): boolean => {
  if (!userId) return false;
  return ADMIN_USER_IDS.includes(userId);
};

// Full admin validation (UUID only - email not required)
export const isValidAdmin = (
  userId: string | undefined,
  email?: string | undefined
): boolean => {
  if (!userId) return false;
  return isAdminUUID(userId);
};

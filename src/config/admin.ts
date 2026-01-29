export const ADMIN_USER_IDS = ["cd6d5d3d-e59d-4fd0-8543-93da9e3d87c1"];
export const requireAdminEmail = "tpcglobal.io@gmail.com";

export function isAdminUUID(userId: string): boolean {
  return ADMIN_USER_IDS.includes(userId);
}

export function isAdminUser(userId: string, email?: string): boolean {
  return isAdminUUID(userId) && email === requireAdminEmail;
}

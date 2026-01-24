export type ProfileRequiredFields = {
  full_name?: string | null;
  phone?: string | null;
  telegram?: string | null;
  city?: string | null;
};

export function isProfileComplete(p: ProfileRequiredFields | null | undefined): boolean {
  if (!p) return false;
  const fullNameOk = Boolean(p.full_name && p.full_name.trim().length > 0);
  const phoneOk = Boolean(p.phone && p.phone.trim().length > 0);
  const telegramOk = Boolean(p.telegram && p.telegram.trim().length > 0);
  const cityOk = Boolean(p.city && p.city.trim().length > 0);
  return fullNameOk && phoneOk && telegramOk && cityOk;
}

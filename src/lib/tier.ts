export type TpcTier = "BASIC" | "PRO" | "ELITE";

export function hasTier(current: string | null | undefined, required: TpcTier): boolean {
  const tier = (current ?? "BASIC") as TpcTier;
  const order: Record<TpcTier, number> = { BASIC: 0, PRO: 1, ELITE: 2 };
  return order[tier] >= order[required];
}

export function tierLabel(tier?: string | null) {
  return (tier ?? "BASIC").toUpperCase();
}

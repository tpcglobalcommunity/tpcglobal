// TPC Presale Configuration - LOCKED

export interface StageConfig {
  id: string;
  name: string;
  nameKey: string;
  supply: number;
  priceUsd: number;
}

export const PRESALE_STAGES: StageConfig[] = [
  {
    id: "stage1",
    name: "Stage 1",
    nameKey: "presale.stage1",
    supply: 100_000_000,
    priceUsd: 0.001,
  },
  {
    id: "stage2",
    name: "Stage 2",
    nameKey: "presale.stage2",
    supply: 100_000_000,
    priceUsd: 0.002,
  },
];

// DEX reference price (informational only)
export const DEX_REFERENCE_PRICE = 0.005;

// Default USD/IDR exchange rate
export const DEFAULT_USD_IDR_RATE = 17000;

// Calculate TPC amount from USD
export const calculateTpcFromUsd = (usd: number, stageId: string): number => {
  const stage = PRESALE_STAGES.find((s) => s.id === stageId);
  if (!stage) return 0;
  return usd / stage.priceUsd;
};

// Calculate USD from TPC amount
export const calculateUsdFromTpc = (tpc: number, stageId: string): number => {
  const stage = PRESALE_STAGES.find((s) => s.id === stageId);
  if (!stage) return 0;
  return tpc * stage.priceUsd;
};

// Calculate IDR from USD
export const calculateIdrFromUsd = (usd: number, rate: number = DEFAULT_USD_IDR_RATE): number => {
  return usd * rate;
};

// Format currency
export const formatUsd = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(amount);
};

export const formatIdr = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatTpc = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

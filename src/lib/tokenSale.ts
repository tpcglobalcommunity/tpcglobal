export interface PresaleStage {
  id: 'stage1' | 'stage2';
  name: string;
  price: number; // USD
  supply: number; // TPC tokens
}

export interface PresaleConfig {
  stages: PresaleStage[];
  dexReferencePrice: number; // USD
  defaultUsdIdrRate: number;
}

export const presaleConfig: PresaleConfig = {
  stages: [
    {
      id: 'stage1',
      name: 'Stage 1',
      price: 0.001,
      supply: 100_000_000,
    },
    {
      id: 'stage2',
      name: 'Stage 2',
      price: 0.002,
      supply: 100_000_000,
    },
  ],
  dexReferencePrice: 0.005,
  defaultUsdIdrRate: 17000,
};

export function getStageById(id: string): PresaleStage | undefined {
  return presaleConfig.stages.find(stage => stage.id === id);
}

export function calculateUsdAmount(tpcAmount: number, stageId: string): number {
  const stage = getStageById(stageId);
  if (!stage) return 0;
  return tpcAmount * stage.price;
}

export function calculateIdrAmount(usdAmount: number, rate: number = presaleConfig.defaultUsdIdrRate): number {
  return usdAmount * rate;
}

export function calculateTpcAmount(usdAmount: number, stageId: string): number {
  const stage = getStageById(stageId);
  if (!stage) return 0;
  return usdAmount / stage.price;
}

export function formatCurrency(amount: number, currency: 'USD' | 'IDR'): string {
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } else {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
}

export function formatTpcAmount(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

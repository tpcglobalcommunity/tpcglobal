// TPC Global Official Wallet Registry
// SINGLE SOURCE OF TRUTH - DO NOT MODIFY

export interface TPCWallet {
  label: string;
  labelKey: string;
  purpose: string;
  purposeKey: string;
  address: string;
  shortAddress: string;
  type: "payment" | "transparency";
}

// Payment Wallet - FOR ALL PAYMENTS
export const PAYMENT_WALLET: TPCWallet = {
  label: "Payment Wallet",
  labelKey: "wallets.payment",
  purpose: "FOR PAYMENT",
  purposeKey: "wallets.paymentPurpose",
  address: "5AeayrU2pdy6yNBeiUpTXkfMxw3VpDQGUHC6kXrBt5vw",
  shortAddress: "5Aea...t5vw",
  type: "payment",
};

// Transparency Wallets
export const TRANSPARENCY_WALLETS: TPCWallet[] = [
  {
    label: "Stage 1 Supply",
    labelKey: "wallets.stage1Supply",
    purpose: "Stage 1 Token Supply",
    purposeKey: "wallets.stage1Purpose",
    address: "At5nA9pw2ukSoAQj5vxqBmNbfk6UYF89UBsXtoFrf8t7",
    shortAddress: "At5n...8t7",
    type: "transparency",
  },
  {
    label: "Stage 2 Supply",
    labelKey: "wallets.stage2Supply",
    purpose: "Stage 2 Token Supply",
    purposeKey: "wallets.stage2Purpose",
    address: "FzUNpf4vVbTSzxcywAUba87FdZHvEBQZFNyKVMrchyAh",
    shortAddress: "FzUN...yAh",
    type: "transparency",
  },
  {
    label: "Liquidity",
    labelKey: "wallets.liquidity",
    purpose: "DEX Liquidity Pool",
    purposeKey: "wallets.liquidityPurpose",
    address: "CbaYJrd23Ak9dEDjVTExyjrgjn1MVSN1h3Ga7cRCnrxm",
    shortAddress: "CbaY...rxm",
    type: "transparency",
  },
  {
    label: "Buyback",
    labelKey: "wallets.buyback",
    purpose: "Token Buyback Fund",
    purposeKey: "wallets.buybackPurpose",
    address: "ALaCDQv5etXkrFqB91r7gNw5CpDe58nUyhWR8C5vKg7a",
    shortAddress: "ALaC...g7a",
    type: "transparency",
  },
  {
    label: "Burn",
    labelKey: "wallets.burn",
    purpose: "Token Burn Address",
    purposeKey: "wallets.burnPurpose",
    address: "H75PvmbP55LYbK3hGyrnxus2kZCjfZ4TmCGvyWcKPfL",
    shortAddress: "H75P...PfL",
    type: "transparency",
  },
  {
    label: "Mint TPC",
    labelKey: "wallets.mint",
    purpose: "Official TPC Mint Address",
    purposeKey: "wallets.mintPurpose",
    address: "2YJi7b95778Wv5DNWMZD86TN3fkUHDFwcDesrFoGdEka",
    shortAddress: "2YJi...Eka",
    type: "transparency",
  },
];

// All wallets combined
export const ALL_WALLETS: TPCWallet[] = [PAYMENT_WALLET, ...TRANSPARENCY_WALLETS];

// Explorer URL
export const getSolscanUrl = (address: string) => {
  return `https://solscan.io/account/${address}`;
};

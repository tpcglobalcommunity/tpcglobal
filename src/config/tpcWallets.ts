export interface TPCWallet {
  address: string;
  label: string;
  purpose: string;
  isPayment?: boolean;
}

export const tpcWallets: TPCWallet[] = [
  {
    address: '5AeayrU2pdy6yNBeiUpTXkfMxw3VpDQGUHC6kXrBt5vw',
    label: 'Payment Wallet',
    purpose: 'FOR PAYMENT',
    isPayment: true,
  },
  {
    address: 'At5nA9pw2ukSoAQj5vxqBmNbfk6UYF89UBsXtoFrf8t7',
    label: 'Stage 1 Supply',
    purpose: 'Transparency Wallet',
  },
  {
    address: 'FzUNpf4vVbTSzxcywAUba87FdZHvEBQZFNyKVMrchyAh',
    label: 'Stage 2 Supply',
    purpose: 'Transparency Wallet',
  },
  {
    address: 'CbaYJrd23Ak9dEDjVTExyjrgjn1MVSN1h3Ga7cRCnrxm',
    label: 'Liquidity',
    purpose: 'Transparency Wallet',
  },
  {
    address: 'ALaCDQv5etXkrFqB91r7gNw5CpDe58nUyhWR8C5vKg7a',
    label: 'Buyback',
    purpose: 'Transparency Wallet',
  },
  {
    address: 'H75PvmbP55LYbK3hGyrnxus2kZCjfZ4TmCGvyWcKPfL',
    label: 'Burn',
    purpose: 'Transparency Wallet',
  },
  {
    address: '2YJi7b95778Wv5DNWMZD86TN3fkUHDFwcDesrFoGdEka',
    label: 'Mint TPC',
    purpose: 'Transparency Wallet',
  },
];

export const paymentWallet = tpcWallets.find(w => w.isPayment);
export const transparencyWallets = tpcWallets.filter(w => !w.isPayment);

export function formatWalletAddress(address: string): string {
  if (address.length <= 8) return address;
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

export function getExplorerUrl(address: string): string {
  return `https://solscan.io/account/${address}`;
}

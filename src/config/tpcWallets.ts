export interface TPCWallet {
  address: string;
  label: string;
  purpose: string;
  category: 'payment' | 'transparency';
}

export const tpcWallets: TPCWallet[] = [
  {
    address: '5AeayrU2pdy6yNBeiUpTXkfMxw3VpDQGUHC6kXrBt5vw',
    label: 'Payment Wallet',
    purpose: 'Untuk pembayaran presale TPC',
    category: 'payment',
  },
  {
    address: 'At5nA9pw2ukSoAQj5vxqBmNbfk6UYF89UBsXtoFrf8t7',
    label: 'Stage 1 Supply',
    purpose: 'Suplai tahap 1 untuk transparansi',
    category: 'transparency',
  },
  {
    address: 'FzUNpf4vVbTSzxcywAUba87FdZHvEBQZFNyKVMrchyAh',
    label: 'Stage 2 Supply',
    purpose: 'Suplai tahap 2 untuk transparansi',
    category: 'transparency',
  },
  {
    address: 'CbaYJrd23Ak9dEDjVTExyjrgjn1MVSN1h3Ga7cRCnrxm',
    label: 'Liquidity',
    purpose: 'Liquidity DEX untuk trading',
    category: 'transparency',
  },
  {
    address: 'ALaCDQv5etXkrFqB91r7gNw5CpDe58nUyhWR8C5vKg7a',
    label: 'Buyback',
    purpose: 'Buyback program dari profit',
    category: 'transparency',
  },
  {
    address: 'H75PvmbP55LYbK3hGyrnxus2kZCjfZ4TmCGvyWcKPfL',
    label: 'Burn',
    purpose: 'Burn token untuk deflasi',
    category: 'transparency',
  },
  {
    address: '2YJi7b95778Wv5DNWMZD86TN3fkUHDFwcDesrFoGdEka',
    label: 'Mint TPC',
    purpose: 'Mint token untuk suplai',
    category: 'transparency',
  },
];

export const paymentWallets = tpcWallets.filter(w => w.category === 'payment');
export const transparencyWallets = tpcWallets.filter(w => w.category === 'transparency');

// Debug helpers
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  console.log('TPC Wallets Debug:', {
    total: tpcWallets.length,
    payment: paymentWallets.length,
    transparency: transparencyWallets.length,
    paymentWallets: paymentWallets.map(w => ({ label: w.label, address: w.address.slice(0, 8) + '...' })),
    transparencyWallets: transparencyWallets.map(w => ({ label: w.label, address: w.address.slice(0, 8) + '...' }))
  });
}

export function formatWalletAddress(address: string): string {
  if (address.length <= 8) return address;
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

export function getExplorerUrl(address: string): string {
  return `https://solscan.io/account/${address}`;
}

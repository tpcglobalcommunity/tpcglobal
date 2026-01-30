// Official TPC Global Constants
// Single source of truth for official addresses and links

export const OFFICIAL = {
  // Official Treasury Address (SOL/USDC receiving)
  TREASURY_ADDRESS: '5AeayrU2pdy6yNBeiUpTXkfMxw3VpDQGUHC6kXrBt5vw',
  
  // Official Website
  WEBSITE: 'https://tpcglobal.io',
  
  // Official Telegram Community
  TELEGRAM: 'https://t.me/tpcglobalcommunity',
  
  // Official Twitter
  TWITTER: 'https://twitter.com/tpcglobal',
  
  // Official Discord (if exists)
  DISCORD: 'https://discord.gg/tpcglobal',
  
  // Official Mint Address
  MINT_ADDRESS: '2YJi7b95778Wv5DNWMZD86TN3fkUHDFwcDesrFoGdEka',
  
  // Official Network
  NETWORK: 'Solana Mainnet',
  
  // Explorer Links
  SOLSCAN: 'https://solscan.io',
  SOLANA_EXPLORER: 'https://explorer.solana.com',
  
  // Social Media Links
  FACEBOOK: 'https://facebook.com/tpcglobal',
  INSTAGRAM: 'https://instagram.com/tpcglobal',
  
  // Legal Links
  TERMS: 'https://tpcglobal.io/terms',
  PRIVACY: 'https://tpcglobal.io/privacy',
  WHITEPAPER: 'https://tpcglobal.io/whitepaper'
} as const;

export const WALLET_TYPES = {
  TREASURY: 'treasury',
  DISTRIBUTION: 'distribution',
  MARKETING: 'marketing',
  LIQUIDITY: 'liquidity',
  BUYBACK: 'buyback',
  BURN: 'burn'
} as const;

export const NETWORKS = {
  SOLANA: 'solana',
  ETHEREUM: 'ethereum',
  BINANCE: 'binance',
  OKX: 'okx',
  JUPITER: 'jupiter'
} as const;

export const STAGES = {
  STAGE1: 'stage1',
  STAGE2: 'stage2'
} as const;

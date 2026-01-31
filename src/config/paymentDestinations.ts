import { OFFICIAL } from '@/lib/constants/official';

export interface PaymentDestination {
  method: string;
  type: 'bank' | 'crypto';
  details: {
    // Bank details
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    // Crypto details
    address?: string;
    instructions?: string;
  };
}

export const PAYMENT_DESTINATIONS: Record<string, PaymentDestination> = {
  BANK: {
    method: 'BANK',
    type: 'bank',
    details: {
      bankName: 'BCA - Bank Central Asia',
      accountName: 'TPC Global',
      accountNumber: '1234567890',
      instructions: 'Transfer ke rekening resmi TPC Global'
    }
  },
  USDC: {
    method: 'USDC',
    type: 'crypto',
    details: {
      address: OFFICIAL.TREASURY_ADDRESS,
      instructions: 'Send USDC ke alamat treasury resmi TPC'
    }
  },
  SOL: {
    method: 'SOL',
    type: 'crypto',
    details: {
      address: OFFICIAL.TREASURY_ADDRESS,
      instructions: 'Send SOL ke alamat treasury resmi TPC'
    }
  }
};

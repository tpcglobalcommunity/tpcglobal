/**
 * TPC Token Balance Checking
 * Handles SPL token balance queries for TPC tokens
 */

import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';

// TPC Token Mint Address (TODO: Replace with actual TPC token mint address)
const TPC_MINT_ADDRESS = new PublicKey('11111111111111111111111111111111111111111111111'); // Placeholder

// Solana RPC endpoint
const SOLANA_RPC_URL = 'https://api.mainnet-beta.solana.com';

/**
 * Get TPC token balance for a wallet
 * @param walletAddress - Solana wallet public key
 * @returns Promise<number> - TPC token balance
 */
export async function getTPCBalance(walletAddress: string): Promise<number> {
  try {
    const connection = new Connection(SOLANA_RPC_URL);
    const publicKey = new PublicKey(walletAddress);

    // Get associated token account address
    const associatedTokenAddress = getAssociatedTokenAddressSync(
      publicKey,
      TPC_MINT_ADDRESS
    );

    // Get token account info
    const tokenAccountInfo = await connection.getAccountInfo(associatedTokenAddress);

    if (!tokenAccountInfo || !tokenAccountInfo.data) {
      return 0;
    }

    // Parse token balance (this is a simplified version)
    // In a real implementation, you'd need to properly parse the SPL token account data
    // For now, return a stub balance
    return 0; // TODO: Implement actual TPC balance checking

  } catch (error) {
    console.error('Failed to get TPC balance:', error);
    return 0;
  }
}

/**
 * Check if wallet has minimum TPC balance
 * @param walletAddress - Solana wallet public key
 * @param minimumBalance - Minimum required balance (default: 1000)
 * @returns Promise<boolean> - True if balance >= minimum
 */
export async function hasMinimumTPCBalance(
  walletAddress: string, 
  minimumBalance: number = 1000
): Promise<boolean> {
  const balance = await getTPCBalance(walletAddress);
  return balance >= minimumBalance;
}

/**
 * Format TPC balance for display
 * @param balance - Raw token balance
 * @returns Formatted string
 */
export function formatTPCBalance(balance: number): string {
  return balance.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
}

/**
 * Mock balance for development/testing
 * @param walletAddress - Wallet address (not used in mock)
 * @returns Mock TPC balance
 */
export function getMockTPCBalance(walletAddress: string): number {
  // TODO: Remove this function and implement real balance checking
  // For now, return different mock balances based on wallet address
  const hash = walletAddress.slice(-8);
  const mockBalance = parseInt(hash, 16) % 5000; // Random balance 0-5000
  return mockBalance;
}

/**
 * Development balance checker (uses mock data)
 * @param walletAddress - Solana wallet public key
 * @returns Promise<number> - Mock TPC balance
 */
export async function getDevelopmentTPCBalance(walletAddress: string): Promise<number> {
  // In development, use mock data
  if (import.meta.env.DEV) {
    return getMockTPCBalance(walletAddress);
  }
  
  // In production, use real balance checking
  return await getTPCBalance(walletAddress);
}

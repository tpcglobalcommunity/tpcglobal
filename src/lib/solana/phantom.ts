/**
 * Phantom Wallet Connection Utilities
 * Handles connection, disconnection, and wallet state management
 */

export interface PhantomWallet {
  publicKey: {
    toString(): string;
  };
  isConnected: boolean;
}

export interface WalletState {
  isConnected: boolean;
  publicKey: string | null;
  balance: number;
}

/**
 * Check if Phantom wallet is available
 */
export function isPhantomAvailable(): boolean {
  return !!(window.solana && window.solana.isPhantom);
}

/**
 * Get current Phantom wallet instance
 */
export function getPhantomWallet() {
  return window.solana;
}

/**
 * Connect to Phantom wallet
 * @returns Promise<string> - Public key string
 */
export async function connectPhantom(): Promise<string> {
  if (!isPhantomAvailable()) {
    throw new Error("Phantom wallet is not installed. Please install Phantom browser extension.");
  }

  try {
    const response = await window.solana.connect();
    return response.publicKey.toString();
  } catch (error: any) {
    throw new Error(`Failed to connect to Phantom: ${error?.message || error}`);
  }
}

/**
 * Disconnect from Phantom wallet
 */
export async function disconnectPhantom(): Promise<void> {
  if (window.solana && window.solana.disconnect) {
    try {
      await window.solana.disconnect();
    } catch (error: any) {
      console.warn("Failed to disconnect from Phantom:", error);
    }
  }
}

/**
 * Get wallet connection state
 */
export function getWalletState(): WalletState {
  if (!window.solana) {
    return {
      isConnected: false,
      publicKey: null,
      balance: 0
    };
  }

  // Note: Phantom doesn't expose a direct isConnected property
  // We'll need to track this state in the app
  return {
    isConnected: false, // This should be tracked in app state
    publicKey: null, // This should be tracked in app state
    balance: 0 // This will be fetched from our API
  };
}

/**
 * Format wallet address for display
 */
export function formatWalletAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Validate wallet address format
 */
export function isValidSolanaAddress(address: string): boolean {
  // Basic validation for Solana address format
  const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  return solanaAddressRegex.test(address);
}

// Add TypeScript declarations for window.solana
declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: { toString(): string } }>;
      disconnect: () => Promise<void>;
      signTransaction: (transaction: any) => Promise<any>;
      signAllTransactions: (transactions: any[]) => Promise<any[]>;
    };
  }
}

/**
 * Token Balance Hooks for SOLR-ARC
 * Real-time sARC and USDC balance tracking
 */

import { useReadContract } from 'thirdweb/react';
import { sarcTokenContract, usdcContract } from '@/lib/contracts';

/**
 * Get sARC token balance for an address
 */
export function useSARCBalance(address: string | undefined) {
  return useReadContract({
    contract: sarcTokenContract,
    method: 'function balanceOf(address) view returns (uint256)',
    params: address ? [address] : undefined,
  });
}

/**
 * Get USDC balance for an address
 */
export function useUSDCBalance(address: string | undefined) {
  return useReadContract({
    contract: usdcContract,
    method: 'function balanceOf(address) view returns (uint256)',
    params: address ? [address] : undefined,
  });
}

/**
 * Get both balances in a single hook
 */
export function useBalances(address: string | undefined) {
  const sarcBalance = useSARCBalance(address);
  const usdcBalance = useUSDCBalance(address);

  return {
    sarc: {
      balance: sarcBalance.data || 0n,
      isLoading: sarcBalance.isLoading,
      error: sarcBalance.error,
    },
    usdc: {
      balance: usdcBalance.data || 0n,
      isLoading: usdcBalance.isLoading,
      error: usdcBalance.error,
    },
    isLoading: sarcBalance.isLoading || usdcBalance.isLoading,
    error: sarcBalance.error || usdcBalance.error,
  };
}

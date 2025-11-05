/**
 * MintingController Contract Hooks for SOLR-ARC
 * Manages sARC token minting operations
 */

import { useReadContract } from 'thirdweb/react';
import { mintingControllerContract } from '@/lib/contracts';

/**
 * Check if circuit breaker is triggered
 */
export function useCircuitBreakerStatus() {
  return useReadContract({
    contract: mintingControllerContract,
    method: 'function circuitBreakerTriggered() view returns (bool)',
  });
}

/**
 * Get current minting statistics
 */
export function useMintingStats() {
  return useReadContract({
    contract: mintingControllerContract,
    method: 'function getMintingStats() view returns (uint256 todayMinted, uint256 dailyRemaining, uint256 allTimeMinted, bool breakerStatus)',
  });
}

/**
 * Get producer-specific minting stats
 */
export function useProducerStats(address: string | undefined) {
  return useReadContract({
    contract: mintingControllerContract,
    method: 'function getProducerStats(address) view returns (uint256)',
    params: address ? [address] : undefined,
  });
}

/**
 * Note: Actual minting is handled by the PoG Agent (Cloudflare Worker)
 * Users call the PoG Agent API endpoint, which then calls mintFromGeneration()
 * This keeps the AI validation logic off-chain while ensuring blockchain security
 */

/**
 * Hook to check if a wallet is registered as a solar producer
 * Returns registration status and producer data
 */

import { useReadContract } from 'thirdweb/react';
import { registryContract } from '@/lib/contracts';

export interface ProducerData {
  isWhitelisted: boolean;
  systemCapacityKw: bigint;
  dailyCapKwh: bigint;
  totalMinted: bigint;
  lastMintTimestamp: bigint;
  ipfsMetadata: string;
  registrationDate: bigint;
}

/**
 * Check producer registration status and get their data
 */
export function useProducerStatus(address: string | undefined) {
  // Primary check: Get full producer data
  const producerResult = useReadContract({
    contract: registryContract,
    method: 'function getProducer(address) view returns (tuple(bool isWhitelisted, uint256 systemCapacityKw, uint256 dailyCapKwh, uint256 totalMinted, uint256 lastMintTimestamp, string ipfsMetadata, uint256 registrationDate))',
    params: address ? [address] : undefined,
  } as any);

  // Fallback check: Simple whitelist check
  const whitelistResult = useReadContract({
    contract: registryContract,
    method: 'function isWhitelisted(address) view returns (bool)',
    params: address ? [address] : undefined,
  } as any);

  // Debug logging
  if (address && !producerResult.isLoading && !whitelistResult.isLoading) {
    console.log('🔍 Checking registration for:', address);
    console.log('Producer data:', producerResult.data);
    console.log('Whitelist status:', whitelistResult.data);
    console.log('Producer error:', producerResult.error);
    console.log('Whitelist error:', whitelistResult.error);
  }

  // Parse the data if available
  const producerData: ProducerData | null = producerResult.data ? {
    isWhitelisted: producerResult.data[0],
    systemCapacityKw: producerResult.data[1],
    dailyCapKwh: producerResult.data[2],
    totalMinted: producerResult.data[3],
    lastMintTimestamp: producerResult.data[4],
    ipfsMetadata: producerResult.data[5],
    registrationDate: producerResult.data[6],
  } : null;

  // Determine registration status
  // Use whitelist check as primary source, fallback to producer data
  const isRegistered = whitelistResult.data === true || producerData?.isWhitelisted === true;

  console.log('✅ Final isRegistered status:', isRegistered);

  return {
    isRegistered,
    producerData,
    isLoading: producerResult.isLoading || whitelistResult.isLoading,
    error: producerResult.error || whitelistResult.error,
    refetch: async () => {
      await producerResult.refetch();
      await whitelistResult.refetch();
    },
  };
}

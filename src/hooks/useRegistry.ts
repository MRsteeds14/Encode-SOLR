/**
 * Registry Contract Hooks for SOLR-ARC
 * Manages solar producer registration and validation
 */

import { useReadContract, useSendTransaction } from 'thirdweb/react';
import { prepareContractCall } from 'thirdweb';
import { registryContract } from '@/lib/contracts';

/**
 * Check if an address is whitelisted as a solar producer
 */
export function useIsWhitelisted(address: string | undefined) {
  return useReadContract({
    contract: registryContract,
    method: 'function isWhitelisted(address) view returns (bool)',
    params: address ? [address] : undefined,
  });
}

/**
 * Get full producer profile
 */
export function useProducerProfile(address: string | undefined) {
  return useReadContract({
    contract: registryContract,
    method: 'function getProducer(address) view returns (tuple(bool isWhitelisted, uint256 systemCapacityKw, uint256 dailyCapKwh, uint256 totalMinted, uint256 lastMintTimestamp, string ipfsMetadata, uint256 registrationDate))',
    params: address ? [address] : undefined,
  });
}

/**
 * Validate if a production amount is within daily limits
 */
export function useValidateDailyProduction(
  address: string | undefined,
  kwhAmount: bigint | undefined
) {
  return useReadContract({
    contract: registryContract,
    method: 'function validateDailyProduction(address, uint256) view returns (bool isValid, string reason)',
    params: address && kwhAmount ? [address, kwhAmount] : undefined,
  });
}

/**
 * Register a new solar producer (for demo purposes)
 */
export function useRegisterProducer() {
  const { mutate: sendTx, isPending, isSuccess, isError, error } = useSendTransaction();

  const registerProducer = async (
    producerAddress: string,
    systemCapacityKw: number,
    dailyCapKwh: number,
    ipfsMetadata: string
  ) => {
    const transaction = prepareContractCall({
      contract: registryContract,
      method: 'function registerProducer(address, uint256, uint256, string)',
      params: [
        producerAddress,
        BigInt(systemCapacityKw),
        BigInt(dailyCapKwh),
        ipfsMetadata,
      ],
    });

    return sendTx(transaction);
  };

  return {
    registerProducer,
    isPending,
    isSuccess,
    isError,
    error,
  };
}

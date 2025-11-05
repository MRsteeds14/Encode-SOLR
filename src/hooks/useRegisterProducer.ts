/**
 * Hook to register a new solar producer
 * Handles the registration transaction with proper confirmation
 */

import { useSendTransaction } from 'thirdweb/react';
import { prepareContractCall, waitForReceipt } from 'thirdweb';
import { registryContract } from '@/lib/contracts';

export function useRegisterProducer() {
  const { mutate: sendTx, isPending, isSuccess, isError, error, data } = useSendTransaction();

  const register = async (
    producerAddress: string,
    systemCapacityKw: number,
    dailyCapKwh: number,
    ipfsMetadata: string = ''
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

    return new Promise((resolve, reject) => {
      sendTx(transaction, {
        onSuccess: (result) => {
          resolve(result);
        },
        onError: (error) => {
          reject(error);
        }
      });
    });
  };

  return {
    register,
    isPending,
    isSuccess,
    isError,
    error,
    data,
  };
}

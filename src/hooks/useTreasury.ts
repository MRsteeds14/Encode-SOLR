/**
 * Treasury Contract Hooks for SOLR-ARC
 * Manages sARC → USDC redemptions
 */

import { useReadContract, useSendTransaction } from 'thirdweb/react';
import { prepareContractCall } from 'thirdweb';
import { treasuryContract } from '@/lib/contracts';

/**
 * Calculate USDC amount for given sARC
 */
export function useCalculateRedemption(sarcAmount: bigint | undefined) {
  return useReadContract({
    contract: treasuryContract,
    method: 'function calculateRedemptionAmount(uint256) view returns (uint256)',
    params: sarcAmount ? [sarcAmount] : undefined,
  });
}

/**
 * Get Treasury balances
 */
export function useTreasuryBalance() {
  return useReadContract({
    contract: treasuryContract,
    method: 'function getTreasuryBalance() view returns (uint256 sarcBalance, uint256 usdcBalance)',
  });
}

/**
 * Get current exchange rate
 */
export function useExchangeRate() {
  return useReadContract({
    contract: treasuryContract,
    method: 'function usdcPerKwh() view returns (uint256)',
  });
}

/**
 * Redeem sARC tokens for USDC
 */
export function useRedeemForUSDC() {
  const { mutate: sendTx, isPending, isSuccess, isError, error, data } = useSendTransaction();

  const redeemForUSDC = async (sarcAmount: bigint, ipfsProof: string) => {
    const transaction = prepareContractCall({
      contract: treasuryContract,
      method: 'function redeemForUSDC(uint256, string)',
      params: [sarcAmount, ipfsProof],
    });

    return sendTx(transaction);
  };

  return {
    redeemForUSDC,
    isPending,
    isSuccess,
    isError,
    error,
    transactionData: data,
  };
}

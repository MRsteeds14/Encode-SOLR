/**
 * React hook for cross-chain USDC bridging via Circle CCTP
 */

import { useState, useCallback } from 'react';
import {
  bridgeUSDCFromArc,
  type SupportedChainId,
  SUPPORTED_CHAINS,
  getEstimatedTransferTime,
} from '@/lib/circle-bridge';

interface BridgeProgress {
  status: string;
  percentage: number;
}

interface BridgeResult {
  success: boolean;
  sourceTxHash?: string;
  destinationTxHash?: string;
  timeElapsed?: string;
  error?: string;
}

export function useCrossChainBridge() {
  const [bridging, setBridging] = useState(false);
  const [progress, setProgress] = useState<BridgeProgress>({
    status: 'Idle',
    percentage: 0,
  });
  const [result, setResult] = useState<BridgeResult | null>(null);

  const bridge = useCallback(
    async (
      destinationChain: SupportedChainId,
      amount: string,
      destinationAddress: string
    ): Promise<BridgeResult> => {
      setBridging(true);
      setProgress({ status: 'Initializing...', percentage: 0 });
      setResult(null);

      try {
        const bridgeResult = await bridgeUSDCFromArc(
          destinationChain,
          amount,
          destinationAddress,
          (progressUpdate) => {
            setProgress(progressUpdate);
          }
        );

        setResult(bridgeResult);
        setProgress({ status: 'Complete', percentage: 100 });

        return bridgeResult;
      } catch (error: any) {
        const errorResult: BridgeResult = {
          success: false,
          error: error.message || 'Bridge transfer failed',
        };
        setResult(errorResult);
        setProgress({ status: 'Failed', percentage: 0 });

        return errorResult;
      } finally {
        setBridging(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setBridging(false);
    setProgress({ status: 'Idle', percentage: 0 });
    setResult(null);
  }, []);

  return {
    // State
    bridging,
    progress,
    result,

    // Actions
    bridge,
    reset,

    // Utilities
    supportedChains: SUPPORTED_CHAINS,
    getEstimatedTime: getEstimatedTransferTime,
  };
}

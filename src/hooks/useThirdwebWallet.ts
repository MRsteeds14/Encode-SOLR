/**
 * Thirdweb Wallet Hook for SOLR-ARC
 * Handles wallet connection with Arc Testnet
 */

import { useConnect, useActiveAccount, useDisconnect } from 'thirdweb/react';
import { createWallet } from 'thirdweb/wallets';
import { arcTestnetChain } from '@/lib/thirdweb-config';

export function useThirdwebWallet() {
  const account = useActiveAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const connectWallet = async () => {
    try {
      // Create wallet instance (supports MetaMask, WalletConnect, Coinbase, etc.)
      const wallet = createWallet('io.metamask'); // or 'walletConnect', 'com.coinbase.wallet'

      // Connect to Arc Testnet
      await connect(async () => {
        await wallet.connect({
          client: thirdwebClient,
          chain: arcTestnetChain,
        });
        return wallet;
      });
    } catch (error) {
      console.error('Wallet connection failed:', error);
      throw error;
    }
  };

  const disconnectWallet = async () => {
    await disconnect();
  };

  return {
    account,
    address: account?.address,
    isConnected: !!account,
    connectWallet,
    disconnectWallet,
  };
}

/**
 * Thirdweb Wallet Hook for SOLR-ARC
 * Handles wallet connection with Arc Testnet
 */

import { useConnect, useActiveAccount, useDisconnect } from 'thirdweb/react';
import { createWallet } from 'thirdweb/wallets';
import { DEFAULT_CHAIN } from '@/lib/thirdweb-config';
import { client } from '@/lib/thirdweb-client';
import { arcTestnet } from '@/lib/chains';

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
          client,
          chain: DEFAULT_CHAIN ?? arcTestnet,
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

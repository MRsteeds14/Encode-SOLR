/**
 * Blockchain Network Definitions for SOLR-ARC
 * Defines Arc Testnet and other supported chains
 */

import { defineChain } from 'thirdweb';

// Arc Testnet - Circle's Layer-1 blockchain with native USDC
export const arcTestnet = defineChain({
  id: 5042002,
  name: 'Arc Testnet',
  rpc: 'https://rpc.testnet.arc.network',
  nativeCurrency: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 18, // Native USDC for gas uses 18 decimals
  },
  blockExplorers: [
    {
      name: 'ArcScan',
      url: 'https://testnet.arcscan.app',
      apiUrl: 'https://testnet.arcscan.app/api',
    },
  ],
  testnet: true,
});

// Export for easy access
export const supportedChains = [arcTestnet] as const;
export type SupportedChain = typeof arcTestnet;

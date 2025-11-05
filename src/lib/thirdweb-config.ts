/**
 * Thirdweb Configuration for SOLR-ARC
 * Connects to Arc Testnet with your client ID
 */

import { createThirdwebClient, defineChain } from 'thirdweb';

// Your Thirdweb Client ID
export const THIRDWEB_CLIENT_ID = import.meta.env.VITE_THIRDWEB_CLIENT_ID || 'f4f554536916e8c00f22a8bd2a2049d0';

// Initialize Thirdweb client
export const thirdwebClient = createThirdwebClient({
  clientId: THIRDWEB_CLIENT_ID,
});

// Define Arc Testnet chain for Thirdweb
export const arcTestnetChain = defineChain({
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 18, // Native USDC for gas
  },
  blockExplorers: [
    {
      name: 'ArcScan',
      url: 'https://testnet.arcscan.app',
    },
  ],
  testnet: true,
  rpc: 'https://rpc.testnet.arc.network',
});

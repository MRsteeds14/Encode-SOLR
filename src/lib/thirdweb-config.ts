/**
 * Thirdweb configuration helpers for SOLR-ARC
 * Exposes the shared Client ID and default chain for the app
 */

import { arcTestnet } from './chains';

export const THIRDWEB_CLIENT_ID =
  import.meta.env.VITE_THIRDWEB_CLIENT_ID || 'f4f554536916e8c00f22a8bd2a2049d0';

// Default chain used across the app (Arc Testnet)
export const DEFAULT_CHAIN = arcTestnet;

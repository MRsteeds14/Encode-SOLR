/**
 * Thirdweb Client Configuration for SOLR-ARC
 * Single client instance used throughout the application
 */

import { createThirdwebClient } from 'thirdweb';

export const client = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID || 'f4f554536916e8c00f22a8bd2a2049d0',
});

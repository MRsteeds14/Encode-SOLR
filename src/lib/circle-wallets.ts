/**
 * Circle Programmable Wallets Integration for SOLR-ARC
 * Enables seamless wallet creation and management for solar producers
 */

// Note: Install Circle SDK first:
// npm install @circle-fin/circle-sdk

interface ProducerWallet {
  walletId: string;
  address: string;
  blockchain: 'ARC';
  userId: string;
  createdAt: string;
}

interface WalletBalance {
  token: string;
  amount: string;
  decimals: number;
}

/**
 * Initialize Circle SDK
 */
function getCircleSDK() {
  // Dynamic import to avoid bundling if not used
  try {
    // This will be uncommented once SDK is installed
    // const { CircleSDK } = require('@circle-fin/circle-sdk');

    // return new CircleSDK({
    //   apiKey: import.meta.env.VITE_CIRCLE_API_KEY!,
    //   entitySecret: import.meta.env.VITE_CIRCLE_ENTITY_SECRET!,
    // });

    // Placeholder for now
    throw new Error('Circle SDK not installed yet. Run: npm install @circle-fin/circle-sdk');
  } catch (error) {
    console.error('Circle SDK initialization failed:', error);
    throw error;
  }
}

/**
 * Create a new wallet for a solar producer
 * @param userId - Unique identifier for the producer
 * @param metadata - Additional producer information
 */
export async function createProducerWallet(
  userId: string,
  metadata?: {
    name?: string;
    systemCapacity?: number;
    location?: string;
  }
): Promise<ProducerWallet> {
  const circle = getCircleSDK();

  try {
    const wallet = await circle.wallets.create({
      walletSetId: import.meta.env.VITE_CIRCLE_WALLET_SET_ID!,
      accountType: 'EOA', // Externally Owned Account
      blockchain: 'ARC',
      metadata: {
        userId,
        type: 'solar-producer',
        ...metadata,
      },
    });

    return {
      walletId: wallet.id,
      address: wallet.address,
      blockchain: 'ARC',
      userId,
      createdAt: wallet.createDate,
    };
  } catch (error: any) {
    console.error('Failed to create producer wallet:', error);
    throw new Error(`Wallet creation failed: ${error.message}`);
  }
}

/**
 * Get wallet details by wallet ID
 */
export async function getWalletDetails(walletId: string): Promise<ProducerWallet | null> {
  const circle = getCircleSDK();

  try {
    const wallet = await circle.wallets.get({ id: walletId });

    if (!wallet) {
      return null;
    }

    return {
      walletId: wallet.id,
      address: wallet.address,
      blockchain: wallet.blockchain as 'ARC',
      userId: wallet.metadata?.userId || '',
      createdAt: wallet.createDate,
    };
  } catch (error) {
    console.error('Failed to get wallet details:', error);
    return null;
  }
}

/**
 * Get wallet balance (USDC and sARC)
 */
export async function getWalletBalance(address: string): Promise<WalletBalance[]> {
  const circle = getCircleSDK();

  try {
    // Get token balances for the wallet
    const balances = await circle.wallets.getBalance({
      address,
      blockchain: 'ARC',
    });

    return balances.map((balance: any) => ({
      token: balance.token,
      amount: balance.amount,
      decimals: balance.decimals,
    }));
  } catch (error) {
    console.error('Failed to get wallet balance:', error);
    return [];
  }
}

/**
 * Transfer USDC from treasury wallet to producer wallet
 * Used for redemption payouts
 */
export async function transferUSDCToProducer(
  producerAddress: string,
  amount: string
): Promise<{ transactionId: string; success: boolean }> {
  const circle = getCircleSDK();

  try {
    const transfer = await circle.transfers.create({
      source: {
        type: 'wallet',
        id: import.meta.env.VITE_CIRCLE_TREASURY_WALLET_ID!,
      },
      destination: {
        type: 'blockchain',
        address: producerAddress,
        chain: 'ARC',
      },
      amount: {
        amount,
        currency: 'USDC',
      },
      metadata: {
        type: 'sarc-redemption',
        timestamp: Date.now(),
      },
    });

    return {
      transactionId: transfer.id,
      success: transfer.status === 'complete' || transfer.status === 'pending',
    };
  } catch (error: any) {
    console.error('Failed to transfer USDC:', error);
    throw new Error(`Transfer failed: ${error.message}`);
  }
}

/**
 * Get transaction history for a wallet
 */
export async function getWalletTransactions(
  walletId: string,
  limit: number = 50
): Promise<any[]> {
  const circle = getCircleSDK();

  try {
    const transactions = await circle.wallets.getTransactions({
      walletId,
      pageSize: limit,
    });

    return transactions.data || [];
  } catch (error) {
    console.error('Failed to get wallet transactions:', error);
    return [];
  }
}

/**
 * Check if wallet exists for a user
 */
export async function checkUserWallet(userId: string): Promise<ProducerWallet | null> {
  const circle = getCircleSDK();

  try {
    // Search for wallet by user metadata
    const wallets = await circle.wallets.list({
      metadata: { userId },
    });

    if (wallets.data && wallets.data.length > 0) {
      const wallet = wallets.data[0];
      return {
        walletId: wallet.id,
        address: wallet.address,
        blockchain: 'ARC',
        userId,
        createdAt: wallet.createDate,
      };
    }

    return null;
  } catch (error) {
    console.error('Failed to check user wallet:', error);
    return null;
  }
}

/**
 * Format wallet address for display (shortened)
 */
export function formatWalletAddress(address: string, chars: number = 6): string {
  if (!address || address.length < chars * 2) {
    return address;
  }

  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Validate wallet address format
 */
export function isValidWalletAddress(address: string): boolean {
  // Basic Ethereum address validation (Arc uses same format)
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

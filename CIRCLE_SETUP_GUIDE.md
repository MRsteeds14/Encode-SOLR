# Circle Developer Setup Guide for SOLR-ARC

This guide walks you through setting up all Circle services for the SOLR-ARC platform.

## 🚀 Quick Start Checklist

- [ ] Create Circle Developer account
- [ ] Get API keys
- [ ] Deploy contracts via Circle SCP
- [ ] Set up Programmable Wallets
- [ ] Configure Bridge Kit for CCTP
- [ ] Enable Compliance Engine
- [ ] Test integration

---

## 1. Create Circle Developer Account

### Step 1: Sign Up

1. Go to [Circle Developer Console](https://console.circle.com)
2. Click "Sign Up" or "Create Account"
3. Enter your email and create password
4. Verify your email address
5. Complete account setup

### Step 2: Create New Project

1. Click "Create New Project"
2. Project Name: **SOLR-ARC**
3. Description: **AI-powered solar energy tokenization on Arc blockchain**
4. Use Case: **Tokenized Assets / RWA**
5. Click "Create"

### Step 3: Get API Keys

1. Navigate to **Settings** → **API Keys**
2. Click "Create API Key"
3. Name: `SOLR-ARC Production`
4. Copy and save:
   - `API Key` → Add to `.env` as `VITE_CIRCLE_API_KEY`
   - `Entity Secret` → Add to `.env` as `VITE_CIRCLE_ENTITY_SECRET`
5. ⚠️ **Important**: Store these securely - they won't be shown again!

---

## 2. Deploy Smart Contracts via Circle SCP

### Option A: Using Circle Console (Recommended)

1. **Navigate to Smart Contract Platform**
   - Go to Console → **Smart Contracts** → **Deploy Contract**

2. **Upload Contract Files**
   - Click "Upload Files"
   - Select `contracts/src/Registry.sol`
   - Select `contracts/src/Treasury.sol`
   - Select `contracts/src/MintingController.sol`

3. **Configure Deployment**
   - **Network**: Select **Arc Testnet**
   - **Compiler Version**: `0.8.20`
   - **Optimization**: Enabled (200 runs)

4. **Deploy Registry**
   - Contract: `Registry.sol`
   - Constructor Args: None
   - Click "Deploy"
   - Wait for confirmation
   - **Save address**: Copy to `VITE_REGISTRY_ADDRESS`

5. **Deploy Treasury**
   - Contract: `Treasury.sol`
   - Constructor Args:
     ```
     _sarcToken: 0x9604ad29C8fEe0611EcE73a91e192E5d976E2184
     _usdcToken: [Arc Testnet USDC address]
     _initialRate: 100000  (0.10 USDC per kWh)
     ```
   - Click "Deploy"
   - **Save address**: Copy to `VITE_TREASURY_ADDRESS`

6. **Deploy MintingController**
   - Contract: `MintingController.sol`
   - Constructor Args:
     ```
     _sarcToken: 0x9604ad29C8fEe0611EcE73a91e192E5d976E2184
     _registry: [Registry address from step 4]
     ```
   - Click "Deploy"
   - **Save address**: Copy to `VITE_MINTING_CONTROLLER_ADDRESS`

### Option B: Using Circle API

```typescript
// deploy-via-api.ts
import { CircleSDK } from '@circle-fin/circle-sdk';

const circle = new CircleSDK({
  apiKey: process.env.CIRCLE_API_KEY!
});

// Deploy Registry
const registryDeployment = await circle.contracts.deploy({
  network: 'ARC_TESTNET',
  contractName: 'Registry',
  sourceCode: registrySolidity,
  compilerVersion: '0.8.20'
});

console.log('Registry deployed:', registryDeployment.contractAddress);
```

---

## 3. Configure Contract Permissions

After deployment, set up roles and permissions:

### Using Circle SCP API

```typescript
// setup-permissions.ts

// 1. Grant MINTER_ROLE on sARC token to MintingController
await circle.contracts.execute({
  contractAddress: '0x9604ad29C8fEe0611EcE73a91e192E5d976E2184', // sARC token
  abiFunctionSignature: 'grantRole(bytes32,address)',
  abiParameters: [
    '0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6', // MINTER_ROLE
    MINTING_CONTROLLER_ADDRESS
  ],
  walletId: 'your-admin-wallet-id'
});

// 2. Grant OPERATOR_ROLE on Registry to MintingController
await circle.contracts.execute({
  contractAddress: REGISTRY_ADDRESS,
  abiFunctionSignature: 'grantRole(bytes32,address)',
  abiParameters: [
    '0x97667070c54ef182b0f5858b034beac1b6f3089aa2d3188bb1e8929f4fa9b929', // OPERATOR_ROLE
    MINTING_CONTROLLER_ADDRESS
  ],
  walletId: 'your-admin-wallet-id'
});

// 3. Grant MINTER_ROLE on MintingController to AI agent
await circle.contracts.execute({
  contractAddress: MINTING_CONTROLLER_ADDRESS,
  abiFunctionSignature: 'grantRole(bytes32,address)',
  abiParameters: [
    '0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6', // MINTER_ROLE
    AI_AGENT_WALLET_ADDRESS
  ],
  walletId: 'your-admin-wallet-id'
});
```

---

## 4. Set Up Circle Programmable Wallets

### Create Wallet Set

1. **In Circle Console**:
   - Navigate to **Wallets** → **Create Wallet Set**
   - Name: `SOLR-ARC Producers`
   - Type: **User-Controlled Wallets**
   - Click "Create"

2. **Get Wallet Set ID**:
   - Copy the Wallet Set ID
   - Save for use in your application

### Create User Wallet (via API)

```typescript
// src/lib/circle-wallets.ts
import { CircleSDK } from '@circle-fin/circle-sdk';

const circle = new CircleSDK({
  apiKey: process.env.VITE_CIRCLE_API_KEY!,
  entitySecret: process.env.VITE_CIRCLE_ENTITY_SECRET!
});

export async function createProducerWallet(userId: string) {
  const wallet = await circle.wallets.create({
    walletSetId: 'your-wallet-set-id',
    accountType: 'EOA',
    blockchain: 'ARC',
    metadata: {
      userId,
      type: 'solar-producer'
    }
  });

  return {
    walletId: wallet.id,
    address: wallet.address,
    blockchain: 'ARC'
  };
}
```

---

## 5. Set Up Circle Bridge Kit (CCTP)

### Install Dependencies

```bash
npm install @circle-fin/cctp-bridge-kit viem
```

### Configure Bridge Kit

```typescript
// src/lib/circle-bridge.ts
import { createBridgeKit } from '@circle-fin/cctp-bridge-kit';
import { createWalletClient, http, custom } from 'viem';
import { mainnet } from 'viem/chains';

// Arc Testnet chain configuration
const arcTestnet = {
  id: 1234,
  name: 'Arc Testnet',
  network: 'arc-testnet',
  nativeCurrency: {
    decimals: 6,
    name: 'USDC',
    symbol: 'USDC',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc-testnet.arcchain.org'],
    },
    public: {
      http: ['https://rpc-testnet.arcchain.org'],
    },
  },
  blockExplorers: {
    default: { name: 'ArcScan', url: 'https://testnet.arcscan.app' },
  },
};

// Create Bridge Kit instance
export const bridgeKit = createBridgeKit({
  apiKey: import.meta.env.VITE_CIRCLE_API_KEY
});

// Create wallet adapters
export function createArcAdapter(provider: any) {
  return createWalletClient({
    chain: arcTestnet,
    transport: custom(provider)
  });
}

export function createEthAdapter(provider: any) {
  return createWalletClient({
    chain: mainnet,
    transport: custom(provider)
  });
}
```

### Test Cross-Chain Transfer

```typescript
// test-cctp.ts
import { bridgeKit, createArcAdapter, createEthAdapter } from './circle-bridge';

async function testCrossChainTransfer() {
  const arcAdapter = createArcAdapter(window.ethereum);
  const ethAdapter = createEthAdapter(window.ethereum);

  const result = await bridgeKit.bridge({
    from: { chain: 'ARC', adapter: arcAdapter },
    to: { chain: 'ETH', adapter: ethAdapter },
    amount: '1.00', // 1 USDC
    onProgress: (step) => {
      console.log(`${step.status}: ${step.percentage}%`);
    }
  });

  console.log('Transfer complete!', result);
}
```

---

## 6. Enable Circle Compliance Engine

### Activate in Console

1. Navigate to **Compliance** → **Transaction Screening**
2. Click "Enable Compliance Engine"
3. Select screening rules:
   - ✅ Sanctions lists (OFAC, UN, EU)
   - ✅ PEP (Politically Exposed Persons)
   - ✅ Adverse media
4. Set risk tolerance: **Medium**
5. Configure alert destinations:
   - Email: your@email.com
   - Webhook: `https://your-app.com/api/compliance-alerts`

### Configure Allowlist/Blocklist

```typescript
// Add verified producer to allowlist
await circle.compliance.addToAllowlist({
  address: producerWalletAddress,
  category: 'verified-solar-producer',
  metadata: {
    systemCapacity: 5000,
    location: 'California, USA'
  }
});
```

---

## 7. Configure Event Webhooks

### In Circle Console

1. Go to **Settings** → **Webhooks**
2. Click "Add Webhook"
3. Configure webhooks:

**Minting Events:**
```json
{
  "url": "https://your-app.com/api/webhooks/minting",
  "events": ["contract.execution"],
  "filters": {
    "contractAddress": "[MINTING_CONTROLLER_ADDRESS]",
    "eventName": "TokensMinted"
  }
}
```

**Redemption Events:**
```json
{
  "url": "https://your-app.com/api/webhooks/redemption",
  "events": ["contract.execution"],
  "filters": {
    "contractAddress": "[TREASURY_ADDRESS]",
    "eventName": "Redeemed"
  }
}
```

---

## 8. Fund Treasury and Register Test Producer

### Fund Treasury with USDC

```typescript
// Via Circle SCP API
await circle.contracts.execute({
  contractAddress: TREASURY_ADDRESS,
  abiFunctionSignature: 'fundTreasury(uint256)',
  abiParameters: ['1000000000'], // 1,000 USDC (6 decimals)
  walletId: 'your-admin-wallet-id'
});
```

### Register Test Producer

```typescript
await circle.contracts.execute({
  contractAddress: REGISTRY_ADDRESS,
  abiFunctionSignature: 'registerProducer(address,uint256,uint256,string)',
  abiParameters: [
    producerAddress,
    5000,              // 5 kW capacity
    40,                // 40 kWh daily cap
    'QmTestIPFSHash'   // IPFS metadata
  ],
  walletId: 'your-admin-wallet-id'
});
```

---

## 9. Test Complete Integration

### Test Minting Flow

```typescript
// Test mint via Circle SCP
const mintResult = await circle.contracts.execute({
  walletId: 'ai-agent-wallet-id',
  contractAddress: MINTING_CONTROLLER_ADDRESS,
  abiFunctionSignature: 'mintFromGeneration(address,uint256,string)',
  abiParameters: [
    producerAddress,
    '10000000000000000000', // 10 kWh (18 decimals)
    'QmProofHash123'
  ]
});

console.log('Minting transaction:', mintResult.transactionId);
```

### Test CCTP Bridge

```typescript
const bridgeResult = await bridgeKit.bridge({
  from: { chain: 'ARC', adapter: arcAdapter },
  to: { chain: 'ETH', adapter: ethAdapter },
  amount: '1.00'
});

console.log('Bridge complete:', bridgeResult);
```

---

## 10. Update Frontend Configuration

### Update constants.ts

```typescript
// src/lib/constants.ts

export const CONTRACTS = {
  SARC_TOKEN: '0x9604ad29C8fEe0611EcE73a91e192E5d976E2184',
  REGISTRY: '[DEPLOYED_REGISTRY_ADDRESS]',
  TREASURY: '[DEPLOYED_TREASURY_ADDRESS]',
  MINTING_CONTROLLER: '[DEPLOYED_MINTING_CONTROLLER_ADDRESS]',
} as const;

export const CIRCLE_CONFIG = {
  walletSetId: '[YOUR_WALLET_SET_ID]',
  apiKey: import.meta.env.VITE_CIRCLE_API_KEY,
} as const;
```

---

## ✅ Verification Checklist

- [ ] Circle Developer account created
- [ ] API keys saved in `.env`
- [ ] All 3 contracts deployed to Arc Testnet
- [ ] Contract addresses saved in `constants.ts`
- [ ] Permissions configured (MINTER_ROLE, OPERATOR_ROLE)
- [ ] Wallet Set created
- [ ] Bridge Kit installed and configured
- [ ] Compliance Engine enabled
- [ ] Webhooks configured
- [ ] Treasury funded with test USDC
- [ ] Test producer registered
- [ ] Minting test successful
- [ ] CCTP bridge test successful

---

## 🆘 Troubleshooting

### Issue: "Contract deployment failed"
- Check Arc Testnet RPC is accessible
- Verify you have testnet USDC for gas
- Check compiler version matches (0.8.20)

### Issue: "Permission denied on contract call"
- Verify all roles are granted correctly
- Check wallet has necessary permissions
- Ensure you're using the correct wallet ID

### Issue: "Bridge Kit transfer fails"
- Verify CCTP supports Arc blockchain
- Check USDC contract address is correct
- Ensure sufficient USDC balance

---

## 📚 Additional Resources

- [Circle Developer Docs](https://developers.circle.com)
- [Smart Contract Platform Guide](https://developers.circle.com/contracts)
- [Bridge Kit Documentation](https://developers.circle.com/bridge-kit)
- [Programmable Wallets API](https://developers.circle.com/wallets)
- [Arc Blockchain Docs](https://docs.arcchain.org)

---

## Next Steps

After completing this setup:

1. ✅ Proceed to frontend integration
2. ✅ Set up NREL API integration
3. ✅ Deploy Cloudflare Workers (AI agents)
4. ✅ Build cross-chain redemption UI
5. ✅ Comprehensive testing

**Your Circle infrastructure is now ready for SOLR-ARC!** 🚀

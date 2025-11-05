# 🔷 Thirdweb Deployment Guide for SOLR-ARC

## ✅ Using Your Existing Thirdweb Wallet

**Your Wallet:** `0x9e7D0d9775d9bacE19B97C8d25C6e572DdbaC072`
**Client ID:** `f4f554536916e8c00f22a8bd2a2049d0`

---

## 🎯 Smart Contract Deployment (3 Options)

### **Option 1: Thirdweb Deploy CLI (EASIEST!)**

```bash
# 1. Install Thirdweb CLI
npm install -g thirdweb

# 2. Navigate to contracts directory
cd contracts

# 3. Deploy contracts
npx thirdweb deploy

# This will:
# - Compile all .sol files
# - Open Thirdweb dashboard
# - Let you select Arc Testnet
# - Deploy with your wallet (0x9e7D0d9775d9bacE19B97C8d25C6e572DdbaC072)
```

**Constructor Parameters:**

**Registry.sol:**
- No parameters needed

**Treasury.sol:**
- `_sarcToken`: `0x9604ad29C8fEe0611EcE73a91e192E5d976E2184`
- `_usdcToken`: `0x3600000000000000000000000000000000000000`
- `_usdcPerKwh`: `100000` (0.10 USDC with 6 decimals)

**MintingController.sol:**
- `_registryAddress`: (Registry address from first deployment)
- `_sarcTokenAddress`: `0x9604ad29C8fEe0611EcE73a91e192E5d976E2184`
- `_maxDailyMint`: `1000000000000000000000` (1000 sARC)
- `_anomalyThreshold`: `150`

---

### **Option 2: Remix IDE (If Thirdweb Deploy Fails)**

1. Go to [remix.ethereum.org](https://remix.ethereum.org)
2. Create new workspace
3. Copy contracts:
   - [Registry.sol](contracts/src/Registry.sol)
   - [Treasury.sol](contracts/src/Treasury.sol)
   - [MintingController.sol](contracts/src/MintingController.sol)
4. Install OpenZeppelin:
   ```
   npm install @openzeppelin/contracts
   ```
5. Compile with Solidity 0.8.20
6. Deploy:
   - Environment: "Injected Provider - MetaMask"
   - Switch MetaMask to Arc Testnet (Chain ID: 5042002)
   - Deploy each contract with constructor parameters above

**Add Arc Testnet to MetaMask:**
```
Network Name: Arc Testnet
RPC URL: https://rpc.testnet.arc.network
Chain ID: 5042002
Currency Symbol: USDC
Block Explorer: https://testnet.arcscan.app
```

---

### **Option 3: Hardhat Deployment Script**

If you prefer Hardhat, create `contracts/scripts/deploy.ts`:

```typescript
import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  // 1. Deploy Registry
  const Registry = await ethers.getContractFactory("Registry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();
  console.log("Registry deployed to:", await registry.getAddress());

  // 2. Deploy Treasury
  const Treasury = await ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy(
    "0x9604ad29C8fEe0611EcE73a91e192E5d976E2184", // sARC
    "0x3600000000000000000000000000000000000000", // USDC
    "100000" // 0.10 USDC per kWh
  );
  await treasury.waitForDeployment();
  console.log("Treasury deployed to:", await treasury.getAddress());

  // 3. Deploy MintingController
  const MintingController = await ethers.getContractFactory("MintingController");
  const controller = await MintingController.deploy(
    await registry.getAddress(),
    "0x9604ad29C8fEe0611EcE73a91e192E5d976E2184",
    ethers.parseEther("1000"), // 1000 sARC daily max
    150 // 150% anomaly threshold
  );
  await controller.waitForDeployment();
  console.log("MintingController deployed to:", await controller.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

---

## 🔧 Post-Deployment Configuration

### 1. Grant Roles

**On Registry:**
```solidity
// Grant OPERATOR_ROLE to MintingController
grantRole(OPERATOR_ROLE, MINTING_CONTROLLER_ADDRESS)
```

**On MintingController:**
```solidity
// Grant MINTER_ROLE to PoG Agent
grantRole(MINTER_ROLE, AI_AGENT_WALLET_ADDRESS)

// Grant OPERATOR_ROLE to Risk Agent
grantRole(OPERATOR_ROLE, AI_AGENT_WALLET_ADDRESS)
```

**On sARC Token:**
```solidity
// Grant MINTER_ROLE to MintingController
grantRole(MINTER_ROLE, MINTING_CONTROLLER_ADDRESS)
```

### 2. Register Test Producer

```solidity
// Call on Registry contract
registerProducer(
  YOUR_WALLET_ADDRESS,
  10,  // 10 kW system
  80,  // 80 kWh daily cap
  "QmTestMetadata"
)
```

### 3. Fund Treasury

Transfer 1000 USDC to Treasury contract from Circle Faucet

### 4. Update Frontend

Edit [src/lib/constants.ts](src/lib/constants.ts):

```typescript
export const CONTRACTS = {
  SARC_TOKEN: '0x9604ad29C8fEe0611EcE73a91e192E5d976E2184',
  REGISTRY: '0xYOUR_DEPLOYED_REGISTRY_ADDRESS',
  TREASURY: '0xYOUR_DEPLOYED_TREASURY_ADDRESS',
  MINTING_CONTROLLER: '0xYOUR_DEPLOYED_MINTING_CONTROLLER_ADDRESS',
} as const
```

---

## 🚀 Frontend Integration

### 1. Install Thirdweb SDK

```bash
npm install thirdweb
```

### 2. Update main.tsx

Replace current [main.tsx](src/main.tsx) with Thirdweb provider:

```typescript
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";
import { ThirdwebProvider } from 'thirdweb/react';
import "@github/spark/spark"

import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'
import { thirdwebClient } from '@/lib/thirdweb-config'

import "./main.css"
import "./styles/theme.css"
import "./index.css"

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <ThirdwebProvider>
      <App />
    </ThirdwebProvider>
  </ErrorBoundary>
)
```

### 3. Update App.tsx

Replace mock wallet functions with real Thirdweb:

```typescript
import { useThirdwebWallet } from '@/hooks/useThirdwebWallet'

function App() {
  const { address, isConnected, connectWallet, disconnectWallet } = useThirdwebWallet()

  const handleConnect = async () => {
    try {
      await connectWallet()
      toast.success('Wallet connected successfully!')
    } catch (error) {
      toast.error('Failed to connect wallet')
    }
  }

  const handleDisconnect = async () => {
    await disconnectWallet()
    toast.info('Wallet disconnected')
  }

  // Replace wallet state with:
  const wallet = {
    connected: isConnected,
    address: address || null,
    network: ARC_TESTNET.name,
  }

  // ... rest of component stays the same
}
```

---

## ✅ Current Status

### **What's Ready:**
- ✅ Smart contracts written
- ✅ Thirdweb config created ([thirdweb-config.ts](src/lib/thirdweb-config.ts))
- ✅ Wallet hook created ([useThirdwebWallet.ts](src/hooks/useThirdwebWallet.ts))
- ✅ Arc Testnet configuration correct
- ✅ Your Thirdweb wallet ready to deploy

### **What You Need to Do:**

1. **Install Thirdweb SDK:**
   ```bash
   npm install thirdweb
   ```

2. **Fund Your Wallet:**
   - Go to [Circle Faucet](https://faucet.circle.com)
   - Enter: `0x9e7D0d9775d9bacE19B97C8d25C6e572DdbaC072`
   - Request testnet USDC for gas

3. **Deploy Contracts:**
   ```bash
   npx thirdweb deploy
   ```

4. **Update [constants.ts](src/lib/constants.ts) with deployed addresses**

5. **Update [main.tsx](src/main.tsx) with ThirdwebProvider**

6. **Update [App.tsx](src/App.tsx) to use `useThirdwebWallet` hook**

---

## 🎯 Deployment Checklist

- [ ] Install Thirdweb SDK (`npm install thirdweb`)
- [ ] Fund wallet at Circle Faucet
- [ ] Deploy Registry contract
- [ ] Deploy Treasury contract
- [ ] Deploy MintingController contract
- [ ] Grant roles on all contracts
- [ ] Register test producer
- [ ] Fund Treasury with USDC
- [ ] Update constants.ts with addresses
- [ ] Update main.tsx with ThirdwebProvider
- [ ] Update App.tsx with real wallet hook
- [ ] Test wallet connection
- [ ] Test minting flow
- [ ] Test redemption flow

---

## 🆘 Troubleshooting

**Issue: "Network not supported"**
- Add Arc Testnet manually to MetaMask (see instructions above)

**Issue: "Insufficient funds for gas"**
- Get USDC from Circle Faucet: https://faucet.circle.com

**Issue: "Contract deployment failed"**
- Check you're on Arc Testnet (Chain ID: 5042002)
- Verify gas balance in wallet

**Issue: "Thirdweb deploy not found"**
```bash
npm install -g thirdweb
```

---

## 📝 Notes

- **Circle Developer-Controlled Wallets:** NOT needed for contract deployment
- **Your Thirdweb Wallet:** Perfect for deploying contracts
- **AI Agent Wallet:** Create a separate wallet for the agents (don't reuse deployment wallet)

**Estimated Time: 2-3 hours** (including testing)

---

**Next:** Once contracts are deployed, move to deploying Cloudflare Workers!

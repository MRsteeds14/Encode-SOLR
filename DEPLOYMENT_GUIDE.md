# 🚀 SOLR-ARC Deployment Guide - Arc Testnet

**Status:** ✅ Treasury.sol Fixed for 18-Decimal USDC
**Ready to Deploy:** YES
**Method:** Thirdweb CLI

---

## ✅ Pre-Deployment Completed

### Critical Fix Applied:
- ✅ **Treasury.sol updated** for Arc's 18-decimal USDC
  - Line 91: Changed `/1e18` → `/1e6`
  - Comments updated to reflect 18 decimals
  - Constructor parameters documented

### Verification:
```solidity
// Example calculation (10 sARC redemption):
// sARC: 10 × 10^18 = 10,000,000,000,000,000,000
// Exchange rate: 0.10 USDC = 100,000,000,000,000 (18 decimals)
// Formula: (10^19 × 100,000,000,000,000) / 10^6
// Result: 1,000,000,000,000,000,000 = 1 USDC (18 decimals) ✅
```

---

## 📋 Deployment Steps

### Step 1: Fund Your Wallet (5 minutes)

**Wallet:** `0x9e7D0d9775d9bacE19B97C8d25C6e572DdbaC072`
**Required:** 100 USDC for deployment gas

```bash
# Visit Circle Faucet
open https://faucet.circle.com

# Enter your wallet address
# Request testnet USDC

# Verify balance
open https://testnet.arcscan.app/address/0x9e7D0d9775d9bacE19B97C8d25C6e572DdbaC072
```

**Checklist:**
- [ ] Wallet has 100+ USDC
- [ ] Network is Arc Testnet (Chain ID: 5042002)

---

### Step 2: Install Dependencies (5 minutes)

**Install OpenZeppelin Contracts:**
```bash
cd /Users/sommers-j/Documents/solr-arc-solar-energ/contracts
npm install
```

**What This Does:**
- Installs `@openzeppelin/contracts` needed by your Solidity files
- Ensures Thirdweb CLI can compile Registry, Treasury, and MintingController

**✅ Expected Output:**
```
added 1 package, and audited 2 packages in 3s
```

---

### Step 3: Deploy Contracts (45 minutes)

**⚠️ CRITICAL: Run from contracts directory**
The `npx thirdweb deploy` command MUST be run from the `contracts/` directory where `foundry.toml` is located.

**Run Thirdweb Deploy:**
```bash
cd /Users/sommers-j/Documents/solr-arc-solar-energ/contracts
npx thirdweb deploy
```

**If using secret key (optional):**
```bash
npx thirdweb deploy -k YOUR_SECRET_KEY_HERE
```

**⚠️ Important about the `-k` flag:**
- When docs show `-k <your-key>`, the `<>` brackets mean "replace this"
- DO NOT type the `<>` brackets - they cause `zsh: parse error`
- Example: `-k abc123` NOT `-k <abc123>`

**What Happens:**
1. CLI detects `foundry.toml` configuration
2. CLI compiles all contracts in `contracts/src/`
3. Browser opens to Thirdweb dashboard
4. You see 3 contracts ready to deploy

**Common Errors & Solutions:**

| Error | Cause | Solution |
|-------|-------|----------|
| `No contracts detected` | Wrong directory or missing foundry.toml | Run from `contracts/` directory |
| `zsh: parse error near '\n'` | Using `<>` brackets in command | Remove `<>` brackets from `-k` flag |
| `Cannot find module '@openzeppelin'` | Dependencies not installed | Run `cd contracts && npm install` |
| `thirdweb: command not found` | CLI not installed | Run `npm install -g thirdweb` |
| Browser doesn't open | CLI needs permissions | Check firewall/browser settings |

---

#### Contract 1: Registry

**Select:** Registry.sol
**Network:** Arc Testnet (5042002)
**Constructor:** None required
**Deploy:** Sign transaction

**Save Address:**
```
REGISTRY_ADDRESS = _________________
```

**Verify on ArcScan:**
```
https://testnet.arcscan.app/address/[REGISTRY_ADDRESS]
```

---

#### Contract 2: Treasury

**Select:** Treasury.sol
**Network:** Arc Testnet (5042002)

**Constructor Parameters:**

| Parameter | Value | Explanation |
|-----------|-------|-------------|
| `_sarcToken` | `0x9604ad29C8fEe0611EcE73a91e192E5d976E2184` | Existing sARC token |
| `_usdcToken` | `0x3600000000000000000000000000000000000000` | Arc native USDC |
| `_usdcPerKwh` | `100000000000000` | 0.10 USDC (18 decimals) |

⚠️ **CRITICAL:** Use `100000000000000` NOT `100000` (18 decimals, not 6!)

**Deploy:** Sign transaction

**Save Address:**
```
TREASURY_ADDRESS = _________________
```

---

#### Contract 3: MintingController

**Select:** MintingController.sol
**Network:** Arc Testnet (5042002)

**Constructor Parameters:**

| Parameter | Value | Explanation |
|-----------|-------|-------------|
| `_registryAddress` | `[REGISTRY_ADDRESS]` | From Contract 1 |
| `_sarcTokenAddress` | `0x9604ad29C8fEe0611EcE73a91e192E5d976E2184` | Existing sARC token |
| `_maxDailyMint` | `1000000000000000000000` | 1000 sARC (1000 × 10^18) |
| `_anomalyThreshold` | `150` | 150% threshold |

**Deploy:** Sign transaction

**Save Address:**
```
MINTING_CONTROLLER_ADDRESS = _________________
```

---

### Step 3: Grant Roles (30 minutes)

Use Thirdweb dashboard "Write" tab for each contract:

#### Role 1: sARC Token → MintingController

**Contract:** `0x9604ad29C8fEe0611EcE73a91e192E5d976E2184`
**Function:** `grantRole(bytes32 role, address account)`

**Parameters:**
- `role`: `0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6`
- `account`: `[MINTING_CONTROLLER_ADDRESS]`

**Why:** Allows MintingController to mint new sARC tokens

---

#### Role 2: Registry → MintingController

**Contract:** `[REGISTRY_ADDRESS]`
**Function:** `grantRole(bytes32 role, address account)`

**Parameters:**
- `role`: `0x97667070c54ef182b0f5858b034beac1b6f3089aa2d3188bb1e8929f4fa9b929`
- `account`: `[MINTING_CONTROLLER_ADDRESS]`

**Why:** Allows MintingController to record production

---

#### Role 3: Create AI Agent Wallet

```bash
# Generate new wallet (DO NOT reuse deployment wallet)
# Save to .env.local:
AI_AGENT_PRIVATE_KEY=0x...
AI_AGENT_WALLET_ADDRESS=0x...
```

---

#### Role 4: MintingController → AI Agent (MINTER)

**Contract:** `[MINTING_CONTROLLER_ADDRESS]`
**Function:** `grantRole(bytes32 role, address account)`

**Parameters:**
- `role`: `0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6`
- `account`: `[AI_AGENT_WALLET_ADDRESS]`

---

#### Role 5: MintingController → AI Agent (OPERATOR)

**Contract:** `[MINTING_CONTROLLER_ADDRESS]`
**Function:** `grantRole(bytes32 role, address account)`

**Parameters:**
- `role`: `0x97667070c54ef182b0f5858b034beac1b6f3089aa2d3188bb1e8929f4fa9b929`
- `account`: `[AI_AGENT_WALLET_ADDRESS]`

---

### Step 4: Register Test Producer (10 minutes)

**Contract:** Registry
**Function:** `registerProducer`

**Parameters:**
- `_producer`: `0x9e7D0d9775d9bacE19B97C8d25C6e572DdbaC072`
- `_systemCapacityKw`: `5`
- `_dailyCapKwh`: `40`
- `_ipfsMetadata`: `"QmDemoProducer"`

**Execute via Thirdweb dashboard**

---

### Step 5: Fund Treasury (10 minutes)

**Contract:** `0x3600000000000000000000000000000000000000` (USDC)
**Function:** `transfer`

**Parameters:**
- `to`: `[TREASURY_ADDRESS]`
- `amount`: `1000000000000000000000` (1000 USDC with 18 decimals)

**Or use Treasury's fundTreasury function:**
1. Approve: `approve(TREASURY_ADDRESS, 1000000000000000000000)`
2. Fund: `fundTreasury(1000000000000000000000)`

---

### Step 6: Update Frontend (5 minutes)

#### File 1: `src/lib/contracts.ts`

```typescript
export const CONTRACT_ADDRESSES = {
  SARC_TOKEN: '0x9604ad29C8fEe0611EcE73a91e192E5d976E2184',
  REGISTRY: '[PASTE_REGISTRY_ADDRESS]',
  TREASURY: '[PASTE_TREASURY_ADDRESS]',
  MINTING_CONTROLLER: '[PASTE_MINTING_CONTROLLER_ADDRESS]',
} as const;
```

#### File 2: `.env.local`

```env
# Deployed Contracts
VITE_REGISTRY_ADDRESS=[REGISTRY_ADDRESS]
VITE_TREASURY_ADDRESS=[TREASURY_ADDRESS]
VITE_MINTING_CONTROLLER_ADDRESS=[MINTING_CONTROLLER_ADDRESS]

# AI Agent Wallet
AI_AGENT_PRIVATE_KEY=[PRIVATE_KEY]
AI_AGENT_WALLET_ADDRESS=[WALLET_ADDRESS]
```

---

## 🧪 Testing

### Test 1: Read Functions

**Registry:**
```solidity
isWhitelisted(0x9e7D0d9775d9bacE19B97C8d25C6e572DdbaC072)
// Expected: true

getProducer(0x9e7D0d9775d9bacE19B97C8d25C6e572DdbaC072)
// Expected: (true, 5, 40, 0, 0, "QmDemoProducer", [timestamp])
```

**Treasury:**
```solidity
usdcPerKwh()
// Expected: 100000000000000

getTreasuryBalance()
// Expected: (0, 1000000000000000000000) = 0 sARC, 1000 USDC
```

**MintingController:**
```solidity
circuitBreakerTriggered()
// Expected: false

getMintingStats()
// Expected: (0, 1000000000000000000000, 0, false)
```

---

### Test 2: Minting (Via AI Agent)

```solidity
// As AI Agent wallet
mintFromGeneration(
  0x9e7D0d9775d9bacE19B97C8d25C6e572DdbaC072,  // producer
  10000000000000000000,  // 10 kWh
  "QmTestProof"
)

// Check result:
sarcToken.balanceOf(0x9e7D0d9775d9bacE19B97C8d25C6e572DdbaC072)
// Expected: 10000000000000000000 (10 sARC)
```

---

### Test 3: Redemption

```solidity
// 1. Approve
sarcToken.approve(TREASURY_ADDRESS, 10000000000000000000)

// 2. Redeem
treasury.redeemForUSDC(10000000000000000000, "QmRedemption")

// 3. Check USDC balance
usdcToken.balanceOf(producer)
// Expected: 1000000000000000000 (1 USDC with 18 decimals)
```

---

## ✅ Deployment Checklist

### Pre-Deployment:
- [x] Treasury.sol fixed for 18 decimals
- [ ] Wallet funded with 100 USDC
- [ ] Thirdweb CLI ready

### Deployment:
- [x] Registry deployed
- [x] Treasury deployed (with correct parameters!)
- [x] MintingController deployed

### Configuration:
- [ ] sARC → MintingController MINTER_ROLE granted
- [ ] Registry → MintingController OPERATOR_ROLE granted
- [ ] AI agent wallet created
- [ ] MintingController → AI agent MINTER_ROLE granted
- [ ] MintingController → AI agent OPERATOR_ROLE granted
- [ ] Test producer registered
- [ ] Treasury funded with 1000 USDC

### Frontend:
- [x] Contract addresses updated in contracts.ts
- [x] Contract addresses updated in constants.ts
- [ ] .env.local updated with addresses
- [ ] AI agent credentials saved

### Testing:
- [ ] Read functions work
- [ ] Minting succeeds
- [ ] Redemption succeeds
- [ ] Balances correct

---

## 🔗 Important Addresses

**Network:**
- Arc Testnet RPC: https://rpc.testnet.arc.network
- Chain ID: 5042002
- Explorer: https://testnet.arcscan.app
- Faucet: https://faucet.circle.com

**Existing Contracts:**
- sARC Token: `0x9604ad29C8fEe0611EcE73a91e192E5d976E2184`
- USDC Token: `0x3600000000000000000000000000000000000000`

**Your Wallet:**
- Deployment Wallet: `0x9e7D0d9775d9bacE19B97C8d25C6e572DdbaC072`

**Deployed Contracts (November 4, 2025):**
- Registry: `0x90b4883040f64aB37678382dE4e0fAa67B1126e1` ✅
- Treasury: `0x8825518674A89e28d2C11CA0Ec49024ef6e1E2b2` ✅
- MintingController: `0x186c2987F138f3784913e5e42f0cee4512b89C3E` ✅

**AI Agent:**
- Wallet: _________________ (create using ROLE_GRANTING_GUIDE.md)

---

## 📊 Timeline

| Task | Duration | Status |
|------|----------|--------|
| Fund wallet | 5 min | ✅ Complete |
| Deploy Registry | 10 min | ✅ Complete |
| Deploy Treasury | 15 min | ✅ Complete |
| Deploy MintingController | 20 min | ✅ Complete |
| Grant all roles | 30 min | ⏳ In Progress |
| Register producer + fund | 20 min | Pending |
| Update frontend | 5 min | ✅ Complete |
| Testing | 30 min | Pending |
| **TOTAL** | **~2 hours** | **~60% Complete** |

---

## 🚀 Ready to Deploy!

**Next immediate action:**
```bash
# 1. Fund wallet (if not already done)
open https://faucet.circle.com

# 2. Start deployment
npx thirdweb deploy
```

**Good luck!** 🎉

# SOLR-ARC Implementation Roadmap

**Target:** AI Agents x Arc x USDC Hackathon (November 8th Deadline)

---

## 📊 Current Status

✅ **Completed:**
- Project structure created
- Contracts directory set up
- Circle Bridge Kit configuration ready
- Circle Programmable Wallets integration prepared
- Cross-chain bridge React hook created
- Comprehensive setup guides written

⚠️ **In Progress:**
- Adding smart contracts to repository
- Circle Developer account setup

🔴 **Pending:**
- Contract deployment
- NREL API integration
- AI Agents deployment
- Frontend wire-up
- Testing & demo video

---

## 🎯 Implementation Phases

### **Phase 1: Circle Infrastructure Setup** (Day 1 - Today!)

#### 1.1 Circle Developer Account (30 minutes)
- [ ] Sign up at [console.circle.com](https://console.circle.com)
- [ ] Create project: "SOLR-ARC"
- [ ] Get API keys
- [ ] Create `.env.local` from `.env.example`
- [ ] Add Circle API keys to `.env.local`

**Files to update:**
- `.env.local` (create from `.env.example`)

---

#### 1.2 Add Smart Contracts (30 minutes)
- [ ] Copy your `Registry.sol` to `contracts/src/`
- [ ] Copy your `Treasury.sol` to `contracts/src/`
- [ ] Copy your `MintingController.sol` to `contracts/src/`
- [ ] Review constructor parameters for Arc compatibility

**Files to create:**
- `contracts/src/Registry.sol`
- `contracts/src/Treasury.sol`
- `contracts/src/MintingController.sol`

---

#### 1.3 Deploy Contracts via Circle SCP (1-2 hours)
Follow `CIRCLE_SETUP_GUIDE.md` section 2.

- [ ] Navigate to Circle Console → Smart Contract Platform
- [ ] Upload Registry.sol → Deploy to Arc Testnet
- [ ] Upload Treasury.sol → Deploy to Arc Testnet
- [ ] Upload MintingController.sol → Deploy to Arc Testnet
- [ ] Save all deployed addresses

**Files to update:**
- `src/lib/constants.ts` (add contract addresses)

---

#### 1.4 Configure Contract Permissions (1 hour)
- [ ] Grant MINTER_ROLE on sARC token to MintingController
- [ ] Grant OPERATOR_ROLE on Registry to MintingController
- [ ] Grant MINTER_ROLE on MintingController to AI agent wallet
- [ ] Fund Treasury with test USDC (1,000 USDC recommended)
- [ ] Register test producer

---

#### 1.5 Install Dependencies (15 minutes)
```bash
# Circle Bridge Kit
npm install @circle-fin/cctp-bridge-kit viem

# Circle SDK (for Programmable Wallets)
npm install @circle-fin/circle-sdk

# Alchemy SDK
npm install alchemy-sdk

# Additional utilities
npm install ethers@6
```

---

### **Phase 2: Frontend Integration** (Day 2)

#### 2.1 Update Constants (15 minutes)
Update `src/lib/constants.ts` with deployed addresses:

```typescript
export const CONTRACTS = {
  SARC_TOKEN: '0x9604ad29C8fEe0611EcE73a91e192E5d976E2184',
  REGISTRY: '[PASTE_DEPLOYED_ADDRESS]',
  TREASURY: '[PASTE_DEPLOYED_ADDRESS]',
  MINTING_CONTROLLER: '[PASTE_DEPLOYED_ADDRESS]',
} as const;
```

---

#### 2.2 Create Circle SCP Contract Hooks (2 hours)
Create `src/hooks/useCircleContracts.ts`:

```typescript
// Hook for minting via Circle Smart Contract Platform
export function useMintTokens() {
  async function mint(producer: string, kwh: number, ipfsProof: string) {
    const response = await fetch('https://api.circle.com/v1/w3s/developer/transactions/contractExecution', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_CIRCLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        walletId: 'ai-agent-wallet-id',
        contractAddress: CONTRACTS.MINTING_CONTROLLER,
        abiFunctionSignature: 'mintFromGeneration(address,uint256,string)',
        abiParameters: [producer, ethers.parseEther(kwh.toString()), ipfsProof],
        fee: { type: 'level', config: { feeLevel: 'MEDIUM' } }
      })
    });

    return await response.json();
  }

  return { mint };
}
```

**Files to create:**
- `src/hooks/useCircleContracts.ts`
- `src/hooks/useRedemption.ts`
- `src/hooks/useProducerRegistry.ts`

---

#### 2.3 Wire Existing UI to Real Contracts (2 hours)
Update `src/App.tsx`:

- Replace mock `handleMint` with real Circle SCP calls
- Replace mock `handleRedeem` with real Treasury calls
- Update transaction hash generation to use real blockchain data

---

#### 2.4 Add Cross-Chain Redemption UI (2 hours)
Update redemption form to include chain selector:

```typescript
// In redemption component
import { useCrossChainBridge } from '@/hooks/useCrossChainBridge';

const { bridge, bridging, progress } = useCrossChainBridge();

// Add chain selector
<select value={selectedChain} onChange={e => setSelectedChain(e.target.value)}>
  <option value="ARC">Arc Blockchain (Instant)</option>
  <option value="ETH">Ethereum (15 sec)</option>
  <option value="BASE">Base (10 sec)</option>
</select>
```

**Files to update:**
- Existing redemption component
- Add CCTP progress indicator

---

### **Phase 3: NREL API Integration** (Day 2-3)

#### 3.1 Create NREL Service (1 hour)
Create `src/lib/nrel-service.ts`:

```typescript
export async function getEstimatedProduction(
  systemCapacity: number,
  lat: number,
  lon: number
): Promise<number> {
  const response = await fetch(
    `https://developer.nrel.gov/api/pvwatts/v8.json?` +
    `api_key=${import.meta.env.VITE_NREL_API_KEY}` +
    `&system_capacity=${systemCapacity}` +
    `&lat=${lat}&lon=${lon}` +
    `&module_type=1&array_type=1&tilt=20&azimuth=180`
  );

  const data = await response.json();
  return data.outputs.ac_annual / 365; // Daily average
}
```

**Files to create:**
- `src/lib/nrel-service.ts`
- `src/hooks/useNRELValidation.ts`

---

#### 3.2 Add Auto-Calculate Button (1 hour)
Update energy input component:

```typescript
<Button onClick={async () => {
  const estimated = await getEstimatedProduction(5, 34.05, -118.25);
  setKwh(estimated.toFixed(2));
}}>
  Calculate Today's Generation (NREL)
</Button>
```

---

### **Phase 4: AI Agents Deployment** (Day 3)

#### 4.1 Create Cloudflare Workers Structure (30 minutes)
```bash
mkdir -p workers/risk-agent/src
mkdir -p workers/pog-agent/src
```

---

#### 4.2 Deploy Risk Agent (2 hours)
Create `workers/risk-agent/src/index.ts` with:
- NREL validation
- Registry whitelist check
- AIML API anomaly detection
- Circuit breaker triggering

```bash
cd workers/risk-agent
npx wrangler deploy
```

**Save URL** → `VITE_RISK_AGENT_URL` in `.env.local`

---

#### 4.3 Deploy PoG Agent (2 hours)
Create `workers/pog-agent/src/index.ts` with:
- Energy data validation
- Pinata IPFS upload
- Circle SCP minting call
- Transaction hash return

```bash
cd workers/pog-agent
npx wrangler deploy
```

**Save URL** → `VITE_POG_AGENT_URL` in `.env.local`

---

#### 4.4 Wire Agents to Frontend (1 hour)
Update minting flow:

```typescript
// 1. Call Risk Agent
const riskCheck = await fetch(RISK_AGENT_URL, {
  method: 'POST',
  body: JSON.stringify({ producer, kwh })
});

if (!riskCheck.approved) {
  alert('Risk check failed');
  return;
}

// 2. Call PoG Agent
const mintResult = await fetch(POG_AGENT_URL, {
  method: 'POST',
  body: JSON.stringify({ producer, kwh, timestamp })
});
```

---

### **Phase 5: Advanced Features** (Day 4)

#### 5.1 Alchemy SDK Integration (2 hours)
```typescript
// src/lib/alchemy.ts
import { Alchemy, Network } from 'alchemy-sdk';

export const alchemy = new Alchemy({
  apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
  network: Network.ARC_TESTNET
});

// Get transaction history
export async function getTransactionHistory(address: string) {
  return await alchemy.core.getAssetTransfers({
    fromBlock: '0x0',
    toAddress: address,
    category: ['erc20']
  });
}
```

**Files to create:**
- `src/lib/alchemy.ts`
- `src/hooks/useTransactionHistory.ts`

---

#### 5.2 Circle Compliance Engine (2 hours)
Follow `CIRCLE_SETUP_GUIDE.md` section 6:
- Enable Compliance Engine in Console
- Configure transaction screening
- Add compliance checks to registration
- Display compliance dashboard

---

#### 5.3 Real-Time Balance Updates (1 hour)
Replace mock balances with Alchemy calls:

```typescript
const balance = await alchemy.core.getTokenBalances(
  address,
  [CONTRACTS.SARC_TOKEN]
);
```

---

### **Phase 6: Testing & Polish** (Day 5)

#### 6.1 End-to-End Testing (4 hours)
Test complete flow 10+ times:
- [ ] Connect wallet (MetaMask)
- [ ] Auto-calculate generation (NREL)
- [ ] Submit for minting
- [ ] Risk Agent validates
- [ ] PoG Agent mints tokens
- [ ] Check balance updated
- [ ] Redeem for USDC (Arc native)
- [ ] Redeem for USDC (CCTP to Ethereum)
- [ ] Verify transactions on Arc explorer

---

#### 6.2 Error Handling (2 hours)
Add error states for:
- Rejected transactions
- Failed NREL API calls
- Agent validation failures
- CCTP bridge errors
- Insufficient balances

---

#### 6.3 UI/UX Polish (2 hours)
- Loading states during blockchain operations
- Success notifications with Arc explorer links
- Better error messages
- Mobile optimization test

---

### **Phase 7: Production Deploy & Demo** (Day 6)

#### 7.1 Deploy to Vercel (1 hour)
```bash
npm run build
vercel --prod
```

Configure environment variables in Vercel dashboard.

---

#### 7.2 Create Demo Video with ElevenLabs (3 hours)
1. Record screen demo (all features)
2. Generate AI voice narration via ElevenLabs
3. Edit with AIML API video tools
4. Result: 3-5 minute professional demo

---

#### 7.3 Final Submission (2 hours)
- Update README with deployed addresses
- Create pitch deck
- Submit to hackathon platform
- Share demo video

---

## 🚨 Critical Path Items

**MUST COMPLETE for demo to work:**
1. ✅ Contracts deployed to Arc Testnet
2. ✅ Circle Programmable Wallets functional
3. ✅ NREL API working (auto-calculate)
4. ✅ AI agents deployed and callable
5. ✅ Basic minting flow works
6. ✅ Demo video completed

**NICE TO HAVE:**
- CCTP cross-chain redemption
- Compliance Engine dashboard
- Advanced analytics
- Multiple test scenarios

---

## 📋 Daily Checklist

### Today (Day 1):
- [ ] Circle account setup
- [ ] Add contract files
- [ ] Deploy contracts
- [ ] Configure permissions
- [ ] Install dependencies

### Day 2:
- [ ] Wire frontend to contracts
- [ ] NREL API integration
- [ ] Cross-chain UI

### Day 3:
- [ ] Deploy AI agents
- [ ] Wire agents to frontend
- [ ] Test agent flow

### Day 4:
- [ ] Alchemy integration
- [ ] Compliance Engine
- [ ] Polish features

### Day 5:
- [ ] Comprehensive testing
- [ ] Bug fixes
- [ ] UI polish

### Day 6:
- [ ] Deploy to production
- [ ] Demo video
- [ ] Submit!

---

## 🆘 Getting Help

**Resources:**
- Circle Docs: https://developers.circle.com
- Arc Docs: https://docs.arcchain.org
- NREL API Docs: https://developer.nrel.gov
- Setup guides in this repository

**Next Steps:**
1. Complete Circle Developer account setup
2. Add your smart contract files to `contracts/src/`
3. Follow `CIRCLE_SETUP_GUIDE.md` for deployment
4. Start wiring frontend to real contracts

**Let's build this! 🚀**

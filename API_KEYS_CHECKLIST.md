# API Keys & Configuration Checklist

Quick reference for all API keys and configuration needed for SOLR-ARC.

---

## ✅ What You Already Have

- ✅ **Thirdweb Client ID**: `f4f554536916e8c00f22a8bd2a2049d0`
- ✅ **sARC Token Address**: `0x9604ad29C8fEe0611EcE73a91e192E5d976E2184`
- ✅ **MetaMask Wallet** (F8B8): Token admin
- ✅ **Thirdweb Wallet** (C072): Tested on Arc
- ✅ **Cloudflare API Key**: Ready
- ✅ **AIML API Key**: Ready
- ✅ **Pinata API Key**: Ready
- ✅ **NREL API Key**: Ready
- ✅ **Alchemy API Key**: Ready
- ✅ **Circle API Key**: Ready
- ✅ **Circle Client Key**: Ready

---

## 🔑 Keys to Add to .env.local

### Circle APIs
```env
# From Circle Developer Console
VITE_CIRCLE_API_KEY=your_circle_api_key_here
VITE_CIRCLE_ENTITY_SECRET=your_circle_entity_secret_here
VITE_CIRCLE_WALLET_SET_ID=your_wallet_set_id_here
VITE_CIRCLE_TREASURY_WALLET_ID=your_treasury_wallet_id_here
```

**How to get:**
1. Go to [console.circle.com](https://console.circle.com)
2. Settings → API Keys → Create API Key
3. Wallets → Create Wallet Set → Copy Wallet Set ID

---

### Thirdweb
```env
VITE_THIRDWEB_CLIENT_ID=f4f554536916e8c00f22a8bd2a2049d0
```
✅ **Already have this!**

---

### Alchemy
```env
VITE_ALCHEMY_API_KEY=[PASTE_YOUR_ALCHEMY_KEY]
```
✅ **You mentioned you have this!**

---

### NREL (National Renewable Energy Laboratory)
```env
VITE_NREL_API_KEY=[PASTE_YOUR_NREL_KEY]
```
✅ **You mentioned you have this!**

---

### AIML API
```env
VITE_AIML_API_KEY=[PASTE_YOUR_AIML_KEY]
```
✅ **You mentioned you have this!**

---

### Pinata (IPFS)
```env
VITE_PINATA_JWT=[PASTE_YOUR_PINATA_JWT]
```
✅ **You mentioned you have this!**

---

### Cloudflare Workers
```env
CLOUDFLARE_API_KEY=[PASTE_YOUR_CLOUDFLARE_KEY]
CLOUDFLARE_ACCOUNT_ID=[PASTE_YOUR_ACCOUNT_ID]
```
✅ **You mentioned you have this!**

---

### AI Agent Wallet
```env
# Private key for AI agent that will mint tokens
AI_AGENT_PRIVATE_KEY=[CREATE_NEW_WALLET_OR_USE_EXISTING]
```

**How to get:**
- Create new wallet with MetaMask
- Export private key (Settings → Security & Privacy → Show Private Key)
- ⚠️ **IMPORTANT**: This should be a SEPARATE wallet from your admin wallet
- Fund with small amount of testnet USDC for gas

---

### Contract Addresses (To be filled after deployment)
```env
VITE_SARC_TOKEN=0x9604ad29C8fEe0611EcE73a91e192E5d976E2184
VITE_REGISTRY_ADDRESS=[AFTER_DEPLOYMENT]
VITE_TREASURY_ADDRESS=[AFTER_DEPLOYMENT]
VITE_MINTING_CONTROLLER_ADDRESS=[AFTER_DEPLOYMENT]
```

---

### Cloudflare Worker URLs (After deployment)
```env
VITE_POG_AGENT_URL=[AFTER_DEPLOYING_POG_AGENT]
VITE_RISK_AGENT_URL=[AFTER_DEPLOYING_RISK_AGENT]
```

---

### Arc Testnet Configuration
```env
VITE_ARC_RPC_URL=https://rpc-testnet.arcchain.org
VITE_ARC_CHAIN_ID=1234
VITE_ARC_EXPLORER=https://testnet.arcscan.app
```
✅ **These are standard Arc Testnet values**

---

## 📝 Step-by-Step Setup

### 1. Create .env.local file
```bash
cp .env.example .env.local
```

### 2. Add all your existing API keys
Paste in the keys you mentioned you have:
- Thirdweb (already in example)
- Alchemy
- NREL
- AIML
- Pinata
- Cloudflare

### 3. Create Circle Developer account
Follow `CIRCLE_SETUP_GUIDE.md` to:
- Get Circle API keys
- Create Wallet Set
- Get Wallet Set ID

### 4. Create AI Agent wallet
- New MetaMask wallet
- Export private key
- Add to `.env` (not `.env.local` - this is secret!)
- Fund with testnet USDC

### 5. Deploy contracts
Follow `CIRCLE_SETUP_GUIDE.md` section 2:
- Deploy via Circle SCP
- Save addresses to `.env.local`

### 6. Deploy Cloudflare Workers
- Deploy Risk Agent → Save URL
- Deploy PoG Agent → Save URL
- Add URLs to `.env.local`

---

## ⚠️ Security Best Practices

### Public Variables (VITE_ prefix)
✅ Safe to commit to Git:
- VITE_THIRDWEB_CLIENT_ID
- VITE_CIRCLE_API_KEY (read-only for frontend)
- VITE_*_ADDRESS (contract addresses are public)
- VITE_*_URL (worker URLs are public endpoints)

### Private Variables (NO VITE_ prefix)
❌ **NEVER commit to Git:**
- AI_AGENT_PRIVATE_KEY
- CIRCLE_ENTITY_SECRET
- CLOUDFLARE_API_KEY
- Any private keys or secrets

### .gitignore entries
```
.env
.env.local
.env*.local
```

---

## 🧪 Testing Your Configuration

### Test 1: Environment Variables Loaded
```typescript
// In your app
console.log('Thirdweb ID:', import.meta.env.VITE_THIRDWEB_CLIENT_ID);
console.log('Circle API Key:', import.meta.env.VITE_CIRCLE_API_KEY ? '✅ Set' : '❌ Missing');
console.log('NREL API Key:', import.meta.env.VITE_NREL_API_KEY ? '✅ Set' : '❌ Missing');
```

### Test 2: API Keys Work
```typescript
// Test NREL API
const response = await fetch(
  `https://developer.nrel.gov/api/pvwatts/v8.json?api_key=${import.meta.env.VITE_NREL_API_KEY}&system_capacity=5&lat=34&lon=-118`
);
console.log('NREL API:', response.ok ? '✅ Working' : '❌ Failed');
```

### Test 3: Circle API Access
```typescript
// Test Circle API
const response = await fetch('https://api.circle.com/v1/w3s/wallets', {
  headers: {
    'Authorization': `Bearer ${import.meta.env.VITE_CIRCLE_API_KEY}`
  }
});
console.log('Circle API:', response.ok ? '✅ Working' : '❌ Failed');
```

---

## ✅ Final Checklist

Before starting development:
- [ ] All API keys added to `.env.local`
- [ ] `.env.local` added to `.gitignore`
- [ ] Test environment variables load in app
- [ ] Test NREL API call works
- [ ] Test Circle API access
- [ ] AI agent wallet created and funded
- [ ] Ready to deploy contracts

---

## 🆘 Troubleshooting

### "Environment variable undefined"
- Check variable has `VITE_` prefix for frontend access
- Restart dev server after adding to `.env.local`
- Verify `.env.local` is in project root

### "API call returns 401 Unauthorized"
- Check API key is correct
- Verify no extra spaces in `.env.local`
- Check API key has necessary permissions

### "Worker deployment fails"
- Verify Cloudflare API key is correct
- Check account ID is correct
- Ensure you're logged in: `wrangler login`

---

**Next Step:** Complete Circle Developer account setup and fill in the Circle API keys! 🚀

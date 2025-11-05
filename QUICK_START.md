# 🚀 SOLR-ARC Quick Start Guide

**Time to Deploy:** 10 minutes
**Difficulty:** Easy

This guide gets you from deployed contracts to a working system in the fastest way possible.

---

## ✅ Prerequisites

You should have already completed:
- [x] Deployed Registry, Treasury, and MintingController
- [x] Wallet has testnet USDC for gas

---

## 🎯 Quick Setup (3 Commands, 10 Minutes)

### Step 1: Grant All Roles Automatically (5 minutes)

Instead of manually clicking through Thirdweb 5 times, run our automated script:

```bash
node grant-roles.js
```

**What it will ask:**
```
Enter your deployment wallet private key (starts with 0x):
```

**Where to find your private key:**
1. Open MetaMask
2. Click your account
3. Click ⋮ (three dots)
4. Click "Account Details"
5. Click "Show Private Key"
6. Enter your password
7. Copy the private key

**What the script does:**
1. ✅ Grants MINTER_ROLE to MintingController
2. ✅ Grants OPERATOR_ROLE to MintingController
3. ✅ Creates AI Agent wallet
4. ✅ Grants roles to AI Agent
5. ✅ Saves everything to `.env.local`

**Expected output:**
```
✅ 1. MintingController → sARC Token MINTER_ROLE
✅ 2. MintingController → Registry OPERATOR_ROLE
✅ 3. AI Agent Wallet Created
✅ 4. AI Agent → MintingController MINTER_ROLE
✅ 5. AI Agent → MintingController OPERATOR_ROLE
✅ 6. Credentials saved to .env.local

🎉 All Done! Role Granting Complete
```

---

### Step 2: Register Yourself as a Producer (2 minutes)

Go to your Registry contract on Thirdweb:
```
https://thirdweb.com/arc-testnet/0x90b4883040f64aB37678382dE4e0fAa67B1126e1
```

1. Click "Write" tab
2. Find `registerProducer` function
3. Fill in:
   - `_producer`: Your wallet address (0x9e7D0d9775d9bacE19B97C8d25C6e572DdbaC072)
   - `_systemCapacityKw`: `5`
   - `_dailyCapKwh`: `40`
   - `_ipfsMetadata`: `QmDemoProducer`
4. Click "Execute"
5. Confirm in MetaMask

---

### Step 3: Fund the Treasury (2 minutes)

Get testnet USDC and send it to Treasury:

**Option A: Direct Transfer**
1. Get USDC from faucet: https://faucet.circle.com
2. In MetaMask, send 1000 USDC to: `0x8825518674A89e28d2C11CA0Ec49024ef6e1E2b2`

**Option B: Via Treasury Contract**
1. Go to USDC contract and approve Treasury to spend your USDC
2. Go to Treasury contract and call `fundTreasury(1000000000000000000000)`

---

## ✅ Verify Everything Works (1 minute)

Run the test script:
```bash
node test-deployment.js
```

**Expected output:**
```
✅ Contracts deployed
✅ Roles configured
✅ MintingController operational
✅ Treasury configured
✅ Producer registered
✅ Treasury funded

🎉 All tests passed! Your deployment is ready for use!
```

---

## 🎮 Test Your System

### Start the Frontend

```bash
npm run dev
```

Open http://localhost:5173

### Test Minting

As the AI Agent (or manually via Thirdweb), call:

**Contract:** MintingController (`0x186c2987F138f3784913e5e42f0cee4512b89C3E`)
**Function:** `mintFromGeneration`
**Parameters:**
- `_producer`: `0x9e7D0d9775d9bacE19B97C8d25C6e572DdbaC072`
- `_kwhAmount`: `10000000000000000000` (10 kWh)
- `_ipfsProofHash`: `QmTestProof`

**Expected result:**
- ✅ 10 sARC tokens minted
- ✅ Balance increases
- ✅ Production recorded in Registry

### Test Redemption

**Contract:** Treasury (`0x8825518674A89e28d2C11CA0Ec49024ef6e1E2b2`)

1. First, approve:
   - Contract: sARC Token
   - Function: `approve`
   - Spender: Treasury address
   - Amount: `10000000000000000000`

2. Then, redeem:
   - Contract: Treasury
   - Function: `redeemForUSDC`
   - Amount: `10000000000000000000`
   - Metadata: `QmRedemption`

**Expected result:**
- ✅ 10 sARC burned
- ✅ 1 USDC received (at 0.10 rate)
- ✅ Balances updated

---

## 📊 Your Deployed System

### Contracts

| Contract | Address | Purpose |
|----------|---------|---------|
| Registry | `0x90b4883040f64aB37678382dE4e0fAa67B1126e1` | Producer whitelist & validation |
| Treasury | `0x8825518674A89e28d2C11CA0Ec49024ef6e1E2b2` | sARC → USDC redemptions |
| MintingController | `0x186c2987F138f3784913e5e42f0cee4512b89C3E` | Orchestrates minting |
| sARC Token | `0x9604ad29C8fEe0611EcE73a91e192E5d976E2184` | Solar energy token |

### Key Addresses

**Your Deployment Wallet:**
`0x9e7D0d9775d9bacE19B97C8d25C6e572DdbaC072`

**AI Agent Wallet:**
Check `.env.local` file (created by grant-roles.js)

**Arc Testnet:**
- RPC: https://rpc.testnet.arc.network
- Explorer: https://testnet.arcscan.app
- Faucet: https://faucet.circle.com
- Chain ID: 5042002

---

## 🐛 Troubleshooting

### "Insufficient funds" error
**Fix:** Get more testnet USDC from https://faucet.circle.com

### Roles not working
**Fix:** Run `node grant-roles.js` again

### "Producer not whitelisted"
**Fix:** Register yourself as producer (Step 2 above)

### "Treasury has no USDC"
**Fix:** Fund treasury (Step 3 above)

### Test script shows warnings
**Fix:** Complete the step that's marked as "Action required"

---

## 📚 Next Steps

Once everything works:

1. **Build Your Frontend**
   - Customize UI in `src/components/`
   - Add your branding
   - Connect wallet features

2. **Deploy AI Agents**
   - Configure PoG Agent in `workers/pog-agent/`
   - Configure Risk Agent in `workers/risk-agent/`
   - Deploy to Cloudflare Workers

3. **Add More Producers**
   - Register real solar producers
   - Verify their systems
   - Set appropriate capacity limits

4. **Monitor System**
   - Watch minting activity
   - Check treasury balance
   - Monitor circuit breaker status

5. **Go to Mainnet**
   - Deploy to Arc mainnet
   - Fund with real USDC
   - Start onboarding users

---

## 🎓 Learning Resources

- **Detailed Guide:** [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **Role Education:** [ROLE_GRANTING_GUIDE.md](ROLE_GRANTING_GUIDE.md)
- **Contract Docs:** Check `contracts/README.md`
- **Testing:** Run `node test-deployment.js` anytime

---

## ✅ Completion Checklist

- [ ] Ran `node grant-roles.js` successfully
- [ ] Registered as producer
- [ ] Funded treasury with USDC
- [ ] Ran `node test-deployment.js` - all green ✅
- [ ] Tested minting via Thirdweb
- [ ] Tested redemption via Thirdweb
- [ ] Started frontend with `npm run dev`
- [ ] Saw system working end-to-end

**All checked?** Congratulations! Your SOLR-ARC system is fully operational! 🎉

---

## 🆘 Need Help?

- **Script Issues:** Check error message and re-run
- **Contract Issues:** Visit Thirdweb dashboard for contract details
- **Network Issues:** Verify you're on Arc Testnet (Chain ID: 5042002)
- **General Questions:** Review DEPLOYMENT_GUIDE.md

---

**Time Saved:** 35 minutes (vs manual setup)
**Complexity:** Automated
**Result:** Fully functional solar energy tokenization system

Happy building! ☀️⚡

# Multi-User System Testing Guide

## Quick Start Testing

### Step 1: Start the Development Server
```bash
npm run dev
```
Open http://localhost:5173 in your browser.

### Step 2: Test User Registration Flow

#### A. First User (User A)
1. **Connect Wallet**
   - Click "Connect Wallet" button
   - Select MetaMask (or your preferred wallet)
   - Approve connection

2. **See Registration Form**
   - Should automatically show registration form
   - Form displays your wallet address

3. **Register System**
   - Enter System Capacity: `5` kW
   - Enter Daily Cap: `40` kWh
   - Click "Register My System"
   - Sign transaction in MetaMask
   - Wait for confirmation (success animation)

4. **View Dashboard**
   - Should auto-load after registration
   - See your system stats (5 kW / 40 kWh)
   - Balance shows 0 sARC, 0 USDC

5. **Mint Tokens** (Demo Mode)
   - Go to "Mint" tab
   - Enter: `25` kWh
   - Click "Mint sARC Tokens"
   - Watch AI agents process
   - See balance update to 25 sARC

6. **Check Overview**
   - Go to "Overview" tab
   - Verify: 25 sARC balance
   - Transaction feed shows mint

7. **Note Your Data**
   ```
   Wallet: 0x[your_wallet_address]
   sARC: 25 tokens
   System: 5 kW / 40 kWh
   Transactions: 1 mint
   ```

#### B. Switch to Second User (User B)
1. **Disconnect User A**
   - Click wallet button
   - Click "Disconnect"
   - Confirm you're back to landing page

2. **Connect Different Wallet**
   - Use a different MetaMask account
   - Or use WalletConnect with different wallet
   - Connect wallet

3. **See Registration Form Again**
   - Should show fresh registration form
   - Different wallet address displayed

4. **Register Different System**
   - Enter System Capacity: `10` kW
   - Enter Daily Cap: `80` kWh
   - Click "Register My System"
   - Sign transaction
   - Wait for confirmation

5. **Verify Separate Dashboard**
   - Dashboard loads
   - Shows 10 kW / 80 kWh (different from User A)
   - Balance: 0 sARC (not User A's 25)

6. **Mint Different Amount**
   - Go to "Mint" tab
   - Enter: `50` kWh
   - Mint tokens
   - Balance: 50 sARC

7. **Note User B Data**
   ```
   Wallet: 0x[different_wallet_address]
   sARC: 50 tokens
   System: 10 kW / 80 kWh
   Transactions: 1 mint (50 kWh)
   ```

#### C. Verify Data Isolation
1. **Switch Back to User A**
   - Disconnect User B
   - Connect User A's wallet again
   - Dashboard should load immediately (already registered)

2. **Verify User A's Data**
   ```
   ✅ Balance: 25 sARC (not 50)
   ✅ System: 5 kW / 40 kWh (not 10/80)
   ✅ Transactions: Only User A's mint
   ```

3. **Switch to User B Again**
   - Disconnect User A
   - Connect User B's wallet
   - Dashboard loads

4. **Verify User B's Data**
   ```
   ✅ Balance: 50 sARC (not 25)
   ✅ System: 10 kW / 80 kWh (not 5/40)
   ✅ Transactions: Only User B's mint
   ```

### Step 3: Test Edge Cases

#### Test 1: Refresh Page
1. While connected as User A
2. Refresh browser (F5)
3. Wallet should auto-reconnect
4. Dashboard should reload with same data

#### Test 2: Multiple Mints
1. Connect as User A
2. Mint 10 kWh
3. Mint 15 kWh
4. Mint 5 kWh
5. Balance should be: 25 + 10 + 15 + 5 = 55 sARC
6. Transaction feed shows 4 mints

#### Test 3: Daily Limit (if connected to real contracts)
1. User with 40 kWh daily cap
2. Mint 30 kWh (should work)
3. Try to mint 20 kWh (should fail - exceeds daily limit)
4. Error message shows

#### Test 4: Wrong Network
1. Connect wallet to wrong network (e.g., Ethereum mainnet)
2. Thirdweb should prompt to switch to Arc Testnet
3. User clicks "Switch Network"
4. App should work normally

## 🎯 Expected Results

### ✅ Success Criteria
- [ ] Multiple wallets can connect independently
- [ ] Each wallet sees registration form if not registered
- [ ] Registration transaction succeeds
- [ ] Dashboard loads with correct user data
- [ ] Token balances are isolated per user
- [ ] Switching users shows different data
- [ ] No data leakage between users
- [ ] Page refresh maintains state

### ❌ Failure Scenarios
If you see:
- "All users see same balance" → Data isolation issue
- "Registration fails" → Check gas, network, contract
- "Dashboard shows wrong data" → Check wallet address
- "Wallet won't connect" → Check Thirdweb config

## 🐛 Troubleshooting

### Issue: Registration Transaction Fails
**Symptoms:** Click register, transaction fails or reverts

**Solutions:**
1. Check wallet has USDC for gas
   ```
   Go to: https://faucet.circle.com
   Get Arc testnet USDC
   ```
2. Verify correct network selected (Arc Testnet)
3. Check contract addresses in constants.ts
4. Look at console errors (F12)

### Issue: Dashboard Shows 0 for Everything
**Symptoms:** Connected and registered, but all zeros

**Solutions:**
1. Check blockchain connection
   ```javascript
   // In console:
   console.log(activeAccount?.address)
   ```
2. Verify contracts deployed
3. Check RPC endpoint working
4. Try disconnecting and reconnecting

### Issue: Wallet Won't Connect
**Symptoms:** Click connect, nothing happens

**Solutions:**
1. Check MetaMask installed
2. Check Thirdweb client ID set
3. Check console for errors
4. Try different browser
5. Clear site data and retry

### Issue: Can't Switch Users
**Symptoms:** Disconnecting doesn't clear data

**Solutions:**
1. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear localStorage
   ```javascript
   // In console:
   localStorage.clear()
   ```
3. Close and reopen browser

## 📊 Data Verification

### Check Blockchain Data
```bash
# Using cast (Foundry) or other tools
cast call $REGISTRY_ADDRESS "getProducer(address)" $USER_WALLET_ADDRESS --rpc-url https://rpc.testnet.arc.network
```

### Check Local Storage
```javascript
// In browser console
// View transactions for specific wallet
const wallet = "0x..." // Your wallet address
const txKey = `transactions_${wallet}`
console.log(localStorage.getItem(txKey))

// View energy data
const energyKey = `energyData_${wallet}`
console.log(localStorage.getItem(energyKey))
```

## 🎓 Understanding the Flow

### Component Lifecycle
```
App Loads
    ↓
Check: useActiveAccount() → wallet address?
    ↓
NO → Show Landing Page
    ↓
YES → useProducerStatus(address) → registered?
    ↓
NO → Show RegisterSystem
    ↓
YES → Show Dashboard with user data
```

### Data Flow
```
User Action (Mint)
    ↓
Call handleMint(kwh)
    ↓
Simulate agent processing
    ↓
Update local transactions
    ↓
Update local energy data
    ↓
UI re-renders with new data
    ↓
(In production: Also call smart contract)
```

## 🚀 Production Testing

When you connect to real contracts:

### Test 1: Real Registration
1. Connect wallet with USDC for gas
2. Register system
3. Verify on blockchain:
   - Go to https://testnet.arcscan.app
   - Find transaction
   - Verify registration event

### Test 2: Real Minting
1. Call minting API/agent
2. Sign transaction
3. Verify sARC tokens in wallet
4. Check balance matches

### Test 3: Real Redemption
1. Have sARC tokens
2. Call redemption
3. Sign transaction
4. Verify USDC received
5. Check sARC deducted

## 📝 Test Report Template

```markdown
## Multi-User Test Report

**Date:** [Date]
**Tester:** [Name]
**Environment:** Development / Production

### User A Testing
- Wallet: 0x...
- Registration: ✅ / ❌
- Minting: ✅ / ❌
- Dashboard: ✅ / ❌
- Issues: [None / Describe]

### User B Testing
- Wallet: 0x...
- Registration: ✅ / ❌
- Minting: ✅ / ❌
- Dashboard: ✅ / ❌
- Issues: [None / Describe]

### Data Isolation
- User A sees only their data: ✅ / ❌
- User B sees only their data: ✅ / ❌
- No cross-contamination: ✅ / ❌
- Issues: [None / Describe]

### Overall
- System Status: ✅ Pass / ❌ Fail
- Notes: [Any observations]
```

## 🎉 Success!

If all tests pass:
- ✅ Multi-user system works
- ✅ Data isolation verified
- ✅ Ready for production
- ✅ Can onboard real users

**Congratulations on building a production-ready multi-user platform!** 🚀

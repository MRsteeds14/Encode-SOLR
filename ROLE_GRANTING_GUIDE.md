# 🔐 Role Granting Guide - Learn Smart Contract Permissions

**Time Required:** 30-45 minutes
**Difficulty:** Beginner-Friendly
**What You'll Learn:** Access Control, Role-Based Permissions, Smart Contract Security

---

## 📚 What Are Roles? (5-Minute Lesson)

### The Problem
Imagine you deployed a bank vault (smart contract). By default, **only you** have the keys. But you need:
- Your security system (MintingController) to **deposit money** (mint tokens)
- Your accountant (AI Agent) to **record transactions**
- Your partner contracts to **work together**

Without giving them keys (roles), they can't do their jobs!

### The Solution: Access Control
OpenZeppelin's `AccessControl` lets you create "roles" (like job titles) and grant them to specific addresses.

**Key Concepts:**
1. **Roles** = Permissions (like "MINTER_ROLE" = permission to mint tokens)
2. **Grant** = Give permission to an address
3. **Role Hash** = A unique ID for each role (looks like `0x9f2df0...`)

### Why It Matters for SOLR-ARC
Your contracts need to work together:
- **MintingController** needs permission to mint sARC tokens
- **MintingController** needs permission to record production in Registry
- **AI Agent** needs permission to trigger minting

Without these permissions, your system is **locked** and won't work!

---

## 🎯 Your Mission: Grant 5 Critical Roles

### Overview
| Transaction | From Contract | To Address | Why |
|-------------|---------------|------------|-----|
| 1 | sARC Token | MintingController | Allow minting new tokens |
| 2 | Registry | MintingController | Allow recording production |
| 3 | Create AI Wallet | - | New wallet for automation |
| 4 | MintingController | AI Agent | Allow agent to mint |
| 5 | MintingController | AI Agent | Allow agent to operate |

---

## 🚀 Step-by-Step Instructions

### Prerequisites
- ✅ MetaMask connected to Arc Testnet
- ✅ Wallet has testnet USDC for gas fees
- ✅ All 3 contracts deployed (Registry, Treasury, MintingController)

---

## Transaction 1: Grant MINTER_ROLE to MintingController

### What This Does
Allows your MintingController contract to call the `mint()` function on the sARC token contract. Without this, minting will fail with "AccessControl: account is missing role".

### Step-by-Step

1. **Open Thirdweb Dashboard**
   ```
   https://thirdweb.com/arc-testnet/0x9604ad29C8fEe0611EcE73a91e192E5d976E2184
   ```
   *(This is the existing sARC token contract)*

2. **Navigate to "Write" Tab**
   - Click the "Contract" tab at the top
   - Click "Write" in the sidebar
   - You'll see a list of functions you can call

3. **Find the `grantRole` Function**
   - Scroll down to find `grantRole`
   - Click to expand it

4. **Fill in the Parameters**

   **Parameter 1: `role` (bytes32)**
   ```
   0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6
   ```
   *This is the hash of "MINTER_ROLE" - it uniquely identifies this permission*

   **Parameter 2: `account` (address)**
   ```
   0x186c2987F138f3784913e5e42f0cee4512b89C3E
   ```
   *Your MintingController contract address*

5. **Execute the Transaction**
   - Click "Execute"
   - MetaMask will pop up asking you to confirm
   - Review the transaction (gas fee should be ~0.01 USDC)
   - Click "Confirm"
   - Wait for transaction to complete (15-30 seconds)

6. **Verify Success**
   - Go to the "Read" tab
   - Find `hasRole` function
   - Enter:
     - `role`: `0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6`
     - `account`: `0x186c2987F138f3784913e5e42f0cee4512b89C3E`
   - Click "Call"
   - Should return: `true` ✅

**✅ Checkpoint:** MintingController can now mint sARC tokens!

---

## Transaction 2: Grant OPERATOR_ROLE to MintingController (on Registry)

### What This Does
Allows MintingController to call `recordProduction()` on the Registry contract to track how much energy producers have generated.

### Step-by-Step

1. **Open Your Registry Contract**
   ```
   https://thirdweb.com/arc-testnet/0x90b4883040f64aB37678382dE4e0fAa67B1126e1
   ```

2. **Go to Write Tab → grantRole**

3. **Fill in Parameters**

   **`role`:**
   ```
   0x97667070c54ef182b0f5858b034beac1b6f3089aa2d3188bb1e8929f4fa9b929
   ```
   *OPERATOR_ROLE - permission to record production*

   **`account`:**
   ```
   0x186c2987F138f3784913e5e42f0cee4512b89C3E
   ```
   *Your MintingController*

4. **Execute & Verify**
   - Click "Execute" → Confirm in MetaMask
   - Verify in "Read" tab using `hasRole` (should return `true`)

**✅ Checkpoint:** MintingController can now record production data!

---

## Transaction 3: Create AI Agent Wallet

### What This Does
Creates a new wallet that your AI agents (PoG Agent, Risk Agent) will use to interact with contracts autonomously.

### Important Security Note
⚠️ **Never reuse your main deployment wallet for automation!**
- Deployment wallet = High-value, manually controlled
- AI Agent wallet = Automated, limited permissions

### Step-by-Step

1. **Generate New Wallet**

   **Option A: Using MetaMask**
   - Open MetaMask
   - Click your account icon
   - Click "Create Account"
   - Name it "SOLR AI Agent"
   - Copy the address

   **Option B: Using JavaScript (in terminal)**
   ```bash
   node -e "const ethers = require('ethers'); const wallet = ethers.Wallet.createRandom(); console.log('Address:', wallet.address); console.log('Private Key:', wallet.privateKey);"
   ```

2. **Save Credentials Securely**

   Create a `.env.local` file (if not exists):
   ```bash
   echo "AI_AGENT_WALLET_ADDRESS=YOUR_NEW_ADDRESS_HERE" >> .env.local
   echo "AI_AGENT_PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE" >> .env.local
   ```

3. **Fund the AI Wallet (Optional but Recommended)**
   - Send ~10 USDC from your main wallet to the AI wallet
   - This covers gas fees for automated transactions
   - Use MetaMask to send USDC

**✅ Checkpoint:** AI Agent wallet created and funded!

---

## Transaction 4: Grant MINTER_ROLE to AI Agent

### What This Does
Allows your AI agents to call `mintFromGeneration()` on the MintingController when they validate solar production.

### Step-by-Step

1. **Open MintingController Contract**
   ```
   https://thirdweb.com/arc-testnet/0x186c2987F138f3784913e5e42f0cee4512b89C3E
   ```

2. **Go to Write Tab → grantRole**

3. **Fill in Parameters**

   **`role`:**
   ```
   0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6
   ```
   *MINTER_ROLE*

   **`account`:**
   ```
   [YOUR_AI_AGENT_WALLET_ADDRESS_FROM_STEP_3]
   ```

4. **Execute & Verify**

**✅ Checkpoint:** AI Agent can now trigger minting!

---

## Transaction 5: Grant OPERATOR_ROLE to AI Agent

### What This Does
Allows AI agents to perform operator functions like pausing/unpausing the MintingController in emergencies.

### Step-by-Step

1. **Stay on MintingController Contract**

2. **Go to Write Tab → grantRole**

3. **Fill in Parameters**

   **`role`:**
   ```
   0x97667070c54ef182b0f5858b034beac1b6f3089aa2d3188bb1e8929f4fa9b929
   ```
   *OPERATOR_ROLE*

   **`account`:**
   ```
   [YOUR_AI_AGENT_WALLET_ADDRESS]
   ```

4. **Execute & Verify**

**✅ Checkpoint:** AI Agent has full operational permissions!

---

## 🧪 Verify All Roles Are Granted

### Quick Verification Script

Run this in your terminal (from project root):

```bash
node -e "
const { ethers } = require('ethers');
const provider = new ethers.JsonRpcProvider('https://rpc.testnet.arc.network');

const CONTRACTS = {
  sarcToken: '0x9604ad29C8fEe0611EcE73a91e192E5d976E2184',
  registry: '0x90b4883040f64aB37678382dE4e0fAa67B1126e1',
  mintingController: '0x186c2987F138f3784913e5e42f0cee4512b89C3E',
};

const ROLES = {
  MINTER: '0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6',
  OPERATOR: '0x97667070c54ef182b0f5858b034beac1b6f3089aa2d3188bb1e8929f4fa9b929',
};

async function checkRoles() {
  const abi = ['function hasRole(bytes32 role, address account) view returns (bool)'];

  // Check 1: MintingController has MINTER on sARC
  const sarcToken = new ethers.Contract(CONTRACTS.sarcToken, abi, provider);
  const check1 = await sarcToken.hasRole(ROLES.MINTER, CONTRACTS.mintingController);
  console.log('✅ 1. MintingController → sARC MINTER:', check1);

  // Check 2: MintingController has OPERATOR on Registry
  const registry = new ethers.Contract(CONTRACTS.registry, abi, provider);
  const check2 = await registry.hasRole(ROLES.OPERATOR, CONTRACTS.mintingController);
  console.log('✅ 2. MintingController → Registry OPERATOR:', check2);

  // Add AI Agent checks here after you have the address
}

checkRoles();
"
```

**Expected Output:**
```
✅ 1. MintingController → sARC MINTER: true
✅ 2. MintingController → Registry OPERATOR: true
```

---

## 📊 Understanding Role Hashes

### How Are Role Hashes Calculated?

Role hashes are created using `keccak256`, Ethereum's hashing function:

```solidity
bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
// Result: 0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6
```

**Why use hashes instead of strings?**
- More efficient (uses less gas)
- Standardized 32-byte format
- Prevents typos ("MINTER" vs "MINTOR")

### Common Roles in SOLR-ARC

| Role Name | Hash | Who Has It | Can Do |
|-----------|------|------------|--------|
| DEFAULT_ADMIN_ROLE | 0x0000...0000 | Your wallet | Grant/revoke all roles |
| MINTER_ROLE | 0x9f2df0... | MintingController, AI Agent | Mint new sARC tokens |
| OPERATOR_ROLE | 0x9766... | MintingController, AI Agent | Record production, pause contracts |

---

## 🔒 Security Best Practices

### DO ✅
- Grant roles only to contracts you deployed and trust
- Use separate wallets for deployment vs. automation
- Verify each role grant transaction completed successfully
- Keep private keys for AI wallets secure (use environment variables)
- Test on testnet first (you're doing this now!)

### DON'T ❌
- Never grant DEFAULT_ADMIN_ROLE to contracts (only humans should have this)
- Don't reuse your personal wallet as an AI agent wallet
- Don't grant MINTER_ROLE to random addresses
- Don't share private keys in code or commit them to GitHub
- Don't skip verification steps

---

## 🐛 Troubleshooting Common Issues

### Issue: "Transaction Failed" in MetaMask

**Cause:** Insufficient gas or wrong network

**Solution:**
1. Check you're on Arc Testnet (Chain ID: 5042002)
2. Ensure wallet has at least 1 USDC for gas
3. Try again with higher gas limit

---

### Issue: `hasRole` returns `false` after granting

**Cause:** Transaction didn't confirm or went to wrong contract

**Solution:**
1. Check transaction status on https://testnet.arcscan.app
2. Verify you're calling `hasRole` on the correct contract
3. Make sure you copied the role hash exactly (no spaces)

---

### Issue: "AccessControl: account is missing role"

**Cause:** Role was never granted or granted to wrong address

**Solution:**
1. Double-check the contract address in step
2. Verify the transaction succeeded (check block explorer)
3. Re-grant the role if needed

---

## ✅ Completion Checklist

Before moving to testing, ensure:

- [ ] Transaction 1: MintingController has MINTER_ROLE on sARC token
- [ ] Transaction 2: MintingController has OPERATOR_ROLE on Registry
- [ ] Transaction 3: AI Agent wallet created and saved to .env.local
- [ ] Transaction 4: AI Agent has MINTER_ROLE on MintingController
- [ ] Transaction 5: AI Agent has OPERATOR_ROLE on MintingController
- [ ] All 5 transactions confirmed on block explorer
- [ ] Verification script shows all roles as `true`

---

## 🎓 What You Learned

Congratulations! You now understand:

1. **Access Control Patterns** - How smart contracts manage permissions
2. **Role-Based Security** - Why separating permissions by role is safer
3. **Contract Interactions** - How contracts call functions on each other
4. **Transaction Execution** - How to use Thirdweb dashboard to interact with contracts
5. **Verification** - How to confirm your transactions succeeded

### Next Steps
- [ ] Register a test producer (see DEPLOYMENT_GUIDE.md Step 4)
- [ ] Fund the treasury with USDC
- [ ] Test minting flow
- [ ] Test redemption flow

---

## 📚 Additional Resources

- [OpenZeppelin Access Control Docs](https://docs.openzeppelin.com/contracts/4.x/access-control)
- [Thirdweb Dashboard Guide](https://portal.thirdweb.com/contracts/explore)
- [Arc Testnet Block Explorer](https://testnet.arcscan.app)
- [Ethereum Role-Based Access](https://ethereum.org/en/developers/docs/smart-contracts/security/)

---

**Need Help?** Check the troubleshooting section or review the deployment guide.

**Ready to Test?** Proceed to registering a producer and testing the minting flow!

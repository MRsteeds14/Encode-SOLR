# Smart Contract Files

## Instructions

Please paste your contract code into the following files:

### 1. Registry.sol
Create a file named `Registry.sol` in this directory (`contracts/src/`) and paste your Registry contract code.

**Expected content:**
- Producer whitelist management
- System capacity tracking
- Daily production cap validation
- Role-based access control

### 2. Treasury.sol
Create a file named `Treasury.sol` in this directory and paste your Treasury contract code.

**Expected content:**
- USDC reserve management
- sARC → USDC redemption logic
- Rate configuration (0.10 USDC per kWh)
- Funding functions

### 3. MintingController.sol
Create a file named `MintingController.sol` in this directory and paste your MintingController contract code.

**Expected content:**
- mintFromGeneration() function (called by PoG Agent)
- Integration with Registry for validation
- Circuit breaker mechanism
- Daily capacity checks
- IPFS proof recording

## After Adding Contracts

Once you've added all three contract files:

1. Review the contracts for any Arc-specific configurations
2. Update constructor parameters if needed
3. Follow the CIRCLE_SETUP_GUIDE.md to deploy via Circle SCP
4. Save deployed addresses to `src/lib/constants.ts`

## Deployment Checklist

- [ ] Registry.sol added to `contracts/src/`
- [ ] Treasury.sol added to `contracts/src/`
- [ ] MintingController.sol added to `contracts/src/`
- [ ] Reviewed all constructor parameters
- [ ] Ready for Circle SCP deployment

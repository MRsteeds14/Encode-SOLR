# SOLR-ARC Smart Contracts

## Overview
Smart contracts for the SOLR-ARC solar energy tokenization platform, deployed on Arc Testnet.

## Contracts

### 1. Registry.sol
- **Purpose**: Manages whitelist of verified solar energy producers
- **Key Functions**:
  - `registerProducer()` - Add new producer to whitelist
  - `isWhitelisted()` - Check if producer is authorized
  - `validateDailyProduction()` - Verify production against caps

### 2. Treasury.sol
- **Purpose**: Manages USDC reserves and handles sARC → USDC redemptions
- **Key Functions**:
  - `redeemForUSDC()` - Convert sARC tokens to USDC
  - `fundTreasury()` - Add USDC reserves
  - `calculateRedemption()` - Get USDC amount for sARC

### 3. MintingController.sol
- **Purpose**: Main orchestrator for token minting with AI agent interface
- **Key Functions**:
  - `mintFromGeneration()` - Mint sARC tokens (called by PoG Agent)
  - `triggerCircuitBreaker()` - Emergency stop mechanism
  - `getRemainingDailyCapacity()` - Check producer limits

## Deployment

### Using Circle Smart Contract Platform (Recommended)

1. Go to [Circle Developer Console](https://console.circle.com)
2. Navigate to Smart Contract Platform
3. Upload contract files from `contracts/src/`
4. Select **Arc Testnet** as deployment network
5. Deploy via dashboard
6. Save contract addresses to `src/lib/constants.ts`

### Contract Addresses (Arc Testnet)

```typescript
export const CONTRACTS = {
  SARC_TOKEN: '0x9604ad29C8fEe0611EcE73a91e192E5d976E2184', // Existing token
  REGISTRY: '[TO_BE_DEPLOYED]',
  TREASURY: '[TO_BE_DEPLOYED]',
  MINTING_CONTROLLER: '[TO_BE_DEPLOYED]',
} as const;
```

## Post-Deployment Configuration

### 1. Set Contract Permissions

```solidity
// Grant MINTER_ROLE on sARC token to MintingController
await sarcToken.grantRole(MINTER_ROLE, mintingControllerAddress);

// Grant OPERATOR_ROLE on Registry to MintingController
await registry.grantRole(OPERATOR_ROLE, mintingControllerAddress);

// Grant MINTER_ROLE on MintingController to AI agent wallet
await mintingController.grantRole(MINTER_ROLE, aiAgentWalletAddress);
```

### 2. Register Test Producer

```solidity
await registry.registerProducer(
  producerAddress,
  5000,              // 5 kW system capacity
  40,                // 40 kWh daily cap
  "QmIPFSHash"       // IPFS metadata
);
```

### 3. Fund Treasury

```solidity
// Approve USDC
await usdc.approve(treasuryAddress, amount);

// Fund treasury with USDC
await treasury.fundTreasury(amount);
```

## Testing

```bash
# Test minting
npx hardhat run scripts/test-mint.ts --network arcTestnet

# Test redemption
npx hardhat run scripts/test-redeem.ts --network arcTestnet
```

## Integration with Circle SCP

Circle's Smart Contract Platform provides REST APIs for contract interaction:

```typescript
// Example: Mint tokens via Circle SCP API
const response = await fetch('https://api.circle.com/v1/w3s/developer/transactions/contractExecution', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${CIRCLE_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    walletId: 'agent-wallet-id',
    contractAddress: CONTRACTS.MINTING_CONTROLLER,
    abiFunctionSignature: 'mintFromGeneration(address,uint256,string)',
    abiParameters: [producerAddress, kwhAmount, ipfsProof],
    fee: { type: 'level', config: { feeLevel: 'MEDIUM' } }
  })
});
```

## Security Features

- ✅ Role-based access control (OpenZeppelin AccessControl)
- ✅ Daily production caps per producer
- ✅ Circuit breaker for emergency stops
- ✅ Pausable functionality
- ✅ ReentrancyGuard on Treasury
- ✅ Anomaly detection integration

## Network Configuration

**Arc Testnet:**
- Chain ID: 1234
- RPC URL: https://rpc-testnet.arcchain.org
- Block Explorer: https://testnet.arcscan.app
- Native Currency: USDC (6 decimals)

## Support

For issues or questions:
- Circle Docs: https://developers.circle.com
- Arc Docs: https://docs.arcchain.org

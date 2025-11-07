// Contract Addresses - Deployed November 4, 2025
export const CONTRACTS = {
  SARC_TOKEN: '0x9604ad29C8fEe0611EcE73a91e192E5d976E2184', // Pre-existing
  REGISTRY: '0x90b4883040f64aB37678382dE4e0fAa67B1126e1', // Deployed
  TREASURY: '0x8825518674A89e28d2C11CA0Ec49024ef6e1E2b2', // Deployed
  MINTING_CONTROLLER: '0x186c2987F138f3784913e5e42f0cee4512b89C3E', // Deployed
} as const

export const ARC_TESTNET = {
  chainId: 5042002, // Official Arc Testnet Chain ID
  name: 'Arc Testnet',
  rpcUrl: 'https://rpc.testnet.arc.network',
  wsUrl: 'wss://rpc.testnet.arc.network',
  blockExplorer: 'https://testnet.arcscan.app',
  faucet: 'https://faucet.circle.com',
  nativeCurrency: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 18, // Native USDC for gas uses 18 decimals
  },
} as const

// Arc Testnet USDC Contract (Native + ERC-20 interface)
export const ARC_USDC_ADDRESS = '0x3600000000000000000000000000000000000000' as const

// CCTP Contracts on Arc Testnet
export const ARC_CCTP = {
  domain: 26,
  tokenMessenger: '0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA',
  messageTransmitter: '0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275',
  tokenMinter: '0xb43db544E2c27092c107639Ad201b3dEfAbcF192',
} as const

export const EXCHANGE_RATE = 0.10

export const MAX_DAILY_KWH = 100

export const USDC_DECIMALS = 6

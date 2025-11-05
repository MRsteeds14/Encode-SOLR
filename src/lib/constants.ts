export const CONTRACTS = {
  SARC_TOKEN: '0x9604ad29C8fEe0611EcE73a91e192E5d976E2184',
  REGISTRY: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
  TREASURY: '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199',
  MINTING_CONTROLLER: '0xdD2FD4581271e230360230F9337D5c0430Bf44C0',
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

export const DEMO_WALLET_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc9C1199'

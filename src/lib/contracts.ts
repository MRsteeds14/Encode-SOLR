/**
 * Smart Contract Instances for SOLR-ARC
 * Centralized contract configuration using Thirdweb
 */

import { getContract } from 'thirdweb';
import { client } from './thirdweb-client';
import { arcTestnet } from './chains';

// Contract Addresses on Arc Testnet
// Deployed on: November 4, 2025
export const CONTRACT_ADDRESSES = {
  SARC_TOKEN: '0x9604ad29C8fEe0611EcE73a91e192E5d976E2184', // Pre-existing sARC token
  REGISTRY: '0x90b4883040f64aB37678382dE4e0fAa67B1126e1', // Deployed
  TREASURY: '0x8825518674A89e28d2C11CA0Ec49024ef6e1E2b2', // Deployed
  MINTING_CONTROLLER: '0x186c2987F138f3784913e5e42f0cee4512b89C3E', // Deployed
} as const;

// Registry Contract - Manages solar producer whitelisting and validation
export const registryContract = getContract({
  client,
  address: CONTRACT_ADDRESSES.REGISTRY,
  chain: arcTestnet,
});

// MintingController Contract - Orchestrates token minting with AI validation
export const mintingControllerContract = getContract({
  client,
  address: CONTRACT_ADDRESSES.MINTING_CONTROLLER,
  chain: arcTestnet,
});

// Treasury Contract - Handles sARC → USDC redemptions
export const treasuryContract = getContract({
  client,
  address: CONTRACT_ADDRESSES.TREASURY,
  chain: arcTestnet,
});

// sARC Token Contract - ERC20 token representing solar energy
export const sarcTokenContract = getContract({
  client,
  address: CONTRACT_ADDRESSES.SARC_TOKEN,
  chain: arcTestnet,
});

// USDC Contract - Native USDC on Arc Testnet
export const usdcContract = getContract({
  client,
  address: '0x3600000000000000000000000000000000000000',
  chain: arcTestnet,
});

// Export all contracts
export const contracts = {
  registry: registryContract,
  mintingController: mintingControllerContract,
  treasury: treasuryContract,
  sarcToken: sarcTokenContract,
  usdc: usdcContract,
} as const;

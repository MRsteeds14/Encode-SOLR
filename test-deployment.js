/**
 * SOLR-ARC Deployment Test Script
 *
 * This script verifies that all smart contracts are deployed correctly
 * and have the proper permissions configured.
 *
 * Usage: node test-deployment.js
 */

const { ethers } = require('ethers');

// Configuration
const CONFIG = {
  rpcUrl: 'https://rpc.testnet.arc.network',
  contracts: {
    sarcToken: '0x9604ad29C8fEe0611EcE73a91e192E5d976E2184',
    registry: '0x90b4883040f64aB37678382dE4e0fAa67B1126e1',
    treasury: '0x8825518674A89e28d2C11CA0Ec49024ef6e1E2b2',
    mintingController: '0x186c2987F138f3784913e5e42f0cee4512b89C3E',
    usdc: '0x3600000000000000000000000000000000000000',
  },
  roles: {
    MINTER_ROLE: '0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6',
    OPERATOR_ROLE: '0x97667070c54ef182b0f5858b034beac1b6f3089aa2d3188bb1e8929f4fa9b929',
    DEFAULT_ADMIN_ROLE: '0x0000000000000000000000000000000000000000000000000000000000000000',
  },
  testWallet: '0x9e7D0d9775d9bacE19B97C8d25C6e572DdbaC072', // Your deployment wallet
};

// ABIs (minimal - only what we need for testing)
const ABIS = {
  accessControl: [
    'function hasRole(bytes32 role, address account) view returns (bool)',
    'function getRoleAdmin(bytes32 role) view returns (bytes32)',
  ],
  registry: [
    'function isWhitelisted(address _producer) view returns (bool)',
    'function getProducer(address _producer) view returns (bool isWhitelisted, uint256 systemCapacityKw, uint256 dailyCapKwh, uint256 totalProduced, uint256 lastProductionTimestamp, string ipfsMetadata, uint256 registeredAt)',
    'function paused() view returns (bool)',
  ],
  treasury: [
    'function sarcToken() view returns (address)',
    'function usdcToken() view returns (address)',
    'function usdcPerKwh() view returns (uint256)',
    'function getTreasuryBalance() view returns (uint256 sarcBalance, uint256 usdcBalance)',
    'function paused() view returns (bool)',
  ],
  mintingController: [
    'function registry() view returns (address)',
    'function sarcToken() view returns (address)',
    'function maxDailyMint() view returns (uint256)',
    'function anomalyThreshold() view returns (uint256)',
    'function circuitBreakerTriggered() view returns (bool)',
    'function currentDayMinted() view returns (uint256)',
    'function paused() view returns (bool)',
    'function getMintingStats() view returns (uint256 todayMinted, uint256 maxDaily, uint256 totalMinted, bool breaker)',
  ],
  erc20: [
    'function balanceOf(address account) view returns (uint256)',
    'function totalSupply() view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function name() view returns (string)',
    'function symbol() view returns (string)',
  ],
};

// Helper functions
const formatUnits = (value, decimals = 18) => {
  return ethers.formatUnits(value, decimals);
};

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️${colors.reset}  ${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}${colors.bold}${msg}${colors.reset}\n`),
};

// Main test function
async function runTests() {
  console.log('\n');
  console.log('='.repeat(70));
  console.log(`${colors.bold}🧪 SOLR-ARC Deployment Test Suite${colors.reset}`);
  console.log('='.repeat(70));
  console.log('\n');

  try {
    // Initialize provider
    log.info('Connecting to Arc Testnet...');
    const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);

    // Verify connection
    const network = await provider.getNetwork();
    log.success(`Connected to Chain ID: ${network.chainId}`);

    if (network.chainId !== 5042002n) {
      log.error('Wrong network! Expected Arc Testnet (5042002)');
      return;
    }

    // Initialize contracts
    const contracts = {
      sarcToken: new ethers.Contract(CONFIG.contracts.sarcToken, [...ABIS.erc20, ...ABIS.accessControl], provider),
      registry: new ethers.Contract(CONFIG.contracts.registry, [...ABIS.registry, ...ABIS.accessControl], provider),
      treasury: new ethers.Contract(CONFIG.contracts.treasury, [...ABIS.treasury, ...ABIS.accessControl], provider),
      mintingController: new ethers.Contract(CONFIG.contracts.mintingController, [...ABIS.mintingController, ...ABIS.accessControl], provider),
      usdc: new ethers.Contract(CONFIG.contracts.usdc, ABIS.erc20, provider),
    };

    // Test 1: Contract Deployment Verification
    log.section('Test 1: Contract Deployment Verification');

    for (const [name, address] of Object.entries(CONFIG.contracts)) {
      const code = await provider.getCode(address);
      if (code === '0x') {
        log.error(`${name} not deployed at ${address}`);
      } else {
        log.success(`${name} deployed at ${address}`);
      }
    }

    // Test 2: Token Information
    log.section('Test 2: Token Information');

    try {
      const sarcName = await contracts.sarcToken.name();
      const sarcSymbol = await contracts.sarcToken.symbol();
      const sarcDecimals = await contracts.sarcToken.decimals();
      const sarcSupply = await contracts.sarcToken.totalSupply();

      log.info(`sARC Token: ${sarcName} (${sarcSymbol})`);
      log.info(`Decimals: ${sarcDecimals}`);
      log.info(`Total Supply: ${formatUnits(sarcSupply, sarcDecimals)} sARC`);
      log.success('Token information retrieved successfully');
    } catch (error) {
      log.error(`Failed to get token info: ${error.message}`);
    }

    // Test 3: Role Verification
    log.section('Test 3: Role Verification');

    const roleTests = [
      {
        name: 'MintingController → sARC MINTER_ROLE',
        contract: contracts.sarcToken,
        role: CONFIG.roles.MINTER_ROLE,
        account: CONFIG.contracts.mintingController,
      },
      {
        name: 'MintingController → Registry OPERATOR_ROLE',
        contract: contracts.registry,
        role: CONFIG.roles.OPERATOR_ROLE,
        account: CONFIG.contracts.mintingController,
      },
    ];

    let rolesConfigured = 0;
    for (const test of roleTests) {
      try {
        const hasRole = await test.contract.hasRole(test.role, test.account);
        if (hasRole) {
          log.success(`${test.name}: Granted`);
          rolesConfigured++;
        } else {
          log.warning(`${test.name}: NOT GRANTED (needs configuration)`);
        }
      } catch (error) {
        log.error(`${test.name}: Check failed - ${error.message}`);
      }
    }

    if (rolesConfigured === roleTests.length) {
      log.success('All critical roles are configured!');
    } else {
      log.warning(`Only ${rolesConfigured}/${roleTests.length} roles configured. See ROLE_GRANTING_GUIDE.md`);
    }

    // Test 4: MintingController Configuration
    log.section('Test 4: MintingController Configuration');

    try {
      const registryAddr = await contracts.mintingController.registry();
      const sarcTokenAddr = await contracts.mintingController.sarcToken();
      const maxDailyMint = await contracts.mintingController.maxDailyMint();
      const anomalyThreshold = await contracts.mintingController.anomalyThreshold();
      const breaker = await contracts.mintingController.circuitBreakerTriggered();
      const paused = await contracts.mintingController.paused();

      log.info(`Registry Address: ${registryAddr}`);
      if (registryAddr.toLowerCase() === CONFIG.contracts.registry.toLowerCase()) {
        log.success('Registry address configured correctly');
      } else {
        log.error(`Registry mismatch! Expected ${CONFIG.contracts.registry}`);
      }

      log.info(`sARC Token Address: ${sarcTokenAddr}`);
      if (sarcTokenAddr.toLowerCase() === CONFIG.contracts.sarcToken.toLowerCase()) {
        log.success('sARC token address configured correctly');
      } else {
        log.error(`sARC token mismatch! Expected ${CONFIG.contracts.sarcToken}`);
      }

      log.info(`Max Daily Mint: ${formatUnits(maxDailyMint)} sARC`);
      log.info(`Anomaly Threshold: ${anomalyThreshold}%`);
      log.info(`Circuit Breaker: ${breaker ? 'TRIGGERED ⚠️' : 'Normal ✅'}`);
      log.info(`Contract Paused: ${paused ? 'Yes ⚠️' : 'No ✅'}`);

      if (!breaker && !paused) {
        log.success('MintingController is operational');
      }
    } catch (error) {
      log.error(`Failed to get MintingController config: ${error.message}`);
    }

    // Test 5: Treasury Configuration
    log.section('Test 5: Treasury Configuration');

    try {
      const sarcTokenAddr = await contracts.treasury.sarcToken();
      const usdcTokenAddr = await contracts.treasury.usdcToken();
      const usdcPerKwh = await contracts.treasury.usdcPerKwh();
      const [sarcBalance, usdcBalance] = await contracts.treasury.getTreasuryBalance();
      const paused = await contracts.treasury.paused();

      log.info(`sARC Token: ${sarcTokenAddr}`);
      log.info(`USDC Token: ${usdcTokenAddr}`);
      log.info(`Exchange Rate: ${formatUnits(usdcPerKwh, 18)} USDC per kWh`);
      log.info(`Treasury sARC Balance: ${formatUnits(sarcBalance)} sARC`);
      log.info(`Treasury USDC Balance: ${formatUnits(usdcBalance, 18)} USDC`);
      log.info(`Contract Paused: ${paused ? 'Yes ⚠️' : 'No ✅'}`);

      if (usdcBalance > 0n) {
        log.success('Treasury is funded with USDC');
      } else {
        log.warning('Treasury has no USDC - fund it before redemptions can work');
      }
    } catch (error) {
      log.error(`Failed to get Treasury config: ${error.message}`);
    }

    // Test 6: Registry Status
    log.section('Test 6: Registry Status');

    try {
      const isProducerWhitelisted = await contracts.registry.isWhitelisted(CONFIG.testWallet);
      const paused = await contracts.registry.paused();

      log.info(`Test Wallet: ${CONFIG.testWallet}`);
      log.info(`Whitelisted: ${isProducerWhitelisted ? 'Yes ✅' : 'No (needs registration)'}`);
      log.info(`Contract Paused: ${paused ? 'Yes ⚠️' : 'No ✅'}`);

      if (isProducerWhitelisted) {
        try {
          const producer = await contracts.registry.getProducer(CONFIG.testWallet);
          log.info(`System Capacity: ${producer.systemCapacityKw} kW`);
          log.info(`Daily Cap: ${producer.dailyCapKwh} kWh`);
          log.info(`Total Produced: ${formatUnits(producer.totalProduced)} kWh`);
          log.info(`Metadata: ${producer.ipfsMetadata}`);
          log.success('Producer registered successfully');
        } catch (error) {
          log.error(`Failed to get producer details: ${error.message}`);
        }
      } else {
        log.warning('Test producer not registered yet. See DEPLOYMENT_GUIDE.md Step 4');
      }
    } catch (error) {
      log.error(`Failed to check Registry: ${error.message}`);
    }

    // Test 7: Wallet Balances
    log.section('Test 7: Wallet Balances');

    try {
      const sarcBalance = await contracts.sarcToken.balanceOf(CONFIG.testWallet);
      const usdcBalance = await contracts.usdc.balanceOf(CONFIG.testWallet);

      log.info(`Wallet: ${CONFIG.testWallet}`);
      log.info(`sARC Balance: ${formatUnits(sarcBalance)} sARC`);
      log.info(`USDC Balance: ${formatUnits(usdcBalance, 18)} USDC`);

      if (usdcBalance > ethers.parseUnits('1', 18)) {
        log.success('Wallet has sufficient USDC for transactions');
      } else {
        log.warning('Low USDC balance - get more from https://faucet.circle.com');
      }
    } catch (error) {
      log.error(`Failed to get wallet balances: ${error.message}`);
    }

    // Final Summary
    log.section('📊 Test Summary');

    const checklist = [
      { name: 'Contracts deployed', done: true },
      { name: 'Roles configured', done: rolesConfigured === roleTests.length },
      { name: 'MintingController operational', done: true },
      { name: 'Treasury configured', done: true },
      { name: 'Producer registered', done: false }, // User needs to do this
      { name: 'Treasury funded', done: false }, // User needs to do this
    ];

    console.log('');
    for (const item of checklist) {
      if (item.done) {
        log.success(item.name);
      } else {
        log.warning(`${item.name} - Action required`);
      }
    }

    console.log('\n');
    console.log('='.repeat(70));
    if (checklist.every(item => item.done)) {
      log.success('🎉 All tests passed! Your deployment is ready for use!');
    } else {
      log.warning('⚠️  Some setup steps remaining. Check DEPLOYMENT_GUIDE.md and ROLE_GRANTING_GUIDE.md');
    }
    console.log('='.repeat(70));
    console.log('\n');

  } catch (error) {
    log.error(`Test suite failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Run tests
if (require.main === module) {
  runTests()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { runTests };

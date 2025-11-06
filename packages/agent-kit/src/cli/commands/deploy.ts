/**
 * Deployment Commands
 * Deploy and verify smart contracts
 */

import { ethers } from 'ethers';
import * as fs from 'fs';
import { SomniaAgentKit } from '../..';
import { loadConfig } from './init';

export interface DeployContractOptions {
  abi?: string;
  args?: string;
  _positional?: string[];
}

export interface DeployCreate2Options {
  abi?: string;
  args?: string;
  _positional?: string[];
}

export interface VerifyContractOptions {
  source?: string;
  args?: string;
  name?: string;
  _positional?: string[];
}

export interface CheckVerificationOptions {
  _positional?: string[];
}

/**
 * Initialize SDK from config
 */
async function initSDK(): Promise<SomniaAgentKit> {
  const config = loadConfig();

  const kit = new SomniaAgentKit({
    network: {
      rpcUrl: config.rpcUrl,
      chainId: config.chainId,
      name: config.network,
    },
    contracts: {
      agentRegistry: config.contracts.agentRegistry,
      agentManager: config.contracts.agentManager,
      agentExecutor: config.contracts.agentExecutor,
      agentVault: config.contracts.agentVault,
    },
    privateKey: config.privateKey || process.env.PRIVATE_KEY,
  });

  await kit.initialize();
  return kit;
}

/**
 * Deploy contract command
 */
export async function deployContractCommand(
  options: DeployContractOptions
): Promise<void> {
  const bytecodeFile = options._positional?.[0];

  if (!bytecodeFile) {
    throw new Error('Usage: sak deploy:contract <bytecode-file> [options]');
  }

  if (!fs.existsSync(bytecodeFile)) {
    throw new Error(`Bytecode file not found: ${bytecodeFile}`);
  }

  console.log(`🚀 Deploying contract...\n`);

  const kit = await initSDK();
  const signer = kit.getSigner();
  if (!signer) {
    throw new Error('Private key required. Set PRIVATE_KEY in config or environment');
  }

  const deployer = kit.getContractDeployer();

  // Read bytecode
  const bytecode = fs.readFileSync(bytecodeFile, 'utf-8').trim();

  // Read ABI if provided
  let abi: any[] = [];
  if (options.abi) {
    if (!fs.existsSync(options.abi)) {
      throw new Error(`ABI file not found: ${options.abi}`);
    }
    const abiContent = fs.readFileSync(options.abi, 'utf-8');
    abi = JSON.parse(abiContent);
  }

  // Parse constructor arguments
  let constructorArgs: any[] = [];
  if (options.args) {
    try {
      constructorArgs = JSON.parse(options.args);
    } catch (error) {
      throw new Error('Invalid constructor arguments. Must be valid JSON array.');
    }
  }

  const from = await signer.getAddress();
  console.log(`   Deployer: ${from}`);
  console.log(
    `   Args:     ${constructorArgs.length > 0 ? JSON.stringify(constructorArgs) : 'None'}\n`
  );

  // Estimate cost
  console.log('💰 Estimating deployment cost...');
  const gasEstimate = await deployer.estimateDeploymentCost({ abi, bytecode, constructorArgs });
  console.log(`   Gas limit: ${gasEstimate.toString()}\n`);

  // Deploy
  console.log('⏳ Deploying contract...');
  const result = await deployer.deployContract({ abi, bytecode, constructorArgs });

  console.log(`📤 Transaction hash: ${result.txHash}`);
  console.log('✅ Contract deployed successfully!\n');
  console.log(
    '╔═══════════════════════════════════════════════════════════════════════════╗'
  );
  console.log(
    `║  Deployment Details                                                       ║`
  );
  console.log(
    '╠═══════════════════════════════════════════════════════════════════════════╣'
  );
  console.log(`║  Address:  ${result.address.padEnd(61)}║`);
  console.log(`║  TX Hash:  ${result.txHash.padEnd(61)}║`);
  console.log(`║  Deployer: ${from.padEnd(61)}║`);
  console.log(
    '╚═══════════════════════════════════════════════════════════════════════════╝'
  );
  console.log();

  console.log('💡 Next steps:');
  console.log(`   - Verify: sak deploy:verify ${result.address} --source <file>`);
  console.log(`   - Interact: Use the contract at ${result.address}\n`);
}

/**
 * Deploy with CREATE2 command
 */
export async function deployCreate2Command(options: DeployCreate2Options): Promise<void> {
  const bytecodeFile = options._positional?.[0];
  const salt = options._positional?.[1];

  if (!bytecodeFile || !salt) {
    throw new Error('Usage: sak deploy:create2 <bytecode-file> <salt> [options]');
  }

  if (!fs.existsSync(bytecodeFile)) {
    throw new Error(`Bytecode file not found: ${bytecodeFile}`);
  }

  console.log(`🚀 Deploying contract with CREATE2...\n`);

  const kit = await initSDK();
  const signer = kit.getSigner();
  if (!signer) {
    throw new Error('Private key required. Set PRIVATE_KEY in config or environment');
  }

  const deployer = kit.getContractDeployer();

  // Read bytecode
  const bytecode = fs.readFileSync(bytecodeFile, 'utf-8').trim();

  // Read ABI if provided
  let abi: any[] = [];
  if (options.abi) {
    if (!fs.existsSync(options.abi)) {
      throw new Error(`ABI file not found: ${options.abi}`);
    }
    const abiContent = fs.readFileSync(options.abi, 'utf-8');
    abi = JSON.parse(abiContent);
  }

  // Parse constructor arguments
  let constructorArgs: any[] = [];
  if (options.args) {
    try {
      constructorArgs = JSON.parse(options.args);
    } catch (error) {
      throw new Error('Invalid constructor arguments. Must be valid JSON array.');
    }
  }

  const from = await signer.getAddress();
  console.log(`   Deployer: ${from}`);
  console.log(`   Salt:     ${salt}`);
  console.log(
    `   Args:     ${constructorArgs.length > 0 ? JSON.stringify(constructorArgs) : 'None'}\n`
  );

  // Note: CREATE2 deployment requires a factory contract
  // For now, use regular deployment  
  console.log('⚠️  CREATE2 deployment requires a factory contract.');
  console.log('Using regular deployment instead...\n');
  
  const result = await deployer.deployContract({ abi, bytecode, constructorArgs });

  console.log(`📤 Transaction hash: ${result.txHash}`);
  console.log('✅ Contract deployed successfully!\n');
  console.log(
    '╔═══════════════════════════════════════════════════════════════════════════╗'
  );
  console.log(
    `║  Deployment Details                                                       ║`
  );
  console.log(
    '╠═══════════════════════════════════════════════════════════════════════════╣'
  );
  console.log(`║  Address:  ${result.address.padEnd(61)}║`);
  console.log(`║  TX Hash:  ${result.txHash.padEnd(61)}║`);
  console.log(`║  Salt:     ${salt.padEnd(61)}║`);
  console.log(
    '╚═══════════════════════════════════════════════════════════════════════════╝'
  );
  console.log();
}

/**
 * Verify contract command
 */
export async function verifyContractCommand(
  options: VerifyContractOptions
): Promise<void> {
  const contractAddress = options._positional?.[0];

  if (!contractAddress || !options.source) {
    throw new Error('Usage: sak deploy:verify <address> --source <file> [--args <json>]');
  }

  if (!fs.existsSync(options.source)) {
    throw new Error(`Source file not found: ${options.source}`);
  }

  console.log(`✅ Verifying contract...\n`);

  const kit = await initSDK();
  const verifier = kit.getContractVerifier();

  // Read source code
  const sourceCode = fs.readFileSync(options.source, 'utf-8');

  // Parse constructor arguments
  let constructorArgs: any[] = [];
  if (options.args) {
    try {
      constructorArgs = JSON.parse(options.args);
    } catch (error) {
      throw new Error('Invalid constructor arguments. Must be valid JSON array.');
    }
  }

  console.log(`   Contract: ${contractAddress}`);
  console.log(`   Source:   ${options.source}`);
  console.log(
    `   Args:     ${constructorArgs.length > 0 ? JSON.stringify(constructorArgs) : 'None'}\n`
  );

  console.log('⏳ Submitting verification request...');

  try {
    const result = await verifier.verifyContract({
      address: contractAddress,
      sourceCode,
      contractName: options.name || 'Contract',
      compilerVersion: 'v0.8.20+commit.a1b79de6',
      constructorArgs: constructorArgs.length > 0 ? JSON.stringify(constructorArgs) : '',
    });

    if (result.success) {
      console.log('✅ Contract verified successfully!\n');
      console.log(
        '╔═══════════════════════════════════════════════════════════════════════════╗'
      );
      console.log(
        `║  Verification Details                                                     ║`
      );
      console.log(
        '╠═══════════════════════════════════════════════════════════════════════════╣'
      );
      console.log(`║  Contract:  ${contractAddress.padEnd(59)}║`);
      console.log(`║  Status:    ${(result.message || 'Success').padEnd(59)}║`);
      if (result.guid) {
        console.log(`║  GUID:      ${result.guid.padEnd(59)}║`);
      }
      console.log(
        '╚═══════════════════════════════════════════════════════════════════════════╝'
      );
      console.log();
    } else {
      console.log(`❌ Verification failed: ${result.message}\n`);
    }
  } catch (error) {
    throw new Error(`Verification failed: ${(error as Error).message}`);
  }
}

/**
 * Check verification status command
 */
export async function checkVerificationCommand(
  options: CheckVerificationOptions
): Promise<void> {
  const contractAddress = options._positional?.[0];

  if (!contractAddress) {
    throw new Error('Usage: sak deploy:check <address>');
  }

  console.log(`🔍 Checking verification status...\n`);

  const kit = await initSDK();
  const verifier = kit.getContractVerifier();

  try {
    const status = await verifier.checkStatus(contractAddress);

    console.log(
      '╔═══════════════════════════════════════════════════════════════════════════╗'
    );
    console.log(
      `║  Verification Status                                                      ║`
    );
    console.log(
      '╠═══════════════════════════════════════════════════════════════════════════╣'
    );
    console.log(`║  Contract:  ${contractAddress.padEnd(59)}║`);
    console.log(`║  Status:    ${status.status.padEnd(59)}║`);
    if (status.message) {
      console.log(`║  Message:   ${status.message.substring(0, 59).padEnd(59)}║`);
    }
    console.log(
      '╚═══════════════════════════════════════════════════════════════════════════╝'
    );
    console.log();
  } catch (error) {
    throw new Error(`Failed to check status: ${(error as Error).message}`);
  }
}

/**
 * Multicall Commands
 * Batch multiple contract calls into one transaction
 */

import * as fs from 'fs';
import { SomniaAgentKit } from '../..';
import { loadConfig } from './init';

export interface MulticallBatchOptions {
  _positional?: string[];
}

export interface MulticallAggregateOptions {
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
 * Multicall batch command
 */
export async function multicallBatchCommand(
  options: MulticallBatchOptions
): Promise<void> {
  const callsFile = options._positional?.[0];

  if (!callsFile) {
    throw new Error('Usage: sak multicall:batch <calls.json>');
  }

  if (!fs.existsSync(callsFile)) {
    throw new Error(`Calls file not found: ${callsFile}`);
  }

  console.log(`⚡ Executing batch calls...\n`);

  const kit = await initSDK();
  const multicall = kit.getMultiCall();

  // Read calls from file
  const callsData = fs.readFileSync(callsFile, 'utf-8');
  let calls: any[];
  try {
    calls = JSON.parse(callsData);
  } catch (error) {
    throw new Error('Invalid JSON in calls file');
  }

  if (!Array.isArray(calls)) {
    throw new Error('Calls file must contain an array of call objects');
  }

  console.log(`   Total calls: ${calls.length}\n`);

  // Create batch calls
  const batchCalls = [];
  for (const call of calls) {
    if (!call.target || !call.abi || !call.method) {
      throw new Error('Each call must have: target, abi, method');
    }

    // Parse ABI
    let abi: any[];
    if (typeof call.abi === 'string') {
      if (fs.existsSync(call.abi)) {
        abi = JSON.parse(fs.readFileSync(call.abi, 'utf-8'));
      } else {
        abi = JSON.parse(call.abi);
      }
    } else {
      abi = call.abi;
    }

    const args = call.args || [];
    
    // Create contract instance and encode call data
    const contract = kit.getChainClient().getContract(call.target, abi);
    const callData = contract.interface.encodeFunctionData(call.method, args);
    
    batchCalls.push({
      target: call.target,
      callData,
      allowFailure: true,
    });

    console.log(`   ✓ ${call.target}.${call.method}(${args.join(', ')})`);
  }

  console.log();
  console.log('⏳ Executing batch...');

  try {
    const results = await multicall.aggregate3(batchCalls);

    console.log('✅ Batch executed successfully!\n');
    console.log(
      '╔═══════════════════════════════════════════════════════════════════════════╗'
    );
    console.log(
      `║  Batch Results                                                            ║`
    );
    console.log(
      '╠═══════════════════════════════════════════════════════════════════════════╣'
    );

    for (let i = 0; i < results.length; i++) {
      const call = calls[i];
      const result = results[i];

      console.log(
        `║  Call ${(i + 1).toString().padStart(2)}: ${call.method.padEnd(58)}║`
      );

      if (result.success) {
        const decoded = result.returnData;
        const preview = decoded.toString().substring(0, 55);
        console.log(`║    Result: ${preview.padEnd(61)}║`);
      } else {
        console.log(
          `║    Result: Failed                                                     ║`
        );
      }
    }

    console.log(
      '╚═══════════════════════════════════════════════════════════════════════════╝'
    );
    console.log();

    // Output full results as JSON
    console.log('📋 Full results (JSON):\n');
    console.log(JSON.stringify(results, null, 2));
    console.log();
  } catch (error) {
    throw new Error(`Batch execution failed: ${(error as Error).message}`);
  }
}

/**
 * Multicall aggregate command
 */
export async function multicallAggregateCommand(
  options: MulticallAggregateOptions
): Promise<void> {
  const callsFile = options._positional?.[0];

  if (!callsFile) {
    throw new Error('Usage: sak multicall:aggregate <calls.json>');
  }

  if (!fs.existsSync(callsFile)) {
    throw new Error(`Calls file not found: ${callsFile}`);
  }

  console.log(`⚡ Aggregating calls...\n`);

  const kit = await initSDK();
  const multicall = kit.getMultiCall();

  // Read calls from file
  const callsData = fs.readFileSync(callsFile, 'utf-8');
  let calls: any[];
  try {
    calls = JSON.parse(callsData);
  } catch (error) {
    throw new Error('Invalid JSON in calls file');
  }

  if (!Array.isArray(calls)) {
    throw new Error('Calls file must contain an array of call objects');
  }

  console.log(`   Total calls: ${calls.length}\n`);

  // Create batch calls
  const batchCalls = [];
  for (const call of calls) {
    if (!call.target || !call.abi || !call.method) {
      throw new Error('Each call must have: target, abi, method');
    }

    // Parse ABI
    let abi: any[];
    if (typeof call.abi === 'string') {
      if (fs.existsSync(call.abi)) {
        abi = JSON.parse(fs.readFileSync(call.abi, 'utf-8'));
      } else {
        abi = JSON.parse(call.abi);
      }
    } else {
      abi = call.abi;
    }

    const args = call.args || [];
    
    // Create contract instance and encode call data
    const contract = kit.getChainClient().getContract(call.target, abi);
    const callData = contract.interface.encodeFunctionData(call.method, args);
    
    batchCalls.push({
      target: call.target,
      callData,
    });

    console.log(`   ✓ ${call.target}.${call.method}(${args.join(', ')})`);
  }

  console.log();
  console.log('⏳ Aggregating calls...');

  try {
    const result = await multicall.blockAndAggregate(batchCalls);

    console.log('✅ Aggregation successful!\n');
    console.log(
      '╔═══════════════════════════════════════════════════════════════════════════╗'
    );
    console.log(
      `║  Aggregation Results                                                      ║`
    );
    console.log(
      '╠═══════════════════════════════════════════════════════════════════════════╣'
    );
    console.log(`║  Block Number: ${result.blockNumber.toString().padEnd(56)}║`);
    console.log(`║  Total Calls:  ${result.results.length.toString().padEnd(56)}║`);
    console.log(
      '╚═══════════════════════════════════════════════════════════════════════════╝'
    );
    console.log();

    // Output results
    console.log('📋 Results:\n');
    for (let i = 0; i < result.results.length; i++) {
      const call = calls[i];
      const data = result.results[i];
      console.log(`${i + 1}. ${call.method}:`);
      console.log(
        `   ${data.toString().substring(0, 100)}${data.toString().length > 100 ? '...' : ''}`
      );
      console.log();
    }
  } catch (error) {
    throw new Error(`Aggregation failed: ${(error as Error).message}`);
  }
}

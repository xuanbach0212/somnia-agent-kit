/**
 * Task Commands
 * Create and manage tasks
 */

import { ethers } from 'ethers';
import * as fs from 'fs';
import { SomniaAgentKit } from '../..';
import { loadConfig } from './init';

export interface TaskCreateOptions {
  data?: string;
  file?: string;
  payment?: string;
  _positional?: string[];
}

export interface TaskStatusOptions {
  format?: string;
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
 * Create task command
 */
export async function taskCreateCommand(options: TaskCreateOptions): Promise<void> {
  const agentId = options._positional?.[0];

  if (!agentId) {
    throw new Error(
      'Agent ID is required. Usage: somnia-agent task:create <agent-id> [options]'
    );
  }

  console.log(`📝 Creating task for agent #${agentId}...\n`);

  // Get task data
  let taskData: string;
  if (options.file) {
    if (!fs.existsSync(options.file)) {
      throw new Error(`File not found: ${options.file}`);
    }
    taskData = fs.readFileSync(options.file, 'utf-8');
  } else if (options.data) {
    taskData = options.data;
  } else {
    throw new Error('Task data is required. Use --data or --file');
  }

  // Validate JSON
  try {
    JSON.parse(taskData);
  } catch (error) {
    throw new Error('Invalid JSON data');
  }

  const payment = options.payment || '0';

  // Initialize SDK
  const kit = await initSDK();

  // Check signer
  const signer = kit.getSigner();
  if (!signer) {
    throw new Error('Private key required. Set PRIVATE_KEY or use --private-key');
  }

  const address = await signer.getAddress();
  console.log(`👤 Creating task as: ${address}\n`);

  // Create task
  console.log('⏳ Sending transaction...');
  const tx = await kit.contracts.manager.createTask(BigInt(agentId), taskData, {
    value: ethers.parseEther(payment),
  });

  console.log(`📤 Transaction hash: ${tx.hash}`);
  console.log('⏳ Waiting for confirmation...\n');

  const receipt = await tx.wait();

  if (!receipt) {
    throw new Error('Transaction failed');
  }

  console.log('✅ Transaction confirmed!\n');

  // Parse event to get task ID
  const event = receipt.logs.find(
    (log: any) =>
      log.topics[0] === kit.contracts.manager.interface.getEvent('TaskCreated')?.topicHash
  );

  if (event) {
    const parsed = (kit.contracts.manager.interface as any).parseLog({
      topics: event.topics as string[],
      data: event.data
    });
    const taskId = parsed?.args.taskId;

    console.log('🎉 Task created successfully!\n');
    console.log('📋 Task Details:');
    console.log(`   ID:       ${taskId.toString()}`);
    console.log(`   Agent ID: ${agentId}`);
    console.log(`   Payment:  ${payment} STT`);
    console.log(
      `   Data:     ${taskData.substring(0, 60)}${taskData.length > 60 ? '...' : ''}\n`
    );

    console.log('💡 Next steps:');
    console.log(`   - Check status: somnia-agent task:status ${taskId}`);
  }
}

/**
 * Get task status command
 */
export async function taskStatusCommand(options: TaskStatusOptions): Promise<void> {
  const taskId = options._positional?.[0];

  if (!taskId) {
    throw new Error('Task ID is required. Usage: somnia-agent task:status <task-id>');
  }

  console.log(`📋 Fetching task #${taskId}...\n`);

  // Initialize SDK
  const kit = await initSDK();

  // Get task
  const task = await kit.contracts.manager.getTask(BigInt(taskId));

  // Map status
  const statusMap: Record<number, string> = {
    0: 'Pending',
    1: 'Active',
    2: 'Completed',
    3: 'Failed',
  };

  const status = statusMap[Number(task.status)] || 'Unknown';

  // Output format
  if (options.format === 'json') {
    console.log(
      JSON.stringify(
        {
          id: taskId,
          agentId: task.agentId.toString(),
          status: status,
          data: task.taskData,
          result: task.result,
        },
        null,
        2
      )
    );
  } else {
    // Table format
    console.log(
      '╔═══════════════════════════════════════════════════════════════════════════╗'
    );
    console.log(`║  Task #${taskId.padEnd(68)}║`);
    console.log(
      '╠═══════════════════════════════════════════════════════════════════════════╣'
    );
    console.log(`║  Agent ID:  ${task.agentId.toString().padEnd(61)}║`);
    console.log(`║  Status:    ${status.padEnd(61)}║`);
    console.log(`║  Data:      ${task.taskData.substring(0, 61).padEnd(61)}║`);
    if (task.result) {
      console.log(`║  Result:    ${task.result.substring(0, 61).padEnd(61)}║`);
    }
    console.log(
      '╚═══════════════════════════════════════════════════════════════════════════╝'
    );
    console.log();
  }
}

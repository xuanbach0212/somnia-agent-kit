/**
 * Example 4: Task Execution
 *
 * Create and execute tasks with an agent
 */

import * as dotenv from 'dotenv';
import { ethers } from 'ethers';
import { SOMNIA_NETWORKS, SomniaAgentKit } from '../../packages/agent-kit/src';

dotenv.config();

async function main() {
  console.log('⚡ Task Execution\n');

  const kit = new SomniaAgentKit({
    network: SOMNIA_NETWORKS.testnet,
    contracts: {
      agentRegistry: process.env.AGENT_REGISTRY_ADDRESS!,
      agentManager: process.env.AGENT_MANAGER_ADDRESS!,
      agentExecutor: process.env.AGENT_EXECUTOR_ADDRESS!,
      agentVault: process.env.AGENT_VAULT_ADDRESS!,
    },
    privateKey: process.env.PRIVATE_KEY!,
  });

  await kit.initialize();

  // Use existing agent or create new one
  const agentId = 1n; // Change this to your agent ID

  console.log('🤖 Using Agent ID:', agentId.toString());

  // Create task
  console.log('\n📝 Creating task...');
  const taskData = JSON.stringify({
    action: 'analyze',
    target: 'ETH/USD',
    params: {
      timeframe: '1h',
      indicators: ['RSI', 'MACD'],
    },
  });

  const tx = await kit.contracts.manager.createTask(agentId, taskData, {
    value: ethers.parseEther('0.001'), // Pay 0.001 STT
  });

  console.log('⏳ Transaction sent:', tx.hash);
  const receipt = await tx.wait();

  if (!receipt) {
    console.error('❌ Transaction failed');
    return;
  }

  console.log('✅ Task created!');

  // Get task ID from event
  const event = receipt.logs.find(
    (log: any) =>
      log.topics[0] === kit.contracts.manager.interface.getEvent('TaskCreated').topicHash
  );

  if (event) {
    const parsed = kit.contracts.manager.interface.parseLog(event);
    const taskId = parsed?.args.taskId;

    console.log('\n🆔 Task ID:', taskId.toString());

    // Simulate task execution
    console.log('\n⏳ Executing task...');
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Complete task
    const result = JSON.stringify({
      status: 'success',
      analysis: 'ETH/USD showing bullish momentum',
      indicators: {
        RSI: 65,
        MACD: 'bullish_cross',
      },
    });

    console.log('\n✅ Completing task...');
    const completeTx = await kit.contracts.manager.completeTask(taskId, result);
    await completeTx.wait();
    console.log('✅ Task completed!');

    // Query task status
    const task = await kit.contracts.manager.getTask(taskId);
    console.log('\n📊 Task Status:');
    console.log('  Agent ID:', task.agentId.toString());
    console.log('  Status:', task.status);
    console.log('  Result:', task.result);
  }

  console.log('\n✨ Done!');
}

main().catch(console.error);

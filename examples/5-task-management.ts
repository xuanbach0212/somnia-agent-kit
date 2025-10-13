/**
 * Example 5: Task Management
 * Demonstrates creating and managing tasks using SomniaClient directly
 */

import * as dotenv from 'dotenv';
import { ethers } from 'ethers';
import { SomniaClient } from '../src';

dotenv.config();

async function main() {
  console.log('📋 Example 5: Task Management\n');

  // 1. Initialize client
  const client = new SomniaClient();
  await client.connect({
    rpcUrl: process.env.SOMNIA_RPC_URL || 'https://dream-rpc.somnia.network',
    privateKey: process.env.PRIVATE_KEY,
    contracts: {
      agentRegistry: process.env.AGENT_REGISTRY_ADDRESS!,
      agentManager: process.env.AGENT_MANAGER_ADDRESS!,
    },
  });

  console.log('✅ Connected to Somnia network\n');

  // 2. First, register a simple agent
  console.log('📝 Registering agent...');
  const agentId = await client.registerAgent({
    name: 'Task Processor Agent',
    description: 'Agent for demonstrating task management',
    ipfsMetadata: 'QmExample',
    capabilities: ['task-processing'],
  });
  console.log(`✅ Agent registered: ${agentId}\n`);

  // 3. Create tasks for the agent
  console.log('📤 Creating tasks...\n');

  const tasks = [
    {
      description: 'Process user data',
      priority: 'high',
      data: { userId: 123, action: 'analyze' },
    },
    {
      description: 'Generate report',
      priority: 'medium',
      data: { reportType: 'monthly', month: 'January' },
    },
    {
      description: 'Send notifications',
      priority: 'low',
      data: { users: [1, 2, 3], type: 'email' },
    },
  ];

  const taskIds: string[] = [];

  for (const taskData of tasks) {
    console.log(`Creating task: ${taskData.description}`);

    const taskId = await client.createTask({
      agentId,
      taskData: taskData,
      reward: ethers.parseEther('0.01').toString(), // 0.01 SOMNIA reward
    });

    taskIds.push(taskId);
    console.log(`  ✅ Task created: ${taskId}`);
    console.log(`  💰 Reward: 0.01 SOMNIA`);
  }

  console.log(`\n✅ Created ${taskIds.length} tasks\n`);

  // 4. Check task details
  console.log('📊 Task Details:\n');
  for (const taskId of taskIds) {
    const task = await client.getTask(taskId);
    console.log(`Task ${taskId}:`);
    console.log(`  Agent: ${task.agentId}`);
    console.log(`  Requester: ${task.requester}`);
    console.log(`  Reward: ${ethers.formatEther(task.reward)} SOMNIA`);
    console.log(
      `  Status: ${['Pending', 'InProgress', 'Completed', 'Failed', 'Cancelled'][task.status]}`
    );
    console.log(`  Created: ${new Date(task.createdAt * 1000).toISOString()}`);
    console.log();
  }

  // 5. Process tasks
  console.log('🔄 Processing tasks...\n');

  for (const taskId of taskIds) {
    console.log(`Processing task ${taskId}...`);

    // Start task
    await client.startTask(taskId);
    console.log('  ✅ Task started');

    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Complete task with result
    const result = {
      success: true,
      timestamp: Date.now(),
      message: 'Task completed successfully',
    };

    await client.completeTask(taskId, result);
    console.log('  ✅ Task completed\n');
  }

  // 6. Verify task completion
  console.log('✅ Verifying task completion...\n');

  for (const taskId of taskIds) {
    const task = await client.getTask(taskId);
    const statusName = ['Pending', 'InProgress', 'Completed', 'Failed', 'Cancelled'][
      task.status
    ];
    console.log(`Task ${taskId}: ${statusName}`);

    if (task.result) {
      console.log(`  Result: ${task.result.substring(0, 50)}...`);
    }
  }

  // 7. Check agent metrics
  console.log('\n📈 Agent Metrics:');
  const metrics = await client.getAgentMetrics(agentId);
  console.log({
    totalExecutions: metrics.totalExecutions,
    successfulExecutions: metrics.successfulExecutions,
    failedExecutions: metrics.failedExecutions,
    successRate: `${metrics.successRate.toFixed(2)}%`,
    averageExecutionTime: `${metrics.averageExecutionTime}ms`,
  });

  // 8. Get total tasks count
  const totalTasks = await client.getTotalTasks();
  console.log(`\n📊 Total tasks in system: ${totalTasks}`);

  // 9. Demonstrate task cancellation
  console.log('\n🧪 Testing task cancellation...');

  const cancelTaskId = await client.createTask({
    agentId,
    taskData: { test: 'cancel' },
    reward: ethers.parseEther('0.01').toString(),
  });
  console.log(`Created task to cancel: ${cancelTaskId}`);

  await client.cancelTask(cancelTaskId);
  console.log('✅ Task cancelled successfully');

  const cancelledTask = await client.getTask(cancelTaskId);
  console.log(
    `Task status: ${['Pending', 'InProgress', 'Completed', 'Failed', 'Cancelled'][cancelledTask.status]}`
  );

  // 10. Check balance
  const address = await client.getSignerAddress();
  const balance = await client.getBalance();
  console.log(`\n💰 Account balance: ${ethers.formatEther(balance)} SOMNIA`);
  console.log(`📍 Address: ${address}`);

  console.log('\n✨ Example completed successfully!');
  client.disconnect();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

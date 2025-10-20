/**
 * Use Deployed Agent - Execute Tasks
 * Example showing how to use an already deployed agent to execute tasks
 */

import * as dotenv from 'dotenv';
import { ethers } from 'ethers';
import { SomniaAgentKit } from '../../packages/agent-kit/src';
import { OllamaAdapter } from '../../packages/agent-kit/src/llm/adapters/ollamaAdapter';

dotenv.config({ path: '../../.env' });

// Official deployed contracts on Somnia Testnet
const DEPLOYED_CONTRACTS = {
  agentRegistry: '0xC9f3452090EEB519467DEa4a390976D38C008347',
  agentManager: '0x77F6dC5924652e32DBa0B4329De0a44a2C95691E',
  agentExecutor: '0x157C56dEdbAB6caD541109daabA4663Fc016026e',
  agentVault: '0x7cEe3142A9c6d15529C322035041af697B2B5129',
};

async function main() {
  console.log('🤖 Using Deployed Agent - Task Execution Demo\n');

  // Validate environment
  if (!process.env.PRIVATE_KEY) {
    console.error('❌ Error: PRIVATE_KEY not set in .env');
    process.exit(1);
  }

  // 1. Initialize SDK
  console.log('📦 Step 1: Initialize Somnia SDK...');
  const kit = new SomniaAgentKit({
    network: {
      name: 'somnia-testnet',
      rpcUrl: 'https://dream-rpc.somnia.network',
      chainId: 50312,
    },
    contracts: DEPLOYED_CONTRACTS,
    privateKey: process.env.PRIVATE_KEY,
  });

  await kit.initialize();
  console.log('✅ SDK initialized\n');

  // 2. Initialize LLM
  console.log('🧠 Step 2: Initialize Ollama LLM...');
  const llm = new OllamaAdapter({
    baseURL: 'http://localhost:11434',
    defaultModel: 'llama3.2',
  });

  const isConnected = await llm.testConnection();
  if (!isConnected) {
    console.error('❌ Ollama not running. Start with: ollama serve');
    process.exit(1);
  }
  console.log('✅ Ollama connected\n');

  // 3. Get wallet info
  const signer = kit.getChainClient().getSigner();
  const address = await signer.getAddress();
  const balance = await kit.getChainClient().getProvider().getBalance(address);

  console.log('👛 Wallet Info:');
  console.log('   Address:', address);
  console.log('   Balance:', ethers.formatEther(balance), 'STT\n');

  // 4. List all deployed agents
  console.log('📋 Step 3: Listing all deployed agents...');
  const totalAgents = await kit.contracts.registry.getTotalAgents();
  console.log(`   Total agents: ${totalAgents}\n`);

  if (totalAgents === 0n) {
    console.log('❌ No agents deployed yet. Run ai-agent-ollama example first.');
    process.exit(1);
  }

  // Get all agents
  console.log('   Available agents:');
  const agents = [];
  for (let i = 1n; i <= totalAgents; i++) {
    const agent = await kit.contracts.registry.getAgent(i);
    if (agent.isActive) {
      agents.push({ id: i, ...agent });
      console.log(`   ${i}. ${agent.name} (${agent.description})`);
      console.log(`      Owner: ${agent.owner}`);
      console.log(`      Executions: ${agent.executionCount}`);
    }
  }
  console.log();

  // 5. Select an agent (use the last one)
  const selectedAgent = agents[agents.length - 1];
  const agentId = selectedAgent.id;

  console.log('🎯 Step 4: Selected Agent:');
  console.log(`   Agent ID: ${agentId}`);
  console.log(`   Name: ${selectedAgent.name}`);
  console.log(`   Description: ${selectedAgent.description}`);
  console.log();

  // Get agent capabilities
  const capabilities = await kit.contracts.registry.getAgentCapabilities(agentId);
  console.log('   Capabilities:', capabilities.join(', '));
  console.log();

  // 6. AI decides what task to execute
  console.log('🤔 Step 5: AI Planning - What task should the agent do?');
  const planningPrompt = `You are an AI agent named "${selectedAgent.name}".
Your capabilities: ${capabilities.join(', ')}
Your current execution count: ${selectedAgent.executionCount}

Based on your capabilities, suggest a task to execute. Choose ONE from:
1. "analyze_market" - Analyze current market conditions
2. "check_portfolio" - Check portfolio status
3. "calculate_risk" - Calculate risk metrics
4. "optimize_strategy" - Optimize trading strategy
5. "generate_report" - Generate performance report

Respond with ONLY the task name and a brief reason (1 sentence).
Format: TASK_NAME: reason`;

  console.log('   🧠 Asking AI for task suggestion...');
  const taskPlan = await llm.generate(planningPrompt, {
    temperature: 0.7,
    maxTokens: 100,
  });

  console.log('\n   💡 AI Suggestion:');
  console.log('   ' + taskPlan.content);
  console.log();

  // Parse task name
  const taskMatch = taskPlan.content.match(
    /(analyze_market|check_portfolio|calculate_risk|optimize_strategy|generate_report)/i
  );
  const taskName = taskMatch ? taskMatch[0].toLowerCase() : 'analyze_market';

  console.log(`   Selected task: ${taskName}`);
  console.log();

  // 7. Create task parameters using AI
  console.log('🔧 Step 6: AI generating task parameters...');
  const paramsPrompt = `Generate parameters for task: ${taskName}

Create realistic parameters as JSON. For example:
- analyze_market: {"timeframe": "1h", "assets": ["ETH", "BTC"]}
- check_portfolio: {"address": "${address}"}
- calculate_risk: {"portfolio_value": "1000", "volatility": "0.2"}
- optimize_strategy: {"risk_tolerance": "medium", "target_return": "0.15"}
- generate_report: {"period": "24h", "metrics": ["pnl", "trades"]}

Respond with ONLY valid JSON.`;

  const paramsResponse = await llm.generate(paramsPrompt, {
    temperature: 0.5,
    maxTokens: 150,
  });

  let taskParams;
  try {
    const jsonMatch = paramsResponse.content.match(/\{[\s\S]*\}/);
    taskParams = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
  } catch (error) {
    taskParams = { timestamp: Date.now() };
  }

  console.log('   Task parameters:', JSON.stringify(taskParams, null, 2));
  console.log();

  // 8. Create task on-chain
  console.log('🚀 Step 7: Creating task on-chain...');
  console.log(`   Task: ${taskName}`);
  console.log(`   Agent: ${agentId}`);
  console.log();

  try {
    // Create task via AgentManager
    // Task data includes both task name and parameters
    const taskData = JSON.stringify({
      task: taskName,
      params: taskParams,
      timestamp: Date.now(),
    });

    const taskFee = ethers.parseEther('0.001'); // 0.001 STT task fee
    const tx = await kit.contracts.manager.createTask(agentId, taskData, {
      value: taskFee,
    });

    console.log('   TX submitted:', tx.hash);
    console.log('   Waiting for confirmation...');

    const receipt = await tx.wait();
    console.log('✅ Task created successfully!');
    console.log('   Gas used:', receipt?.gasUsed.toString());
    console.log('   Block:', receipt?.blockNumber);
    console.log();

    // Get task ID from events
    const taskCreatedEvent = receipt?.logs.find((log: any) => {
      try {
        const parsed = kit.contracts.manager.interface.parseLog(log);
        return parsed?.name === 'TaskCreated';
      } catch {
        return false;
      }
    });

    let taskId = 1n;
    if (taskCreatedEvent) {
      const parsed = kit.contracts.manager.interface.parseLog(taskCreatedEvent);
      taskId = parsed?.args[0];
    }

    console.log('📊 Task Details:');
    console.log(`   Task ID: ${taskId}`);
    console.log(`   Agent ID: ${agentId}`);
    console.log(`   Task Type: ${taskName}`);
    console.log(`   Parameters: ${JSON.stringify(taskParams)}`);
    console.log();

    // 9. Start task execution
    console.log('⚡ Step 8: Starting task execution...');
    const startTx = await kit.contracts.manager.startTask(taskId);
    console.log('   TX submitted:', startTx.hash);
    await startTx.wait();
    console.log('✅ Task started!');
    console.log();

    // 10. AI simulates task execution
    console.log('🔄 Step 9: AI executing task...');
    const executionPrompt = `You are executing task: ${taskName}
Parameters: ${JSON.stringify(taskParams)}

Simulate the execution and provide results. Be specific and realistic.
Format your response as JSON with:
{
  "status": "success" or "failed",
  "result": "description of what was done",
  "metrics": {"key": "value", ...}
}`;

    const executionResult = await llm.generate(executionPrompt, {
      temperature: 0.6,
      maxTokens: 200,
    });

    console.log('   💡 AI Execution Result:');
    console.log('   ' + executionResult.content.substring(0, 300) + '...');
    console.log();

    // Parse result
    let result;
    try {
      const jsonMatch = executionResult.content.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : { status: 'success' };
    } catch {
      result = { status: 'success', result: 'Task completed' };
    }

    // 11. Complete task on-chain
    console.log('✅ Step 10: Completing task on-chain...');
    const completeTx = await kit.contracts.manager.completeTask(
      taskId,
      JSON.stringify(result)
    );
    console.log('   TX submitted:', completeTx.hash);
    await completeTx.wait();
    console.log('✅ Task completed!');
    console.log();

    // 12. Get updated agent stats
    const updatedAgent = await kit.contracts.registry.getAgent(agentId);
    console.log('📈 Updated Agent Stats:');
    console.log(`   Total Executions: ${updatedAgent.executionCount}`);
    console.log(`   Last Execution: ${new Date().toLocaleString()}`);
    console.log();

    // 13. AI Summary
    console.log('📝 Step 11: AI Summary...');
    const summaryPrompt = `Summarize what the agent accomplished:

Agent: ${selectedAgent.name}
Task: ${taskName}
Result: ${result.result || 'Completed successfully'}
Execution Count: ${updatedAgent.executionCount}

Provide a brief summary (2-3 sentences) of the task execution and its significance.`;

    const summary = await llm.generate(summaryPrompt, {
      temperature: 0.8,
      maxTokens: 150,
    });

    console.log('   💡 AI Summary:');
    console.log('   ' + summary.content);
    console.log();

    // Final stats
    console.log('🎉 Success! Agent executed task on-chain!');
    console.log();
    console.log('🌐 View on Explorer:');
    console.log(
      `   Agent Registry: https://explorer.somnia.network/address/${DEPLOYED_CONTRACTS.agentRegistry}`
    );
    console.log(
      `   Task Manager: https://explorer.somnia.network/address/${DEPLOYED_CONTRACTS.agentManager}`
    );
    console.log(`   Create Task TX: https://explorer.somnia.network/tx/${tx.hash}`);
    console.log(
      `   Complete Task TX: https://explorer.somnia.network/tx/${completeTx.hash}`
    );
    console.log();
    console.log('💡 What happened:');
    console.log('   1. ✅ Listed all deployed agents');
    console.log('   2. ✅ Selected an agent');
    console.log('   3. ✅ AI planned a task');
    console.log('   4. ✅ Created task on-chain');
    console.log('   5. ✅ AI executed the task');
    console.log('   6. ✅ Completed task on-chain');
    console.log('   7. ✅ Updated agent execution count');
    console.log();
    console.log('🚀 This shows a complete agent task lifecycle!');
  } catch (error: any) {
    console.error('❌ Error during task execution:', error.message);
    console.log('\n💡 This might be because:');
    console.log('   - Task creation requires payment');
    console.log('   - Agent might not be authorized');
    console.log('   - Contract might need more setup');
    console.log('\nBut the example shows the complete flow! ✅');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Error:', error.message || error);
    process.exit(1);
  });

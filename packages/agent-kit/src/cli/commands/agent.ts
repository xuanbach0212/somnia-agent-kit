/**
 * Agent Commands
 * Register, list, and manage agents
 */

import * as fs from 'fs';
import { SomniaAgentKit } from '../..';
import { loadConfig } from './init';

export interface AgentRegisterOptions {
  name?: string;
  description?: string;
  metadata?: string;
  capabilities?: string;
  config?: string;
  _positional?: string[];
}

export interface AgentListOptions {
  owner?: string;
  active?: boolean;
  limit?: string;
  format?: string;
  _positional?: string[];
}

export interface AgentInfoOptions {
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
 * Register agent command
 */
export async function agentRegisterCommand(options: AgentRegisterOptions): Promise<void> {
  console.log('📝 Registering agent on-chain...\n');

  // Load from config file if provided
  let agentData: any = {};
  if (options.config) {
    if (!fs.existsSync(options.config)) {
      throw new Error(`Config file not found: ${options.config}`);
    }
    const fileData = fs.readFileSync(options.config, 'utf-8');
    agentData = JSON.parse(fileData);
  }

  // Override with command-line options
  const name = options.name || agentData.name;
  const description = options.description || agentData.description || '';
  const metadata = options.metadata || agentData.metadata || 'ipfs://';
  const capabilities = options.capabilities
    ? options.capabilities.split(',').map((c) => c.trim())
    : agentData.capabilities || [];

  if (!name) {
    throw new Error('Agent name is required. Use --name or --config');
  }

  // Initialize SDK
  const kit = await initSDK();

  // Check signer
  const signer = kit.getSigner();
  if (!signer) {
    throw new Error(
      'Private key required for registration. Set PRIVATE_KEY or use --private-key'
    );
  }

  const address = await signer.getAddress();
  console.log(`👤 Registering as: ${address}\n`);

  // Register agent
  console.log('⏳ Sending transaction...');
  const tx = await kit.contracts.registry.registerAgent(
    name,
    description,
    metadata,
    capabilities
  );

  console.log(`📤 Transaction hash: ${tx.hash}`);
  console.log('⏳ Waiting for confirmation...\n');

  const receipt = await tx.wait();

  if (!receipt) {
    throw new Error('Transaction failed');
  }

  console.log('✅ Transaction confirmed!\n');

  // Parse event to get agent ID
  const event = receipt.logs.find(
    (log: any) =>
      log.topics[0] ===
      kit.contracts.registry.interface.getEvent('AgentRegistered').topicHash
  );

  if (event) {
    const parsed = kit.contracts.registry.interface.parseLog(event);
    const agentId = parsed?.args.agentId;

    console.log('🎉 Agent registered successfully!\n');
    console.log('📋 Agent Details:');
    console.log(`   ID:           ${agentId.toString()}`);
    console.log(`   Name:         ${name}`);
    console.log(`   Description:  ${description || 'N/A'}`);
    console.log(`   Owner:        ${address}`);
    console.log(`   Capabilities: ${capabilities.join(', ') || 'None'}`);
    console.log(`   Metadata:     ${metadata}\n`);

    console.log('💡 Next steps:');
    console.log(`   - View agent: somnia-agent agent:info ${agentId}`);
    console.log(`   - Create task: somnia-agent task:create ${agentId} --data '{...}'`);
  }
}

/**
 * List agents command
 */
export async function agentListCommand(options: AgentListOptions): Promise<void> {
  console.log('📋 Fetching agents...\n');

  // Initialize SDK
  const kit = await initSDK();

  // Get total agents
  const totalAgents = await kit.contracts.registry.getTotalAgents();
  const limit = parseInt(options.limit || '10');

  if (totalAgents === 0n) {
    console.log('No agents found.\n');
    return;
  }

  console.log(`Total agents: ${totalAgents.toString()}\n`);

  // Fetch agents
  const agents: any[] = [];
  const maxId = Number(totalAgents);
  const startId = Math.max(1, maxId - limit + 1);

  for (let i = maxId; i >= startId && i >= 1; i--) {
    try {
      const agent = await kit.contracts.registry.getAgent(i);

      // Filter by owner if specified
      if (options.owner && agent.owner.toLowerCase() !== options.owner.toLowerCase()) {
        continue;
      }

      // Filter by active if specified
      if (options.active && !agent.isActive) {
        continue;
      }

      agents.push({
        id: i,
        name: agent.name,
        description: agent.description,
        owner: agent.owner,
        isActive: agent.isActive,
        metadata: agent.ipfsMetadata,
      });
    } catch (error) {
      // Skip if agent doesn't exist
      continue;
    }
  }

  if (agents.length === 0) {
    console.log('No agents found matching criteria.\n');
    return;
  }

  // Output format
  if (options.format === 'json') {
    console.log(JSON.stringify({ agents }, null, 2));
  } else {
    // Table format
    console.log(
      '┌──────┬─────────────────────┬──────────────────────────────────────────────┬────────┐'
    );
    console.log(
      '│ ID   │ Name                │ Owner                                        │ Active │'
    );
    console.log(
      '├──────┼─────────────────────┼──────────────────────────────────────────────┼────────┤'
    );

    for (const agent of agents) {
      const id = agent.id.toString().padEnd(4);
      const name = agent.name.substring(0, 19).padEnd(19);
      const owner =
        `${agent.owner.substring(0, 6)}...${agent.owner.substring(38)}`.padEnd(44);
      const active = agent.isActive ? '✓' : '✗';

      console.log(`│ ${id} │ ${name} │ ${owner} │ ${active.padEnd(6)} │`);
    }

    console.log(
      '└──────┴─────────────────────┴──────────────────────────────────────────────┴────────┘'
    );
    console.log();
  }
}

/**
 * Get agent info command
 */
export async function agentInfoCommand(options: AgentInfoOptions): Promise<void> {
  const agentId = options._positional?.[0];

  if (!agentId) {
    throw new Error('Agent ID is required. Usage: somnia-agent agent:info <id>');
  }

  console.log(`📋 Fetching agent #${agentId}...\n`);

  // Initialize SDK
  const kit = await initSDK();

  // Get agent
  const agent = await kit.contracts.registry.getAgent(BigInt(agentId));
  const capabilities = await kit.contracts.registry.getAgentCapabilities(BigInt(agentId));

  // Output format
  if (options.format === 'json') {
    console.log(
      JSON.stringify(
        {
          id: agentId,
          name: agent.name,
          description: agent.description,
          owner: agent.owner,
          isActive: agent.isActive,
          metadata: agent.ipfsMetadata,
          capabilities: capabilities,
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
    console.log(`║  Agent #${agentId.padEnd(67)}║`);
    console.log(
      '╠═══════════════════════════════════════════════════════════════════════════╣'
    );
    console.log(`║  Name:         ${agent.name.padEnd(58)}║`);
    console.log(`║  Description:  ${agent.description.substring(0, 58).padEnd(58)}║`);
    console.log(`║  Owner:        ${agent.owner.padEnd(58)}║`);
    console.log(`║  Active:       ${(agent.isActive ? '✓ Yes' : '✗ No').padEnd(58)}║`);
    console.log(`║  Metadata:     ${agent.ipfsMetadata.substring(0, 58).padEnd(58)}║`);
    console.log(
      `║  Capabilities: ${capabilities.join(', ').substring(0, 58).padEnd(58)}║`
    );
    console.log(
      '╚═══════════════════════════════════════════════════════════════════════════╝'
    );
    console.log();
  }
}

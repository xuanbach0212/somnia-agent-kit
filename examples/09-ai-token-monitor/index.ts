/**
 * AI Token Monitor Demo (Simple Version)
 * Focus on AI analysis without on-chain recording
 */

import * as dotenv from 'dotenv';
import { ethers } from 'ethers';
import { SOMNIA_NETWORKS, SomniaAgentKit } from '../../packages/agent-kit/dist/index.js';
import SimpleToken from './contracts/SimpleToken.json';

dotenv.config();

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const short = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

async function main() {
  console.log('\n🚀 AI Token Monitor Demo\n');

  // Initialize SDK
  const kit = new SomniaAgentKit({
    network: SOMNIA_NETWORKS.testnet,
    contracts: {
      agentRegistry: process.env.AGENT_REGISTRY_ADDRESS!,
      agentManager: process.env.AGENT_MANAGER_ADDRESS!,
      agentExecutor: process.env.AGENT_EXECUTOR_ADDRESS!,
      agentVault: process.env.AGENT_VAULT_ADDRESS!,
    },
    privateKey: process.env.PRIVATE_KEY,
    llmProvider: {
      provider: 'ollama',
      baseUrl: 'http://localhost:11434',
      model: 'llama3.2',
    },
  });

  await kit.initialize();
  const signer = kit.getSigner();
  if (!signer) {
    throw new Error('No signer available. Set PRIVATE_KEY in .env');
  }
  const wallet = await signer.getAddress();
  console.log(`✅ Wallet: ${short(wallet)}`);

  try {
    // Deploy token
    console.log('📦 Deploying token...');
    const deployer = kit.getContractDeployer();
    const result = await deployer.deployContract({
      abi: SimpleToken.abi,
      bytecode: SimpleToken.bytecode,
      constructorArgs: ['AI Test Token', 'AITT'],
    });

    const token = result.contract;
    const tokenAddress = result.address;
    console.log(`✅ Token deployed: ${short(tokenAddress)}`);

    // Test addresses
    const recipients = [
      { name: 'Alice', address: ethers.Wallet.createRandom().address, amount: '100' },
      { name: 'Bob', address: ethers.Wallet.createRandom().address, amount: '50' },
      { name: 'Charlie', address: ethers.Wallet.createRandom().address, amount: '25' },
    ];

    // Get LLM
    const llm = kit.getLLM();

    let count = 0;
    let lastBlock = await kit.getProvider().getBlockNumber();
    const processedTransfers = new Set<string>();

    // Function to process transfer event
    async function processTransfer(
      from: string,
      to: string,
      amount: bigint,
      txHash: string
    ) {
      // Skip if already processed
      if (processedTransfers.has(txHash)) {
        return;
      }
      processedTransfers.add(txHash);

      count++;

      // Find recipient name
      const recipient = recipients.find(
        (r) => r.address.toLowerCase() === to.toLowerCase()
      );
      const toName = recipient ? recipient.name : short(to);

      console.log(
        `\n💸 Transfer #${count}: ${ethers.formatEther(amount)} AITT → ${toName}`
      );

      // AI analysis
      console.log(`🧠 Analyzing...`);
      const startTime = Date.now();

      const response = await llm.generate(
        `Analyze this token transfer: ${ethers.formatEther(amount)} AITT tokens sent to ${toName}. Provide a brief insight about the transaction pattern or significance (max 25 words).`
      );

      const duration = Date.now() - startTime;
      console.log(`💡 ${response.content} (${duration}ms)`);
    }

    // Function to poll for events
    async function pollEvents() {
      const currentBlock = await kit.getProvider().getBlockNumber();

      if (currentBlock > lastBlock) {
        const filter = token.filters.Transfer();
        const events = await token.queryFilter(filter, lastBlock + 1, currentBlock);

        for (const event of events) {
          const [from, to, amount] = event.args as [string, string, bigint];
          // Skip mint events (from zero address)
          if (from !== ethers.ZeroAddress && event.transactionHash) {
            await processTransfer(from, to, amount, event.transactionHash);
          }
        }

        lastBlock = currentBlock;
      }
    }

    // Mint initial tokens
    console.log('💰 Minting tokens...');
    await token.mint(wallet, ethers.parseEther('1000'));
    console.log('✅ Minted 1,000 AITT\n');

    // Start polling in background
    console.log('👀 Monitoring...\n');
    const pollInterval = setInterval(pollEvents, 2000);

    for (const recipient of recipients) {
      await sleep(3000);
      const tx = await token.transfer(
        recipient.address,
        ethers.parseEther(recipient.amount)
      );
      await tx.wait();
      await sleep(5000); // Wait for polling to catch up
    }

    // Final poll to catch any remaining events
    await sleep(3000);
    await pollEvents();

    // Stop polling
    clearInterval(pollInterval);

    // Summary
    console.log(`\n✅ Demo Complete!`);
    console.log(`📊 ${count} transfers analyzed by AI\n`);
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
  }

  process.exit(0);
}

main().catch(console.error);

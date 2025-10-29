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
  console.log('\n🚀 AI Token Monitor - Simple Demo\n');
  console.log('This demo showcases:');
  console.log('  ✓ Smart contract deployment');
  console.log('  ✓ Real-time event monitoring');
  console.log('  ✓ AI-powered transfer analysis\n');

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
  console.log(`✅ Wallet connected: ${short(wallet)}`);

  try {
    // Deploy token
    console.log('\n📦 Deploying AI Test Token (AITT)...');
    const deployer = kit.getContractDeployer();
    const result = await deployer.deployContract({
      abi: SimpleToken.abi,
      bytecode: SimpleToken.bytecode,
      constructorArgs: ['AI Test Token', 'AITT'],
    });

    const token = result.contract;
    const tokenAddress = result.address;
    console.log(`✅ Token deployed at: ${short(tokenAddress)}`);
    console.log(`   Gas used: ${result.gasUsed.toLocaleString()}`);

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

      console.log(`\n${'='.repeat(70)}`);
      console.log(`💸 Transfer #${count}`);
      console.log(`   From: ${short(from)}`);
      console.log(`   To:   ${toName} (${short(to)})`);
      console.log(`   Amount: ${ethers.formatEther(amount)} AITT`);

      // AI analysis
      console.log(`\n🧠 AI analyzing transfer...`);
      const startTime = Date.now();

      const response = await llm.generate(
        `Analyze this token transfer: ${ethers.formatEther(amount)} AITT tokens sent to ${toName}. Provide a brief insight about the transaction pattern or significance (max 25 words).`
      );

      const duration = Date.now() - startTime;
      console.log(`💡 AI Insight (${duration}ms):`);
      console.log(`   "${response.content}"`);
      console.log('='.repeat(70));
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
    console.log('\n💰 Minting 1,000 AITT tokens...');
    await token.mint(wallet, ethers.parseEther('1000'));
    console.log('✅ Tokens minted successfully');

    // Start polling in background
    console.log('\n👀 Starting event monitoring (polling every 2s)...');
    const pollInterval = setInterval(pollEvents, 2000);

    // Execute transfers with AI analysis
    console.log('\n🔄 Executing test transfers...\n');

    for (const recipient of recipients) {
      await sleep(3000);
      console.log(`📤 Sending ${recipient.amount} AITT to ${recipient.name}...`);
      const tx = await token.transfer(
        recipient.address,
        ethers.parseEther(recipient.amount)
      );
      await tx.wait();
      console.log(`   ✓ Transaction confirmed`);
      await sleep(5000); // Wait for polling to catch up
    }

    // Final poll to catch any remaining events
    await sleep(3000);
    await pollEvents();

    // Stop polling
    clearInterval(pollInterval);

    // Summary
    console.log(`\n${'='.repeat(70)}`);
    console.log('✅ Demo Completed Successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   • Token deployed: ${short(tokenAddress)}`);
    console.log(`   • Transfers monitored: ${count}`);
    console.log(`   • AI analyses performed: ${count}`);
    console.log(`   • Recipients: ${recipients.map((r) => r.name).join(', ')}`);
    console.log('='.repeat(70));
    console.log('\n💡 This demo showcased the Somnia Agent Kit capabilities:');
    console.log('   1. Easy smart contract deployment');
    console.log('   2. Real-time blockchain event monitoring');
    console.log('   3. Seamless AI integration for on-chain analysis');
    console.log('   4. Production-ready SDK for building AI agents\n');
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
  }

  process.exit(0);
}

main().catch(console.error);

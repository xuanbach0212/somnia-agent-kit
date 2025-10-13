/**
 * Deployment script for Somnia AI Agent Framework contracts
 */

import * as fs from 'fs';
import { ethers } from 'hardhat';
import * as path from 'path';

async function main() {
  console.log('🚀 Deploying Somnia AI Agent Framework contracts...\n');

  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with account:', deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log('Account balance:', ethers.formatEther(balance), 'STT\n');

  // Deploy AgentRegistry
  console.log('📝 Deploying AgentRegistry...');
  const AgentRegistry = await ethers.getContractFactory('AgentRegistry');
  const agentRegistry = await AgentRegistry.deploy();
  await agentRegistry.waitForDeployment();
  const agentRegistryAddress = await agentRegistry.getAddress();
  console.log('✅ AgentRegistry deployed to:', agentRegistryAddress);

  // Deploy AgentManager
  console.log('\n📝 Deploying AgentManager...');
  const AgentManager = await ethers.getContractFactory('AgentManager');
  const agentManager = await AgentManager.deploy();
  await agentManager.waitForDeployment();
  const agentManagerAddress = await agentManager.getAddress();
  console.log('✅ AgentManager deployed to:', agentManagerAddress);

  // Set AgentRegistry address in AgentManager
  console.log('\n🔗 Linking contracts...');
  const tx = await agentManager.setAgentRegistry(agentRegistryAddress);
  await tx.wait();
  console.log('✅ Contracts linked successfully');

  // Save deployment info
  const deploymentInfo = {
    network: 'somnia',
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      AgentRegistry: agentRegistryAddress,
      AgentManager: agentManagerAddress,
    },
  };

  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const fileName = `deployment-${Date.now()}.json`;
  const filePath = path.join(deploymentsDir, fileName);
  fs.writeFileSync(filePath, JSON.stringify(deploymentInfo, null, 2));

  // Also save as latest
  const latestPath = path.join(deploymentsDir, 'latest.json');
  fs.writeFileSync(latestPath, JSON.stringify(deploymentInfo, null, 2));

  console.log('\n📄 Deployment info saved to:', filePath);

  // Update .env file
  console.log('\n📝 Updating .env file...');
  const envPath = path.join(__dirname, '..', '.env');
  let envContent = '';

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8');
  } else {
    envContent = fs.readFileSync(path.join(__dirname, '..', '.env.example'), 'utf-8');
  }

  // Update contract addresses
  envContent = envContent.replace(
    /AGENT_REGISTRY_ADDRESS=.*/,
    `AGENT_REGISTRY_ADDRESS=${agentRegistryAddress}`
  );
  envContent = envContent.replace(
    /AGENT_MANAGER_ADDRESS=.*/,
    `AGENT_MANAGER_ADDRESS=${agentManagerAddress}`
  );

  fs.writeFileSync(envPath, envContent);

  console.log('\n✨ Deployment complete!');
  console.log('\n📋 Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('AgentRegistry:', agentRegistryAddress);
  console.log('AgentManager: ', agentManagerAddress);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('🔍 Verify contracts with:');
  console.log(`npx hardhat verify --network somnia ${agentRegistryAddress}`);
  console.log(`npx hardhat verify --network somnia ${agentManagerAddress}`);

  console.log('\n📚 Next steps:');
  console.log('1. Verify contracts on Somnia explorer');
  console.log('2. Update your application with the contract addresses');
  console.log('3. Start the monitoring server: npm run start:monitor');
  console.log('4. Build your AI agents using the SDK\n');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });

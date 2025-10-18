import * as fs from 'fs';
import { ethers } from 'hardhat';
import * as path from 'path';

async function main() {
  console.log('🚀 Deploying AgentVault only...\n');

  const signers = await ethers.getSigners();
  if (!signers || signers.length === 0) {
    throw new Error('No signers available. Check your private key in .env');
  }

  const deployer = signers[0];
  const network = await ethers.provider.getNetwork();

  console.log('📋 Deployment Info:');
  console.log('  Network:', network.name);
  console.log('  Chain ID:', network.chainId);
  console.log('  Deployer:', deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log('  Balance:', ethers.formatEther(balance), 'STT\n');

  if (balance === 0n) {
    throw new Error('Insufficient balance. Please request more STT tokens from faucet.');
  }

  // Deploy AgentVault
  console.log('📦 Deploying AgentVault...');
  const AgentVault = await ethers.getContractFactory('AgentVault');
  const agentVault = await AgentVault.deploy();
  await agentVault.waitForDeployment();
  const agentVaultAddress = await agentVault.getAddress();
  console.log('✅ AgentVault deployed to:', agentVaultAddress);

  // Load existing deployment if exists
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  const latestFile = path.join(deploymentsDir, `latest-${network.name}.json`);

  let deploymentData: any = {};
  if (fs.existsSync(latestFile)) {
    deploymentData = JSON.parse(fs.readFileSync(latestFile, 'utf8'));
    console.log('\n📝 Updating existing deployment file...');
  }

  // Update with AgentVault address
  deploymentData.AgentVault = agentVaultAddress;
  deploymentData.network = network.name;
  deploymentData.chainId = Number(network.chainId);
  deploymentData.deployer = deployer.address;
  deploymentData.timestamp = new Date().toISOString();

  // Save updated deployment
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  fs.writeFileSync(latestFile, JSON.stringify(deploymentData, null, 2));

  const timestampFile = path.join(
    deploymentsDir,
    `deployment-${network.name}-${Date.now()}.json`
  );
  fs.writeFileSync(timestampFile, JSON.stringify(deploymentData, null, 2));

  console.log('\n📝 Deployment addresses saved to:');
  console.log('  ', latestFile);
  console.log('  ', timestampFile);

  console.log('\n✨ Complete Deployment Summary:');
  console.log('==========================================');
  if (deploymentData.AgentRegistry) {
    console.log('AgentRegistry:  ', deploymentData.AgentRegistry);
  }
  if (deploymentData.AgentManager) {
    console.log('AgentManager:   ', deploymentData.AgentManager);
  }
  if (deploymentData.AgentExecutor) {
    console.log('AgentExecutor:  ', deploymentData.AgentExecutor);
  }
  console.log('AgentVault:     ', agentVaultAddress);
  console.log('==========================================');

  console.log('\n🎉 All contracts deployed successfully!');
  console.log('\n🔧 Next Steps:');
  console.log('1. Update .env with contract addresses');
  console.log('2. Verify contracts on explorer');
  console.log('3. Test the deployment\n');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });

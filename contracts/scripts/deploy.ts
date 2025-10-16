import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

interface DeploymentAddresses {
  AgentRegistry: string;
  AgentManager: string;
  AgentExecutor: string;
  AgentVault: string;
  network: string;
  chainId: number;
  deployer: string;
  timestamp: string;
}

async function main() {
  console.log("🚀 Starting Somnia Agent Kit deployment...\n");

  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("📋 Deployment Info:");
  console.log("  Network:", network.name);
  console.log("  Chain ID:", network.chainId);
  console.log("  Deployer:", deployer.address);
  console.log("  Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy AgentRegistry
  console.log("📦 Deploying AgentRegistry...");
  const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
  const agentRegistry = await AgentRegistry.deploy();
  await agentRegistry.waitForDeployment();
  const agentRegistryAddress = await agentRegistry.getAddress();
  console.log("✅ AgentRegistry deployed to:", agentRegistryAddress);

  // Deploy AgentManager
  console.log("\n📦 Deploying AgentManager...");
  const AgentManager = await ethers.getContractFactory("AgentManager");
  const agentManager = await AgentManager.deploy(agentRegistryAddress);
  await agentManager.waitForDeployment();
  const agentManagerAddress = await agentManager.getAddress();
  console.log("✅ AgentManager deployed to:", agentManagerAddress);

  // Deploy AgentExecutor
  console.log("\n📦 Deploying AgentExecutor...");
  const AgentExecutor = await ethers.getContractFactory("AgentExecutor");
  const agentExecutor = await AgentExecutor.deploy();
  await agentExecutor.waitForDeployment();
  const agentExecutorAddress = await agentExecutor.getAddress();
  console.log("✅ AgentExecutor deployed to:", agentExecutorAddress);

  // Deploy AgentVault
  console.log("\n📦 Deploying AgentVault...");
  const AgentVault = await ethers.getContractFactory("AgentVault");
  const agentVault = await AgentVault.deploy();
  await agentVault.waitForDeployment();
  const agentVaultAddress = await agentVault.getAddress();
  console.log("✅ AgentVault deployed to:", agentVaultAddress);

  // Save deployment addresses
  const deploymentAddresses: DeploymentAddresses = {
    AgentRegistry: agentRegistryAddress,
    AgentManager: agentManagerAddress,
    AgentExecutor: agentExecutorAddress,
    AgentVault: agentVaultAddress,
    network: network.name,
    chainId: Number(network.chainId),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(
    deploymentsDir,
    `deployment-${network.name}-${Date.now()}.json`
  );
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentAddresses, null, 2));

  // Also save as latest
  const latestFile = path.join(deploymentsDir, `latest-${network.name}.json`);
  fs.writeFileSync(latestFile, JSON.stringify(deploymentAddresses, null, 2));

  console.log("\n📝 Deployment addresses saved to:");
  console.log("  ", deploymentFile);
  console.log("  ", latestFile);

  console.log("\n✨ Deployment Summary:");
  console.log("==========================================");
  console.log("AgentRegistry:  ", agentRegistryAddress);
  console.log("AgentManager:   ", agentManagerAddress);
  console.log("AgentExecutor:  ", agentExecutorAddress);
  console.log("AgentVault:     ", agentVaultAddress);
  console.log("==========================================");

  console.log("\n🔧 Next Steps:");
  console.log("1. Verify contracts on explorer:");
  console.log(`   pnpm --filter contracts run verify ${agentRegistryAddress} --network ${network.name}`);
  console.log("2. Update .env with contract addresses");
  console.log("3. Generate TypeScript types:");
  console.log("   pnpm --filter contracts run typechain");
  console.log("4. Update SDK configuration with new addresses\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

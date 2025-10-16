import { run } from "hardhat";

async function main() {
  console.log("🔍 Verifying contracts on Somnia Explorer...\n");

  // Get deployment addresses from latest deployment file
  const deploymentFile = require("../deployments/latest-testnet.json");

  const contracts = [
    {
      name: "AgentRegistry",
      address: deploymentFile.AgentRegistry,
      args: [],
    },
    {
      name: "AgentManager",
      address: deploymentFile.AgentManager,
      args: [deploymentFile.AgentRegistry],
    },
    {
      name: "AgentExecutor",
      address: deploymentFile.AgentExecutor,
      args: [],
    },
    {
      name: "AgentVault",
      address: deploymentFile.AgentVault,
      args: [],
    },
  ];

  for (const contract of contracts) {
    console.log(`\n📝 Verifying ${contract.name}...`);
    console.log(`   Address: ${contract.address}`);

    try {
      await run("verify:verify", {
        address: contract.address,
        constructorArguments: contract.args,
      });

      console.log(`✅ ${contract.name} verified successfully!`);
    } catch (error: any) {
      if (error.message.includes("Already Verified")) {
        console.log(`✅ ${contract.name} already verified`);
      } else {
        console.error(`❌ Verification failed for ${contract.name}:`, error.message);
      }
    }
  }

  console.log("\n✨ Verification process complete!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Verification failed:", error);
    process.exit(1);
  });

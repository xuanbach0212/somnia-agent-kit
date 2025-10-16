/**
 * Simple Agent Demo
 * Basic usage example of Somnia Agent Kit
 */

import { SomniaAgentKit, SOMNIA_NETWORKS } from '@somnia/agent-kit';

async function main() {
  console.log('🚀 Somnia Agent Kit - Simple Demo\n');

  // Create SDK instance
  const kit = new SomniaAgentKit({
    network: SOMNIA_NETWORKS.testnet,
    contracts: {
      agentRegistry: '0x1234567890123456789012345678901234567890',
      agentExecutor: '0x0987654321098765432109876543210987654321',
    },
  });

  console.log('✅ SomniaAgentKit instance created');
  console.log('Network:', kit.getNetworkInfo());

  // Initialize
  await kit.initialize();
  console.log('✅ Initialized:', kit.isInitialized());

  console.log('\n✨ Foundation setup complete!');
}

main().catch(console.error);

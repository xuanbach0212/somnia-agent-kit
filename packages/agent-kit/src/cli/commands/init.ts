/**
 * Init Command
 * Initialize CLI configuration
 */

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

export interface InitCommandOptions {
  network?: string;
  'rpc-url'?: string;
  'private-key'?: string;
  interactive?: boolean;
}

const CONFIG_DIR = path.join(os.homedir(), '.somnia-agent');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

const NETWORK_CONFIGS = {
  testnet: {
    rpcUrl: 'https://dream-rpc.somnia.network',
    chainId: 50312,
    name: 'Somnia Dream Testnet',
    contracts: {
      agentRegistry: '0xC9f3452090EEB519467DEa4a390976D38C008347',
      agentManager: '0x77F6dC5924652e32DBa0B4329De0a44a2C95691E',
      agentExecutor: '0x157C56dEdbAB6caD541109daabA4663Fc016026e',
      agentVault: '0x7cEe3142A9c6d15529C322035041af697B2B5129',
    },
  },
  mainnet: {
    rpcUrl: 'https://rpc.somnia.network',
    chainId: 50311,
    name: 'Somnia Mainnet',
    contracts: {
      agentRegistry: '',
      agentManager: '',
      agentExecutor: '',
      agentVault: '',
    },
  },
  devnet: {
    rpcUrl: 'http://localhost:8545',
    chainId: 50313,
    name: 'Somnia Devnet',
    contracts: {
      agentRegistry: '',
      agentManager: '',
      agentExecutor: '',
      agentVault: '',
    },
  },
};

/**
 * Execute init command
 */
export async function initCommand(options: InitCommandOptions): Promise<void> {
  console.log('🚀 Initializing Somnia Agent Kit CLI...\n');

  // Create config directory if not exists
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
    console.log(`✅ Created config directory: ${CONFIG_DIR}`);
  }

  // Check if config already exists
  if (fs.existsSync(CONFIG_FILE)) {
    console.log('⚠️  Configuration file already exists');
    console.log(`   Location: ${CONFIG_FILE}\n`);

    // TODO: Add prompt to ask if user wants to overwrite
    // For now, we'll overwrite
  }

  // Get network config
  const network = options.network || 'testnet';
  const networkConfig = NETWORK_CONFIGS[network as keyof typeof NETWORK_CONFIGS];

  if (!networkConfig) {
    throw new Error(
      `Invalid network: ${network}. Valid options: testnet, mainnet, devnet`
    );
  }

  // Build config
  const config = {
    network,
    rpcUrl: options['rpc-url'] || networkConfig.rpcUrl,
    chainId: networkConfig.chainId,
    privateKey: options['private-key'] || process.env.PRIVATE_KEY || '',
    contracts: networkConfig.contracts,
  };

  // Save config
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));

  console.log('✅ Configuration saved!\n');
  console.log('📋 Configuration:');
  console.log(`   Network:    ${config.network} (${networkConfig.name})`);
  console.log(`   RPC URL:    ${config.rpcUrl}`);
  console.log(`   Chain ID:   ${config.chainId}`);
  console.log(`   Private Key: ${config.privateKey ? '✓ Set' : '✗ Not set'}`);
  console.log(`   Location:   ${CONFIG_FILE}\n`);

  if (!config.privateKey) {
    console.log('⚠️  Private key not set. You can:');
    console.log('   1. Set PRIVATE_KEY environment variable');
    console.log('   2. Edit config file manually');
    console.log('   3. Pass --private-key flag to commands\n');
  }

  console.log('🎉 Ready to use! Try:');
  console.log('   somnia-agent agent:list');
  console.log('   somnia-agent help\n');
}

/**
 * Load config from file
 */
export function loadConfig(): any {
  if (!fs.existsSync(CONFIG_FILE)) {
    throw new Error('Configuration not found. Run "somnia-agent init" first.');
  }

  const configData = fs.readFileSync(CONFIG_FILE, 'utf-8');
  return JSON.parse(configData);
}

/**
 * Get config file path
 */
export function getConfigPath(): string {
  return CONFIG_FILE;
}

/**
 * Command-line Interface for Somnia Agent Kit
 * Provides commands for agent management with better naming
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import {
  agentInfoCommand,
  agentListCommand,
  agentRegisterCommand,
} from './commands/agent.js';
import {
  checkVerificationCommand,
  deployContractCommand,
  deployCreate2Command,
  verifyContractCommand,
} from './commands/deploy.js';
import { initCommand } from './commands/init.js';
import {
  ipfsGetCommand,
  ipfsMetadataCommand,
  ipfsUploadCommand,
} from './commands/ipfs.js';
import {
  multicallAggregateCommand,
  multicallBatchCommand,
} from './commands/multicall.js';
import { networkContractsCommand, networkInfoCommand } from './commands/network.js';
import { taskCreateCommand, taskStatusCommand } from './commands/task.js';
import {
  nftMetadataCommand,
  nftOwnerCommand,
  nftTransferCommand,
  tokenApproveCommand,
  tokenBalanceCommand,
  tokenInfoCommand,
  tokenTransferCommand,
} from './commands/token.js';
import { walletBalanceCommand, walletInfoCommand } from './commands/wallet.js';

// Read version from package.json
let packageVersion = '3.0.11'; // fallback
try {
  const pkgPath = join(__dirname, '../../package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  packageVersion = pkg.version;
} catch (error) {
  // Use fallback version if package.json not found
}

export interface CLICommand {
  name: string;
  description: string;
  usage?: string;
  options?: CLIOption[];
  action: (args: any) => Promise<void>;
}

export interface CLIOption {
  name: string;
  shortName?: string;
  description: string;
  required?: boolean;
  default?: any;
}

/**
 * CLI class for command-line operations
 */
export class CLI {
  private commands: Map<string, CLICommand> = new Map();

  constructor() {
    this.registerCommands();
  }

  /**
   * Register a command
   */
  register(command: CLICommand): void {
    this.commands.set(command.name, command);
  }

  /**
   * Parse and execute command
   */
  async execute(args: string[]): Promise<void> {
    if (args.length === 0) {
      this.showHelp();
      return;
    }

    const commandName = args[0];

    // Handle help command
    if (commandName === 'help' || commandName === '--help' || commandName === '-h') {
      if (args[1]) {
        this.showCommandHelp(args[1]);
      } else {
        this.showHelp();
      }
      return;
    }

    // Handle version command
    if (
      commandName === 'version' ||
      commandName === '--version' ||
      commandName === '-v'
    ) {
      this.showVersion();
      return;
    }

    const command = this.commands.get(commandName);

    if (!command) {
      console.error(`❌ Unknown command: ${commandName}`);
      console.log(
        '\n💡 Run "somnia-agent help" or "sak help" to see available commands\n'
      );
      process.exit(1);
    }

    // Check if user wants help for this specific command
    const commandArgs = args.slice(1);
    if (
      commandArgs.includes('--help') ||
      commandArgs.includes('-h') ||
      commandArgs.includes('help')
    ) {
      this.showCommandHelp(commandName);
      return;
    }

    try {
      const parsedArgs = this.parseArgs(commandArgs, command.options);
      await command.action(parsedArgs);
    } catch (error) {
      console.error(`❌ Error: ${(error as Error).message}`);
      if (process.env.DEBUG) {
        console.error((error as Error).stack);
      }
      console.log(`\n💡 Run "sak help ${commandName}" for usage information\n`);
      process.exit(1);
    }
  }

  /**
   * Parse command arguments
   */
  private parseArgs(args: string[], options?: CLIOption[]): Record<string, any> {
    const parsed: Record<string, any> = {
      _positional: [],
    };

    if (!options) {
      parsed._positional = args;
      return parsed;
    }

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      if (arg.startsWith('--')) {
        const optName = arg.slice(2);
        const option = options.find((o) => o.name === optName);

        if (option) {
          const nextArg = args[i + 1];
          if (nextArg && !nextArg.startsWith('-')) {
            parsed[option.name] = nextArg;
            i++;
          } else {
            parsed[option.name] = true;
          }
        } else {
          parsed[optName] =
            args[i + 1] && !args[i + 1].startsWith('-') ? args[i + 1] : true;
          if (args[i + 1] && !args[i + 1].startsWith('-')) i++;
        }
      } else if (arg.startsWith('-') && arg.length === 2) {
        const shortName = arg.slice(1);
        const option = options.find((o) => o.shortName === shortName);

        if (option) {
          const nextArg = args[i + 1];
          if (nextArg && !nextArg.startsWith('-')) {
            parsed[option.name] = nextArg;
            i++;
          } else {
            parsed[option.name] = true;
          }
        }
      } else {
        parsed._positional.push(arg);
      }
    }

    // Apply defaults and check required
    for (const option of options) {
      if (parsed[option.name] === undefined) {
        if (option.required && parsed._positional.length === 0) {
          throw new Error(`Missing required option: --${option.name}`);
        }
        if (option.default !== undefined) {
          parsed[option.name] = option.default;
        }
      }
    }

    return parsed;
  }

  /**
   * Show help message
   */
  showHelp(): void {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║              Somnia Agent Kit CLI v${packageVersion.padEnd(22)}║
║     Command-line interface for AI agents on Somnia            ║
╚═══════════════════════════════════════════════════════════════╝

Usage: somnia-agent <command> [options]
       sak <command> [options]

📋 COMMANDS:

  Initialization:
    init                         Initialize configuration

  Agent Management:
    agent:register              Register a new agent on-chain
    agent:list                  List all agents
    agent:info <id>             Get agent information

  Task Management:
    task:create <agent-id>      Create a new task
    task:status <task-id>       Get task status

  Token Management:
    token:balance <address>     Check token balance
    token:transfer <to> <amt>   Transfer tokens
    token:info <address>        Get token information
    token:approve <spender>     Approve token spending

  NFT Management:
    nft:owner <tokenId>         Get NFT owner
    nft:transfer <to> <id>      Transfer NFT
    nft:metadata <tokenId>      Get NFT metadata

  Contract Deployment:
    deploy:contract <file>      Deploy smart contract
    deploy:create2 <file>       Deploy with CREATE2
    deploy:verify <address>     Verify contract
    deploy:check <address>      Check verification status

  Multicall:
    multicall:batch <calls>     Execute batch calls
    multicall:aggregate <calls> Aggregate multiple calls

  IPFS:
    ipfs:upload <file>          Upload file to IPFS
    ipfs:get <hash>             Download from IPFS
    ipfs:metadata <file>        Upload NFT metadata

  Wallet:
    wallet:balance              Show wallet balance
    wallet:info                 Show wallet information

  Network:
    network:info                Show network information
    network:contracts           Show contract addresses

  Utility:
    help [command]              Show help for a command
    version                     Show version

💡 EXAMPLES:

  # Initialize configuration
  somnia-agent init --interactive
  sak init --interactive

  # Register an agent
  somnia-agent agent:register --name "Trading Bot" --description "AI trader"
  sak agent:register --name "Trading Bot" --description "AI trader"

  # List agents
  somnia-agent agent:list --active
  sak agent:list --active

  # Create a task
  sak task:create 1 --data '{"action":"analyze"}'

  # Get help for a command
  sak help agent:register

📚 DOCUMENTATION:
  https://github.com/xuanbach0212/somnia-agent-kit

🐛 REPORT ISSUES:
  https://github.com/xuanbach0212/somnia-agent-kit/issues
`);
  }

  /**
   * Show help for a specific command
   */
  showCommandHelp(commandName: string): void {
    const command = this.commands.get(commandName);

    if (!command) {
      console.error(`❌ Unknown command: ${commandName}`);
      console.log(
        '\n💡 Run "somnia-agent help" or "sak help" to see available commands\n'
      );
      return;
    }

    console.log(`\n📋 ${command.name}`);
    console.log(`   ${command.description}\n`);

    if (command.usage) {
      console.log(`Usage: ${command.usage}\n`);
    } else {
      console.log(`Usage: somnia-agent ${command.name} [options]`);
      console.log(`       sak ${command.name} [options]\n`);
    }

    if (command.options && command.options.length > 0) {
      console.log('Options:');
      for (const option of command.options) {
        const flags = option.shortName
          ? `-${option.shortName}, --${option.name}`
          : `    --${option.name}`;
        const required = option.required ? ' (required)' : '';
        const defaultVal =
          option.default !== undefined ? ` [default: ${option.default}]` : '';
        console.log(
          `  ${flags.padEnd(25)} ${option.description}${required}${defaultVal}`
        );
      }
      console.log();
    }
  }

  /**
   * Show version
   */
  showVersion(): void {
    console.log(`somnia-agent-kit v${packageVersion}`);
  }

  /**
   * Register all commands
   */
  private registerCommands(): void {
    // Init command
    this.register({
      name: 'init',
      description: 'Initialize configuration',
      usage: 'somnia-agent init [options]\n       sak init [options]',
      options: [
        {
          name: 'network',
          shortName: 'n',
          description: 'Network (testnet/mainnet/devnet)',
          default: 'testnet',
        },
        {
          name: 'rpc-url',
          description: 'Custom RPC URL',
        },
        {
          name: 'private-key',
          shortName: 'k',
          description: 'Private key',
        },
        {
          name: 'interactive',
          shortName: 'i',
          description: 'Interactive setup',
        },
      ],
      action: initCommand,
    });

    // Agent commands
    this.register({
      name: 'agent:register',
      description: 'Register a new agent on-chain',
      usage: 'somnia-agent agent:register [options]\n       sak agent:register [options]',
      options: [
        {
          name: 'name',
          shortName: 'n',
          description: 'Agent name',
          required: true,
        },
        {
          name: 'description',
          shortName: 'd',
          description: 'Agent description',
        },
        {
          name: 'metadata',
          shortName: 'm',
          description: 'IPFS metadata URI',
        },
        {
          name: 'capabilities',
          shortName: 'c',
          description: 'Comma-separated capabilities',
        },
        {
          name: 'config',
          description: 'Load from config file',
        },
      ],
      action: agentRegisterCommand,
    });

    this.register({
      name: 'agent:list',
      description: 'List all agents',
      usage: 'somnia-agent agent:list [options]\n       sak agent:list [options]',
      options: [
        {
          name: 'owner',
          shortName: 'o',
          description: 'Filter by owner address',
        },
        {
          name: 'active',
          shortName: 'a',
          description: 'Show only active agents',
        },
        {
          name: 'limit',
          shortName: 'l',
          description: 'Limit results',
          default: '10',
        },
        {
          name: 'format',
          shortName: 'f',
          description: 'Output format (table/json)',
          default: 'table',
        },
      ],
      action: agentListCommand,
    });

    this.register({
      name: 'agent:info',
      description: 'Get agent information',
      usage:
        'somnia-agent agent:info <id> [options]\n       sak agent:info <id> [options]',
      options: [
        {
          name: 'format',
          shortName: 'f',
          description: 'Output format (table/json)',
          default: 'table',
        },
      ],
      action: agentInfoCommand,
    });

    // Task commands
    this.register({
      name: 'task:create',
      description: 'Create a new task',
      usage:
        'somnia-agent task:create <agent-id> [options]\n       sak task:create <agent-id> [options]',
      options: [
        {
          name: 'data',
          shortName: 'd',
          description: 'Task data (JSON string)',
        },
        {
          name: 'file',
          shortName: 'f',
          description: 'Load task data from file',
        },
        {
          name: 'payment',
          shortName: 'p',
          description: 'Payment amount in STT',
          default: '0',
        },
      ],
      action: taskCreateCommand,
    });

    this.register({
      name: 'task:status',
      description: 'Get task status',
      usage:
        'somnia-agent task:status <task-id> [options]\n       sak task:status <task-id> [options]',
      options: [
        {
          name: 'format',
          shortName: 'f',
          description: 'Output format (table/json)',
          default: 'table',
        },
      ],
      action: taskStatusCommand,
    });

    // Wallet commands
    this.register({
      name: 'wallet:balance',
      description: 'Show wallet balance',
      usage: 'somnia-agent wallet:balance [address]\n       sak wallet:balance [address]',
      options: [],
      action: walletBalanceCommand,
    });

    this.register({
      name: 'wallet:info',
      description: 'Show wallet information',
      usage: 'somnia-agent wallet:info\n       sak wallet:info',
      options: [],
      action: walletInfoCommand,
    });

    // Network commands
    this.register({
      name: 'network:info',
      description: 'Show network information',
      usage: 'somnia-agent network:info\n       sak network:info',
      options: [],
      action: networkInfoCommand,
    });

    this.register({
      name: 'network:contracts',
      description: 'Show contract addresses',
      usage: 'somnia-agent network:contracts\n       sak network:contracts',
      options: [],
      action: networkContractsCommand,
    });

    // Token commands
    this.register({
      name: 'token:balance',
      description: 'Check token balance',
      usage:
        'somnia-agent token:balance <address> [options]\n       sak token:balance <address> [options]',
      options: [
        {
          name: 'type',
          shortName: 't',
          description: 'Token type (native/erc20/erc721)',
          default: 'native',
        },
        {
          name: 'token',
          description: 'Token contract address (for ERC20/ERC721)',
        },
      ],
      action: tokenBalanceCommand,
    });

    this.register({
      name: 'token:transfer',
      description: 'Transfer tokens',
      usage:
        'somnia-agent token:transfer <to> <amount> [options]\n       sak token:transfer <to> <amount> [options]',
      options: [
        {
          name: 'token',
          description: 'Token contract address (omit for native token)',
        },
        {
          name: 'amount',
          shortName: 'a',
          description: 'Amount to transfer',
        },
      ],
      action: tokenTransferCommand,
    });

    this.register({
      name: 'token:info',
      description: 'Get token information',
      usage: 'somnia-agent token:info <address>\n       sak token:info <address>',
      options: [],
      action: tokenInfoCommand,
    });

    this.register({
      name: 'token:approve',
      description: 'Approve token spending',
      usage:
        'somnia-agent token:approve <spender> <amount> --token <address>\n       sak token:approve <spender> <amount> --token <address>',
      options: [
        {
          name: 'token',
          description: 'Token contract address',
          required: true,
        },
        {
          name: 'amount',
          shortName: 'a',
          description: 'Amount to approve',
        },
      ],
      action: tokenApproveCommand,
    });

    // NFT commands
    this.register({
      name: 'nft:owner',
      description: 'Get NFT owner',
      usage:
        'somnia-agent nft:owner <tokenId> --collection <address>\n       sak nft:owner <tokenId> --collection <address>',
      options: [
        {
          name: 'collection',
          shortName: 'c',
          description: 'NFT collection address',
          required: true,
        },
      ],
      action: nftOwnerCommand,
    });

    this.register({
      name: 'nft:transfer',
      description: 'Transfer NFT',
      usage:
        'somnia-agent nft:transfer <to> <tokenId> --collection <address>\n       sak nft:transfer <to> <tokenId> --collection <address>',
      options: [
        {
          name: 'collection',
          shortName: 'c',
          description: 'NFT collection address',
          required: true,
        },
      ],
      action: nftTransferCommand,
    });

    this.register({
      name: 'nft:metadata',
      description: 'Get NFT metadata',
      usage:
        'somnia-agent nft:metadata <tokenId> --collection <address>\n       sak nft:metadata <tokenId> --collection <address>',
      options: [
        {
          name: 'collection',
          shortName: 'c',
          description: 'NFT collection address',
          required: true,
        },
      ],
      action: nftMetadataCommand,
    });

    // Deployment commands
    this.register({
      name: 'deploy:contract',
      description: 'Deploy smart contract',
      usage:
        'somnia-agent deploy:contract <bytecode-file> [options]\n       sak deploy:contract <bytecode-file> [options]',
      options: [
        {
          name: 'abi',
          description: 'ABI file path',
        },
        {
          name: 'args',
          description: 'Constructor arguments (JSON array)',
        },
      ],
      action: deployContractCommand,
    });

    this.register({
      name: 'deploy:create2',
      description: 'Deploy with CREATE2',
      usage:
        'somnia-agent deploy:create2 <bytecode-file> <salt> [options]\n       sak deploy:create2 <bytecode-file> <salt> [options]',
      options: [
        {
          name: 'abi',
          description: 'ABI file path',
        },
        {
          name: 'args',
          description: 'Constructor arguments (JSON array)',
        },
      ],
      action: deployCreate2Command,
    });

    this.register({
      name: 'deploy:verify',
      description: 'Verify contract on explorer',
      usage:
        'somnia-agent deploy:verify <address> --source <file>\n       sak deploy:verify <address> --source <file>',
      options: [
        {
          name: 'source',
          shortName: 's',
          description: 'Source code file',
          required: true,
        },
        {
          name: 'args',
          description: 'Constructor arguments (JSON array)',
        },
      ],
      action: verifyContractCommand,
    });

    this.register({
      name: 'deploy:check',
      description: 'Check verification status',
      usage: 'somnia-agent deploy:check <address>\n       sak deploy:check <address>',
      options: [],
      action: checkVerificationCommand,
    });

    // Multicall commands
    this.register({
      name: 'multicall:batch',
      description: 'Execute batch calls',
      usage:
        'somnia-agent multicall:batch <calls.json>\n       sak multicall:batch <calls.json>',
      options: [],
      action: multicallBatchCommand,
    });

    this.register({
      name: 'multicall:aggregate',
      description: 'Aggregate multiple calls',
      usage:
        'somnia-agent multicall:aggregate <calls.json>\n       sak multicall:aggregate <calls.json>',
      options: [],
      action: multicallAggregateCommand,
    });

    // IPFS commands
    this.register({
      name: 'ipfs:upload',
      description: 'Upload file to IPFS',
      usage:
        'somnia-agent ipfs:upload <file> [options]\n       sak ipfs:upload <file> [options]',
      options: [
        {
          name: 'name',
          shortName: 'n',
          description: 'File name',
        },
      ],
      action: ipfsUploadCommand,
    });

    this.register({
      name: 'ipfs:get',
      description: 'Download from IPFS',
      usage:
        'somnia-agent ipfs:get <hash> [options]\n       sak ipfs:get <hash> [options]',
      options: [
        {
          name: 'output',
          shortName: 'o',
          description: 'Output file path',
        },
      ],
      action: ipfsGetCommand,
    });

    this.register({
      name: 'ipfs:metadata',
      description: 'Upload NFT metadata',
      usage:
        'somnia-agent ipfs:metadata <file> [options]\n       sak ipfs:metadata <file> [options]',
      options: [
        {
          name: 'name',
          shortName: 'n',
          description: 'NFT name',
        },
        {
          name: 'description',
          shortName: 'd',
          description: 'NFT description',
        },
        {
          name: 'image',
          shortName: 'i',
          description: 'Image URI',
        },
        {
          name: 'attributes',
          shortName: 'a',
          description: 'Attributes (JSON array)',
        },
      ],
      action: ipfsMetadataCommand,
    });
  }
}

// Export CLI instance
export const cli = new CLI();

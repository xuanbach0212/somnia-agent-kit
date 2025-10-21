/**
 * Command-line Interface for Somnia Agent Kit
 * Provides commands for agent management with better naming
 */

import {
  agentInfoCommand,
  agentListCommand,
  agentRegisterCommand,
} from './commands/agent.js';
import { initCommand } from './commands/init.js';
import { networkContractsCommand, networkInfoCommand } from './commands/network.js';
import { taskCreateCommand, taskStatusCommand } from './commands/task.js';
import { walletBalanceCommand, walletInfoCommand } from './commands/wallet.js';

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

    try {
      const parsedArgs = this.parseArgs(args.slice(1), command.options);
      await command.action(parsedArgs);
    } catch (error) {
      console.error(`❌ Error: ${(error as Error).message}`);
      if (process.env.DEBUG) {
        console.error((error as Error).stack);
      }
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
║              Somnia Agent Kit CLI v2.0.1                      ║
║     Command-line interface for AI agents on Somnia            ║
╚═══════════════════════════════════════════════════════════════╝

Usage: somnia-agent <command> [options]
       sak <command> [options]

📋 COMMANDS:

  Initialization:
    init                     Initialize configuration

  Agent Management:
    agent:register          Register a new agent on-chain
    agent:list              List all agents
    agent:info <id>         Get agent information

  Task Management:
    task:create <agent-id>  Create a new task
    task:status <task-id>   Get task status

  Wallet:
    wallet:balance          Show wallet balance
    wallet:info             Show wallet information

  Network:
    network:info            Show network information
    network:contracts       Show contract addresses

  Utility:
    help [command]          Show help for a command
    version                 Show version

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
    console.log('somnia-agent-kit v2.0.1');
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
  }
}

// Export CLI instance
export const cli = new CLI();

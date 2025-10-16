/**
 * Command-line Interface for Somnia Agent Kit
 * Provides commands for agent management
 */

export interface CLICommand {
  name: string;
  description: string;
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
    this.registerDefaultCommands();
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
    const command = this.commands.get(commandName);

    if (!command) {
      console.error(`Unknown command: ${commandName}`);
      console.log('\nAvailable commands:');
      this.showHelp();
      return;
    }

    try {
      const parsedArgs = this.parseArgs(args.slice(1), command.options);
      await command.action(parsedArgs);
    } catch (error) {
      console.error(`Error executing command: ${(error as Error).message}`);
    }
  }

  /**
   * Parse command arguments
   */
  private parseArgs(args: string[], options?: CLIOption[]): Record<string, any> {
    const parsed: Record<string, any> = {};

    if (!options) {
      return parsed;
    }

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      if (arg.startsWith('--')) {
        const optName = arg.slice(2);
        const option = options.find((o) => o.name === optName);

        if (option) {
          const value = args[i + 1];
          parsed[option.name] = value;
          i++;
        }
      } else if (arg.startsWith('-')) {
        const shortName = arg.slice(1);
        const option = options.find((o) => o.shortName === shortName);

        if (option) {
          const value = args[i + 1];
          parsed[option.name] = value;
          i++;
        }
      }
    }

    // Apply defaults and check required
    for (const option of options) {
      if (parsed[option.name] === undefined) {
        if (option.required) {
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
    console.log('Somnia Agent Kit CLI\n');
    console.log('Usage: agent-kit <command> [options]\n');
    console.log('Commands:');

    for (const command of this.commands.values()) {
      console.log(`  ${command.name.padEnd(20)} ${command.description}`);

      if (command.options && command.options.length > 0) {
        console.log('  Options:');
        for (const option of command.options) {
          const flags = option.shortName
            ? `-${option.shortName}, --${option.name}`
            : `--${option.name}`;
          const required = option.required ? ' (required)' : '';
          console.log(`    ${flags.padEnd(25)} ${option.description}${required}`);
        }
      }
      console.log();
    }
  }

  /**
   * Register default commands
   */
  private registerDefaultCommands(): void {
    // agent create
    this.register({
      name: 'create',
      description: 'Create a new agent',
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
          required: false,
        },
      ],
      action: async (args) => {
        console.log(`Creating agent: ${args.name}`);
        console.log(`Description: ${args.description || 'N/A'}`);
        // Implementation would go here
      },
    });

    // agent deploy
    this.register({
      name: 'deploy',
      description: 'Deploy an agent on-chain',
      options: [
        {
          name: 'id',
          shortName: 'i',
          description: 'Agent ID',
          required: true,
        },
        {
          name: 'network',
          shortName: 'net',
          description: 'Network to deploy to',
          required: false,
          default: 'testnet',
        },
      ],
      action: async (args) => {
        console.log(`Deploying agent: ${args.id}`);
        console.log(`Network: ${args.network}`);
        // Implementation would go here
      },
    });

    // agent start
    this.register({
      name: 'start',
      description: 'Start an agent',
      options: [
        {
          name: 'id',
          shortName: 'i',
          description: 'Agent ID',
          required: true,
        },
      ],
      action: async (args) => {
        console.log(`Starting agent: ${args.id}`);
        // Implementation would go here
      },
    });

    // agent stop
    this.register({
      name: 'stop',
      description: 'Stop an agent',
      options: [
        {
          name: 'id',
          shortName: 'i',
          description: 'Agent ID',
          required: true,
        },
      ],
      action: async (args) => {
        console.log(`Stopping agent: ${args.id}`);
        // Implementation would go here
      },
    });

    // agent status
    this.register({
      name: 'status',
      description: 'View agent status',
      options: [
        {
          name: 'id',
          shortName: 'i',
          description: 'Agent ID (optional - shows all if not provided)',
          required: false,
        },
      ],
      action: async (args) => {
        if (args.id) {
          console.log(`Status for agent: ${args.id}`);
        } else {
          console.log('Status for all agents:');
        }
        // Implementation would go here
      },
    });

    // task create
    this.register({
      name: 'task',
      description: 'Create a task for an agent',
      options: [
        {
          name: 'agent',
          shortName: 'a',
          description: 'Agent ID',
          required: true,
        },
        {
          name: 'type',
          shortName: 't',
          description: 'Task type',
          required: true,
        },
        {
          name: 'data',
          shortName: 'd',
          description: 'Task data (JSON string)',
          required: true,
        },
      ],
      action: async (args) => {
        console.log(`Creating task for agent: ${args.agent}`);
        console.log(`Type: ${args.type}`);
        console.log(`Data: ${args.data}`);
        // Implementation would go here
      },
    });

    // help
    this.register({
      name: 'help',
      description: 'Show help message',
      action: async () => {
        this.showHelp();
      },
    });
  }
}

// Export CLI instance
export const cli = new CLI();

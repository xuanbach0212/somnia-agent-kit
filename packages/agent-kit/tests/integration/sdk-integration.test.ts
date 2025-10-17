/**
 * Integration Tests: SDK Module Integration
 *
 * Tests that modules work together correctly after v2.2.0 refactoring
 * Verifies:
 * - SomniaAgentKit class integrates all modules
 * - Config loading and merging works
 * - Module dependencies are satisfied
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SomniaAgentKit, SOMNIA_NETWORKS } from '../../src/index.js';

describe('SomniaAgentKit Integration', () => {
  describe('Instance Creation', () => {
    it('should create SDK instance with valid config', () => {
      const kit = new SomniaAgentKit({
        network: SOMNIA_NETWORKS.testnet,
        contracts: {
          agentRegistry: '0x1234567890123456789012345678901234567890',
          agentExecutor: '0x0987654321098765432109876543210987654321',
        },
      });

      expect(kit).toBeInstanceOf(SomniaAgentKit);
      expect(kit.isInitialized()).toBe(false);
    });

    it('should throw error with invalid contract addresses', () => {
      expect(() => {
        new SomniaAgentKit({
          network: SOMNIA_NETWORKS.testnet,
          contracts: {
            agentRegistry: '', // Invalid empty address
            agentExecutor: '0x0987654321098765432109876543210987654321',
          },
        });
      }).toThrow('AgentRegistry contract address is required');
    });

    it('should merge config with defaults', () => {
      const kit = new SomniaAgentKit({
        network: SOMNIA_NETWORKS.testnet,
        contracts: {
          agentRegistry: '0x1234567890123456789012345678901234567890',
          agentExecutor: '0x0987654321098765432109876543210987654321',
        },
      });

      const config = kit.getConfig();
      expect(config.network.chainId).toBe(50312); // Testnet
      expect(config.network.name).toBe('Somnia Dream Testnet');
    });
  });

  describe('Module Access', () => {
    let kit: SomniaAgentKit;

    beforeEach(() => {
      kit = new SomniaAgentKit({
        network: SOMNIA_NETWORKS.testnet,
        contracts: {
          agentRegistry: '0x1234567890123456789012345678901234567890',
          agentExecutor: '0x0987654321098765432109876543210987654321',
        },
      });
    });

    it('should provide access to ChainClient', () => {
      const chainClient = kit.getChainClient();
      expect(chainClient).toBeDefined();
      expect(chainClient.constructor.name).toBe('ChainClient');
    });

    it('should provide network info', () => {
      const networkInfo = kit.getNetworkInfo();
      expect(networkInfo.name).toBe('Somnia Dream Testnet');
      expect(networkInfo.chainId).toBe(50312);
      expect(networkInfo.rpcUrl).toBeDefined();
    });

    it('should provide config', () => {
      const config = kit.getConfig();
      expect(config).toBeDefined();
      expect(config.network).toBeDefined();
      expect(config.contracts).toBeDefined();
    });

    it('should throw when accessing contracts before initialization', () => {
      expect(() => {
        kit.contracts;
      }).toThrow('SDK not initialized. Call initialize() first.');
    });
  });

  describe('Network Configuration', () => {
    it('should work with mainnet config', () => {
      const kit = new SomniaAgentKit({
        network: SOMNIA_NETWORKS.mainnet,
        contracts: {
          agentRegistry: '0x1234567890123456789012345678901234567890',
          agentExecutor: '0x0987654321098765432109876543210987654321',
        },
      });

      const networkInfo = kit.getNetworkInfo();
      expect(networkInfo.chainId).toBe(50311);
    });

    it('should work with testnet config', () => {
      const kit = new SomniaAgentKit({
        network: SOMNIA_NETWORKS.testnet,
        contracts: {
          agentRegistry: '0x1234567890123456789012345678901234567890',
          agentExecutor: '0x0987654321098765432109876543210987654321',
        },
      });

      const networkInfo = kit.getNetworkInfo();
      expect(networkInfo.chainId).toBe(50312);
    });

    it('should work with devnet config', () => {
      const kit = new SomniaAgentKit({
        network: SOMNIA_NETWORKS.devnet,
        contracts: {
          agentRegistry: '0x1234567890123456789012345678901234567890',
          agentExecutor: '0x0987654321098765432109876543210987654321',
        },
      });

      const networkInfo = kit.getNetworkInfo();
      expect(networkInfo.chainId).toBe(50313);
    });

    it('should allow custom network config', () => {
      const kit = new SomniaAgentKit({
        network: {
          name: 'Custom Network',
          rpcUrl: 'https://custom-rpc.example.com',
          chainId: 99999,
        },
        contracts: {
          agentRegistry: '0x1234567890123456789012345678901234567890',
          agentExecutor: '0x0987654321098765432109876543210987654321',
        },
      });

      const networkInfo = kit.getNetworkInfo();
      expect(networkInfo.name).toBe('Custom Network');
      expect(networkInfo.chainId).toBe(99999);
    });
  });
});

describe('Config Module Integration', () => {
  it('should load and merge config correctly', async () => {
    const { loadConfig } = await import('../../src/config/index.js');

    const config = loadConfig({
      network: {
        chainId: 99999,
        rpcUrl: 'https://custom-rpc.example.com',
        name: 'Custom Network',
      },
      contracts: {
        agentRegistry: '0x1234567890123456789012345678901234567890',
        agentExecutor: '0x0987654321098765432109876543210987654321',
      },
    });

    // Custom value should be used
    expect(config.network.chainId).toBe(99999);
    expect(config.network.rpcUrl).toBe('https://custom-rpc.example.com');
    expect(config.network.name).toBe('Custom Network');
  });

  it('should validate config', async () => {
    const { validateConfig } = await import('../../src/config/index.js');

    // Valid config should pass
    expect(() => {
      validateConfig({
        network: SOMNIA_NETWORKS.testnet,
        contracts: {
          agentRegistry: '0x1234567890123456789012345678901234567890',
          agentExecutor: '0x0987654321098765432109876543210987654321',
        },
      });
    }).not.toThrow();

    // Invalid config should throw
    expect(() => {
      validateConfig({
        network: SOMNIA_NETWORKS.testnet,
        contracts: {
          agentRegistry: '', // Invalid
          agentExecutor: '0x0987654321098765432109876543210987654321',
        },
      } as any);
    }).toThrow();
  });

  it('should get network by name', async () => {
    const { getNetwork } = await import('../../src/config/index.js');

    const testnet = getNetwork('testnet');
    expect(testnet.chainId).toBe(50312);

    const mainnet = getNetwork('mainnet');
    expect(mainnet.chainId).toBe(50311);
  });
});

describe('Utils Module Integration', () => {
  it('should work with address validation', async () => {
    const { isValidAddress, shortAddress } = await import('../../src/utils/index.js');

    const address = '0x1234567890123456789012345678901234567890';
    expect(isValidAddress(address)).toBe(true);

    const shortened = shortAddress(address);
    expect(shortened).toBe('0x1234...7890');
  });

  it('should work with retry logic', async () => {
    const { retry } = await import('../../src/utils/index.js');

    let attempts = 0;
    const fn = async () => {
      attempts++;
      if (attempts < 3) {
        throw new Error('Not yet');
      }
      return 'success';
    };

    const result = await retry(fn, 5, 10); // 5 retries, 10ms delay
    expect(result).toBe('success');
    expect(attempts).toBe(3);
  });

  it('should work with ether formatting', async () => {
    const { formatEther, parseEther } = await import('../../src/utils/index.js');

    const wei = parseEther('1.5');
    expect(wei).toBe(1500000000000000000n);

    const eth = formatEther(wei);
    expect(eth).toBe('1.5');
  });

  it('should work with keccak256 hashing', async () => {
    const { keccak256 } = await import('../../src/utils/index.js');

    const hash = keccak256('hello');
    expect(hash).toMatch(/^0x[a-f0-9]{64}$/);
    expect(hash).toBe('0x1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8');
  });
});

describe('LLM Module Integration (v2.2.0)', () => {
  it('should export LLMTaskPlanner (NEW)', async () => {
    const { LLMTaskPlanner } = await import('../../src/llm/index.js');
    expect(LLMTaskPlanner).toBeDefined();
  });

  it('should export MultiStepReasoner (NEW)', async () => {
    const { MultiStepReasoner } = await import('../../src/llm/index.js');
    expect(MultiStepReasoner).toBeDefined();
  });

  it('should export ContextBuilder (moved from runtime)', async () => {
    const { ContextBuilder } = await import('../../src/llm/index.js');
    expect(ContextBuilder).toBeDefined();
  });

  it('should have adapters submodule', async () => {
    const { OpenAIAdapter, OllamaAdapter } = await import('../../src/llm/adapters/index.js');
    expect(OpenAIAdapter).toBeDefined();
    expect(OllamaAdapter).toBeDefined();
  });

  it('should have prompt submodule', async () => {
    const { buildPrompt, getTemplate, PROMPT_TEMPLATES } = await import('../../src/llm/prompt/index.js');
    expect(buildPrompt).toBeDefined();
    expect(getTemplate).toBeDefined();
    expect(PROMPT_TEMPLATES).toBeDefined();
  });

  it('should work with prompt templates', async () => {
    const { buildPrompt, ACTION_PLANNER_PROMPT } = await import('../../src/llm/prompt/index.js');

    const result = buildPrompt(ACTION_PLANNER_PROMPT.template, {
      goal: 'Send 1 ETH to Alice',
      context: 'My balance: 5 ETH',
    });

    // buildPrompt returns a string
    expect(result).toContain('Send 1 ETH to Alice');
    expect(result).toContain('My balance: 5 ETH');
  });
});

describe('Runtime Module Integration', () => {
  it('should export Memory (from memoryManager.ts)', async () => {
    const { Memory } = await import('../../src/runtime/index.js');
    expect(Memory).toBeDefined();
  });

  it('should export storage classes', async () => {
    const { MemoryStorage, FileStorage } = await import('../../src/runtime/index.js');
    expect(MemoryStorage).toBeDefined();
    expect(FileStorage).toBeDefined();
  });

  it('should work with MemoryStorage', async () => {
    const { MemoryStorage } = await import('../../src/runtime/index.js');

    const storage = new MemoryStorage();
    await storage.saveEvent({ type: 'test' });
    await storage.saveAction({ type: 'test_action' }, 'result');

    const history = await storage.getHistory();
    expect(history.events.length).toBe(1);
    expect(history.actions.length).toBe(1);
  });

  it('should export trigger types', async () => {
    const { IntervalTrigger } = await import('../../src/runtime/index.js');
    expect(IntervalTrigger).toBeDefined();

    // Test IntervalTrigger creation
    const trigger = new IntervalTrigger(1000); // 1 second
    expect(trigger).toBeDefined();
    expect(trigger.isRunning()).toBe(false);
  });
});

describe('Version Info Integration (v2.2.0)', () => {
  it('should export version info from main index', async () => {
    const { SDK_VERSION, SDK_NAME, getVersionString, getVersionInfo } = await import('../../src/index.js');

    expect(SDK_VERSION).toBe('2.2.0');
    expect(SDK_NAME).toBe('@somnia/agent-kit');
    expect(getVersionString()).toContain('2.2.0');

    const info = getVersionInfo();
    expect(info.name).toBe('@somnia/agent-kit');
    expect(info.version).toBe('2.2.0');
    expect(info.buildDate).toBeDefined();
  });

  it('should export version info from version module', async () => {
    const { SDK_VERSION, getVersionString } = await import('../../src/version.js');

    expect(SDK_VERSION).toBe('2.2.0');
    expect(getVersionString()).toContain('@somnia/agent-kit@2.2.0');
  });
});

describe('Cross-Module Integration', () => {
  it('should integrate config with SomniaAgentKit', () => {
    const kit = new SomniaAgentKit({
      network: SOMNIA_NETWORKS.testnet,
      contracts: {
        agentRegistry: '0x1234567890123456789012345678901234567890',
        agentExecutor: '0x0987654321098765432109876543210987654321',
      },
    });

    const config = kit.getConfig();
    expect(config.network.chainId).toBe(SOMNIA_NETWORKS.testnet.chainId);
  });

  it('should integrate utils with address validation', async () => {
    const { isValidAddress } = await import('../../src/utils/index.js');

    const validAddress = '0x1234567890123456789012345678901234567890';
    const invalidAddress = '0x123';

    expect(isValidAddress(validAddress)).toBe(true);
    expect(isValidAddress(invalidAddress)).toBe(false);

    // Should not throw when creating SDK with valid address
    expect(() => {
      new SomniaAgentKit({
        network: SOMNIA_NETWORKS.testnet,
        contracts: {
          agentRegistry: validAddress,
          agentExecutor: validAddress,
        },
      });
    }).not.toThrow();
  });

  it('should not have circular dependencies', async () => {
    // Import all modules simultaneously to check for circular deps
    const imports = Promise.all([
      import('../../src/core/index.js'),
      import('../../src/runtime/index.js'),
      import('../../src/llm/index.js'),
      import('../../src/utils/index.js'),
      import('../../src/config/index.js'),
      import('../../src/monitor/index.js'),
    ]);
    await expect(imports).resolves.toBeDefined();
  });
});

describe('Error Handling', () => {
  it('should throw clear error for missing contract address', () => {
    expect(() => {
      new SomniaAgentKit({
        network: SOMNIA_NETWORKS.testnet,
        contracts: {
          agentRegistry: '',
          agentExecutor: '0x0987654321098765432109876543210987654321',
        },
      });
    }).toThrow(/AgentRegistry contract address is required/);
  });

  it('should throw clear error when accessing contracts before init', () => {
    const kit = new SomniaAgentKit({
      network: SOMNIA_NETWORKS.testnet,
      contracts: {
        agentRegistry: '0x1234567890123456789012345678901234567890',
        agentExecutor: '0x0987654321098765432109876543210987654321',
      },
    });

    expect(() => {
      kit.contracts;
    }).toThrow(/SDK not initialized/);
  });
});

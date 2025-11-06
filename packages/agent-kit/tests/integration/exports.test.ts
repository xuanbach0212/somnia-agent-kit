/**
 * Integration Tests: Export Verification
 *
 * Verifies all exports work correctly after v3.0.12 refactoring
 * This is the most critical test to ensure the package structure is correct
 */

import { describe, expect, it } from 'vitest';

describe('Main Package Exports (@somnia/agent-kit)', () => {
  describe('Core Classes', () => {
    it('should export SomniaAgentKit class', async () => {
      const { SomniaAgentKit } = await import('../../src/index.js');
      expect(SomniaAgentKit).toBeDefined();
      expect(typeof SomniaAgentKit).toBe('function');
    });

    it('should export ChainClient', async () => {
      const { ChainClient } = await import('../../src/index.js');
      expect(ChainClient).toBeDefined();
      expect(typeof ChainClient).toBe('function');
    });

    it('should export SignerManager', async () => {
      const { SignerManager } = await import('../../src/index.js');
      expect(SignerManager).toBeDefined();
      expect(typeof SignerManager).toBe('function');
    });

    it('should export SomniaContracts', async () => {
      const { SomniaContracts } = await import('../../src/index.js');
      expect(SomniaContracts).toBeDefined();
      expect(typeof SomniaContracts).toBe('function');
    });
  });

  describe('Version Info (NEW in v3.0.12)', () => {
    it('should export SDK_VERSION', async () => {
      const { SDK_VERSION } = await import('../../src/index.js');
      expect(SDK_VERSION).toBe('3.0.12');
      expect(typeof SDK_VERSION).toBe('string');
    });

    it('should export SDK_NAME', async () => {
      const { SDK_NAME } = await import('../../src/index.js');
      expect(SDK_NAME).toBe('somnia-agent-kit');
      expect(typeof SDK_NAME).toBe('string');
    });

    it('should export BUILD_DATE', async () => {
      const { BUILD_DATE } = await import('../../src/index.js');
      expect(BUILD_DATE).toBeDefined();
      expect(typeof BUILD_DATE).toBe('string');
      // Should be ISO date string
      expect(() => new Date(BUILD_DATE)).not.toThrow();
    });

    it('should export getVersionString function', async () => {
      const { getVersionString } = await import('../../src/index.js');
      expect(getVersionString).toBeDefined();
      expect(typeof getVersionString).toBe('function');

      const versionString = getVersionString();
      expect(versionString).toContain('somnia-agent-kit');
      expect(versionString).toContain('3.0.12');
    });

    it('should export getVersionInfo function', async () => {
      const { getVersionInfo } = await import('../../src/index.js');
      expect(getVersionInfo).toBeDefined();
      expect(typeof getVersionInfo).toBe('function');

      const info = getVersionInfo();
      expect(info.name).toBe('somnia-agent-kit');
      expect(info.version).toBe('3.0.12');
      expect(info.buildDate).toBeDefined();
    });
  });

  describe('Utils Exports (NEW module in v3.0.12)', () => {
    it('should export retry function', async () => {
      const { retry } = await import('../../src/index.js');
      expect(retry).toBeDefined();
      expect(typeof retry).toBe('function');
    });

    it('should export sleep function', async () => {
      const { sleep } = await import('../../src/index.js');
      expect(sleep).toBeDefined();
      expect(typeof sleep).toBe('function');
    });

    it('should export delay function', async () => {
      const { delay } = await import('../../src/index.js');
      expect(delay).toBeDefined();
      expect(typeof delay).toBe('function');
    });

    it('should export timeout function', async () => {
      const { timeout } = await import('../../src/index.js');
      expect(timeout).toBeDefined();
      expect(typeof timeout).toBe('function');
    });

    it('should export isValidAddress function', async () => {
      const { isValidAddress } = await import('../../src/index.js');
      expect(isValidAddress).toBeDefined();
      expect(typeof isValidAddress).toBe('function');

      // Test it works
      expect(isValidAddress('0x1234567890123456789012345678901234567890')).toBe(true);
      expect(isValidAddress('invalid')).toBe(false);
    });

    it('should export shortAddress function', async () => {
      const { shortAddress } = await import('../../src/index.js');
      expect(shortAddress).toBeDefined();
      expect(typeof shortAddress).toBe('function');

      // Test it works
      const shortened = shortAddress('0x1234567890123456789012345678901234567890');
      expect(shortened).toBe('0x1234...7890');
    });

    it('should export encoding functions', async () => {
      const { toHex, fromHex, keccak256, formatEther, parseEther } = await import(
        '../../src/index.js'
      );
      expect(toHex).toBeDefined();
      expect(fromHex).toBeDefined();
      expect(keccak256).toBeDefined();
      expect(formatEther).toBeDefined();
      expect(parseEther).toBeDefined();
    });

    it('should export EventEmitter', async () => {
      const { EventEmitter } = await import('../../src/index.js');
      expect(EventEmitter).toBeDefined();
      expect(typeof EventEmitter).toBe('function');
    });
  });

  describe('Config Exports', () => {
    it('should export SOMNIA_NETWORKS', async () => {
      const { SOMNIA_NETWORKS } = await import('../../src/index.js');
      expect(SOMNIA_NETWORKS).toBeDefined();
      expect(SOMNIA_NETWORKS.mainnet).toBeDefined();
      expect(SOMNIA_NETWORKS.testnet).toBeDefined();
      expect(SOMNIA_NETWORKS.devnet).toBeDefined();
    });

    it('should export config functions', async () => {
      const { loadConfig, validateConfig, createConfigFromEnv } = await import(
        '../../src/index.js'
      );
      expect(loadConfig).toBeDefined();
      expect(validateConfig).toBeDefined();
      expect(createConfigFromEnv).toBeDefined();
    });

    it('should export DEFAULT_CONFIG', async () => {
      const { DEFAULT_CONFIG } = await import('../../src/index.js');
      expect(DEFAULT_CONFIG).toBeDefined();
      expect(DEFAULT_CONFIG.logLevel).toBe('info');
      expect(DEFAULT_CONFIG.defaultGasLimit).toBe(3000000n);
    });
  });
});

describe('Module Exports - Core', () => {
  it('should export from core module', async () => {
    const core = await import('../../src/core/index.js');
    expect(core.ChainClient).toBeDefined();
    expect(core.SignerManager).toBeDefined();
    expect(core.SomniaContracts).toBeDefined();
  });

  it('should export ChainClient with all methods', async () => {
    const { ChainClient } = await import('../../src/core/index.js');
    const prototype = ChainClient.prototype;

    expect(prototype.connect).toBeDefined();
    expect(prototype.on).toBeDefined();
    expect(prototype.getBlockNumber).toBeDefined();
    expect(prototype.getGasPrice).toBeDefined();
  });
});

describe('Module Exports - Runtime', () => {
  it('should export from runtime module', async () => {
    const runtime = await import('../../src/runtime/index.js');
    expect(runtime.Agent).toBeDefined();
    expect(runtime.Executor).toBeDefined();
    expect(runtime.Planner).toBeDefined();
    expect(runtime.Trigger).toBeDefined();
  });

  it('should export Memory (from memoryManager.ts)', async () => {
    const { Memory } = await import('../../src/runtime/index.js');
    expect(Memory).toBeDefined();
    expect(typeof Memory).toBe('function');
  });

  it('should export storage classes', async () => {
    const { MemoryStorage, FileStorage } = await import('../../src/runtime/index.js');
    expect(MemoryStorage).toBeDefined();
    expect(FileStorage).toBeDefined();
  });

  it('should export trigger types', async () => {
    const { OnChainTrigger, IntervalTrigger, WebhookTrigger } = await import(
      '../../src/runtime/index.js'
    );
    expect(OnChainTrigger).toBeDefined();
    expect(IntervalTrigger).toBeDefined();
    expect(WebhookTrigger).toBeDefined();
  });
});

describe('Module Exports - LLM (Reorganized in v3.0.12)', () => {
  it('should export from llm module', async () => {
    const llm = await import('../../src/llm/index.js');
    expect(llm.OpenAIAdapter).toBeDefined();
    expect(llm.OllamaAdapter).toBeDefined();
  });

  it('should export LLMTaskPlanner (NEW in v3.0.12)', async () => {
    const { LLMTaskPlanner } = await import('../../src/llm/index.js');
    expect(LLMTaskPlanner).toBeDefined();
    expect(typeof LLMTaskPlanner).toBe('function');
  });

  it('should export MultiStepReasoner (NEW in v3.0.12)', async () => {
    const { MultiStepReasoner } = await import('../../src/llm/index.js');
    expect(MultiStepReasoner).toBeDefined();
    expect(typeof MultiStepReasoner).toBe('function');
  });

  it('should export ContextBuilder (moved from runtime/)', async () => {
    const { ContextBuilder } = await import('../../src/llm/index.js');
    expect(ContextBuilder).toBeDefined();
    expect(typeof ContextBuilder).toBe('function');
  });

  it('should export from llm/adapters submodule', async () => {
    const adapters = await import('../../src/llm/adapters/index.js');
    expect(adapters.OpenAIAdapter).toBeDefined();
    expect(adapters.OllamaAdapter).toBeDefined();
  });

  it('should export from llm/prompt submodule', async () => {
    const prompt = await import('../../src/llm/prompt/index.js');
    expect(prompt.buildPrompt).toBeDefined();
    expect(prompt.getTemplate).toBeDefined();
    expect(prompt.PROMPT_TEMPLATES).toBeDefined();
  });

  it('should export prompt templates', async () => {
    const { PROMPT_TEMPLATES, ACTION_PLANNER_PROMPT } = await import(
      '../../src/llm/prompt/index.js'
    );
    expect(PROMPT_TEMPLATES).toBeDefined();
    expect(ACTION_PLANNER_PROMPT).toBeDefined();
    expect(PROMPT_TEMPLATES.action_planner).toBeDefined();
  });
});

describe('Module Exports - Utils (NEW module in v3.0.12)', () => {
  it('should export from utils module', async () => {
    const utils = await import('../../src/utils/index.js');
    expect(utils.retry).toBeDefined();
    expect(utils.sleep).toBeDefined();
    expect(utils.isValidAddress).toBeDefined();
    expect(utils.toHex).toBeDefined();
    expect(utils.formatEther).toBeDefined();
  });

  it('should export retry utilities', async () => {
    const { retry, sleep, delay, timeout } = await import('../../src/utils/retry.js');
    expect(retry).toBeDefined();
    expect(sleep).toBeDefined();
    expect(delay).toBeDefined();
    expect(timeout).toBeDefined();
  });

  it('should export encode utilities', async () => {
    const { toHex, fromHex, keccak256, formatEther, parseEther, bytesToHex, hexToBytes } =
      await import('../../src/utils/encode.js');

    expect(toHex).toBeDefined();
    expect(fromHex).toBeDefined();
    expect(keccak256).toBeDefined();
    expect(formatEther).toBeDefined();
    expect(parseEther).toBeDefined();
    expect(bytesToHex).toBeDefined();
    expect(hexToBytes).toBeDefined();
  });

  it('should export validate utilities', async () => {
    const {
      isValidAddress,
      shortAddress,
      isValidHex,
      isValidChainId,
      isValidUrl,
      sanitizeInput,
    } = await import('../../src/utils/validate.js');

    expect(isValidAddress).toBeDefined();
    expect(shortAddress).toBeDefined();
    expect(isValidHex).toBeDefined();
    expect(isValidChainId).toBeDefined();
    expect(isValidUrl).toBeDefined();
    expect(sanitizeInput).toBeDefined();
  });

  it('should export logger utilities', async () => {
    const { EventEmitter, Logger, createLogger } = await import(
      '../../src/utils/logger.js'
    );
    expect(EventEmitter).toBeDefined();
    expect(Logger).toBeDefined();
    expect(createLogger).toBeDefined();
  });
});

describe('Module Exports - Config (Enhanced in v3.0.12)', () => {
  it('should export from config module', async () => {
    const config = await import('../../src/config/index.js');
    expect(config.loadConfig).toBeDefined();
    expect(config.validateConfig).toBeDefined();
    expect(config.SOMNIA_NETWORKS).toBeDefined();
  });

  it('should export network configs', async () => {
    const { SOMNIA_NETWORKS } = await import('../../src/config/networks.js');
    expect(SOMNIA_NETWORKS).toBeDefined();
    expect(SOMNIA_NETWORKS.mainnet).toBeDefined();
    expect(SOMNIA_NETWORKS.testnet).toBeDefined();
  });

  it('should export config defaults', async () => {
    const { DEFAULT_CONFIG } = await import('../../src/config/defaults.js');
    expect(DEFAULT_CONFIG).toBeDefined();
    expect(DEFAULT_CONFIG.logLevel).toBe('info');
    expect(DEFAULT_CONFIG.defaultGasLimit).toBe(3000000n);
  });

  it('should export env loader', async () => {
    const { loadFromEnv } = await import('../../src/config/env.js');
    expect(loadFromEnv).toBeDefined();
  });
});

describe('Module Exports - Types', () => {
  it('should export from types module', async () => {
    const types = await import('../../src/types/index.js');
    // Type exports don't create runtime values, but we can check the module loads
    expect(types).toBeDefined();
  });
});

describe('Module Exports - Monitor', () => {
  it('should export from monitor module', async () => {
    const monitor = await import('../../src/monitor/index.js');
    expect(monitor.Logger).toBeDefined();
    expect(monitor.Metrics).toBeDefined();
  });

  it('should export logger', async () => {
    const { Logger, LogLevel } = await import('../../src/monitor/logger.js');
    expect(Logger).toBeDefined();
    expect(LogLevel).toBeDefined();
  });
});

describe('Module Exports - CLI', () => {
  it('should export from cli module', async () => {
    const cli = await import('../../src/cli/index.js');
    // CLI exports the main CLI function
    expect(cli).toBeDefined();
  });
});

describe('Cross-Module Integration', () => {
  it('should not have circular dependency issues', async () => {
    // Import all modules to ensure no circular dependencies
    const imports = Promise.all([
      import('../../src/core/index.js'),
      import('../../src/runtime/index.js'),
      import('../../src/llm/index.js'),
      import('../../src/utils/index.js'),
      import('../../src/config/index.js'),
      import('../../src/types/index.js'),
      import('../../src/monitor/index.js'),
    ]);
    await expect(imports).resolves.toBeDefined();
  });

  it('should import from main index without errors', async () => {
    const mainImport = import('../../src/index.js');
    await expect(mainImport).resolves.toBeDefined();
  });

  it('should have consistent exports between main and modules', async () => {
    const main = await import('../../src/index.js');
    const core = await import('../../src/core/index.js');

    // ChainClient should be the same from both
    expect(main.ChainClient).toBe(core.ChainClient);
  });
});

describe('v3.0.12 Refactoring Verification', () => {
  it('should have utils/ as standalone module (extracted from core/utils.ts)', async () => {
    const utils = await import('../../src/utils/index.js');
    expect(utils.retry).toBeDefined();

    // Should NOT be in core anymore
    const core = await import('../../src/core/index.js');
    expect((core as any).retry).toBeUndefined();
  });

  it('should have memoryManager.ts (renamed from memory.ts)', async () => {
    const { Memory } = await import('../../src/runtime/memoryManager.js');
    expect(Memory).toBeDefined();
  });

  it('should have context.ts in llm/ (moved from runtime/)', async () => {
    const { ContextBuilder } = await import('../../src/llm/context.js');
    expect(ContextBuilder).toBeDefined();
  });

  it('should have llm/planner.ts (NEW)', async () => {
    const { LLMTaskPlanner } = await import('../../src/llm/planner.js');
    expect(LLMTaskPlanner).toBeDefined();
  });

  it('should have llm/reasoning.ts (NEW)', async () => {
    const { MultiStepReasoner } = await import('../../src/llm/reasoning.js');
    expect(MultiStepReasoner).toBeDefined();
  });

  it('should have version.ts (NEW)', async () => {
    const { SDK_VERSION, getVersionString } = await import('../../src/version.js');
    expect(SDK_VERSION).toBe('3.0.12');
    expect(getVersionString()).toContain('3.0.12');
  });
});

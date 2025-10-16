import { describe, it, expect } from 'vitest';
import { SomniaAgentKit, SOMNIA_NETWORKS, isValidAddress, shortAddress } from './index';

describe('SomniaAgentKit', () => {
  it('should create instance with valid config', () => {
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

  it('should throw error with invalid config', () => {
    expect(() => {
      new SomniaAgentKit({
        network: SOMNIA_NETWORKS.testnet,
        contracts: {
          agentRegistry: '',
          agentExecutor: '0x0987654321098765432109876543210987654321',
        },
      });
    }).toThrow('AgentRegistry contract address is required');
  });

  it('should initialize successfully', async () => {
    const kit = new SomniaAgentKit({
      network: SOMNIA_NETWORKS.testnet,
      contracts: {
        agentRegistry: '0x1234567890123456789012345678901234567890',
        agentExecutor: '0x0987654321098765432109876543210987654321',
      },
    });

    await kit.initialize();
    expect(kit.isInitialized()).toBe(true);
  });

  it('should return network info', () => {
    const kit = new SomniaAgentKit({
      network: SOMNIA_NETWORKS.testnet,
      contracts: {
        agentRegistry: '0x1234567890123456789012345678901234567890',
        agentExecutor: '0x0987654321098765432109876543210987654321',
      },
    });

    const networkInfo = kit.getNetworkInfo();
    expect(networkInfo.name).toBe('Somnia Dream Testnet');
    expect(networkInfo.chainId).toBe(50311);
  });
});

describe('Utils', () => {
  describe('isValidAddress', () => {
    it('should validate correct address', () => {
      expect(isValidAddress('0x1234567890123456789012345678901234567890')).toBe(true);
    });

    it('should reject invalid address', () => {
      expect(isValidAddress('invalid')).toBe(false);
      expect(isValidAddress('0x123')).toBe(false);
    });
  });

  describe('shortAddress', () => {
    it('should shorten valid address', () => {
      const address = '0x1234567890123456789012345678901234567890';
      expect(shortAddress(address)).toBe('0x1234...7890');
    });

    it('should return original for invalid address', () => {
      expect(shortAddress('invalid')).toBe('invalid');
    });
  });
});

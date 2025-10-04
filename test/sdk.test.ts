/**
 * Test suite for Somnia Agent SDK
 */

import { AgentBuilder } from '../src/sdk/AgentBuilder';
import { SomniaAgentSDK } from '../src/sdk/SomniaAgentSDK';

describe('SomniaAgentSDK', () => {
  // Mock tests - in production, use proper test environment
  
  it('should create SDK instance', () => {
    expect(() => {
      new SomniaAgentSDK({
        rpcUrl: 'https://dream-rpc.somnia.network',
        chainId: 50311,
        privateKey: '0x' + '1'.repeat(64),
        agentRegistryAddress: '0x' + '0'.repeat(40),
        agentManagerAddress: '0x' + '0'.repeat(40),
      });
    }).not.toThrow();
  });

  it('should validate required config', () => {
    expect(() => {
      new SomniaAgentSDK({
        rpcUrl: 'https://dream-rpc.somnia.network',
      } as any);
    }).toThrow();
  });
});

describe('AgentBuilder', () => {
  it('should create agent builder', () => {
    const builder = new AgentBuilder();
    expect(builder).toBeDefined();
  });

  it('should build agent config with fluent API', () => {
    const builder = new AgentBuilder()
      .withName('Test Agent')
      .withDescription('Test description')
      .addCapability('test-capability');
    
    expect(builder).toBeDefined();
  });

  it('should create quick agent', () => {
    const builder = AgentBuilder.quick(
      'Quick Agent',
      'Quick description',
      {
        execute: async () => ({ success: true }),
      }
    );
    
    expect(builder).toBeDefined();
  });
});


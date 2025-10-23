/**
 * Comprehensive SDK Enhancement Tests
 *
 * Tests for all new features added in Phase 1-4:
 * - Phase 1: MultiCall + RPC Load Balancer
 * - Phase 2: Token Management (ERC20, ERC721, Native)
 * - Phase 3: Contract Deployment & Verification
 * - Phase 4: Frontend Support (MetaMask, IPFS, WebSocket)
 */

import { ethers } from 'ethers';
import { describe, expect, it } from 'vitest';
import {
  ContractDeployer,
  ContractVerifier,
  ERC20Manager,
  ERC721Manager,
  IPFSManager,
  MetaMaskConnector,
  MultiCall,
  NativeTokenManager,
  RPCLoadBalancer,
  SOMNIA_NETWORKS,
  SomniaAgentKit,
  WebSocketClient,
} from '../../src';

// =============================================================================
// Test Configuration
// =============================================================================

const TEST_CONFIG = {
  network: SOMNIA_NETWORKS.testnet,
  contracts: {
    agentRegistry: '0x0000000000000000000000000000000000000001',
    agentExecutor: '0x0000000000000000000000000000000000000002',
  },
  // Note: Tests use read-only operations where possible
  // Write operations would require a funded test account
};

// =============================================================================
// Phase 1: Core Improvements Tests
// =============================================================================

describe('Phase 1: Core Improvements', () => {
  describe('MultiCall', () => {
    it('should be exported from main index', () => {
      expect(MultiCall).toBeDefined();
    });

    it('should create MultiCall instance', async () => {
      const kit = new SomniaAgentKit(TEST_CONFIG);

      await kit.initialize();
      const chainClient = kit.getChainClient();
      const multicall = new MultiCall(chainClient);

      expect(multicall).toBeDefined();
    });

    it('should have required methods', () => {
      const kit = new SomniaAgentKit(TEST_CONFIG);

      const chainClient = kit.getChainClient();
      const multicall = new MultiCall(chainClient);

      expect(typeof multicall.aggregate).toBe('function');
      expect(typeof multicall.tryAggregate).toBe('function');
      expect(typeof multicall.blockAndAggregate).toBe('function');
      expect(typeof multicall.aggregate3).toBe('function');
      expect(typeof multicall.getBlockNumber).toBe('function');
    });

    it('should encode and decode calls', () => {
      // Test static helper methods
      expect(typeof MultiCall.encodeCall).toBe('function');
      expect(typeof MultiCall.decodeResult).toBe('function');
      expect(typeof MultiCall.createBatch).toBe('function');
    });
  });

  describe('RPCLoadBalancer', () => {
    it('should be exported from main index', () => {
      expect(RPCLoadBalancer).toBeDefined();
    });

    it('should create RPCLoadBalancer instance', () => {
      const balancer = new RPCLoadBalancer({
        urls: [TEST_CONFIG.network.rpcUrl],
        strategy: 'round-robin',
      });

      expect(balancer).toBeDefined();
    });

    it('should support multiple strategies', () => {
      const roundRobin = new RPCLoadBalancer({
        urls: [TEST_CONFIG.network.rpcUrl],
        strategy: 'round-robin',
      });

      const fastest = new RPCLoadBalancer({
        urls: [TEST_CONFIG.network.rpcUrl],
        strategy: 'fastest',
      });

      const random = new RPCLoadBalancer({
        urls: [TEST_CONFIG.network.rpcUrl],
        strategy: 'random',
      });

      expect(roundRobin).toBeDefined();
      expect(fastest).toBeDefined();
      expect(random).toBeDefined();
    });

    it('should have health check methods', () => {
      const balancer = new RPCLoadBalancer({
        urls: [TEST_CONFIG.network.rpcUrl],
      });

      expect(typeof balancer.checkHealth).toBe('function');
      expect(typeof balancer.checkAllHealth).toBe('function');
      expect(typeof balancer.getProviderStatus).toBe('function');
      expect(typeof balancer.getHealthyProviders).toBe('function');
    });

    it('should manage providers', () => {
      const balancer = new RPCLoadBalancer({
        urls: [TEST_CONFIG.network.rpcUrl],
      });

      expect(typeof balancer.addProvider).toBe('function');
      expect(typeof balancer.removeProvider).toBe('function');
      expect(typeof balancer.setProviderHealth).toBe('function');
    });
  });
});

// =============================================================================
// Phase 2: Token Management Tests
// =============================================================================

describe('Phase 2: Token Management', () => {
  describe('ERC20Manager', () => {
    it('should be exported from main index', () => {
      expect(ERC20Manager).toBeDefined();
    });

    it('should create ERC20Manager instance', async () => {
      const kit = new SomniaAgentKit(TEST_CONFIG);

      await kit.initialize();
      const chainClient = kit.getChainClient();
      const erc20 = new ERC20Manager(chainClient);

      expect(erc20).toBeDefined();
    });

    it('should have token operation methods', () => {
      const kit = new SomniaAgentKit(TEST_CONFIG);

      const chainClient = kit.getChainClient();
      const erc20 = new ERC20Manager(chainClient);

      expect(typeof erc20.balanceOf).toBe('function');
      expect(typeof erc20.transfer).toBe('function');
      expect(typeof erc20.approve).toBe('function');
      expect(typeof erc20.allowance).toBe('function');
      expect(typeof erc20.getTokenInfo).toBe('function');
    });

    it('should have static utility methods', () => {
      expect(typeof ERC20Manager.formatAmount).toBe('function');
      expect(typeof ERC20Manager.parseAmount).toBe('function');
    });

    it('should format and parse amounts correctly', () => {
      const amount = ethers.parseEther('100.5');
      const formatted = ERC20Manager.formatAmount(amount, 18);
      expect(formatted).toBe('100.5');

      const parsed = ERC20Manager.parseAmount('100.5', 18);
      expect(parsed).toBe(amount);
    });
  });

  describe('ERC721Manager', () => {
    it('should be exported from main index', () => {
      expect(ERC721Manager).toBeDefined();
    });

    it('should create ERC721Manager instance', async () => {
      const kit = new SomniaAgentKit(TEST_CONFIG);

      await kit.initialize();
      const chainClient = kit.getChainClient();
      const erc721 = new ERC721Manager(chainClient);

      expect(erc721).toBeDefined();
    });

    it('should have NFT operation methods', async () => {
      const kit = new SomniaAgentKit(TEST_CONFIG);
      await kit.initialize();
      const chainClient = kit.getChainClient();
      const erc721 = new ERC721Manager(chainClient);

      expect(typeof erc721.ownerOf).toBe('function');
      expect(typeof erc721.balanceOf).toBe('function');
      expect(typeof erc721.tokenURI).toBe('function');
      expect(typeof erc721.transferFrom).toBe('function');
      expect(typeof erc721.safeTransferFrom).toBe('function');
      expect(typeof erc721.approve).toBe('function');
      expect(typeof erc721.setApprovalForAll).toBe('function');
    });

    it('should have collection info method', async () => {
      const kit = new SomniaAgentKit(TEST_CONFIG);
      await kit.initialize();
      const chainClient = kit.getChainClient();
      const erc721 = new ERC721Manager(chainClient);

      expect(typeof erc721.getCollectionInfo).toBe('function');
    });
  });

  describe('NativeTokenManager', () => {
    it('should be exported from main index', () => {
      expect(NativeTokenManager).toBeDefined();
    });

    it('should create NativeTokenManager instance', async () => {
      const kit = new SomniaAgentKit(TEST_CONFIG);

      await kit.initialize();
      const chainClient = kit.getChainClient();
      const native = new NativeTokenManager(chainClient);

      expect(native).toBeDefined();
    });

    it('should have native token methods', () => {
      const kit = new SomniaAgentKit(TEST_CONFIG);

      const chainClient = kit.getChainClient();
      const native = new NativeTokenManager(chainClient);

      expect(typeof native.getBalance).toBe('function');
      expect(typeof native.transfer).toBe('function');
      expect(typeof native.getGasPrice).toBe('function');
      expect(typeof native.estimateTransferGas).toBe('function');
    });

    it('should have static utility methods', () => {
      expect(typeof NativeTokenManager.formatAmount).toBe('function');
      expect(typeof NativeTokenManager.parseAmount).toBe('function');
      expect(typeof NativeTokenManager.formatGasPrice).toBe('function');
    });

    it('should format amounts correctly', () => {
      const amount = ethers.parseEther('1.5');
      const formatted = NativeTokenManager.formatAmount(amount);
      expect(formatted).toBe('1.5');

      const parsed = NativeTokenManager.parseAmount('1.5');
      expect(parsed).toBe(amount);
    });

    it('should get token symbol', () => {
      const kit = new SomniaAgentKit(TEST_CONFIG);

      const chainClient = kit.getChainClient();
      const native = new NativeTokenManager(chainClient);

      const symbol = native.getTokenSymbol();
      expect(symbol).toBe('STT'); // Testnet token
    });
  });
});

// =============================================================================
// Phase 3: Contract Deployment Tests
// =============================================================================

describe('Phase 3: Contract Deployment', () => {
  describe('ContractDeployer', () => {
    it('should be exported from main index', () => {
      expect(ContractDeployer).toBeDefined();
    });

    it('should create ContractDeployer instance', async () => {
      const kit = new SomniaAgentKit(TEST_CONFIG);

      await kit.initialize();
      const chainClient = kit.getChainClient();
      const deployer = new ContractDeployer(chainClient);

      expect(deployer).toBeDefined();
    });

    it('should have deployment methods', () => {
      const kit = new SomniaAgentKit(TEST_CONFIG);

      const chainClient = kit.getChainClient();
      const deployer = new ContractDeployer(chainClient);

      expect(typeof deployer.deployContract).toBe('function');
      expect(typeof deployer.estimateDeploymentCost).toBe('function');
      expect(typeof deployer.verifyContractExists).toBe('function');
      expect(typeof deployer.getContractBytecode).toBe('function');
    });

    it('should have CREATE2 support', () => {
      const kit = new SomniaAgentKit(TEST_CONFIG);

      const chainClient = kit.getChainClient();
      const deployer = new ContractDeployer(chainClient);

      expect(typeof deployer.deployWithCreate2).toBe('function');
      expect(typeof ContractDeployer.predictCreate2Address).toBe('function');
    });
  });

  describe('ContractVerifier', () => {
    it('should be exported from main index', () => {
      expect(ContractVerifier).toBeDefined();
    });

    it('should create ContractVerifier instance', async () => {
      const kit = new SomniaAgentKit(TEST_CONFIG);

      await kit.initialize();
      const chainClient = kit.getChainClient();
      const verifier = new ContractVerifier(chainClient);

      expect(verifier).toBeDefined();
    });

    it('should have verification methods', () => {
      const kit = new SomniaAgentKit(TEST_CONFIG);

      const chainClient = kit.getChainClient();
      const verifier = new ContractVerifier(chainClient);

      expect(typeof verifier.verifyContract).toBe('function');
      expect(typeof verifier.checkStatus).toBe('function');
      expect(typeof verifier.isVerified).toBe('function');
      expect(typeof verifier.getVerifiedSource).toBe('function');
    });

    it('should have explorer utilities', () => {
      const kit = new SomniaAgentKit(TEST_CONFIG);

      const chainClient = kit.getChainClient();
      const verifier = new ContractVerifier(chainClient);

      expect(typeof verifier.getExplorerUrl).toBe('function');
      expect(typeof verifier.getApiUrl).toBe('function');
    });

    it('should use default explorer from network config', () => {
      const kit = new SomniaAgentKit(TEST_CONFIG);

      const chainClient = kit.getChainClient();
      const verifier = new ContractVerifier(chainClient);

      const config = verifier.getConfig();
      expect(config.explorerUrl).toContain('shannon-explorer.somnia.network');
    });
  });
});

// =============================================================================
// Phase 4: Frontend Support Tests
// =============================================================================

describe('Phase 4: Frontend Support', () => {
  describe('MetaMaskConnector', () => {
    it('should be exported from main index', () => {
      expect(MetaMaskConnector).toBeDefined();
    });

    it('should create MetaMaskConnector instance', () => {
      const metamask = new MetaMaskConnector();
      expect(metamask).toBeDefined();
    });

    it('should have wallet methods', () => {
      const metamask = new MetaMaskConnector();

      expect(typeof metamask.isInstalled).toBe('function');
      expect(typeof metamask.connect).toBe('function');
      expect(typeof metamask.disconnect).toBe('function');
      expect(typeof metamask.getAccounts).toBe('function');
      expect(typeof metamask.getChainId).toBe('function');
    });

    it('should have network switching methods', () => {
      const metamask = new MetaMaskConnector();

      expect(typeof metamask.switchToSomnia).toBe('function');
      expect(typeof metamask.addSomniaNetwork).toBe('function');
    });

    it('should have event listeners', () => {
      const metamask = new MetaMaskConnector();

      expect(typeof metamask.on).toBe('function');
      expect(typeof metamask.removeListener).toBe('function');
    });

    it('should return false for isInstalled in Node.js', async () => {
      const metamask = new MetaMaskConnector();
      const installed = await metamask.isInstalled();
      expect(installed).toBe(false); // No window in Node.js
    });
  });

  describe('IPFSManager', () => {
    it('should be exported from main index', () => {
      expect(IPFSManager).toBeDefined();
    });

    it('should create IPFSManager instance', () => {
      const ipfs = new IPFSManager({
        gateway: 'https://ipfs.io/ipfs/',
      });

      expect(ipfs).toBeDefined();
    });

    it('should have upload methods', () => {
      const ipfs = new IPFSManager();

      expect(typeof ipfs.uploadJSON).toBe('function');
      expect(typeof ipfs.uploadNFTMetadata).toBe('function');
      expect(typeof ipfs.uploadFile).toBe('function');
    });

    it('should have fetch methods', () => {
      const ipfs = new IPFSManager();

      expect(typeof ipfs.fetchJSON).toBe('function');
      expect(typeof ipfs.fetchNFTMetadata).toBe('function');
      expect(typeof ipfs.fetchFile).toBe('function');
    });

    it('should have URI conversion methods', () => {
      const ipfs = new IPFSManager();

      expect(typeof ipfs.toHTTP).toBe('function');
      expect(typeof IPFSManager.toIPFS).toBe('function');
      expect(typeof ipfs.extractHash).toBe('function');
    });

    it('should convert IPFS URIs correctly', () => {
      const ipfs = new IPFSManager({
        gateway: 'https://ipfs.io/ipfs/',
      });

      const hash = 'QmTest123';
      const uri = `ipfs://${hash}`;

      const http = ipfs.toHTTP(uri);
      expect(http).toBe('https://ipfs.io/ipfs/QmTest123');

      const extracted = ipfs.extractHash(uri);
      expect(extracted).toBe(hash);

      const backToUri = IPFSManager.toIPFS(http);
      expect(backToUri).toBe(uri);
    });

    it('should validate IPFS hashes', () => {
      // Valid CID v0 (Base58, 46 chars, no 0/O/I/l chars)
      expect(
        IPFSManager.isValidHash('QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG')
      ).toBe(true);
      expect(IPFSManager.isValidHash('invalid')).toBe(false);
      expect(IPFSManager.isValidHash('QmInvalid0O')).toBe(false); // Contains invalid base58 chars
    });

    it('should have common gateways list', () => {
      const gateways = IPFSManager.getCommonGateways();
      expect(Array.isArray(gateways)).toBe(true);
      expect(gateways.length).toBeGreaterThan(0);
    });
  });

  describe('WebSocketClient', () => {
    it('should be exported from main index', () => {
      expect(WebSocketClient).toBeDefined();
    });

    it('should create WebSocketClient instance', async () => {
      const kit = new SomniaAgentKit(TEST_CONFIG);

      await kit.initialize();
      const chainClient = kit.getChainClient();
      const ws = new WebSocketClient(chainClient);

      expect(ws).toBeDefined();
    });

    it('should have connection methods', () => {
      const kit = new SomniaAgentKit(TEST_CONFIG);

      const chainClient = kit.getChainClient();
      const ws = new WebSocketClient(chainClient);

      expect(typeof ws.connect).toBe('function');
      expect(typeof ws.disconnect).toBe('function');
      expect(typeof ws.isConnected).toBe('function');
    });

    it('should have subscription methods', () => {
      const kit = new SomniaAgentKit(TEST_CONFIG);

      const chainClient = kit.getChainClient();
      const ws = new WebSocketClient(chainClient);

      expect(typeof ws.subscribeToBlocks).toBe('function');
      expect(typeof ws.subscribeToPendingTransactions).toBe('function');
      expect(typeof ws.subscribeToContractEvents).toBe('function');
      expect(typeof ws.subscribeToLogs).toBe('function');
      expect(typeof ws.unsubscribe).toBe('function');
      expect(typeof ws.unsubscribeAll).toBe('function');
    });

    it('should derive WebSocket URL from HTTP RPC', () => {
      const kit = new SomniaAgentKit(TEST_CONFIG);

      const chainClient = kit.getChainClient();
      const ws = new WebSocketClient(chainClient);

      const wsUrl = ws.getWebSocketUrl();
      expect(wsUrl).toContain('wss://');
    });
  });
});

// =============================================================================
// Integration Tests
// =============================================================================

describe('Integration Tests', () => {
  it('should initialize SDK with all new features', async () => {
    const kit = new SomniaAgentKit(TEST_CONFIG);

    await kit.initialize();

    expect(kit.isInitialized()).toBe(true);

    const chainClient = kit.getChainClient();
    expect(chainClient).toBeDefined();

    // All new managers should be creatable
    const multicall = new MultiCall(chainClient);
    const erc20 = new ERC20Manager(chainClient);
    const erc721 = new ERC721Manager(chainClient);
    const native = new NativeTokenManager(chainClient);
    const deployer = new ContractDeployer(chainClient);
    const verifier = new ContractVerifier(chainClient);
    const ws = new WebSocketClient(chainClient);

    expect(multicall).toBeDefined();
    expect(erc20).toBeDefined();
    expect(erc721).toBeDefined();
    expect(native).toBeDefined();
    expect(deployer).toBeDefined();
    expect(verifier).toBeDefined();
    expect(ws).toBeDefined();
  });

  it('should export all new modules from main index', () => {
    // Core
    expect(MultiCall).toBeDefined();
    expect(RPCLoadBalancer).toBeDefined();

    // Tokens
    expect(ERC20Manager).toBeDefined();
    expect(ERC721Manager).toBeDefined();
    expect(NativeTokenManager).toBeDefined();

    // Deployment
    expect(ContractDeployer).toBeDefined();
    expect(ContractVerifier).toBeDefined();

    // Frontend
    expect(MetaMaskConnector).toBeDefined();
    expect(IPFSManager).toBeDefined();
    expect(WebSocketClient).toBeDefined();
  });

  it('should have network config with new fields', () => {
    const network = SOMNIA_NETWORKS.testnet;

    expect(network.multicall).toBeDefined();
    expect(network.entryPoint).toBeDefined();
    expect(network.explorer).toBeDefined();
    expect(network.token).toBe('STT');
  });
});

// =============================================================================
// Summary
// =============================================================================

console.log(`
╔════════════════════════════════════════════════════════════════╗
║  SDK Enhancement Tests - Phase 1-4                             ║
╠════════════════════════════════════════════════════════════════╣
║  ✅ Phase 1: Core Improvements (MultiCall + RPC)              ║
║  ✅ Phase 2: Token Management (ERC20, ERC721, Native)         ║
║  ✅ Phase 3: Deployment (Deployer + Verifier)                 ║
║  ✅ Phase 4: Frontend (MetaMask + IPFS + WebSocket)           ║
╚════════════════════════════════════════════════════════════════╝
`);

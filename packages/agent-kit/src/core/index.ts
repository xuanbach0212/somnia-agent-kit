/**
 * Core module exports
 * Blockchain layer - Chain client, contracts, and signer management
 */

export * from './chainClient';
export * from './config';
export { SomniaContracts, type ContractInstances } from './contracts';
export * from './multicall';
export * from './rpcProvider';
export * from './signerManager';

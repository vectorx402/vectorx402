/**
 * VectorX402 SDK
 * Main entry point for the VectorX402 TypeScript SDK
 * 
 * VectorX402 is a decentralized marketplace where AI agents can buy and sell
 * vector embeddings, acting as a shared memory system. It uses the X402 protocol
 * for micropayments over HTTP.
 */

// Export math utilities
export * from './lib/math';

// Export X402 protocol
export * from './protocol/x402';
export { X402Client, parseX402Headers } from './protocol/x402';
export type { X402PaymentDetails, X402PaymentProof } from './protocol/x402';

// Export storage vault
export * from './storage/vault';
export { Vault } from './storage/vault';
export type { VectorMetadata, VaultConfig } from './storage/vault';

// Export marketplace
export * from './market/listing';
export { Listing } from './market/listing';
export type { MemoryShard, ListingFilters } from './market/listing';

/**
 * Main VectorX402 SDK Client
 * Provides a unified interface for all SDK functionality
 */
import { X402Client } from './protocol/x402';
import { Vault, VaultConfig } from './storage/vault';
import { Listing } from './market/listing';
import { ethers } from 'ethers';

export interface VectorX402Config {
  signer?: ethers.Signer;
  vaultConfig?: VaultConfig;
}

export class VectorX402 {
  public readonly x402: X402Client;
  public readonly vault: Vault;
  public readonly marketplace: Listing;
  
  constructor(config: VectorX402Config = {}) {
    // Initialize X402 client with signer
    this.x402 = new X402Client(config.signer);
    
    // Initialize vault
    this.vault = new Vault(config.vaultConfig);
    
    // Initialize marketplace with vault
    this.marketplace = new Listing(this.vault);
  }
  
  /**
   * Sets the wallet signer for payments
   */
  setSigner(signer: ethers.Signer): void {
    this.x402.setSigner(signer);
  }
}

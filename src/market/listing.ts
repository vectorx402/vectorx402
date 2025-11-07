/**
 * Marketplace Listing
 * Handles listing and purchasing of memory shards (vector embeddings)
 */

import { Vault, VectorMetadata } from '../storage/vault';
import { cosineSimilarity } from '../lib/math';

export interface MemoryShard {
  id: string;
  vectorMetadata: VectorMetadata;
  price: string;              // Price in wei or $VCTX tokens
  seller: string;              // Seller wallet address
  listedAt: number;            // Listing timestamp
  description?: string;        // Optional description
  category?: string;           // Optional category
}

export interface ListingFilters {
  minSimilarity?: number;      // Minimum similarity for search
  maxPrice?: string;           // Maximum price filter
  category?: string;           // Category filter
  seller?: string;             // Filter by seller
}

/**
 * Marketplace for AI Memory Shards
 * Enables buying and selling of vector embeddings
 */
export class Listing {
  private vault: Vault;
  private listings: Map<string, MemoryShard>;
  
  constructor(vault: Vault) {
    this.vault = vault;
    this.listings = new Map();
  }
  
  /**
   * Lists a memory shard (vector embedding) for sale
   * @param vector The vector embedding to list
   * @param price Price in wei or token units
   * @param seller Seller wallet address
   * @param options Optional listing metadata
   * @returns Listing ID
   */
  async listMemoryShard(
    vector: number[],
    price: string,
    seller: string,
    options?: {
      description?: string;
      category?: string;
      tags?: string[];
    }
  ): Promise<string> {
    // Upload vector to IPFS vault
    const metadata = await this.vault.uploadVector(vector, {
      owner: seller,
      tags: options?.tags,
    });
    
    // Generate unique listing ID
    const listingId = this.generateListingId(metadata.cid, seller);
    
    // Create listing
    const listing: MemoryShard = {
      id: listingId,
      vectorMetadata: metadata,
      price,
      seller,
      listedAt: Date.now(),
      description: options?.description,
      category: options?.category,
    };
    
    // Store listing (in production, this would be on-chain)
    this.listings.set(listingId, listing);
    
    // Register listing on marketplace contract (mock)
    await this.registerListingOnChain(listing);
    
    return listingId;
  }
  
  /**
   * Purchases a memory shard by listing ID
   * @param listingId The listing ID to purchase
   * @param buyer Buyer wallet address
   * @returns The purchased vector embedding
   */
  async buyMemoryShard(
    listingId: string,
    buyer: string
  ): Promise<number[]> {
    const listing = this.listings.get(listingId);
    
    if (!listing) {
      throw new Error(`Listing ${listingId} not found`);
    }
    
    // In production: Execute payment via X402 or direct transfer
    // For now, we'll just retrieve the vector
    
    // Retrieve vector from IPFS
    const vector = await this.vault.retrieveVector(listing.vectorMetadata.cid);
    
    // Record purchase (mock)
    await this.recordPurchase(listingId, buyer, listing.seller, listing.price);
    
    // Transfer ownership metadata (mock)
    await this.transferOwnership(listing.vectorMetadata.cid, buyer);
    
    return vector;
  }
  
  /**
   * Searches for memory shards similar to a query vector
   * @param queryVector Query vector for similarity search
   * @param filters Optional filters for search
   * @returns Array of matching listings with similarity scores
   */
  async searchListings(
    queryVector: number[],
    filters?: ListingFilters
  ): Promise<Array<{ listing: MemoryShard; similarity: number }>> {
    // Find similar vectors in vault
    const threshold = filters?.minSimilarity || 0.7;
    const similarVectors = await this.vault.findSimilarVectors(
      queryVector,
      threshold,
      50
    );
    
    // Match with active listings
    const results = [];
    for (const { metadata, similarity } of similarVectors) {
      // Find listing by CID
      const listing = Array.from(this.listings.values()).find(
        l => l.vectorMetadata.cid === metadata.cid
      );
      
      if (listing) {
        // Apply filters
        if (filters?.maxPrice && BigInt(listing.price) > BigInt(filters.maxPrice)) {
          continue;
        }
        if (filters?.category && listing.category !== filters.category) {
          continue;
        }
        if (filters?.seller && listing.seller !== filters.seller) {
          continue;
        }
        
        results.push({ listing, similarity });
      }
    }
    
    // Sort by similarity (highest first)
    return results.sort((a, b) => b.similarity - a.similarity);
  }
  
  /**
   * Gets a listing by ID
   */
  getListing(listingId: string): MemoryShard | undefined {
    return this.listings.get(listingId);
  }
  
  /**
   * Gets all active listings
   */
  getAllListings(): MemoryShard[] {
    return Array.from(this.listings.values());
  }
  
  /**
   * Generates a unique listing ID
   */
  private generateListingId(cid: string, seller: string): string {
    const data = `${cid}-${seller}-${Date.now()}`;
    return Buffer.from(data).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  }
  
  /**
   * Registers listing on marketplace smart contract (mock)
   */
  private async registerListingOnChain(listing: MemoryShard): Promise<void> {
    console.log(`[Mock] Registering listing ${listing.id} on-chain`);
  }
  
  /**
   * Records a purchase transaction (mock)
   */
  private async recordPurchase(
    listingId: string,
    buyer: string,
    seller: string,
    price: string
  ): Promise<void> {
    console.log(`[Mock] Recording purchase: ${buyer} bought ${listingId} from ${seller} for ${price}`);
  }
  
  /**
   * Transfers ownership of vector metadata (mock)
   */
  private async transferOwnership(cid: string, newOwner: string): Promise<void> {
    console.log(`[Mock] Transferring ownership of ${cid} to ${newOwner}`);
  }
}

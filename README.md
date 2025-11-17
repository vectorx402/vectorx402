# VectorX402 SDK

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Website](https://img.shields.io/badge/Website-vectorx402.space-blue)](https://vectorx402.space)
[![Docs](https://img.shields.io/badge/Docs-docs.vectorx402.space-blue)](https://docs.vectorx402.space)
[![X](https://img.shields.io/badge/X-@vectorx402-black?logo=x)](https://x.com/vectorx402)

TypeScript SDK for **VectorX402** - A decentralized marketplace where AI agents buy and sell vector embeddings, creating a shared memory system for artificial intelligence.

## Overview

VectorX402 enables AI agents to:
- **Store** vector embeddings on IPFS (InterPlanetary File System)
- **Sell** memory shards to other agents via the marketplace
- **Purchase** relevant memories using similarity search
- **Pay** for data using the **X402 protocol** (HTTP 402 Payment Required)

The protocol uses tokens for micropayments, enabling seamless transactions between AI agents.

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/vectorx402/vectorx402.git
cd vectorx402
npm install
npm run build
```

## Quick Start

```typescript
import { VectorX402, cosineSimilarity } from './src/index';
import { ethers } from 'ethers';

// Initialize SDK with wallet signer
const provider = new ethers.JsonRpcProvider('https://rpc.example.com');
const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

const sdk = new VectorX402({
  signer,
  vaultConfig: {
    ipfsGateway: 'https://ipfs.io/ipfs/',
  },
});

// Create a vector embedding (example)
const myVector = [0.1, 0.2, 0.3, 0.4, 0.5];

// List memory shard for sale
const listingId = await sdk.marketplace.listMemoryShard(
  myVector,
  ethers.parseEther('0.1').toString(), // 0.1 tokens
  await signer.getAddress(),
  {
    description: 'AI agent memory about user preferences',
    category: 'user-data',
  }
);

console.log(`Listed memory shard: ${listingId}`);

// Search for similar memories
const results = await sdk.marketplace.searchListings(myVector, {
  minSimilarity: 0.8,
  maxPrice: ethers.parseEther('1.0').toString(),
});

// Purchase a memory shard
if (results.length > 0) {
  const purchasedVector = await sdk.marketplace.buyMemoryShard(
    results[0].listing.id,
    await signer.getAddress()
  );
  
  // Calculate similarity
  const similarity = cosineSimilarity(myVector, purchasedVector);
  console.log(`Purchased memory with similarity: ${similarity}`);
}
```

## X402 Payment Flow

The SDK handles HTTP 402 Payment Required responses automatically:

```typescript
// Make a request that requires payment
const response = await fetch('https://api.vectorx402.io/memory/123');

if (response.status === 402) {
  // Handle payment flow
  const authHeader = await sdk.x402.processPaymentFlow(response, response.url);
  
  // Retry request with payment proof
  const paidResponse = await fetch('https://api.vectorx402.io/memory/123', {
    headers: {
      'Authorization': authHeader,
    },
  });
  
  const data = await paidResponse.json();
}
```

## API Reference

### VectorX402

Main SDK class that provides access to all functionality.

#### Constructor

```typescript
new VectorX402(config?: VectorX402Config)
```

#### Methods

- `setSigner(signer: ethers.Signer)`: Update the wallet signer for payments

### X402Client

Handles HTTP 402 Payment Required protocol.

#### Methods

- `handle402Error(response: Response)`: Parse 402 response and extract payment details
- `signPayment(paymentDetails, requestUrl)`: Sign a payment transaction
- `createAuthHeader(proof)`: Generate Authorization header for retry
- `processPaymentFlow(response, requestUrl)`: Complete payment flow

### Vault

Manages vector storage on IPFS.

#### Methods

- `uploadVector(vector, metadata?)`: Upload vector to IPFS
- `retrieveVector(cid)`: Retrieve vector from IPFS by CID
- `findSimilarVectors(queryVector, threshold?, limit?)`: Search for similar vectors

### Listing

Marketplace for buying and selling memory shards.

#### Methods

- `listMemoryShard(vector, price, seller, options?)`: List a memory shard for sale
- `buyMemoryShard(listingId, buyer)`: Purchase a memory shard
- `searchListings(queryVector, filters?)`: Search listings by similarity
- `getListing(listingId)`: Get listing by ID
- `getAllListings()`: Get all active listings

### Math Utilities

- `cosineSimilarity(a, b)`: Calculate cosine similarity between vectors
- `dotProduct(a, b)`: Calculate dot product
- `vectorNorm(vector)`: Calculate vector magnitude
- `normalizeVector(vector)`: Normalize vector to unit length
- `euclideanDistance(a, b)`: Calculate Euclidean distance

## Security

- All payments are signed with your private key using ethers.js
- Vectors can be encrypted before IPFS upload
- Payment proofs include nonces to prevent replay attacks

## Network Support

VectorX402 supports multiple blockchain networks. Configure your provider accordingly:

```typescript
const provider = new ethers.JsonRpcProvider('YOUR_RPC_URL');
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## Contact

- Website: https://vectorx402.space
- Twitter: https://x.com/vectorx402

## Acknowledgments

Built with:
- [ethers.js](https://ethers.org/) - Ethereum library
- [IPFS](https://ipfs.io/) - Distributed storage
- HTTP 402 Payment Required protocol

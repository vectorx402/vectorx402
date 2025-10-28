/**
 * X402 Protocol Client
 * Implements HTTP 402 Payment Required flow for micropayments
 * 
 * Flow:
 * 1. Client sends request -> Server returns 402 with price/wallet
 * 2. Client signs transaction with wallet
 * 3. Client retries request with Authorization: X402 <proof>
 */

import { ethers } from 'ethers';

export interface X402PaymentDetails {
  price: string;           // Price in wei or token units
  wallet: string;          // Payment recipient wallet address
  tokenAddress?: string;   // Optional ERC20 token address (defaults to native token)
  nonce?: string;          // Payment nonce for replay protection
  expiry?: number;         // Payment expiry timestamp
}

export interface X402PaymentProof {
  transactionHash: string;
  signature: string;
  timestamp: number;
}

/**
 * Parses X402 payment details from HTTP response headers
 */
export function parseX402Headers(response: Response): X402PaymentDetails | null {
  // Check for standard WWW-Authenticate header
  const wwwAuth = response.headers.get('WWW-Authenticate');
  if (wwwAuth && wwwAuth.startsWith('X402')) {
    // Parse: X402 price="1000000000000000", wallet="0x...", token="0x..."
    const priceMatch = wwwAuth.match(/price="([^"]+)"/);
    const walletMatch = wwwAuth.match(/wallet="([^"]+)"/);
    const tokenMatch = wwwAuth.match(/token="([^"]+)"/);
    const nonceMatch = wwwAuth.match(/nonce="([^"]+)"/);
    
    return {
      price: priceMatch?.[1] || '',
      wallet: walletMatch?.[1] || '',
      tokenAddress: tokenMatch?.[1],
      nonce: nonceMatch?.[1],
    };
  }
  
  // Fallback to custom headers
  const price = response.headers.get('X-402-Price');
  const wallet = response.headers.get('X-402-Wallet');
  const token = response.headers.get('X-402-Token');
  const nonce = response.headers.get('X-402-Nonce');
  
  if (price && wallet) {
    return {
      price,
      wallet,
      tokenAddress: token || undefined,
      nonce: nonce || undefined,
    };
  }
  
  return null;
}

export class X402Client {
  private signer?: ethers.Signer;
  
  constructor(signer?: ethers.Signer) {
    this.signer = signer;
  }
  
  /**
   * Sets the wallet signer for payment transactions
   */
  setSigner(signer: ethers.Signer): void {
    this.signer = signer;
  }
  
  /**
   * Handles HTTP 402 Payment Required response
   * Extracts payment details and prepares for transaction signing
   */
  async handle402Error(response: Response): Promise<X402PaymentDetails> {
    if (response.status !== 402) {
      throw new Error(`Expected 402 status, got ${response.status}`);
    }
    
    const paymentDetails = parseX402Headers(response);
    
    if (!paymentDetails) {
      throw new Error('Missing X402 payment details in response headers');
    }
    
    if (!paymentDetails.price || !paymentDetails.wallet) {
      throw new Error('Invalid X402 headers: price and wallet are required');
    }
    
    return paymentDetails;
  }
  
  /**
   * Signs a payment transaction for X402 protocol
   * @param paymentDetails Payment details from 402 response
   * @param requestUrl Original request URL for payment context
   * @returns Payment proof with transaction hash and signature
   */
  async signPayment(
    paymentDetails: X402PaymentDetails,
    requestUrl: string
  ): Promise<X402PaymentProof> {
    if (!this.signer) {
      throw new Error('No signer configured. Call setSigner() first.');
    }
    
    const signerAddress = await this.signer.getAddress();
    const timestamp = Math.floor(Date.now() / 1000);
    
    // Create payment message for signing
    const message = JSON.stringify({
      url: requestUrl,
      price: paymentDetails.price,
      recipient: paymentDetails.wallet,
      token: paymentDetails.tokenAddress || 'native',
      nonce: paymentDetails.nonce || timestamp.toString(),
      timestamp,
    });
    
    // Sign the message
    const signature = await this.signer.signMessage(message);
    
    // For actual payment, send transaction to blockchain
    // This is a simplified version - in production, you'd send actual tx
    const txHash = ethers.id(message + signature); // Mock transaction hash
    
    return {
      transactionHash: txHash,
      signature,
      timestamp,
    };
  }
  
  /**
   * Creates Authorization header value for X402 protocol
   * Format: X402 <proof>
   */
  createAuthHeader(proof: X402PaymentProof): string {
    const proofString = JSON.stringify({
      tx: proof.transactionHash,
      sig: proof.signature,
      ts: proof.timestamp,
    });
    
    return `X402 ${Buffer.from(proofString).toString('base64')}`;
  }
  
  /**
   * Complete X402 payment flow: handle 402, sign payment, return auth header
   */
  async processPaymentFlow(
    response: Response,
    requestUrl: string
  ): Promise<string> {
    const paymentDetails = await this.handle402Error(response);
    const proof = await this.signPayment(paymentDetails, requestUrl);
    return this.createAuthHeader(proof);
  }
}

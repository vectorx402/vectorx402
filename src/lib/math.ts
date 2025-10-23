/**
 * Vector Math Utilities
 * Core mathematical operations for vector embeddings
 */

/**
 * Calculates the dot product of two vectors
 * @param a First vector
 * @param b Second vector
 * @returns Dot product
 * @throws Error if vectors have different dimensions
 */
export function dotProduct(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Vector dimension mismatch: ${a.length} vs ${b.length}`);
  }
  
  return a.reduce((sum, val, i) => sum + val * b[i], 0);
}

/**
 * Calculates the Euclidean norm (magnitude) of a vector
 * @param vector Input vector
 * @returns Vector norm
 */
export function vectorNorm(vector: number[]): number {
  return Math.sqrt(dotProduct(vector, vector));
}

/**
 * Normalizes a vector to unit length
 * @param vector Input vector
 * @returns Normalized vector
 */
export function normalizeVector(vector: number[]): number[] {
  const norm = vectorNorm(vector);
  if (norm === 0) {
    throw new Error("Cannot normalize zero vector");
  }
  return vector.map(val => val / norm);
}

/**
 * Calculates cosine similarity between two vectors
 * Cosine similarity = (A · B) / (||A|| * ||B||)
 * @param a First vector
 * @param b Second vector
 * @returns Cosine similarity value between -1 and 1
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Vector dimension mismatch: ${a.length} vs ${b.length}`);
  }
  
  const dot = dotProduct(a, b);
  const normA = vectorNorm(a);
  const normB = vectorNorm(b);
  
  if (normA === 0 || normB === 0) {
    throw new Error("Cannot calculate similarity for zero vectors");
  }
  
  return dot / (normA * normB);
}

/**
 * Calculates Euclidean distance between two vectors
 * @param a First vector
 * @param b Second vector
 * @returns Euclidean distance
 */
export function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Vector dimension mismatch: ${a.length} vs ${b.length}`);
  }
  
  const sumSquaredDiffs = a.reduce((sum, val, i) => {
    const diff = val - b[i];
    return sum + diff * diff;
  }, 0);
  
  return Math.sqrt(sumSquaredDiffs);
}

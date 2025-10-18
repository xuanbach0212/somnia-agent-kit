// Test helpers and utilities

/**
 * Convert BigInt to Number for chai comparison
 * Use only for small numbers that fit in Number range
 */
export function bn(value: bigint | number): number {
  return Number(value);
}

/**
 * Compare two BigInt values
 */
export function bnEqual(a: bigint, b: bigint | number): boolean {
  return a === BigInt(b);
}

/**
 * Helper to wait for transaction and return receipt
 */
export async function waitForTx(tx: any) {
  return await tx.wait();
}

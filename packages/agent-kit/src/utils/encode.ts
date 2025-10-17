/**
 * Encoding/decoding utilities (hex, bytes, UTF-8, ether)
 * @packageDocumentation
 */

import { ethers } from 'ethers';

// =============================================================================
// Hex and Data Conversion Utilities
// =============================================================================

/**
 * Convert value to hex string
 * @param value Number, bigint, or string to convert
 * @returns Hex string with 0x prefix
 *
 * @example
 * toHex(255)       // "0xff"
 * toHex(1000000n)  // "0xf4240"
 */
export function toHex(value: number | bigint | string): string {
  if (typeof value === 'string' && value.startsWith('0x')) {
    return value;
  }
  return ethers.toBeHex(value);
}

/**
 * Parse hex string to number
 * @param hex Hex string to parse
 * @returns Number value
 *
 * @example
 * fromHex("0xff") // 255
 */
export function fromHex(hex: string): number {
  return Number(ethers.getBigInt(hex));
}

/**
 * Convert bytes to hex string
 * @param bytes Uint8Array to convert
 * @returns Hex string with 0x prefix
 *
 * @example
 * bytesToHex(new Uint8Array([1, 2, 3])) // "0x010203"
 */
export function bytesToHex(bytes: Uint8Array): string {
  return ethers.hexlify(bytes);
}

/**
 * Convert hex string to bytes
 * @param hex Hex string to convert
 * @returns Uint8Array
 *
 * @example
 * hexToBytes("0x010203") // Uint8Array([1, 2, 3])
 */
export function hexToBytes(hex: string): Uint8Array {
  return ethers.getBytes(hex);
}

/**
 * Convert string to UTF-8 bytes
 * @param str String to convert
 * @returns Uint8Array
 *
 * @example
 * toUtf8Bytes("hello") // Uint8Array([104, 101, 108, 108, 111])
 */
export function toUtf8Bytes(str: string): Uint8Array {
  return ethers.toUtf8Bytes(str);
}

/**
 * Convert UTF-8 bytes to string
 * @param bytes Uint8Array to convert
 * @returns String
 *
 * @example
 * toUtf8String(new Uint8Array([104, 101, 108, 108, 111])) // "hello"
 */
export function toUtf8String(bytes: Uint8Array): string {
  return ethers.toUtf8String(bytes);
}

/**
 * Compute keccak256 hash
 * @param data Data to hash (string or bytes)
 * @returns Hash as hex string
 *
 * @example
 * keccak256("hello") // "0x1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8"
 */
export function keccak256(data: string | Uint8Array): string {
  return ethers.keccak256(
    typeof data === 'string' ? ethers.toUtf8Bytes(data) : data
  );
}

// =============================================================================
// Ether and Token Utilities
// =============================================================================

/**
 * Format wei to ether string
 * @param wei Wei amount (bigint or string)
 * @returns Ether string
 *
 * @example
 * formatEther(1000000000000000000n) // "1.0"
 */
export function formatEther(wei: bigint | string): string {
  return ethers.formatEther(wei);
}

/**
 * Parse ether string to wei
 * @param ether Ether amount as string
 * @returns Wei amount as bigint
 *
 * @example
 * parseEther("1.0") // 1000000000000000000n
 */
export function parseEther(ether: string): bigint {
  return ethers.parseEther(ether);
}

/**
 * Format token amount with decimals
 * @param value Token amount in smallest unit
 * @param decimals Token decimals
 * @returns Formatted string
 *
 * @example
 * formatUnits(1000000n, 6) // "1.0" (USDC)
 */
export function formatUnits(value: bigint | string, decimals: number): string {
  return ethers.formatUnits(value, decimals);
}

/**
 * Parse token amount with decimals
 * @param value Token amount as string
 * @param decimals Token decimals
 * @returns Amount in smallest unit as bigint
 *
 * @example
 * parseUnits("1.0", 6) // 1000000n (USDC)
 */
export function parseUnits(value: string, decimals: number): bigint {
  return ethers.parseUnits(value, decimals);
}

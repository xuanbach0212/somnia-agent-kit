/**
 * Validation helpers (addresses, data formats)
 * @packageDocumentation
 */

/**
 * Validate Ethereum address format
 * @param address Address to validate
 * @returns True if valid address format
 *
 * @example
 * isValidAddress("0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb2") // true
 * isValidAddress("0xinvalid") // false
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Get short address format for display
 * @param address Full address
 * @param chars Number of characters to show on each side (default: 4)
 * @returns Shortened address (e.g., "0x1234...5678")
 *
 * @example
 * shortAddress("0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb2") // "0x742d...bEb2"
 * shortAddress("0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb2", 6) // "0x742d35...f0bEb2"
 */
export function shortAddress(address: string, chars: number = 4): string {
  if (!isValidAddress(address)) {
    return address;
  }
  const start = 2 + chars; // Skip '0x' prefix
  return `${address.slice(0, start)}...${address.slice(-chars)}`;
}

/**
 * Validate hex string format
 * @param hex String to validate
 * @returns True if valid hex string with 0x prefix
 *
 * @example
 * isValidHex("0x1234") // true
 * isValidHex("1234") // false (missing 0x)
 * isValidHex("0xGGGG") // false (invalid hex)
 */
export function isValidHex(hex: string): boolean {
  return /^0x[a-fA-F0-9]+$/.test(hex);
}

/**
 * Validate chain ID
 * @param chainId Chain ID to validate
 * @returns True if valid chain ID (positive integer)
 *
 * @example
 * isValidChainId(1) // true (Ethereum Mainnet)
 * isValidChainId(50312) // true (Somnia Devnet)
 * isValidChainId(-1) // false
 * isValidChainId(0) // false
 */
export function isValidChainId(chainId: number): boolean {
  return Number.isInteger(chainId) && chainId > 0;
}

/**
 * Sanitize input string (remove control characters, limit length)
 * @param input Input string to sanitize
 * @param maxLength Maximum allowed length (default: 1000)
 * @returns Sanitized string
 *
 * @example
 * sanitizeInput("hello\x00world") // "helloworld"
 * sanitizeInput("a".repeat(2000), 100) // "aaa...aaa" (100 chars)
 */
export function sanitizeInput(input: string, maxLength: number = 1000): string {
  // Remove control characters (0x00-0x1F, except \n, \r, \t)
  let sanitized = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');

  // Trim to max length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }

  return sanitized;
}

/**
 * Validate URL format
 * @param url URL string to validate
 * @returns True if valid HTTP/HTTPS URL
 *
 * @example
 * isValidUrl("https://api.example.com") // true
 * isValidUrl("http://localhost:3000") // true
 * isValidUrl("not-a-url") // false
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

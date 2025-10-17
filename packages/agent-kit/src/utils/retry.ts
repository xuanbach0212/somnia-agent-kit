/**
 * Retry logic with exponential backoff
 * @packageDocumentation
 */

/**
 * Sleep for specified milliseconds
 * @param ms Milliseconds to sleep
 * @returns Promise that resolves after delay
 *
 * @example
 * await sleep(1000); // Wait 1 second
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry async function with exponential backoff
 * @param fn Function to retry
 * @param maxRetries Maximum number of retry attempts (default: 3)
 * @param delayMs Initial delay in milliseconds (default: 1000)
 * @returns Result from function
 * @throws Last error if all retries fail
 *
 * @example
 * const result = await retry(
 *   async () => fetch('https://api.example.com'),
 *   5,     // max 5 retries
 *   1000   // start with 1s delay
 * );
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        // Exponential backoff: 1s, 2s, 4s, 8s, etc.
        await sleep(delayMs * Math.pow(2, i));
      }
    }
  }

  throw lastError!;
}

/**
 * Delay execution and optionally return a value
 * @param ms Milliseconds to delay
 * @param value Optional value to return after delay
 * @returns Promise that resolves with value after delay
 *
 * @example
 * await delay(1000, "done"); // Waits 1s, returns "done"
 * const result = await delay(2000, { status: 'complete' });
 */
export function delay<T = void>(ms: number, value?: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value as T), ms));
}

/**
 * Add timeout to a promise
 * @param promise Promise to add timeout to
 * @param ms Timeout in milliseconds
 * @param errorMessage Optional custom error message
 * @returns Promise that rejects if timeout is reached
 * @throws Error if timeout is exceeded
 *
 * @example
 * try {
 *   const data = await timeout(fetchData(), 5000, "Request timeout");
 * } catch (error) {
 *   console.error('Operation timed out');
 * }
 */
export function timeout<T>(
  promise: Promise<T>,
  ms: number,
  errorMessage?: string
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(errorMessage || `Timeout after ${ms}ms`)),
        ms
      )
    ),
  ]);
}

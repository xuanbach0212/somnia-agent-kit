/**
 * SDK Version Tracking
 * @packageDocumentation
 */

/**
 * Current SDK version
 */
export const SDK_VERSION = '3.0.12';

/**
 * SDK package name
 */
export const SDK_NAME = 'somnia-agent-kit';

/**
 * Build timestamp
 */
export const BUILD_DATE = new Date().toISOString();

/**
 * Get full version string
 */
export function getVersionString(): string {
  return `${SDK_NAME}@${SDK_VERSION}`;
}

/**
 * Get version info object
 */
export function getVersionInfo() {
  return {
    name: SDK_NAME,
    version: SDK_VERSION,
    buildDate: BUILD_DATE,
  };
}

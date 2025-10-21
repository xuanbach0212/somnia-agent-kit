#!/usr/bin/env node

/**
 * Somnia Agent Kit CLI
 * Command-line interface for managing AI agents on Somnia blockchain
 */

import { cli } from './cli';

async function main() {
  try {
    const args = process.argv.slice(2);

    // Show help if no arguments
    if (args.length === 0) {
      cli.showHelp();
      process.exit(0);
    }

    await cli.execute(args);
  } catch (error) {
    console.error('❌ Error:', (error as Error).message);

    if (process.env.DEBUG) {
      console.error((error as Error).stack);
    }

    process.exit(1);
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (error: Error) => {
  console.error('❌ Unhandled error:', error.message);
  if (process.env.DEBUG) {
    console.error(error.stack);
  }
  process.exit(1);
});

main();

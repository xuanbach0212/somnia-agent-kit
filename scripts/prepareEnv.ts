/**
 * Prepare environment configuration
 */

import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('🔧 Preparing environment configuration...\n');

  const envExample = path.join(__dirname, '../.env.example');
  const envFile = path.join(__dirname, '../.env');

  if (fs.existsSync(envFile)) {
    console.log('⚠️  .env file already exists. Skipping...');
    return;
  }

  try {
    fs.copyFileSync(envExample, envFile);
    console.log('✅ Created .env file from .env.example');
    console.log('\n📝 Next steps:');
    console.log('1. Update .env with your private key');
    console.log('2. Update contract addresses after deployment');
    console.log('3. Add LLM API keys if needed');
  } catch (error) {
    console.error('❌ Failed to create .env file:', error);
    process.exit(1);
  }
}

main();

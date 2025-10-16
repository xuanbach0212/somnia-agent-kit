/**
 * Generate TypeScript contract types using Typechain
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('🔧 Generating contract types with Typechain...\n');

  try {
    // Compile contracts
    console.log('📦 Compiling contracts...');
    execSync('pnpm --filter contracts run compile', { stdio: 'inherit' });

    // Check if types were generated
    const typesDir = path.join(__dirname, '../contracts/typechain-types');
    if (fs.existsSync(typesDir)) {
      console.log('\n✅ Contract types generated successfully!');
      console.log(`📁 Location: ${typesDir}`);

      // Count generated files
      const files = fs.readdirSync(typesDir, { recursive: true });
      console.log(`📝 Generated ${files.length} type files`);
    } else {
      console.error('❌ Types directory not found');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Generation failed:', error);
    process.exit(1);
  }
}

main();

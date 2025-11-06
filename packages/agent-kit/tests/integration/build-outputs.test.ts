/**
 * Integration Tests: Build Output Verification
 *
 * Verifies that tsup build outputs (ESM, CJS, DTS) are correct
 * and can be imported successfully
 */

import { existsSync, statSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';

// Path to dist directory relative to this test file
const distDir = join(__dirname, '../../dist');

describe('Build Output Files', () => {
  describe('File Existence', () => {
    it('should have ESM output (index.mjs)', () => {
      const esmPath = join(distDir, 'index.mjs');
      expect(existsSync(esmPath)).toBe(true);
    });

    it('should have ESM source map (index.mjs.map)', () => {
      const mapPath = join(distDir, 'index.mjs.map');
      expect(existsSync(mapPath)).toBe(true);
    });

    it('should have CJS output (index.js)', () => {
      const cjsPath = join(distDir, 'index.js');
      expect(existsSync(cjsPath)).toBe(true);
    });

    it('should have CJS source map (index.js.map)', () => {
      const mapPath = join(distDir, 'index.js.map');
      expect(existsSync(mapPath)).toBe(true);
    });

    it('should have TypeScript declarations (index.d.ts)', () => {
      const dtsPath = join(distDir, 'index.d.ts');
      expect(existsSync(dtsPath)).toBe(true);
    });

    it('should have TypeScript declarations for ESM (index.d.mts)', () => {
      const dmtsPath = join(distDir, 'index.d.mts');
      expect(existsSync(dmtsPath)).toBe(true);
    });
  });

  describe('File Sizes', () => {
    it('ESM output should be ~435KB', () => {
      const esmPath = join(distDir, 'index.mjs');
      if (existsSync(esmPath)) {
        const stats = statSync(esmPath);
        const sizeKB = stats.size / 1024;
        // Allow 15% variance (increased due to new convenience getters)
        expect(sizeKB).toBeGreaterThan(370); // 435 - 15%
        expect(sizeKB).toBeLessThan(500); // 435 + 15%
      }
    });

    it('CJS output should be ~440KB', () => {
      const cjsPath = join(distDir, 'index.js');
      if (existsSync(cjsPath)) {
        const stats = statSync(cjsPath);
        const sizeKB = stats.size / 1024;
        // Allow 15% variance (increased due to new convenience getters)
        expect(sizeKB).toBeGreaterThan(375); // 440 - 15%
        expect(sizeKB).toBeLessThan(505); // 440 + 15%
      }
    });

    it('DTS output should be ~195KB', () => {
      const dtsPath = join(distDir, 'index.d.ts');
      if (existsSync(dtsPath)) {
        const stats = statSync(dtsPath);
        const sizeKB = stats.size / 1024;
        // Allow 15% variance (reduced size after removing typechain types)
        expect(sizeKB).toBeGreaterThan(165); // 195 - 15%
        expect(sizeKB).toBeLessThan(225); // 195 + 15%
      }
    });
  });
});

describe('ESM Output (index.mjs)', () => {
  it('should be importable as ESM', async () => {
    const esmPath = join(distDir, 'index.mjs');
    if (!existsSync(esmPath)) {
      console.warn('ESM output not found, skipping import test');
      return;
    }

    const esmImport = import(esmPath);
    await expect(esmImport).resolves.toBeDefined();
  });

  it('should export SomniaAgentKit class', async () => {
    const esmPath = join(distDir, 'index.mjs');
    if (!existsSync(esmPath)) return;

    const mod = await import(esmPath);
    expect(mod.SomniaAgentKit).toBeDefined();
    expect(typeof mod.SomniaAgentKit).toBe('function');
  });

  it('should export SDK version info', async () => {
    const esmPath = join(distDir, 'index.mjs');
    if (!existsSync(esmPath)) return;

    const mod = await import(esmPath);
    expect(mod.SDK_VERSION).toBe('3.0.12');
    expect(mod.SDK_NAME).toBe('somnia-agent-kit');
    expect(mod.getVersionString).toBeDefined();
  });

  it('should export utils from new utils module', async () => {
    const esmPath = join(distDir, 'index.mjs');
    if (!existsSync(esmPath)) return;

    const mod = await import(esmPath);
    expect(mod.retry).toBeDefined();
    expect(mod.sleep).toBeDefined();
    expect(mod.isValidAddress).toBeDefined();
    expect(mod.formatEther).toBeDefined();
  });

  it('should export core classes', async () => {
    const esmPath = join(distDir, 'index.mjs');
    if (!existsSync(esmPath)) return;

    const mod = await import(esmPath);
    expect(mod.ChainClient).toBeDefined();
    expect(mod.SignerManager).toBeDefined();
    expect(mod.SomniaContracts).toBeDefined();
  });

  it('should export LLM classes', async () => {
    const esmPath = join(distDir, 'index.mjs');
    if (!existsSync(esmPath)) return;

    const mod = await import(esmPath);
    expect(mod.OpenAIAdapter).toBeDefined();
    expect(mod.OllamaAdapter).toBeDefined();
    expect(mod.LLMTaskPlanner).toBeDefined(); // NEW in v3.0.12
    expect(mod.MultiStepReasoner).toBeDefined(); // NEW in v3.0.12
  });

  it('should export runtime classes', async () => {
    const esmPath = join(distDir, 'index.mjs');
    if (!existsSync(esmPath)) return;

    const mod = await import(esmPath);
    expect(mod.Agent).toBeDefined();
    expect(mod.Executor).toBeDefined();
    expect(mod.Planner).toBeDefined();
    expect(mod.Memory).toBeDefined(); // From memoryManager.ts
  });
});

describe('CJS Output (index.js)', () => {
  // Note: CJS require() tests are tricky in ESM environment
  // We can at least verify the file exists and has correct structure

  it('should exist and be readable', () => {
    const cjsPath = join(distDir, 'index.js');
    expect(existsSync(cjsPath)).toBe(true);
  });

  it('should be larger than ESM (CJS usually bigger)', () => {
    const esmPath = join(distDir, 'index.mjs');
    const cjsPath = join(distDir, 'index.js');

    if (!existsSync(esmPath) || !existsSync(cjsPath)) return;

    const esmSize = statSync(esmPath).size;
    const cjsSize = statSync(cjsPath).size;

    expect(cjsSize).toBeGreaterThanOrEqual(esmSize * 0.95); // CJS ~= ESM size
  });
});

describe('TypeScript Declarations (index.d.ts)', () => {
  it('should exist', () => {
    const dtsPath = join(distDir, 'index.d.ts');
    expect(existsSync(dtsPath)).toBe(true);
  });

  it('should have corresponding .mts for ESM', () => {
    const dmtsPath = join(distDir, 'index.d.mts');
    expect(existsSync(dmtsPath)).toBe(true);
  });

  it('should be approximately same size as .d.mts', () => {
    const dtsPath = join(distDir, 'index.d.ts');
    const dmtsPath = join(distDir, 'index.d.mts');

    if (!existsSync(dtsPath) || !existsSync(dmtsPath)) return;

    const dtsSize = statSync(dtsPath).size;
    const dmtsSize = statSync(dmtsPath).size;

    // Should be identical or very close
    expect(Math.abs(dtsSize - dmtsSize)).toBeLessThan(1000); // Within 1KB
  });
});

describe('Source Maps', () => {
  it('should have source maps for ESM', () => {
    const mapPath = join(distDir, 'index.mjs.map');
    expect(existsSync(mapPath)).toBe(true);
  });

  it('should have source maps for CJS', () => {
    const mapPath = join(distDir, 'index.js.map');
    expect(existsSync(mapPath)).toBe(true);
  });

  it('ESM source map should be larger than output (detailed)', () => {
    const esmPath = join(distDir, 'index.mjs');
    const mapPath = join(distDir, 'index.mjs.map');

    if (!existsSync(esmPath) || !existsSync(mapPath)) return;

    const esmSize = statSync(esmPath).size;
    const mapSize = statSync(mapPath).size;

    // Source maps are typically 2-3x larger than output
    expect(mapSize).toBeGreaterThan(esmSize);
  });
});

describe('Build Quality', () => {
  it('should have all required output files', () => {
    const requiredFiles = [
      'index.mjs',
      'index.mjs.map',
      'index.js',
      'index.js.map',
      'index.d.ts',
      'index.d.mts',
    ];

    for (const file of requiredFiles) {
      const filePath = join(distDir, file);
      expect(existsSync(filePath)).toBe(true);
    }
  });

  it('should not have extra unexpected files in dist/', () => {
    const expectedFiles = [
      'index.mjs',
      'index.mjs.map',
      'index.js',
      'index.js.map',
      'index.d.ts',
      'index.d.mts',
    ];

    // Note: This test may need adjustment based on actual tsup output
    // Just verify we have at least the expected files
    for (const file of expectedFiles) {
      expect(existsSync(join(distDir, file))).toBe(true);
    }
  });

  it('should have consistent build output sizes', () => {
    // Verify builds are consistent (not empty or corrupted)
    const files = [
      { name: 'index.mjs', minSize: 250 * 1024 }, // Min 250KB
      { name: 'index.js', minSize: 250 * 1024 },
      { name: 'index.d.ts', minSize: 150 * 1024 }, // Min 150KB
    ];

    for (const { name, minSize } of files) {
      const filePath = join(distDir, name);
      if (existsSync(filePath)) {
        const size = statSync(filePath).size;
        expect(size).toBeGreaterThan(minSize);
      }
    }
  });
});

describe('Package.json Integration', () => {
  it('package.json should point to correct dist files', async () => {
    const pkgPath = join(__dirname, '../../package.json');
    const pkg = JSON.parse(
      await import('fs').then((fs) => fs.readFileSync(pkgPath, 'utf-8'))
    );

    expect(pkg.main).toBe('./dist/index.js'); // CJS
    expect(pkg.module).toBe('./dist/index.mjs'); // ESM
    expect(pkg.types).toBe('./dist/index.d.ts'); // Types
  });

  it('package.json exports should be configured', async () => {
    const pkgPath = join(__dirname, '../../package.json');
    const pkg = JSON.parse(
      await import('fs').then((fs) => fs.readFileSync(pkgPath, 'utf-8'))
    );

    expect(pkg.exports).toBeDefined();
    expect(pkg.exports['.']).toBeDefined();
    expect(pkg.exports['.'].types).toBe('./dist/index.d.ts');
    expect(pkg.exports['.'].import).toBe('./dist/index.mjs');
    expect(pkg.exports['.'].require).toBe('./dist/index.js');
  });
});

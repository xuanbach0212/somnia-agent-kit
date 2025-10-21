# NPM Integration Tests for Somnia Agent Kit

Comprehensive integration tests for the published `somnia-agent-kit` npm package.

## 🎯 Purpose

Test the npm package as end users will experience it:
- Package installation from npm registry
- TypeScript types and exports
- SDK functionality
- CLI commands
- Monitoring features
- Example code compatibility

## 📋 Test Coverage

### 1. Package Structure Tests
- ✅ Package.json validation
- ✅ Main exports verification
- ✅ TypeScript type definitions
- ✅ CLI binary installation
- ✅ LLM adapters exports
- ✅ Monitoring exports

### 2. SDK Functionality Tests (Example 01)
- ✅ SDK import
- ✅ SDK initialization
- ✅ Network info retrieval
- ✅ Provider connectivity
- ✅ Contract queries (getTotalAgents)
- ✅ Agent details retrieval

### 3. Monitoring Tests (Example 05)
- ✅ Logger functionality
- ✅ Metrics recording
- ✅ Dashboard creation
- ✅ Metrics export format

### 4. CLI Tests
- ✅ Version command
- ✅ Help command
- ✅ Command-specific help
- ✅ Network info
- ✅ Contract addresses
- ✅ Agent list
- ✅ Agent info
- ✅ Alternative CLI alias (sak)
- ✅ Error handling

## 🚀 Quick Start

### Prerequisites

1. **Environment Variables**

Create `.env` file in project root (`somnia-ai/.env`):

```bash
# Network
SOMNIA_RPC_URL=https://dream-rpc.somnia.network
SOMNIA_CHAIN_ID=50312

# Contracts
AGENT_REGISTRY_ADDRESS=0xC9f3452090EEB519467DEa4a390976D38C008347
AGENT_MANAGER_ADDRESS=0x77F6dC5924652e32DBa0B4329De0a44a2C95691E
AGENT_EXECUTOR_ADDRESS=0x157C56dEdbAB6caD541109daabA4663Fc016026e
AGENT_VAULT_ADDRESS=0x7cEe3142A9c6d15529C322035041af697B2B5129

# Optional: For transaction tests
PRIVATE_KEY=0x...
```

2. **Package Published to NPM**

Make sure `somnia-agent-kit` is published:

```bash
cd packages/agent-kit
npm publish
```

Or link locally for testing:

```bash
cd packages/agent-kit
npm link

cd ../../test/npm-integration
npm link somnia-agent-kit
```

### Setup

```bash
cd test/npm-integration

# Run setup script
bash setup.sh

# Or manually
npm install
```

### Run Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:examples    # SDK & monitoring tests
npm run test:cli         # CLI command tests
npm run test:package     # Package structure tests

# Verbose mode
node run-tests.js --verbose
```

## 📊 Test Output

### Console Output

```
╔═══════════════════════════════════════════════════════════════╗
║  Somnia Agent Kit - NPM Package Integration Tests            ║
╚═══════════════════════════════════════════════════════════════╝

🧪 Testing Package Structure & Exports

✅ Package.json - PASS
   Name: somnia-agent-kit | Version: 2.1.0
✅ Main Exports - PASS
   Found: 6 exports
✅ TypeScript Types - PASS
✅ CLI Binaries - PASS
   Found: somnia-agent, sak
✅ LLM Adapters - PASS
✅ Monitoring Exports - PASS

...

╔═══════════════════════════════════════════════════════════════╗
║  Test Summary                                                 ║
╚═══════════════════════════════════════════════════════════════╝

✅ 02-Package Structure: 6/6 passed
✅ 01-Quickstart: 6/6 passed
✅ 03-Monitoring: 4/4 passed
✅ CLI Commands: 9/9 passed

─────────────────────────────────────────────────────────────────
Total Tests:     25
✅ Passed:        25
❌ Failed:        0
⏱️  Duration:      8.45s
─────────────────────────────────────────────────────────────────

📊 Pass Rate: 100.0%

🎉 All tests passed! Package is ready for production.
```

### Report Files

After running tests, check:

1. **JSON Report**: `reports/test-report-{timestamp}.json`
   - Detailed test results
   - Timestamps and durations
   - Error messages and stack traces

2. **Markdown Report**: `reports/LATEST_TEST_REPORT.md`
   - Human-readable summary
   - Test results table
   - Feedback and recommendations
   - Detailed analysis

## 🔍 Test Details

### Package Structure Test

Verifies:
- Package installed correctly from npm
- All exports are accessible
- TypeScript definitions are present
- CLI binaries are executable
- LLM adapters are available
- Monitoring classes work

### SDK Functionality Test

Tests the main SDK workflow:
```javascript
import { SomniaAgentKit, SOMNIA_NETWORKS } from 'somnia-agent-kit';

const kit = new SomniaAgentKit({
  network: SOMNIA_NETWORKS.testnet,
  contracts: { ... },
});

await kit.initialize();
const agents = await kit.contracts.registry.getTotalAgents();
```

### Monitoring Test

Tests monitoring features:
```javascript
import { Logger, Metrics, Dashboard } from 'somnia-agent-kit';

const logger = new Logger();
const metrics = new Metrics();
const dashboard = new Dashboard({ port: 3002 });
```

### CLI Test

Tests all CLI commands:
```bash
somnia-agent version
somnia-agent network:info
somnia-agent agent:list
sak help
```

## 🐛 Troubleshooting

### Issue: "somnia-agent-kit not found"

```bash
# Make sure package is published or linked
cd packages/agent-kit
npm link

cd ../../test/npm-integration
npm link somnia-agent-kit
```

### Issue: "Configuration not found"

Make sure `.env` file exists in project root with required variables.

### Issue: "CLI commands timeout"

Increase timeout in `cli/cli-tests.js`:

```javascript
await runCLI('network:info', 30000); // 30 seconds
```

### Issue: "Cannot connect to network"

Check:
1. RPC URL is correct in `.env`
2. Network is accessible
3. Firewall allows connections

## 📝 Adding New Tests

### Add Example Test

Create `examples/XX-test-name.test.js`:

```javascript
export async function testNewFeature() {
  const results = {
    name: 'XX-Test Name',
    tests: [],
    passed: 0,
    failed: 0,
  };

  console.log('\n🧪 Testing New Feature\n');

  try {
    // Your test code
    results.tests.push({ name: 'Test', status: 'PASS' });
    results.passed++;
    console.log('✅ Test - PASS');
  } catch (error) {
    results.tests.push({ name: 'Test', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ Test - FAIL:', error.message);
  }

  return results;
}
```

Then import in `run-tests.js`:

```javascript
import { testNewFeature } from './examples/XX-test-name.test.js';

// In runAllTests():
const result = await testNewFeature();
allResults.push(result);
```

### Add CLI Test

Add to `cli/cli-tests.js`:

```javascript
// Test: New CLI command
try {
  const result = await runCLI('new:command');
  if (!result.success) {
    throw new Error('Command failed');
  }
  results.tests.push({ name: 'CLI: new:command', status: 'PASS' });
  results.passed++;
  console.log('✅ CLI: new:command - PASS');
} catch (error) {
  results.tests.push({ name: 'CLI: new:command', status: 'FAIL', error: error.message });
  results.failed++;
  console.log('❌ CLI: new:command - FAIL:', error.message);
}
```

## 🎯 CI/CD Integration

Add to GitHub Actions:

```yaml
name: NPM Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Setup
        working-directory: test/npm-integration
        run: bash setup.sh

      - name: Run Tests
        working-directory: test/npm-integration
        run: npm test
        env:
          SOMNIA_RPC_URL: ${{ secrets.SOMNIA_RPC_URL }}
          AGENT_REGISTRY_ADDRESS: ${{ secrets.AGENT_REGISTRY_ADDRESS }}
          AGENT_MANAGER_ADDRESS: ${{ secrets.AGENT_MANAGER_ADDRESS }}
          AGENT_EXECUTOR_ADDRESS: ${{ secrets.AGENT_EXECUTOR_ADDRESS }}
          AGENT_VAULT_ADDRESS: ${{ secrets.AGENT_VAULT_ADDRESS }}

      - name: Upload Report
        uses: actions/upload-artifact@v3
        with:
          name: test-report
          path: test/npm-integration/reports/
```

## 📚 Resources

- **Main README**: `../../README.md`
- **Examples**: `../../examples/`
- **CLI Guide**: `../../CLI_TESTING_GUIDE.md`
- **API Reference**: `../../API_REFERENCE.md`

## ✅ Success Criteria

Tests should pass if:
- ✅ All package exports are accessible
- ✅ TypeScript types work correctly
- ✅ SDK can initialize and connect to network
- ✅ Contract queries return valid data
- ✅ CLI commands execute successfully
- ✅ Monitoring features work as expected
- ✅ No runtime errors or warnings

---

**Last Updated**: October 21, 2025
**Package Version**: 2.1.0
**Maintained By**: Somnia Network Team

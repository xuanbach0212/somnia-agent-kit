#!/usr/bin/env node
/**
 * Main Test Runner for Somnia Agent Kit NPM Package
 * Runs all integration tests and generates comprehensive report
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import test modules
import { testQuickstart } from './examples/01-quickstart.test.js';
import { testPackageStructure } from './examples/02-package-structure.test.js';
import { testMonitoring } from './examples/03-monitoring.test.js';
import { testCLI } from './cli/cli-tests.js';
import { testCompleteCLI } from './cli/cli-complete-tests.js';
import { testCoreSDK } from './sdk/core-sdk.test.js';
import { testContracts } from './sdk/contracts.test.js';
import { testLLM } from './sdk/llm.test.js';
import { testMonitoringComplete } from './sdk/monitoring.test.js';
import { testRuntime } from './sdk/runtime.test.js';

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  examples: args.includes('--examples'),
  cli: args.includes('--cli'),
  sdk: args.includes('--sdk'),
  package: args.includes('--package'),
  full: args.includes('--full'),
  verbose: args.includes('--verbose') || args.includes('-v'),
};

// If no specific tests selected or --full flag, run all
if (options.full || (!options.examples && !options.cli && !options.sdk && !options.package)) {
  options.examples = true;
  options.cli = true;
  options.sdk = true;
  options.package = true;
}

console.log('╔═══════════════════════════════════════════════════════════════╗');
console.log('║  Somnia Agent Kit - NPM Package Integration Tests            ║');
console.log('╚═══════════════════════════════════════════════════════════════╝');
console.log();

async function runAllTests() {
  const startTime = Date.now();
  const allResults = [];

  try {
    // ========== PACKAGE STRUCTURE TESTS ==========
    if (options.package) {
      const result = await testPackageStructure();
      allResults.push(result);
    }

    // ========== SDK TESTS ==========
    if (options.sdk) {
      const coreResult = await testCoreSDK();
      allResults.push(coreResult);

      const contractsResult = await testContracts();
      allResults.push(contractsResult);

      const llmResult = await testLLM();
      allResults.push(llmResult);

      const monitoringResult = await testMonitoringComplete();
      allResults.push(monitoringResult);

      const runtimeResult = await testRuntime();
      allResults.push(runtimeResult);
    }

    // ========== EXAMPLES TESTS ==========
    if (options.examples) {
      const quickstartResult = await testQuickstart();
      allResults.push(quickstartResult);

      const monitoringResult = await testMonitoring();
      allResults.push(monitoringResult);
    }

    // ========== CLI TESTS ==========
    if (options.cli) {
      const cliResult = await testCLI();
      allResults.push(cliResult);

      const completeCLIResult = await testCompleteCLI();
      allResults.push(completeCLIResult);
    }

  } catch (error) {
    console.error('\n❌ Fatal error during test execution:', error);
    process.exit(1);
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  // Calculate totals
  const summary = {
    totalTests: 0,
    totalPassed: 0,
    totalFailed: 0,
    totalSkipped: 0,
    duration: duration,
    timestamp: new Date().toISOString(),
    results: allResults,
  };

  allResults.forEach(result => {
    summary.totalTests += result.tests.length;
    summary.totalPassed += result.passed;
    summary.totalFailed += result.failed;
    summary.totalSkipped += result.tests.filter(t => t.status === 'SKIP').length;
  });

  // Print summary
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║  Test Summary                                                 ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  allResults.forEach(result => {
    const status = result.failed === 0 ? '✅' : '❌';
    console.log(`${status} ${result.name}: ${result.passed}/${result.tests.length} passed`);
  });

  console.log('\n' + '─'.repeat(65));
  console.log(`Total Tests:     ${summary.totalTests}`);
  console.log(`✅ Passed:        ${summary.totalPassed}`);
  console.log(`❌ Failed:        ${summary.totalFailed}`);
  if (summary.totalSkipped > 0) {
    console.log(`⏭️  Skipped:       ${summary.totalSkipped}`);
  }
  console.log(`⏱️  Duration:      ${duration}s`);
  console.log('─'.repeat(65));

  // Pass rate
  const passRate = ((summary.totalPassed / summary.totalTests) * 100).toFixed(1);
  console.log(`\n📊 Pass Rate: ${passRate}%`);

  // Overall status
  if (summary.totalFailed === 0) {
    console.log('\n🎉 All tests passed! Package is ready for production.\n');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the issues above.\n');
  }

  // Save report
  const reportPath = path.join(__dirname, 'reports', `test-report-${Date.now()}.json`);
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2));
  console.log(`📄 Full report saved: ${reportPath}\n`);

  // Generate markdown report
  generateMarkdownReport(summary);

  // Exit with appropriate code
  process.exit(summary.totalFailed > 0 ? 1 : 0);
}

function generateMarkdownReport(summary) {
  const reportPath = path.join(__dirname, 'reports', 'LATEST_TEST_REPORT.md');

  let markdown = `# Somnia Agent Kit - NPM Package Test Report

**Generated**: ${new Date(summary.timestamp).toLocaleString()}
**Duration**: ${summary.duration}s
**Status**: ${summary.totalFailed === 0 ? '✅ PASS' : '❌ FAIL'}

## Summary

- **Total Tests**: ${summary.totalTests}
- **Passed**: ${summary.totalPassed} ✅
- **Failed**: ${summary.totalFailed} ❌
${summary.totalSkipped > 0 ? `- **Skipped**: ${summary.totalSkipped} ⏭️` : ''}
- **Pass Rate**: ${((summary.totalPassed / summary.totalTests) * 100).toFixed(1)}%

## Test Results

`;

  summary.results.forEach(result => {
    const status = result.failed === 0 ? '✅ PASS' : '❌ FAIL';
    markdown += `### ${result.name} ${status}\n\n`;
    markdown += `**Tests**: ${result.passed}/${result.tests.length} passed\n\n`;

    if (result.tests.length > 0) {
      markdown += '| Test | Status | Details |\n';
      markdown += '|------|--------|----------|\n';

      result.tests.forEach(test => {
        const emoji = test.status === 'PASS' ? '✅' : test.status === 'SKIP' ? '⏭️' : '❌';
        const details = test.error || test.reason || '-';
        markdown += `| ${test.name} | ${emoji} ${test.status} | ${details} |\n`;
      });

      markdown += '\n';
    }
  });

  // Feedback section
  markdown += `## 📋 Feedback & Recommendations

`;

  if (summary.totalFailed === 0) {
    markdown += `### ✅ Package Quality: Excellent

All tests passed successfully! The package is well-structured and ready for production use.

**Strengths**:
- ✅ All exports are working correctly
- ✅ TypeScript types are properly included
- ✅ CLI commands are functional
- ✅ SDK initialization works as expected
- ✅ Monitoring features are operational

`;
  } else {
    markdown += `### ⚠️ Issues Found

Please review the failed tests above and address the following:

`;

    summary.results.forEach(result => {
      const failed = result.tests.filter(t => t.status === 'FAIL');
      if (failed.length > 0) {
        markdown += `**${result.name}**:\n`;
        failed.forEach(test => {
          markdown += `- ❌ ${test.name}: ${test.error}\n`;
        });
        markdown += '\n';
      }
    });
  }

  markdown += `## 🔍 Detailed Analysis

### Package Structure
- Package exports are ${summary.results[0]?.failed === 0 ? 'correctly configured' : 'misconfigured'}
- TypeScript definitions are ${summary.results[0]?.tests.find(t => t.name === 'TypeScript Types')?.status === 'PASS' ? 'present' : 'missing'}
- CLI binaries are ${summary.results[0]?.tests.find(t => t.name === 'CLI Binaries')?.status === 'PASS' ? 'installed' : 'missing'}

### SDK Functionality
- Network connectivity: ${summary.results.find(r => r.name === '01-Quickstart')?.tests.find(t => t.name === 'Get Provider')?.status === 'PASS' ? 'Working ✅' : 'Failed ❌'}
- Contract interaction: ${summary.results.find(r => r.name === '01-Quickstart')?.tests.find(t => t.name === 'Query Total Agents')?.status === 'PASS' ? 'Working ✅' : 'Failed ❌'}

### CLI Functionality
- Basic commands: ${summary.results.find(r => r.name === 'CLI Commands')?.tests.find(t => t.name === 'CLI: version')?.status === 'PASS' ? 'Working ✅' : 'Failed ❌'}
- Network commands: ${summary.results.find(r => r.name === 'CLI Commands')?.tests.find(t => t.name === 'CLI: network:info')?.status === 'PASS' ? 'Working ✅' : 'Failed ❌'}
- Agent commands: ${summary.results.find(r => r.name === 'CLI Commands')?.tests.find(t => t.name === 'CLI: agent:list')?.status === 'PASS' ? 'Working ✅' : 'Failed ❌'}

### Monitoring
- Logger: ${summary.results.find(r => r.name === '03-Monitoring')?.tests.find(t => t.name === 'Logger Functionality')?.status === 'PASS' ? 'Working ✅' : 'Failed ❌'}
- Metrics: ${summary.results.find(r => r.name === '03-Monitoring')?.tests.find(t => t.name === 'Metrics Recording')?.status === 'PASS' ? 'Working ✅' : 'Failed ❌'}
- Dashboard: ${summary.results.find(r => r.name === '03-Monitoring')?.tests.find(t => t.name === 'Dashboard Creation')?.status === 'PASS' ? 'Working ✅' : 'Failed ❌'}

## 🚀 Next Steps

${summary.totalFailed === 0 ? `
1. ✅ Package is ready for distribution
2. Consider adding more integration tests for edge cases
3. Document common usage patterns
4. Add performance benchmarks
` : `
1. Fix the failing tests identified above
2. Re-run tests to verify fixes
3. Update documentation if needed
4. Consider adding more error handling
`}

---

**Test Framework**: Custom Integration Tests
**Package Version**: 2.1.0
**Node Version**: ${process.version}
`;

  fs.writeFileSync(reportPath, markdown);
  console.log(`📄 Markdown report saved: ${reportPath}`);
}

// Run tests
runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

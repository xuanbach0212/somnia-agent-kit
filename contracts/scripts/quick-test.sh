#!/bin/bash

# Quick test script - runs tests without full cleanup
# Use this for faster iteration during development

set -e

echo "🚀 Quick Test - Somnia Agent Kit Contracts"
echo "=========================================="
echo ""

cd "$(dirname "$0")/.."

# Compile if needed
if [ ! -d "artifacts" ]; then
    echo "📦 Compiling contracts..."
    pnpm run compile
    echo ""
fi

# Run specific test if provided, otherwise run all
if [ -n "$1" ]; then
    echo "🧪 Running test: $1"
    pnpm hardhat test "test/$1.test.ts"
else
    echo "🧪 Running all tests..."
    pnpm test
fi

echo ""
echo "✅ Tests completed!"


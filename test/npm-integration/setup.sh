#!/bin/bash

# Setup script for NPM integration tests

echo "🔧 Setting up NPM integration tests..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from test/npm-integration directory"
    exit 1
fi

# Clean previous installation
echo "🧹 Cleaning previous installation..."
rm -rf node_modules package-lock.json

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if somnia-agent-kit is installed
if [ ! -d "node_modules/somnia-agent-kit" ]; then
    echo "❌ Error: somnia-agent-kit not installed"
    echo "Make sure the package is published to npm or link it locally"
    exit 1
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Available commands:"
echo "  npm test                 - Run all tests"
echo "  npm run test:examples    - Run example tests only"
echo "  npm run test:cli         - Run CLI tests only"
echo "  npm run test:package     - Run package structure tests only"
echo ""
echo "🚀 To run tests: npm test"
echo ""

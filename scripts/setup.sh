#!/bin/bash

# Somnia AI Agent Framework - Setup Script

echo "🚀 Setting up Somnia AI Agent Framework..."
echo ""

# Check Node.js version
echo "📦 Checking Node.js version..."
node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$node_version" -lt 18 ]; then
    echo "❌ Error: Node.js 18 or higher is required"
    echo "   Current version: $(node -v)"
    exit 1
fi
echo "✅ Node.js version: $(node -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo "✅ Dependencies installed"
echo ""

# Setup environment file
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created"
    echo "⚠️  Please edit .env and add your PRIVATE_KEY"
else
    echo "ℹ️  .env file already exists"
fi
echo ""

# Create directories
echo "📁 Creating directories..."
mkdir -p logs
mkdir -p deployments
echo "✅ Directories created"
echo ""

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Failed to build TypeScript"
    exit 1
fi
echo "✅ Build successful"
echo ""

echo "✨ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Get STT test tokens from Discord: https://discord.gg/somnia"
echo "2. Add your PRIVATE_KEY to .env file"
echo "3. Deploy contracts: npm run deploy:contracts"
echo "4. Run example: ts-node examples/simple-agent.ts"
echo ""
echo "📚 Documentation:"
echo "- Quick Start: QUICKSTART.md"
echo "- Full Guide: README.md"
echo "- Architecture: ARCHITECTURE.md"
echo ""


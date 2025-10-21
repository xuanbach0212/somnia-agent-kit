#!/bin/bash

# Release Script for Somnia Agent Kit
# Usage: ./scripts/release.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Version
VERSION="2.1.0"

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║          🚀 SOMNIA AGENT KIT RELEASE SCRIPT 🚀               ║"
echo "║                     Version $VERSION                           ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Must run from project root${NC}"
    exit 1
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${BLUE}📍 Current branch: $CURRENT_BRANCH${NC}"

if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${YELLOW}⚠️  Warning: You're not on main branch${NC}"
    echo ""
    echo "Release should be done from main branch."
    echo ""
    read -p "Switch to main and merge dev? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Commit current changes on dev
        if [ -n "$(git status --porcelain)" ]; then
            git add .
            git commit -m "chore: prepare release v$VERSION"
            git push origin dev
        fi
        
        # Switch to main and merge
        git checkout main
        git pull origin main
        git merge dev
        echo -e "${GREEN}✅ Merged dev → main${NC}"
    else
        exit 1
    fi
fi

# Check if git is clean
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  Warning: You have uncommitted changes${NC}"
    echo ""
    git status --short
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo -e "${BLUE}📋 Pre-release Checklist${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check version in package.json
PACKAGE_VERSION=$(node -p "require('./packages/agent-kit/package.json').version")
if [ "$PACKAGE_VERSION" != "$VERSION" ]; then
    echo -e "${RED}❌ Version mismatch!${NC}"
    echo "   Expected: $VERSION"
    echo "   Found: $PACKAGE_VERSION"
    exit 1
fi
echo -e "${GREEN}✅ Package version: $VERSION${NC}"

# Build
echo ""
echo -e "${BLUE}🔨 Building package...${NC}"
cd packages/agent-kit
pnpm build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi
cd ../..

# Test CLI
echo ""
echo -e "${BLUE}🧪 Testing CLI...${NC}"
CLI_VERSION=$(node packages/agent-kit/dist/cli/bin.js --version 2>&1 | grep "somnia-agent-kit" | awk '{print $2}')
if [ "$CLI_VERSION" = "v$VERSION" ]; then
    echo -e "${GREEN}✅ CLI version: $CLI_VERSION${NC}"
else
    echo -e "${RED}❌ CLI version mismatch!${NC}"
    echo "   Expected: v$VERSION"
    echo "   Found: $CLI_VERSION"
    exit 1
fi

echo ""
echo -e "${BLUE}📦 Release Steps${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Commit
echo -e "${YELLOW}1️⃣  Commit changes${NC}"
read -p "   Commit all changes? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git add .
    git commit -m "chore: release v$VERSION

- Update package version to $VERSION
- Add complete CLI with 10 commands
- Add comprehensive documentation (20 files)
- Add GitBook integration
- Add CHANGELOG.md and RELEASE_v$VERSION.md
- Update all code examples
- Fix import paths for ESM compatibility"
    echo -e "${GREEN}   ✅ Changes committed${NC}"
else
    echo -e "${YELLOW}   ⏭️  Skipped${NC}"
fi

# Step 2: Push
echo ""
echo -e "${YELLOW}2️⃣  Push to GitHub${NC}"
read -p "   Push to origin/main? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git push origin main
    echo -e "${GREEN}   ✅ Pushed to GitHub${NC}"
else
    echo -e "${YELLOW}   ⏭️  Skipped${NC}"
fi

# Step 3: Create tag
echo ""
echo -e "${YELLOW}3️⃣  Create git tag${NC}"
read -p "   Create tag v$VERSION? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Delete tag if exists
    git tag -d "v$VERSION" 2>/dev/null || true
    git push origin ":refs/tags/v$VERSION" 2>/dev/null || true
    
    # Create new tag
    git tag -a "v$VERSION" -m "Release v$VERSION - CLI & Documentation Update

Major features:
- Complete CLI with 10 commands
- Comprehensive documentation (20 files)
- GitBook integration
- 5 SDK usage guides
- 5 contract documentation files
- Glossary and useful links

See CHANGELOG.md for full details."
    
    echo -e "${GREEN}   ✅ Tag created${NC}"
else
    echo -e "${YELLOW}   ⏭️  Skipped${NC}"
fi

# Step 4: Push tag
echo ""
echo -e "${YELLOW}4️⃣  Push tag to GitHub${NC}"
read -p "   Push tag v$VERSION? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git push origin "v$VERSION"
    echo -e "${GREEN}   ✅ Tag pushed${NC}"
else
    echo -e "${YELLOW}   ⏭️  Skipped${NC}"
fi

# Step 5: GitHub Release
echo ""
echo -e "${YELLOW}5️⃣  Create GitHub Release${NC}"
echo "   Options:"
echo "   a) Use GitHub CLI (gh)"
echo "   b) Manual (open browser)"
echo "   c) Skip"
read -p "   Choose (a/b/c): " -n 1 -r
echo
if [[ $REPLY =~ ^[Aa]$ ]]; then
    # Check if gh is installed
    if command -v gh &> /dev/null; then
        gh release create "v$VERSION" \
            --title "v$VERSION - CLI & Documentation Update" \
            --notes-file RELEASE_v$VERSION.md \
            --latest
        echo -e "${GREEN}   ✅ GitHub release created${NC}"
    else
        echo -e "${RED}   ❌ GitHub CLI not installed${NC}"
        echo "   Install: brew install gh"
    fi
elif [[ $REPLY =~ ^[Bb]$ ]]; then
    echo -e "${BLUE}   📖 Opening GitHub releases page...${NC}"
    open "https://github.com/xuanbach0212/somnia-agent-kit/releases/new?tag=v$VERSION"
    echo ""
    echo "   Copy release notes from: RELEASE_v$VERSION.md"
    read -p "   Press Enter when done..."
    echo -e "${GREEN}   ✅ Done${NC}"
else
    echo -e "${YELLOW}   ⏭️  Skipped${NC}"
fi

# Step 6: npm publish
echo ""
echo -e "${YELLOW}6️⃣  Publish to npm${NC}"
read -p "   Publish to npm? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd packages/agent-kit
    
    # Check if logged in
    if npm whoami &> /dev/null; then
        echo -e "${BLUE}   📦 Publishing...${NC}"
        npm publish
        echo -e "${GREEN}   ✅ Published to npm${NC}"
    else
        echo -e "${RED}   ❌ Not logged in to npm${NC}"
        echo "   Run: npm login"
    fi
    
    cd ../..
else
    echo -e "${YELLOW}   ⏭️  Skipped${NC}"
fi

# Summary
echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║              ✅ RELEASE PROCESS COMPLETE! ✅                 ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}🎉 Version $VERSION released!${NC}"
echo ""
echo "📋 Next steps:"
echo "   1. Verify GitHub release: https://github.com/xuanbach0212/somnia-agent-kit/releases/tag/v$VERSION"
echo "   2. Verify npm package: https://www.npmjs.com/package/somnia-agent-kit"
echo "   3. Check GitBook auto-sync"
echo "   4. Announce on social media"
echo "   5. Close related GitHub issues"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "   - CHANGELOG.md"
echo "   - RELEASE_v$VERSION.md"
echo "   - GITHUB_RELEASE_GUIDE.md"
echo ""


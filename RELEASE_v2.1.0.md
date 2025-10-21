# 🚀 Release v2.1.0 - CLI & Documentation Update

**Release Date**: October 21, 2025  
**Version**: 2.1.0 (from 2.0.1)  
**Type**: Minor Release (New Features)

---

## 🎉 What's New

### 1. Complete CLI Tools 🖥️

New command-line interface with **10 commands**:

```bash
# Install
npm install -g somnia-agent-kit@2.1.0

# Use CLI
somnia-agent init                    # Initialize configuration
somnia-agent agent:register          # Register new agent
somnia-agent agent:list              # List all agents
somnia-agent agent:info <id>         # Get agent details
somnia-agent task:create             # Create task
somnia-agent task:status <id>        # Check task status
somnia-agent wallet:balance          # Check wallet balance
somnia-agent wallet:info             # Get wallet info
somnia-agent network:info            # Network information
somnia-agent network:contracts       # Contract addresses

# Short alias
sak agent:list
```

**Features**:
- ✅ Dual command support: `somnia-agent` and `sak`
- ✅ Interactive prompts for all inputs
- ✅ Beautiful table formatting
- ✅ Color-coded output
- ✅ Error handling with helpful messages
- ✅ Configuration file support

### 2. Comprehensive Documentation 📚

**20 markdown files** with complete SDK documentation:

#### SDK Usage Guides (5 docs) ⭐
- `sdk-usage.md` - Basic SDK usage
- `sdk-agents.md` - Working with agents (301 lines)
- `sdk-tasks.md` - Task management (345 lines)
- `sdk-vault.md` - Vault operations (310 lines)
- `sdk-llm.md` - LLM integration (306 lines)

#### Complete Contract Docs (5 docs)
- `contracts/agent-registry.md` - AgentRegistry
- `contracts/agent-executor.md` - AgentExecutor (NEW)
- `contracts/agent-vault.md` - AgentVault
- `contracts/agent-manager.md` - AgentManager (NEW)
- `contracts-overview.md` - Overview

#### Reference (4 docs)
- `architecture.md` - System architecture
- `troubleshooting.md` - Debug guide
- `resources/glossary.md` - Glossary (NEW)
- `resources/links.md` - Useful links (NEW)

### 3. GitBook Integration 📖

Complete GitBook documentation structure:
- ✅ 26 items in navigation
- ✅ Clean, SDK-focused structure
- ✅ All examples with working code
- ✅ Ready for auto-sync with GitHub

### 4. Package Improvements 📦

- ✅ CLI binary support (`somnia-agent`, `sak`)
- ✅ Built with tsup for Node.js compatibility
- ✅ All dependencies up to date
- ✅ TypeScript 5.3 support

---

## 📊 Release Statistics

| Metric | Count |
|--------|-------|
| **New CLI Commands** | 10 |
| **Documentation Files** | 20 |
| **SDK Guides** | 5 |
| **Contract Docs** | 5 |
| **Total Lines of Docs** | 3,500+ |
| **Code Examples** | 50+ |

---

## 🔧 Installation & Upgrade

### New Installation

```bash
# Install package
npm install somnia-agent-kit@2.1.0

# Install CLI globally (optional)
npm install -g somnia-agent-kit@2.1.0
```

### Upgrade from 2.0.x

```bash
npm update somnia-agent-kit
```

**No breaking changes** - fully backward compatible! ✅

---

## 📝 What's Changed

### Added
- Complete CLI with 10 commands
- 5 comprehensive SDK usage guides
- 2 new contract documentation files
- Glossary and useful links
- GitBook integration
- CLI binary support in package.json
- CHANGELOG.md

### Changed
- Documentation restructured to focus on SDK usage
- All code examples updated to use correct API
- Contract addresses updated to actual testnet
- Package version bumped to 2.1.0

### Fixed
- All docs now use correct package name: `somnia-agent-kit`
- All examples use correct API: `kit.contracts.registry`
- Import paths in CLI for ESM compatibility

### Removed
- Redundant example docs (moved to real examples)
- Overly detailed architecture docs

---

## 🎯 Key Features

### CLI Tools
```bash
# Quick start
somnia-agent init
somnia-agent network:info
somnia-agent agent:list

# Register agent
somnia-agent agent:register

# Create task
somnia-agent task:create

# Check wallet
somnia-agent wallet:balance
```

### SDK Usage
```typescript
import { SomniaAgentKit, SOMNIA_NETWORKS } from 'somnia-agent-kit';

const kit = new SomniaAgentKit({
  network: SOMNIA_NETWORKS.testnet,
  contracts: {
    agentRegistry: '0xC9f3452090EEB519467DEa4a390976D38C008347',
    agentManager: '0x77F6dC5924652e32DBa0B4329De0a44a2C95691E',
    agentExecutor: '0x157C56dEdbAB6caD541109daabA4663Fc016026e',
    agentVault: '0x7cEe3142A9c6d15529C322035041af697B2B5129',
  },
  privateKey: process.env.PRIVATE_KEY,
});

await kit.initialize();

// Use SDK
const agent = await kit.contracts.registry.getAgent(1);
```

---

## 📚 Documentation

### Quick Links
- **Installation**: `docs/installation.md`
- **Quick Start**: `docs/quickstart.md`
- **CLI Guide**: `docs/cli-guide.md`
- **SDK Usage**: `docs/sdk-usage.md`
- **API Reference**: `API_REFERENCE.md`
- **Examples**: `examples/`

### Full Documentation Structure
```
docs/
├── Getting Started (3)
├── SDK Usage (5) ⭐
├── CLI Tools (1)
├── Smart Contracts (5)
├── Reference (4)
└── Examples (6)
```

---

## 🔗 Links

- **npm**: https://www.npmjs.com/package/somnia-agent-kit
- **GitHub**: https://github.com/xuanbach0212/somnia-agent-kit
- **Issues**: https://github.com/xuanbach0212/somnia-agent-kit/issues
- **Changelog**: `CHANGELOG.md`

---

## 🤝 Contributing

We welcome contributions! See:
- Examples in `examples/`
- Documentation in `docs/`
- Source code in `packages/agent-kit/src/`

---

## 📦 Package Info

```json
{
  "name": "somnia-agent-kit",
  "version": "2.1.0",
  "description": "Production-ready SDK for building, deploying, and managing AI agents on Somnia blockchain"
}
```

**Build Info**:
- ✅ Built successfully
- ✅ TypeScript 5.3
- ✅ ESM + CJS support
- ✅ CLI binaries included
- ✅ Full type definitions

**Package Size**:
- `dist/index.js`: 351 KB
- `dist/cli/bin.js`: 186 KB
- `dist/index.d.ts`: 199 KB
- Total: ~736 KB

---

## 🎯 Next Steps

### For Users
1. Update to 2.1.0: `npm update somnia-agent-kit`
2. Try the new CLI: `somnia-agent init`
3. Read the new docs: `docs/sdk-usage.md`
4. Check out examples: `examples/`

### For Contributors
1. Review new CLI code: `packages/agent-kit/src/cli/`
2. Improve documentation
3. Add more examples
4. Report bugs

---

## 🙏 Acknowledgments

Special thanks to:
- Somnia Network team
- Community contributors
- Early adopters and testers

---

## 📄 License

MIT License - see [LICENSE](LICENSE)

---

**Full Changelog**: https://github.com/xuanbach0212/somnia-agent-kit/compare/v2.0.1...v2.1.0

---

## 🎉 Thank You!

This release represents a major improvement in developer experience with:
- ✅ Complete CLI tools
- ✅ Comprehensive documentation
- ✅ Better examples
- ✅ Improved structure

**Enjoy building AI agents on Somnia!** 🚀

---

**Release Manager**: AI Assistant  
**Date**: October 21, 2025  
**Status**: ✅ Ready for Production


# Changelog

All notable changes to Somnia Agent Kit will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2025-10-21

### Added
- **CLI Tools**: Complete command-line interface with 10 commands
  - `somnia-agent` and `sak` dual command support
  - Commands: `init`, `agent:*`, `task:*`, `wallet:*`, `network:*`
  - Full CLI documentation in `docs/cli-guide.md`
- **SDK Documentation**: 5 comprehensive SDK usage guides
  - `sdk-usage.md` - Basic SDK usage
  - `sdk-agents.md` - Working with agents
  - `sdk-tasks.md` - Task management
  - `sdk-vault.md` - Vault operations
  - `sdk-llm.md` - LLM integration
- **Contract Documentation**: Complete smart contract docs
  - `contracts/agent-executor.md` - AgentExecutor contract
  - `contracts/agent-manager.md` - AgentManager contract
- **Reference Documentation**:
  - `resources/glossary.md` - Comprehensive glossary
  - `resources/links.md` - Useful links and resources
- **GitBook Integration**: Complete GitBook documentation structure
  - 20 markdown files, 26 items in navigation
  - Clean, SDK-focused structure
  - All examples with working code

### Changed
- **Documentation**: Restructured docs to focus on SDK usage
  - Removed redundant example docs
  - Cleaned up old architecture docs
  - Updated all code examples to use correct API
- **Package Structure**: Added CLI binary support
  - `bin` field in package.json for `somnia-agent` and `sak`
  - Built CLI with tsup for Node.js compatibility

### Fixed
- All documentation now uses correct package name: `somnia-agent-kit`
- All code examples use correct API: `kit.contracts.registry`
- All contract addresses updated to actual testnet addresses
- Import paths in CLI commands for ESM compatibility

### Removed
- Redundant example docs in `docs/examples/`
- Overly detailed architecture docs (`llm-architecture.md`, `sdk-design.md`)

## [2.0.1] - 2025-10-20

### Fixed
- Minor bug fixes and improvements
- Documentation updates

## [2.0.0] - 2025-10-15

### Added
- Initial public release
- Core SDK functionality
- Smart contract integration
- LLM provider support (OpenAI, Anthropic, Ollama, DeepSeek)
- Agent registration and management
- Task execution system
- Vault operations
- Monitoring and metrics

### Features
- **SomniaAgentKit**: Main SDK class for all operations
- **Smart Contracts**: AgentRegistry, AgentManager, AgentExecutor, AgentVault
- **LLM Integration**: Multiple provider support with unified interface
- **TypeScript**: Full TypeScript support with type definitions
- **Examples**: 5+ working examples

---

## Release Notes

### Version 2.1.0 Highlights

This release focuses on **developer experience** with:

1. **Complete CLI** - Command-line tools for all operations
2. **Comprehensive Docs** - 20+ documentation pages
3. **SDK-Focused** - 5 detailed SDK usage guides
4. **Production Ready** - All examples tested and verified

### Upgrade Guide

No breaking changes from 2.0.x. Simply update:

```bash
npm install somnia-agent-kit@2.1.0
# or
pnpm add somnia-agent-kit@2.1.0
```

### New CLI Usage

```bash
# Install globally (optional)
npm install -g somnia-agent-kit

# Use CLI
somnia-agent init
somnia-agent agent:list
somnia-agent network:info

# Or use short alias
sak agent:list
```

---

## Links

- **GitHub**: https://github.com/xuanbach0212/somnia-agent-kit
- **Documentation**: See `docs/` folder
- **Examples**: See `examples/` folder
- **Issues**: https://github.com/xuanbach0212/somnia-agent-kit/issues

---

**Full Changelog**: https://github.com/xuanbach0212/somnia-agent-kit/compare/v2.0.1...v2.1.0


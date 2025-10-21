# 🚀 GitHub Release Guide - v2.1.0

Hướng dẫn chi tiết để tạo release v2.1.0 trên GitHub.

---

## 📋 Chuẩn Bị

### 1. Kiểm Tra Trước Khi Release

```bash
# 1. Đảm bảo tất cả thay đổi đã commit trên dev
git checkout dev
git status

# 2. Pull code mới nhất
git pull origin dev

# 3. Build và test
cd packages/agent-kit
pnpm build
node dist/cli/bin.js --version
# Should show: somnia-agent-kit v2.1.0
cd ../..

# 4. Merge dev → main
git checkout main
git pull origin main
git merge dev

# 5. Verify merge
git log --oneline -5
```

---

## 🔖 Bước 1: Merge dev → main & Push

```bash
# Về root directory
cd /Users/s29815/Developer/Hackathon/somnia-ai

# 1. Commit changes trên dev (nếu có)
git checkout dev
git add .
git commit -m "chore: prepare release v2.1.0"
git push origin dev

# 2. Merge dev → main
git checkout main
git pull origin main
git merge dev

# 3. Push main
git push origin main

# Commit message khi merge:
# "chore: release v2.1.0
# 
# - Update package version to 2.1.0
# - Add complete CLI with 10 commands
# - Add comprehensive documentation (20 files)
# - Add GitBook integration
# - Add CHANGELOG.md and RELEASE_v2.1.0.md
# - Update all code examples
# - Fix import paths for ESM compatibility"
```

---

## 🏷️ Bước 2: Tạo Git Tag

```bash
# Tạo annotated tag
git tag -a v2.1.0 -m "Release v2.1.0 - CLI & Documentation Update

Major features:
- Complete CLI with 10 commands
- Comprehensive documentation (20 files)
- GitBook integration
- 5 SDK usage guides
- 5 contract documentation files
- Glossary and useful links

See CHANGELOG.md for full details."

# Push tag lên GitHub
git push origin v2.1.0

# Hoặc push tất cả tags
git push origin --tags
```

---

## 📦 Bước 3: Tạo GitHub Release (Web Interface)

### Option A: Qua GitHub Web UI (Recommended)

1. **Mở GitHub Repository**
   - Truy cập: https://github.com/xuanbach0212/somnia-agent-kit
   - Đăng nhập nếu chưa đăng nhập

2. **Vào Releases**
   - Click tab **"Releases"** (bên phải, dưới "About")
   - Hoặc truy cập: https://github.com/xuanbach0212/somnia-agent-kit/releases

3. **Draft New Release**
   - Click nút **"Draft a new release"**

4. **Chọn Tag**
   - Click **"Choose a tag"**
   - Chọn **"v2.1.0"** (tag vừa tạo)
   - Hoặc nhập "v2.1.0" để tạo tag mới

5. **Release Title**
   ```
   v2.1.0 - CLI & Documentation Update
   ```

6. **Release Description** (Copy từ template dưới)

7. **Attach Files** (Optional)
   - Có thể attach build artifacts nếu muốn
   - Thường không cần vì npm package đã có

8. **Publish**
   - ✅ Check "Set as the latest release"
   - Click **"Publish release"**

---

## 📝 Release Description Template

Copy nội dung này vào Release Description:

```markdown
# 🚀 Release v2.1.0 - CLI & Documentation Update

**Release Date**: October 21, 2025  
**Type**: Minor Release (New Features)  
**Status**: ✅ Production Ready

---

## 🎉 What's New

### 1. Complete CLI Tools 🖥️

New command-line interface with **10 commands**:

```bash
# Install globally
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
- ✅ Interactive prompts
- ✅ Beautiful table formatting
- ✅ Color-coded output
- ✅ Configuration file support

### 2. Comprehensive Documentation 📚

**20 markdown files** with complete SDK documentation:

#### SDK Usage Guides (5 docs) ⭐
- `sdk-usage.md` - Basic SDK usage
- `sdk-agents.md` - Working with agents
- `sdk-tasks.md` - Task management
- `sdk-vault.md` - Vault operations
- `sdk-llm.md` - LLM integration

#### Complete Contract Docs (5 docs)
- AgentRegistry, AgentExecutor, AgentVault, AgentManager
- Full API reference with examples

#### Reference (4 docs)
- Architecture, Troubleshooting, Glossary, Useful Links

### 3. GitBook Integration 📖

- ✅ 26 items in navigation
- ✅ Clean, SDK-focused structure
- ✅ All examples with working code

---

## 📊 Statistics

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
npm install somnia-agent-kit@2.1.0
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
- CLI binary support
- CHANGELOG.md

### Changed
- Documentation restructured to focus on SDK usage
- All code examples updated to use correct API
- Contract addresses updated to actual testnet

### Fixed
- All docs now use correct package name: `somnia-agent-kit`
- All examples use correct API: `kit.contracts.registry`
- Import paths in CLI for ESM compatibility

---

## 📚 Documentation

- **Quick Start**: [docs/quickstart.md](docs/quickstart.md)
- **CLI Guide**: [docs/cli-guide.md](docs/cli-guide.md)
- **SDK Usage**: [docs/sdk-usage.md](docs/sdk-usage.md)
- **API Reference**: [API_REFERENCE.md](API_REFERENCE.md)
- **Examples**: [examples/](examples/)
- **Changelog**: [CHANGELOG.md](CHANGELOG.md)
- **Release Notes**: [RELEASE_v2.1.0.md](RELEASE_v2.1.0.md)

---

## 🔗 Links

- **npm Package**: https://www.npmjs.com/package/somnia-agent-kit
- **GitHub**: https://github.com/xuanbach0212/somnia-agent-kit
- **Issues**: https://github.com/xuanbach0212/somnia-agent-kit/issues

---

## 🙏 Acknowledgments

Special thanks to the Somnia Network team and community contributors!

---

**Full Changelog**: https://github.com/xuanbach0212/somnia-agent-kit/compare/v2.0.1...v2.1.0
```

---

## 🚀 Bước 4: Tạo Release Qua GitHub CLI (Alternative)

Nếu bạn có GitHub CLI (`gh`):

```bash
# Install GitHub CLI (nếu chưa có)
brew install gh

# Login
gh auth login

# Tạo release
gh release create v2.1.0 \
  --title "v2.1.0 - CLI & Documentation Update" \
  --notes-file RELEASE_v2.1.0.md \
  --latest

# Hoặc với notes inline
gh release create v2.1.0 \
  --title "v2.1.0 - CLI & Documentation Update" \
  --notes "Complete CLI with 10 commands, comprehensive documentation, GitBook integration. See CHANGELOG.md for details." \
  --latest
```

---

## 📦 Bước 5: Publish to npm

Sau khi tạo GitHub release, publish lên npm:

```bash
# Về package directory
cd /Users/s29815/Developer/Hackathon/somnia-ai/packages/agent-kit

# Đảm bảo đã build
pnpm build

# Login npm (nếu chưa)
npm login

# Publish
npm publish

# Hoặc với pnpm
pnpm publish
```

**Note**: Cần có npm account và quyền publish package.

---

## ✅ Bước 6: Verify Release

### 1. Kiểm Tra GitHub Release
- Truy cập: https://github.com/xuanbach0212/somnia-agent-kit/releases
- Xác nhận release v2.1.0 xuất hiện
- Kiểm tra tag đã được tạo

### 2. Kiểm Tra npm Package
```bash
# Xem version mới nhất
npm view somnia-agent-kit version

# Hoặc xem tất cả versions
npm view somnia-agent-kit versions

# Test install
npm install somnia-agent-kit@2.1.0
```

### 3. Kiểm Tra GitBook
- GitBook sẽ tự động sync sau 10-30 giây
- Kiểm tra docs đã update

---

## 🎯 Post-Release Tasks

### 1. Announce Release

**Twitter/X**:
```
🚀 somnia-agent-kit v2.1.0 is out!

✨ New Features:
• Complete CLI with 10 commands
• Comprehensive docs (20 files)
• GitBook integration
• 50+ code examples

npm install somnia-agent-kit@2.1.0

#Somnia #AI #Web3 #Blockchain
```

**Discord**:
```
🎉 **Release v2.1.0 is live!**

New features:
✅ Complete CLI (`somnia-agent`, `sak`)
✅ 20 documentation files
✅ 5 SDK usage guides
✅ GitBook integration

Install: `npm install somnia-agent-kit@2.1.0`

Release notes: https://github.com/xuanbach0212/somnia-agent-kit/releases/tag/v2.1.0
```

### 2. Update README Badges (if needed)

Ensure badges show correct version:
```markdown
[![npm version](https://img.shields.io/npm/v/somnia-agent-kit.svg)](https://www.npmjs.com/package/somnia-agent-kit)
```

### 3. Close Related Issues

- Go through GitHub issues
- Close issues fixed in this release
- Reference release in closing comment

### 4. Update Project Board

- Move completed tasks to "Done"
- Update milestones

---

## 🐛 Troubleshooting

### Tag Already Exists
```bash
# Delete local tag
git tag -d v2.1.0

# Delete remote tag
git push origin :refs/tags/v2.1.0

# Recreate tag
git tag -a v2.1.0 -m "Release v2.1.0"
git push origin v2.1.0
```

### Release Not Showing
- Wait a few minutes
- Refresh page
- Check if tag was pushed: `git ls-remote --tags origin`

### npm Publish Failed
```bash
# Check if logged in
npm whoami

# Check package name availability
npm view somnia-agent-kit

# Check version not already published
npm view somnia-agent-kit versions
```

---

## 📋 Checklist

Trước khi release:
- [ ] All tests passing
- [ ] Version updated in package.json
- [ ] CHANGELOG.md updated
- [ ] Documentation updated
- [ ] Examples working
- [ ] Build successful
- [ ] CLI tested

Release process:
- [ ] Commit all changes
- [ ] Push to GitHub
- [ ] Create git tag
- [ ] Push tag
- [ ] Create GitHub release
- [ ] Publish to npm
- [ ] Verify release
- [ ] Announce release

Post-release:
- [ ] Update badges
- [ ] Close related issues
- [ ] Update project board
- [ ] Monitor for issues

---

## 🎉 Done!

Your release v2.1.0 is now live! 🚀

**Links to check**:
- GitHub: https://github.com/xuanbach0212/somnia-agent-kit/releases/tag/v2.1.0
- npm: https://www.npmjs.com/package/somnia-agent-kit

---

**Questions?** Open an issue or ask in Discord!


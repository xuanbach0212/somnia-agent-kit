# 🚀 Release Workflow - Correct Git Flow

## 📋 Git Branching Strategy

```
dev (development) → main (production) → release tag
```

- **`dev`**: Development branch - tất cả features được develop ở đây
- **`main`**: Production branch - chỉ merge code đã sẵn sàng release
- **`v2.1.0`**: Release tag - tạo từ main branch

---

## ✅ Correct Release Workflow

### Step 1: Develop on `dev` branch

```bash
# Work on dev branch
git checkout dev

# Make changes
# ...

# Commit
git add .
git commit -m "feat: add new feature"
git push origin dev
```

### Step 2: Prepare for Release

```bash
# On dev branch, update version
git checkout dev

# Update version in:
# - packages/agent-kit/package.json
# - package.json
# - packages/agent-kit/src/cli/cli.ts

# Build and test
cd packages/agent-kit
pnpm build
node dist/cli/bin.js --version  # Verify version
cd ../..

# Commit version update
git add .
git commit -m "chore: bump version to 2.1.0"
git push origin dev
```

### Step 3: Merge `dev` → `main`

```bash
# Switch to main
git checkout main

# Pull latest main
git pull origin main

# Merge dev into main
git merge dev

# Resolve conflicts if any
# ...

# Push main
git push origin main
```

### Step 4: Create Release Tag (from `main`)

```bash
# Ensure you're on main
git checkout main

# Create annotated tag
git tag -a v2.1.0 -m "Release v2.1.0 - CLI & Documentation Update

Major features:
- Complete CLI with 10 commands
- Comprehensive documentation (20 files)
- GitBook integration

See CHANGELOG.md for details."

# Push tag
git push origin v2.1.0
```

### Step 5: Create GitHub Release

```bash
# Option A: GitHub CLI
gh release create v2.1.0 \
  --title "v2.1.0 - CLI & Documentation Update" \
  --notes-file RELEASE_v2.1.0.md \
  --latest

# Option B: Web UI
# Go to: https://github.com/xuanbach0212/somnia-agent-kit/releases/new
```

### Step 6: Publish to npm

```bash
cd packages/agent-kit
npm publish
```

---

## 🎯 Quick Commands (Automated)

### Option 1: Use Release Script

```bash
# Script will handle everything
./scripts/release.sh

# It will:
# 1. Check if you're on main (if not, offer to merge dev → main)
# 2. Build and test
# 3. Commit changes
# 4. Push to main
# 5. Create and push tag
# 6. Create GitHub release
# 7. Publish to npm
```

### Option 2: Manual Commands

```bash
# 1. Prepare on dev
git checkout dev
git add .
git commit -m "chore: prepare release v2.1.0"
git push origin dev

# 2. Merge to main
git checkout main
git pull origin main
git merge dev
git push origin main

# 3. Tag and release
git tag -a v2.1.0 -m "Release v2.1.0"
git push origin v2.1.0

# 4. GitHub release
gh release create v2.1.0 \
  --title "v2.1.0 - CLI & Documentation Update" \
  --notes-file RELEASE_v2.1.0.md \
  --latest

# 5. Publish npm
cd packages/agent-kit && npm publish
```

---

## ❌ Common Mistakes

### ❌ WRONG: Release from `dev`

```bash
# DON'T DO THIS!
git checkout dev
git tag -a v2.1.0 -m "Release"  # ❌ Wrong!
git push origin v2.1.0
```

**Why wrong?**
- `dev` branch may have unstable code
- Release should be from stable `main` branch
- Tags should point to production-ready code

### ✅ CORRECT: Release from `main`

```bash
# DO THIS!
git checkout main
git merge dev                    # Merge dev → main first
git push origin main
git tag -a v2.1.0 -m "Release"  # ✅ Correct!
git push origin v2.1.0
```

---

## 📊 Branch Protection (Recommended)

### Main Branch Protection Rules

On GitHub, set up branch protection for `main`:

1. **Require pull request reviews**
   - At least 1 approval before merging

2. **Require status checks to pass**
   - Build must succeed
   - Tests must pass

3. **Require branches to be up to date**
   - Must pull latest before merge

4. **Do not allow force push**
   - Protect commit history

### How to Merge with Protection

```bash
# 1. Create PR from dev to main
gh pr create --base main --head dev \
  --title "Release v2.1.0" \
  --body "See CHANGELOG.md for details"

# 2. Wait for CI checks
# 3. Get approval (if required)
# 4. Merge PR
gh pr merge --merge

# 5. Then create tag from main
git checkout main
git pull origin main
git tag -a v2.1.0 -m "Release v2.1.0"
git push origin v2.1.0
```

---

## 🔄 Post-Release Workflow

### After releasing from `main`:

```bash
# 1. Continue development on dev
git checkout dev

# 2. Merge main back to dev (to sync tags)
git merge main

# 3. Push dev
git push origin dev

# 4. Continue development
# ...
```

---

## 📝 Summary

### Correct Flow:

```
1. Develop on dev branch
   ↓
2. Update version on dev
   ↓
3. Merge dev → main
   ↓
4. Create tag from main
   ↓
5. Create GitHub release from tag
   ↓
6. Publish to npm
   ↓
7. Continue development on dev
```

### Key Points:

- ✅ **Develop on `dev`**
- ✅ **Release from `main`**
- ✅ **Tag from `main`**
- ✅ **Merge `dev` → `main` before release**
- ✅ **Never tag from `dev`**

---

## 🎯 Current Status

Your repository:
- ✅ Has `dev` branch (development)
- ✅ Has `main` branch (production)
- ✅ Currently on `dev` branch

**Next steps for release:**

```bash
# 1. Merge dev → main
git checkout main
git pull origin main
git merge dev
git push origin main

# 2. Use release script
./scripts/release.sh
```

---

## 📚 References

- **GITHUB_RELEASE_GUIDE.md** - Detailed release guide
- **scripts/release.sh** - Automated release script
- **CHANGELOG.md** - Version history
- **RELEASE_v2.1.0.md** - Release notes

---

**Remember: Always release from `main`, never from `dev`!** ✅


# Git Workflow Guide

This guide explains how we manage code changes in the Ngam-Je monorepo using Git Flow with flexible merge strategies.

## Table of Contents

- [Branching Strategy](#branching-strategy)
- [Branch Types](#branch-types)
- [Feature Development Workflow](#feature-development-workflow)
- [Merge Strategies](#merge-strategies)
- [Common Scenarios](#common-scenarios)
- [Troubleshooting](#troubleshooting)

## Branching Strategy

We use **Git Flow**, a structured branching model that provides clear separation between development, releases, and production code.

### Branch Structure Overview

```
main (production)
  │
  ├── develop (integration)
  │     │
  │     ├── feat/user-authentication
  │     ├── feat/ai-chat-integration
  │     └── fix/database-connection
  │
  ├── release/v1.0.0
  │
  └── hotfix/critical-bug-fix
```

## Branch Types

| Branch Type | Purpose | Naming Convention | Lifetime | Base Branch | Merge Into |
|------------|---------|-------------------|----------|-------------|------------|
| `main` | Production-ready code | `main` | Permanent | N/A | N/A |
| `develop` | Integration branch for features | `develop` | Permanent | N/A | N/A |
| `feature/*` | New features or enhancements | `feat/scope/feature-name` | Temporary | `develop` | `develop` |
| `bugfix/*` | Non-critical bug fixes | `fix/scope/bug-description` | Temporary | `develop` | `develop` |
| `release/*` | Release preparation | `release/v1.0.0` | Temporary | `develop` | `main` + `develop` |
| `hotfix/*` | Critical production fixes | `hotfix/critical-issue` | Temporary | `main` | `main` + `develop` |

### Branch Type Details

#### 1. Main Branch (`main`)

- **Purpose**: Production-ready code only
- **Protected**: Requires PR approval, passing tests
- **Deploy**: Auto-deploys to production (if configured)
- **Never**: Commit directly to this branch

#### 2. Develop Branch (`develop`)

- **Purpose**: Integration branch where features come together
- **Contains**: Latest development changes
- **Testing**: Should always be in a working state
- **Deploy**: Can deploy to staging/dev environment

#### 3. Feature Branches (`feat/*`)

- **Purpose**: Develop new features or enhancements
- **Naming Pattern**: `feat/scope/feature-name`
- **Scope**: Indicates which part of the monorepo is affected
- **Examples**:
  - `feat/frontend/user-authentication` - Frontend-only feature
  - `feat/backend/ai-chat-integration` - Backend-only feature
  - `feat/ui/dark-mode` - UI component feature
  - `feat/api/payment-processing` - API endpoint feature
  - `feat/database/user-migration` - Database-related feature
  - `feat/auth/oauth-integration` - Authentication feature

#### 4. Bugfix Branches (`fix/*`)

- **Purpose**: Fix non-critical bugs during development
- **Naming Pattern**: `fix/scope/bug-description`
- **Examples**:
  - `fix/frontend/login-validation` - Frontend bug fix
  - `fix/backend/memory-leak` - Backend bug fix
  - `fix/docs/typo-in-readme` - Documentation fix
  - `fix/api/null-pointer-error` - API bug fix
  - `fix/database/connection-pool` - Database configuration fix

#### 5. Release Branches (`release/*`)

- **Purpose**: Prepare a new production release
- **Examples**:
  - `release/v1.0.0`
  - `release/v2.1.0`
- **Activities**: Version bumps, final bug fixes, documentation updates

#### 6. Hotfix Branches (`hotfix/*`)

- **Purpose**: Emergency fixes for production issues
- **Examples**:
  - `hotfix/security-vulnerability`
  - `hotfix/data-loss-bug`
- **Priority**: Highest - fixes critical production issues

## Scope Convention

We use **scopes** in branch names to indicate which part of the monorepo is affected. This helps team members quickly understand the context of changes.

### Available Scopes

| Scope | Description | Use When |
|-------|-------------|----------|
| `frontend` | Next.js frontend application | Changes affect the frontend/ directory |
| `backend` | FastAPI backend application | Changes affect the backend/ directory |
| `api` | API endpoints or contracts | Adding/modifying API routes |
| `ui` | UI components or styling | Working on reusable UI components |
| `database` | Database schema or migrations | Database-related changes |
| `auth` | Authentication/authorization | Auth-related features |
| `config` | Configuration files | Changing configs, environment setup |
| `deployment` | Deployment scripts/configs | CI/CD, Docker, infrastructure |
| `docs` | Documentation | README, guides, documentation |

### Branch Naming Examples

```
feat/frontend/dark-mode              ← Frontend feature
feat/backend/ai-integration          ← Backend feature
fix/api/validation-error             ← API bug fix
feat/database/user-schema            ← Database change
refactor/ui/button-component         ← UI refactor
docs/deployment/docker-setup         ← Documentation update
```

### Full-Stack Features (Backend + Frontend)

For features that span both backend and frontend, you have two options:

**Option 1: Use the broader scope**
```
feat/api/user-authentication         ← Backend API + Frontend UI
```

**Option 2: Create separate branches and merge sequentially**
```
feat/backend/auth-endpoints          ← Merge first
feat/frontend/auth-ui                ← Merge second (depends on backend)
```

**Recommendation**: Use Option 1 for tightly coupled changes, Option 2 for independent implementations.

## Feature Development Workflow

### Scenario 1: Full-Stack Feature (Backend + Frontend)

You're adding user authentication that requires both API endpoints and UI components.

#### Visual Tree Diagram

```
develop
  │
  ├─────────────────────────────────────────┐
  │                                         │
  │                          feat/auth/user-authentication
  │                                    │
  │                                    ├── backend: add auth endpoints
  │                                    ├── backend: add JWT middleware
  │                                    ├── frontend: add login UI
  │                                    └── frontend: add auth context
  │                                         │
  │◄────────────────────────────────────────┘ (merge)
  │
```

#### Step-by-Step Commands

```bash
# 1. Start from develop
git checkout develop
git pull origin develop

# 2. Create feature branch (using 'auth' scope for full-stack auth feature)
git checkout -b feat/auth/user-authentication

# 3. Make changes to backend
cd backend
# ... add auth endpoints in src/app/api/v1/endpoints/auth.py ...
# ... add JWT middleware ...
git add backend/
git commit -m "feat(backend): add authentication endpoints with JWT"

# 4. Make changes to frontend
cd ../frontend
# ... create login page ...
# ... add auth context ...
git add frontend/
git commit -m "feat(frontend): add login UI and auth context"

# 5. Push feature branch
git push origin feat/auth/user-authentication

# 6. Create Pull Request on GitHub/GitLab
# Target: develop ← feat/auth/user-authentication

# 7. After PR approval, merge (see Merge Strategies below)

# 8. Delete feature branch
git branch -d feat/auth/user-authentication
git push origin --delete feat/auth/user-authentication
```

### Scenario 2: Backend-Only Change

You're fixing a database connection issue.

#### Visual Tree Diagram

```
develop
  │
  ├──────────────────────┐
  │                      │
  │           fix/backend/database-connection
  │                 │
  │                 └── backend: fix connection pool config
  │                      │
  │◄─────────────────────┘ (merge)
  │
```

#### Step-by-Step Commands

```bash
# 1. Create bugfix branch from develop (using 'backend' scope)
git checkout develop
git pull origin develop
git checkout -b fix/backend/database-connection

# 2. Make changes (backend only)
cd backend
# ... fix connection pool settings in src/app/core/config.py ...
git add backend/src/app/core/config.py
git commit -m "fix(backend): increase database connection pool size"

# 3. Push and create PR
git push origin fix/backend/database-connection
```

### Scenario 3: Frontend-Only Change

You're adding a dark mode toggle.

#### Visual Tree Diagram

```
develop
  │
  ├──────────────────┐
  │                  │
  │         feat/ui/dark-mode
  │              │
  │              ├── frontend: add theme context
  │              ├── frontend: add toggle component
  │              └── frontend: update styles
  │                   │
  │◄──────────────────┘ (merge)
  │
```

#### Step-by-Step Commands

```bash
# 1. Create feature branch (using 'ui' scope for UI feature)
git checkout develop
git pull origin develop
git checkout -b feat/ui/dark-mode

# 2. Make changes (frontend only)
cd frontend
# ... add theme context, toggle component, update styles ...
git add frontend/
git commit -m "feat(ui): add dark mode with theme toggle"

# 3. Push and create PR
git push origin feat/ui/dark-mode
```

## Merge Strategies

We support three merge strategies. Choose based on your situation:

| Strategy | When to Use | Pros | Cons |
|----------|-------------|------|------|
| **Merge Commit** | Large features with many meaningful commits | Preserves full history | Cluttered history |
| **Squash & Merge** | Small features or many "WIP" commits | Clean, linear history | Loses individual commits |
| **Rebase & Merge** | When you want linear history but keep commits | Clean + detailed history | More complex conflicts |

### Strategy 1: Merge Commit (--no-ff)

**Use when**: Feature has meaningful, well-organized commits you want to preserve.

#### Visual Tree

```
Before merge:
develop          A───B───C
                  \
feat/something     D───E───F

After merge (--no-ff):
develop          A───B───C───────G (merge commit)
                  \             /
feat/something     D───E───F───┘
```

#### Commands

```bash
# From your feature branch
git checkout develop
git pull origin develop
git merge --no-ff feat/user-authentication -m "Merge feat/user-authentication into develop"
git push origin develop
```

#### GitHub/GitLab

When creating PR, select **"Create a merge commit"**

### Strategy 2: Squash and Merge

**Use when**: Feature has many small/messy commits you want to condense.

#### Visual Tree

```
Before squash:
develop          A───B───C
                  \
feat/something     D───E───F───G───H (5 commits)

After squash:
develop          A───B───C───S (1 squashed commit containing D+E+F+G+H)
```

#### Commands

```bash
# Option 1: Squash locally
git checkout develop
git pull origin develop
git merge --squash feat/dark-mode
git commit -m "feat(frontend): add dark mode with theme toggle

- Add theme context for state management
- Create toggle component
- Update all components to support dark mode
- Add persistence to localStorage"
git push origin develop

# Option 2: Use GitHub/GitLab UI
# Select "Squash and merge" when merging PR
```

#### GitHub/GitLab

When creating PR, select **"Squash and merge"**

### Strategy 3: Rebase and Merge

**Use when**: You want linear history but keep individual commits.

#### Visual Tree

```
Before rebase:
develop          A───B───C───D
                  \
feat/something     E───F───G

After rebase:
develop          A───B───C───D───E'───F'───G' (linear history)
```

#### Commands

```bash
# 1. Update your feature branch with latest develop
git checkout feat/user-authentication
git fetch origin
git rebase origin/develop

# 2. Resolve any conflicts (see Troubleshooting section)

# 3. Force push (rebase rewrites history)
git push --force-with-lease origin feat/user-authentication

# 4. Merge into develop (fast-forward)
git checkout develop
git pull origin develop
git merge feat/user-authentication  # Fast-forward merge
git push origin develop
```

#### GitHub/GitLab

When creating PR, select **"Rebase and merge"**

### Comparison Table

| Aspect | Merge Commit | Squash & Merge | Rebase & Merge |
|--------|--------------|----------------|----------------|
| History | Non-linear, shows branches | Linear, single commit | Linear, multiple commits |
| Commit count | All preserved | Condensed to 1 | All preserved |
| Conflicts | Easier to resolve | Easier to resolve | Can be complex |
| Rollback | Easy (revert merge commit) | Easy (revert 1 commit) | Harder (revert multiple) |
| Best for | Long-lived features | Quick fixes, small features | Well-organized features |

## Common Scenarios

### Scenario: Keeping Feature Branch Updated with Develop

Your feature branch is getting outdated as others merge to develop.

#### Visual Tree

```
Initial state:
develop     A───B───C
             \
feat/xyz      D───E

After others merge:
develop     A───B───C───F───G (new commits from other features)
             \
feat/xyz      D───E (now outdated)

After updating (merge develop into feature):
develop     A───B───C───F───G
             \           \
feat/xyz      D───E───────H (merge commit)

After updating (rebase feature onto develop):
develop     A───B───C───F───G
                             \
feat/xyz                      D'───E' (rebased commits)
```

#### Commands - Option 1: Merge develop into feature

```bash
git checkout feat/user-authentication
git fetch origin
git merge origin/develop
# Resolve conflicts if any
git push origin feat/user-authentication
```

#### Commands - Option 2: Rebase feature onto develop (cleaner)

```bash
git checkout feat/user-authentication
git fetch origin
git rebase origin/develop
# Resolve conflicts if any (see Troubleshooting)
git push --force-with-lease origin feat/user-authentication
```

### Scenario: Creating a Release

Prepare code for production deployment.

#### Visual Tree

```
develop     A───B───C───D───E───F
                     \           \
release/v1.0.0        G───H───I   \
                               \   \
main        X───Y───────────────J   K (merge release, then merge back)
                                 \ /
develop     A───B───C───D───E───F─K
```

#### Commands

```bash
# 1. Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/v1.0.0

# 2. Bump version numbers, update changelog
# ... edit package.json, pyproject.toml, CHANGELOG.md ...
git add .
git commit -m "chore: bump version to 1.0.0"

# 3. Final testing and bug fixes on release branch
# ... fix any last-minute issues ...
git commit -m "fix: critical bug before release"

# 4. Merge to main (production)
git checkout main
git pull origin main
git merge --no-ff release/v1.0.0 -m "Release v1.0.0"
git tag -a v1.0.0 -m "Version 1.0.0"
git push origin main --tags

# 5. Merge back to develop (to include release fixes)
git checkout develop
git pull origin develop
git merge --no-ff release/v1.0.0 -m "Merge release/v1.0.0 back to develop"
git push origin develop

# 6. Delete release branch
git branch -d release/v1.0.0
git push origin --delete release/v1.0.0
```

### Scenario: Hotfix for Production

Critical bug in production needs immediate fix.

#### Visual Tree

```
main            A───B───C
                     \   \
hotfix/critical       D───E
                           \
develop         X───Y───Z───F (merge hotfix to both main and develop)
```

#### Commands

```bash
# 1. Create hotfix branch from main (NOT develop)
git checkout main
git pull origin main
git checkout -b hotfix/security-vulnerability

# 2. Fix the critical issue
# ... apply urgent fix ...
git add .
git commit -m "hotfix: patch security vulnerability CVE-2024-XXXX"

# 3. Merge to main immediately
git checkout main
git pull origin main
git merge --no-ff hotfix/security-vulnerability -m "Hotfix: security vulnerability"
git tag -a v1.0.1 -m "Hotfix release 1.0.1"
git push origin main --tags

# 4. Merge to develop (so fix isn't lost in next release)
git checkout develop
git pull origin develop
git merge --no-ff hotfix/security-vulnerability -m "Merge hotfix into develop"
git push origin develop

# 5. Delete hotfix branch
git branch -d hotfix/security-vulnerability
git push origin --delete hotfix/security-vulnerability
```

### Scenario: Working on Multiple Features Simultaneously

You need to switch between features.

#### Commands

```bash
# Working on feature A
git checkout feat/user-authentication
# ... make changes ...
git add .
git commit -m "feat: add JWT middleware"

# Need to switch to urgent feature B
git checkout develop
git checkout -b feat/urgent-feature
# ... make changes ...
git add .
git commit -m "feat: implement urgent feature"
git push origin feat/urgent-feature

# Switch back to feature A
git checkout feat/user-authentication
# Continue where you left off
```

#### Use git stash if you have uncommitted changes

```bash
# Working on feature A with uncommitted changes
git stash save "WIP: authentication logic"

# Switch to feature B
git checkout -b feat/urgent-feature
# ... work on urgent feature ...

# Switch back to feature A
git checkout feat/user-authentication
git stash pop  # Restore uncommitted changes
```

## Troubleshooting

### Problem: Merge Conflicts

#### What it looks like

```bash
git merge develop
Auto-merging backend/src/app/main.py
CONFLICT (content): Merge conflict in backend/src/app/main.py
Automatic merge failed; fix conflicts and then commit the result.
```

#### Solution

```bash
# 1. Check which files have conflicts
git status

# 2. Open conflicted file, you'll see:
<<<<<<< HEAD
# Your changes
from src.app.api.v1.api import api_router
=======
# Their changes
from src.app.api.v1 import health, users
>>>>>>> develop

# 3. Manually resolve (keep one, both, or modify)
from src.app.api.v1.api import api_router  # Keep your version

# 4. Mark as resolved
git add backend/src/app/main.py

# 5. Continue merge
git commit -m "Merge develop into feat/user-authentication"
```

### Problem: Rebase Conflicts

#### What it looks like

```bash
git rebase develop
CONFLICT (content): Merge conflict in backend/src/app/main.py
error: could not apply a1b2c3d... feat: add authentication
```

#### Solution

```bash
# 1. Fix the conflict (same as merge conflicts above)
# Edit the conflicted file

# 2. Add the resolved file
git add backend/src/app/main.py

# 3. Continue rebase (NOT commit!)
git rebase --continue

# If more conflicts, repeat steps 1-3
# If you want to abort: git rebase --abort
```

### Problem: Accidentally Committed to Wrong Branch

#### Solution 1: Move commits to new branch

```bash
# You committed to develop instead of feature branch
git checkout develop

# Create new branch from current position
git branch feat/new-feature

# Reset develop to before your commits
git reset --hard origin/develop

# Switch to new feature branch
git checkout feat/new-feature
# Your commits are now here!
```

#### Solution 2: Cherry-pick commits

```bash
# Note the commit hash you want to move
git log  # Copy the commit hash (e.g., a1b2c3d)

# Create and switch to correct branch
git checkout -b feat/correct-branch develop

# Apply the commit
git cherry-pick a1b2c3d

# Remove from wrong branch
git checkout develop
git reset --hard origin/develop
```

### Problem: Need to Undo Last Commit

#### Solution 1: Keep changes, undo commit

```bash
git reset --soft HEAD~1
# Changes are still staged, commit is gone
```

#### Solution 2: Keep changes unstaged, undo commit

```bash
git reset HEAD~1
# Changes are unstaged, commit is gone
```

#### Solution 3: Completely discard commit and changes

```bash
git reset --hard HEAD~1
# WARNING: Changes are permanently lost!
```

### Problem: Pushed Wrong Commits, Need to Undo

#### Solution (use with caution!)

```bash
# If you're the only one using the branch:
git reset --hard HEAD~1
git push --force-with-lease origin feat/your-branch

# If others are using the branch, use revert instead:
git revert HEAD
git push origin feat/your-branch
```

### Problem: Lost Commits After Reset

#### Solution: Use reflog

```bash
# Find lost commit
git reflog
# Shows: a1b2c3d HEAD@{1}: commit: feat: add authentication

# Restore it
git cherry-pick a1b2c3d
# or
git reset --hard a1b2c3d
```

### Problem: Feature Branch Diverged Too Much

#### Visual

```
develop     A───B───C───D───E───F───G
             \
feat/old      H───I (very outdated)
```

#### Solution: Rebase entire feature branch

```bash
git checkout feat/old
git fetch origin

# Option 1: Interactive rebase (clean up commits)
git rebase -i origin/develop

# Option 2: Regular rebase
git rebase origin/develop

# Force push (you're rewriting history)
git push --force-with-lease origin feat/old
```

### Problem: Want to Test Another Branch Without Committing

#### Solution: Use git stash

```bash
# Save current work
git stash save "WIP: authentication logic"

# Switch to other branch
git checkout feat/other-feature
# ... test it ...

# Return to original branch
git checkout feat/user-authentication
git stash pop  # Restore your work
```

## Quick Reference Commands

```bash
# Start new feature (with scope)
git checkout develop && git pull && git checkout -b feat/scope/feature-name

# Examples with scopes
git checkout -b feat/frontend/user-dashboard
git checkout -b feat/backend/api-endpoints
git checkout -b fix/database/migration-error

# Update feature with latest develop
git checkout feat/scope/feature-name && git merge origin/develop

# Push feature branch
git push origin feat/scope/feature-name

# Merge to develop (after PR approval)
git checkout develop && git pull && git merge --no-ff feat/scope/feature-name

# Delete merged branch
git branch -d feat/scope/feature-name && git push origin --delete feat/scope/feature-name

# Create release
git checkout develop && git pull && git checkout -b release/v1.0.0

# Merge release to main
git checkout main && git pull && git merge --no-ff release/v1.0.0 && git tag v1.0.0

# Create hotfix
git checkout main && git pull && git checkout -b hotfix/issue-description

# View branch structure
git log --oneline --graph --all --decorate
```

## Automated Git Management Scripts

The project includes automated scripts (located in `git-scripts/`) to help with branch management:

### git-manager.sh (Linux/macOS) & git-manager.ps1 (Windows)

These scripts provide an interactive menu for:
- Pulling from main branch
- Creating new branches with proper naming conventions
- Pushing branches to GitHub
- Checking out existing branches

**Time Restriction**: Scripts can only run between **1:31 AM - 6:59 AM** (after GitLab servers close at 1:30 AM)

#### Usage:

**Linux/macOS:**
```bash
# Pull from main
./git-scripts/git-manager.sh pull

# Push/create branch (interactive menu)
./git-scripts/git-manager.sh push

# Override time restriction (emergency use only)
./git-scripts/git-manager.sh push --force-time-override
```

**Windows PowerShell:**
```powershell
# Pull from main
.\git-scripts\git-manager.ps1 pull

# Push/create branch (interactive menu)
.\git-scripts\git-manager.ps1 push

# Override time restriction (emergency use only)
.\git-scripts\git-manager.ps1 push -ForceTimeOverride
```

#### Interactive Branch Creation

The scripts will guide you through:
1. **Branch Type**: feat, fix, test, docs, refactor, etc.
2. **Scope**: frontend, backend, api, ui, database, auth, etc.
3. **Feature Name**: Descriptive name (lowercase, hyphens)

Example flow:
```
Select branch type: [1] feat
Select scope: [2] backend
Enter product name: user-authentication
→ Creates: feat/backend/user-authentication
```

### git-prune-gone.sh

Cleans up local branches whose remote tracking branches are gone.

```bash
# Dry run (shows what would be deleted)
./git-scripts/git-prune-gone.sh

# Actually delete gone branches
./git-scripts/git-prune-gone.sh -y

# Exclude specific branches
./git-scripts/git-prune-gone.sh -x main -x "release/*" -y
```

## Resources

- [Git Flow Cheatsheet](https://danielkummer.github.io/git-flow-cheatsheet/)
- [Atlassian Git Flow Tutorial](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)
- [GitHub Flow vs Git Flow](https://lucamezzalira.com/2014/03/10/git-flow-vs-github-flow/)

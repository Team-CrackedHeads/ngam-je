# Git Push Workflow

This project uses a dual-remote setup with GitHub and GitLab for redundancy and availability.

## Remote Configuration

- **origin** (GitHub): Available 24/7
- **gitlab** (Gamuda GitLab): Available 7AM - 12AM only

```bash
git remote -v
# origin    https://github.com/DarrenSJZ/ngam-je.git (fetch)
# origin    https://github.com/DarrenSJZ/ngam-je.git (push)
# gitlab    https://gitlab.gamuda.app/teamcrackedheads/ngam-je.git (fetch)
# gitlab    https://gitlab.gamuda.app/teamcrackedheads/ngam-je.git (push)
```

## Basic Push Commands

### Push to GitHub (Primary - 24/7)
```bash
git push origin main
```

### Push to GitLab (Secondary - 7AM-12AM only)
```bash
git push gitlab main
```

### Push to Both Remotes
```bash
# Push current branch to both remotes
git push origin main
git push gitlab main

# Or push all branches to both remotes
git push --all origin
git push --all gitlab
```

## Workflow Recommendations

### Daily Development
1. **Primary workflow**: Use GitHub as your main remote
2. **Sync to GitLab**: Push to GitLab during operational hours (7AM-12AM)
3. **Backup strategy**: GitHub serves as 24/7 backup when GitLab is down

### Time-Based Strategy
- **7AM - 12AM**: Push to both remotes
- **12AM - 7AM**: Push to GitHub only (GitLab unavailable)

### Branch Management
```bash
# Create and push new feature branch
git checkout -b feature/new-feature
git push origin feature/new-feature
git push gitlab feature/new-feature  # During operational hours only

# Delete branch from both remotes
git push origin --delete feature/old-feature
git push gitlab --delete feature/old-feature
```

## Automation Scripts

### Push to Available Remotes
Create a helper script to automatically push to available remotes:

```bash
#!/bin/bash
# scripts/git-push-all.sh
hour=$(date +%H)

# Always push to GitHub (24/7 available)
echo "Pushing to GitHub..."
git push origin main

# Push to GitLab only during operational hours (7-23)
if [ $hour -ge 7 ] && [ $hour -lt 24 ]; then
    echo "Pushing to GitLab..."
    git push gitlab main
else
    echo "GitLab unavailable (12AM-7AM), skipping..."
fi
```

### Make script executable
```bash
chmod +x scripts/git-push-all.sh
```

## Troubleshooting

### GitLab Connection Issues
If GitLab push fails during operational hours:
1. Check if it's within 7AM-12AM timeframe
2. Verify network connectivity
3. Fall back to GitHub for immediate backup

### Authentication Issues
- **GitHub**: Uses SSH keys or personal access tokens
- **GitLab**: Uses HTTPS authentication (username/password or tokens)

### Emergency Fallback
If one remote is unavailable:
```bash
# Check which remotes are reachable
git ls-remote origin
git ls-remote gitlab

# Push to available remote only
git push origin main  # Always available
```

## Best Practices

1. **Always push to GitHub first** (primary 24/7 remote)
2. **Sync to GitLab during operational hours**
3. **Use meaningful commit messages** for both remotes
4. **Test connectivity** before critical deployments
5. **Keep both remotes in sync** to avoid conflicts

## Git Aliases

Add these aliases to your `~/.gitconfig` for convenience:

```ini
[alias]
    push-all = !git push origin main && git push gitlab main
    push-github = push origin main
    push-gitlab = push gitlab main
    check-remotes = !git ls-remote origin && git ls-remote gitlab
```

Usage:
```bash
git push-all      # Push to both remotes
git push-github   # Push to GitHub only
git push-gitlab   # Push to GitLab only
git check-remotes # Test both remote connections
```
# Git Push Workflow
This project uses a dual-remote setup with GitHub and GitLab for redundancy and availability, as well as the CI/CD features available on GitLab.

## Remote Configuration
- **origin** (GitHub): Available 24/7
- **gitlab** (Gamuda GitLab): Available 7AM - 12AM only

```bash
git remote -v
# origin    https://github.com/DarrenSJZ/ngam-je.git (fetch)
# origin    https://github.com/DarrenSJZ/ngam-je.git (push)
```

## Basic Push Commands

### Push to GitHub (Primary - 24/7)
```bash
git push origin main
```



# Or push all branches to both remotes
```bash
```
git push --all origin
git push --all gitlab
```
```
```
```

## Workflow Recommendations

### Daily Development
1. **Primary workflow**: Use GitHub as your main remote
2. GitHub Actions will mirror directly to GitLab during operational hours
3. Please ensure you create new branches when writing features or fixes
4. Only Repository Admins should push to the `main` branch directly
5. Code will be reviewed via Pull/Merge Requests on GitHub

### Branch Management
```bash
# Create and push new feature branch
git checkout -b feature/new-feature
git push origin feature/new-feature

# Delete branch from both remotes
git push origin --delete feature/old-feature
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


### Authentication Issues
- **GitHub**: Uses SSH keys or personal access tokens

### Emergency Fallback
If one remote is unavailable:
```bash
# Check if the remote can be reached
git ls-remote origin

# Push to available remote only
git push origin main  # Always available
```

## Best Practices

1. **Always push to GitHub in your own branches first** (primary 24/7 remote)
3. **Use meaningful commit messages**
4. **Test connectivity** before critical deployments
5. **Ensure you plan your work with team members** to avoid conflicts

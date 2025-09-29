# Development Guide - GitLab Downtime Workflow

## 📋 Daily Schedule

**GitLab Available:** 7:00 AM - 12:00 AM (midnight)
**GitLab Downtime:** 12:00 AM - 7:00 AM
**Emergency Backup:** GitHub repository

---

## 🕐 Normal Development (7 AM - 12 AM)

### ✅ What to do:
1. Work in GitLab as usual
2. Create branches, MRs, and merge normally
3. All CI/CD runs automatically in GitLab

### ❌ What NOT to do:
- Don't work directly on GitHub during normal hours
- GitLab is your primary workspace

---

## 🌙 Emergency Development (12 AM - 7 AM)

When GitLab is down, use the GitHub backup:

### 🚀 Creating a new feature branch:

```bash
./git-manager.sh push
```

**Follow the prompts:**
1. Choose branch type: `feat`, `fix`, `test`, etc.
2. Choose scope: `frontend`, `backend`, `api`, etc.
3. Enter feature name: `user-login`, `payment-flow`, etc.
4. Script creates: `feat/frontend/user-login`

### 🔄 Getting latest changes:

```bash
./git-manager.sh pull
```

This pulls the latest main branch from GitHub backup.

### 📝 Example workflow:
```bash
# When GitLab is down (12 AM - 7 AM)
./git-manager.sh pull              # Get latest
./git-manager.sh push              # Create new branch
# Do your development work
git add .
git commit -m "Add user login feature"
git push                          # Push to GitHub
```

---

## 🌅 After GitLab Comes Back (7 AM+)

### ✅ What happens automatically:
- Your GitHub branches sync to GitLab at 7:05 AM
- No action needed from you!

### ✅ What you should do:
1. Go to GitLab
2. Find your synced branch
3. Create a Merge Request as normal
4. Continue with regular GitLab workflow

---

## 📱 Quick Commands

| Situation | Command |
|-----------|---------|
| Get latest code (emergency) | `./git-manager.sh pull` |
| Create new branch (emergency) | `./git-manager.sh push` |
| Normal GitLab work | Use GitLab web interface |

---

## ⚠️ Important Rules

### ✅ DO:
- Use GitLab for all normal development
- Use GitHub backup only during GitLab downtime
- Follow the branch naming convention via scripts
- Create MRs in GitLab after sync

### ❌ DON'T:
- Work on GitHub during normal GitLab hours
- Create branches manually on GitHub
- Push to main branch directly
- Skip the sync process

---

## 🆘 Troubleshooting

**Q: GitLab is down but it's not midnight yet?**
A: Check if there's an outage. Use GitHub backup if needed.

**Q: My branch didn't sync to GitLab?**
A: Wait until 7:30 AM. If still missing, contact the team.

**Q: I forgot to use the script and created a branch manually?**
A: It should still sync, but follow the naming convention next time.

**Q: The script isn't working?**
A: Check you have access to GitHub. Contact the team if issues persist.

---

## 📞 Support

For issues with this workflow, contact the development team or check:
- GitLab CI/CD status
- GitHub Actions status
- Repository access permissions
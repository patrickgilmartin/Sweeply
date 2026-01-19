# GitHub Setup Instructions

## Quick Start

### 1. Initialize Git (if not already done)

```powershell
cd C:\Users\Patri\OneDrive\Desktop\Tinder_Clear
git init
git branch -M main
```

### 2. Stage All Files

```powershell
git add .
```

### 3. Create Initial Commit

```powershell
git commit -m "Initial commit: Tinder-style media cleanup application

Features:
- Electron desktop app with React UI
- Web application with File System Access API
- Tinder-style card interface for file review
- Support for images, documents, PDFs, videos, and audio
- IndexedDB for web app, SQLite for Electron
- Comprehensive test suite
- TypeScript throughout"
```

### 4. Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `tinder-clear` (or your preferred name)
3. Description: "Tinder-style media cleanup application for organizing files"
4. **Public** or **Private** (your choice)
5. **DO NOT** check "Initialize with README" (we already have one)
6. Click "Create repository"

### 5. Add Remote and Push

After creating the repository, GitHub will show you commands. Use these:

```powershell
# Replace YOUR_USERNAME and REPO_NAME with your actual GitHub username and repo name
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
git push -u origin main
```

## Verification

After pushing, verify:

```powershell
git remote -v
git log --oneline
```

## Next Steps

1. **Set up GitHub Pages** (if you want to host the web app there):
   - Go to Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main` / `packages/web/dist`

2. **Add repository topics** for discoverability:
   - electron
   - react
   - typescript
   - file-management
   - media-cleanup

3. **Create releases** for Electron app:
   - Go to Releases → Draft a new release
   - Tag version (e.g., v1.0.0)
   - Upload the built `.exe` installer

## Important Notes

- The `.gitignore` is already configured to exclude:
  - `node_modules/`
  - Build artifacts (`dist/`)
  - Database files (`.db`)
  - Test coverage reports
  - OS-specific files

- Large files (>100MB) won't be pushed to GitHub
- Consider using Git LFS for large binaries if needed

## Troubleshooting

### If you get "repository not found":
- Check the repository URL
- Verify you have access to the repository
- Make sure you're using HTTPS (not SSH)

### If you get authentication errors:
- Use a Personal Access Token instead of password
- Or set up SSH keys

### If push is rejected:
- Pull first: `git pull origin main --rebase`
- Then push again: `git push -u origin main`

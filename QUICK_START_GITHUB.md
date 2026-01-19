# Quick Start: Push to GitHub

## Step 1: Configure Git (if not already done)

```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Step 2: Stage All Files

```powershell
cd C:\Users\Patri\OneDrive\Desktop\Tinder_Clear
git add .
```

## Step 3: Create Initial Commit

```powershell
git commit -m "Initial commit: Tinder-style media cleanup application

Features:
- Electron desktop app with React UI
- Web application with File System Access API
- Tinder-style card interface for file review
- Support for images, documents, PDFs, videos, and audio
- Comprehensive test suite with 49+ tests
- TypeScript throughout
- IndexedDB for web, SQLite for Electron"
```

## Step 4: Create GitHub Repository

1. Go to: https://github.com/new
2. Repository name: `tinder-clear` (or your preferred name)
3. Description: "Tinder-style media cleanup application for organizing files"
4. Choose **Public** or **Private**
5. **IMPORTANT**: Do NOT check "Add a README file" (we already have one)
6. Click "Create repository"

## Step 5: Add Remote and Push

After creating the repository, GitHub will show you commands. Copy your repository URL and run:

```powershell
# Replace YOUR_USERNAME and REPO_NAME with your actual values
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
git branch -M main
git push -u origin main
```

## Example (if your username is "johndoe" and repo is "tinder-clear"):

```powershell
git remote add origin https://github.com/johndoe/tinder-clear.git
git branch -M main
git push -u origin main
```

## Troubleshooting

### Authentication Error?
If prompted for credentials, use a **Personal Access Token** instead of password:
1. Go to: https://github.com/settings/tokens
2. Generate new token (classic)
3. Select `repo` scope
4. Use token as password when prompted

### Already exists error?
If remote already exists:
```powershell
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
```

### Need to pull first?
```powershell
git pull origin main --allow-unrelated-histories
```

## Verify

After pushing, check:
```powershell
git remote -v
```

Then visit your repository on GitHub to see all your files!

## Next Steps

See [DEPLOYMENT.md](./DEPLOYMENT.md) for:
- Deploying web app to Vercel
- Building Electron installer
- Setting up CI/CD

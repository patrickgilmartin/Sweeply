# Deployment Guide

This guide covers deploying both the Electron desktop app and the web application.

## GitHub Setup

### 1. Initialize Git Repository

If not already initialized:
```bash
git init
git branch -M main
```

### 2. Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it (e.g., `tinder-clear` or `media-cleanup`)
3. **Do NOT** initialize with README, .gitignore, or license (we already have these)
4. Copy the repository URL (e.g., `https://github.com/yourusername/tinder-clear.git`)

### 3. Add Remote and Push

```bash
# Add remote
git remote add origin https://github.com/yourusername/tinder-clear.git

# Stage all files
git add .

# Create initial commit
git commit -m "Initial commit: Tinder-style media cleanup app with Electron and Web versions"

# Push to GitHub
git push -u origin main
```

## Electron Desktop App Deployment

### Building Windows Installer

1. Build all packages:
```bash
npm run build
```

2. Package the app:
```bash
npm run package
```

The installer will be in `packages/main/dist/`

### Distribution Options

- **GitHub Releases**: Upload the installer `.exe` file to GitHub Releases
- **Direct Distribution**: Share the installer file directly
- **Auto-updater**: Consider implementing electron-updater for automatic updates

## Web Application Deployment

The web application can be deployed to various platforms. The recommended option is Vercel for its simplicity and free tier.

### Vercel Deployment (Recommended)

1. **Install Vercel CLI** (optional, or use GitHub integration):
```bash
npm install -g vercel
```

2. **Deploy from web app directory**:
```bash
cd packages/web
vercel
```

3. **Or use GitHub Integration**:
   - Push code to GitHub
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Set root directory to `packages/web`
   - Deploy

4. **Environment Variables** (if needed):
   - Set in Vercel dashboard under Project Settings → Environment Variables
   - No environment variables needed for initial deployment

### Netlify Deployment

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Deploy:
```bash
cd packages/web
npm run build
netlify deploy --prod --dir=dist
```

### Other Deployment Options

- **Cloudflare Pages**: Similar to Vercel
- **AWS Amplify**: For AWS integration
- **Self-hosted**: Build and serve the `dist/` folder with any static hosting

## Pre-Deployment Checklist

### For GitHub:
- [ ] `.gitignore` is properly configured
- [ ] No sensitive data (API keys, passwords) in code
- [ ] README is up to date
- [ ] All tests pass: `cd packages/web && npm run test`

### For Web Deployment:
- [ ] Build succeeds: `cd packages/web && npm run build`
- [ ] No console errors in browser
- [ ] File System Access API is documented (Chrome/Edge only)
- [ ] Error handling for unsupported browsers

### For Electron Deployment:
- [ ] App builds successfully: `npm run build && npm run package`
- [ ] Installer runs and app launches
- [ ] All features work in packaged version
- [ ] Code signing (optional but recommended for distribution)

## Post-Deployment

### Web App
1. Test in production environment
2. Check browser console for errors
3. Verify File System Access API works (requires HTTPS)
4. Document browser compatibility

### Electron App
1. Test installer on clean Windows machine
2. Verify file operations work correctly
3. Test all media types display correctly
4. Check for any permission issues

## Continuous Deployment

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml` for automated deployments:

```yaml
name: Deploy Web App

on:
  push:
    branches: [ main ]
    paths:
      - 'packages/web/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: cd packages/web && npm run build
      - uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## Support and Documentation

- Update README with deployment URLs
- Add troubleshooting section
- Document browser requirements
- Include license information

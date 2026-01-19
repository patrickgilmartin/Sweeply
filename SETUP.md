# Setup Instructions

## Issues Fixed

1. **TypeScript Types for better-sqlite3**: Added type declarations in `packages/main/src/types/better-sqlite3.d.ts`
2. **Native Module Rebuild**: Added `electron-rebuild` to rebuild `better-sqlite3` for Electron's Node.js version

## Installation Steps

1. **Install dependencies** (if not already done):
   ```powershell
   npm install
   ```

2. **Rebuild better-sqlite3 for Electron**:
   ```powershell
   cd packages/main
   npm run postinstall
   ```
   
   Or manually:
   ```powershell
   cd packages/main
   npx electron-rebuild -f -w better-sqlite3
   ```

3. **Build shared package** (if not already done):
   ```powershell
   cd packages/shared
   npm run build
   ```

## Running the Application

### Development Mode

**Terminal 1 - Renderer (React/Vite)**:
```powershell
cd packages/renderer
npm run dev
```

**Terminal 2 - Main Process (TypeScript Watch)**:
```powershell
cd packages/main
npm run dev
```

**Terminal 3 - Electron App**:
```powershell
cd packages/main
npm start
```

## Note on PowerShell

PowerShell doesn't support `&&` for chaining commands like bash. Use separate commands or use `;` instead:
```powershell
# Instead of: cd packages/shared && npm run build
# Use:
cd packages/shared; npm run build
```

## Troubleshooting

### "Could not find a declaration file for module 'better-sqlite3'"
- Type declarations are now in `packages/main/src/types/better-sqlite3.d.ts`
- Make sure `packages/main/tsconfig.json` includes the types directory

### "NODE_MODULE_VERSION mismatch" error
- This means `better-sqlite3` was compiled for the wrong Node.js version
- Run `npm run postinstall` in `packages/main` to rebuild it for Electron
- Or manually: `cd packages/main && npx electron-rebuild -f -w better-sqlite3`

### TypeScript compilation errors
- Make sure `packages/shared` is built first: `cd packages/shared && npm run build`
- Then build `packages/main`: `cd packages/main && npm run build`

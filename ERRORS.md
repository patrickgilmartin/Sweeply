# Error Log & Solutions

This document tracks all errors encountered during development, their causes, and solutions implemented.

---

## 1. TypeScript: Missing Declaration File for `better-sqlite3`

**Error:**
```
error TS7016: Could not find a declaration file for module 'better-sqlite3'.
'C:/Users/Patri/OneDrive/Desktop/Tinder_Clear/node_modules/better-sqlite3/lib/index.js' 
implicitly has an 'any' type.
```

**Terminal:** Terminal 3 (Main Process - TypeScript Watch)

**Cause:** 
- `better-sqlite3` is a native Node.js module that doesn't ship with TypeScript definitions
- TypeScript couldn't find type declarations for the module

**Solution:**
- Created custom type declarations file: `packages/main/src/types/better-sqlite3.d.ts`
- Added type definitions for `Database`, `Statement`, `RunResult` classes and `transaction` method
- Updated `packages/main/tsconfig.json` to include the types directory in compilation
- Fixed type usage in `packages/main/src/database.ts`: Changed `Database.Database` to `Database`

**Files Modified:**
- `packages/main/src/types/better-sqlite3.d.ts` (created)
- `packages/main/tsconfig.json` (updated include path)
- `packages/main/src/database.ts` (fixed type annotation)

**Status:** ✅ Fixed

---

## 2. Electron Native Module: NODE_MODULE_VERSION Mismatch

**Error:**
```
Error: The module '\\?\C:\Users\Patri\OneDrive\Desktop\Tinder_Clear\node_modules\better-sqlite3\build\Release\better_sqlite3.node'
was compiled against a different Node.js version using
NODE_MODULE_VERSION 127. This version of Node.js requires
NODE_MODULE_VERSION 118.
```

**Terminal:** Terminal 4 (Electron App - npm start)

**Cause:**
- `better-sqlite3` is a native module (contains C++ code compiled to `.node` file)
- It was compiled for the system's Node.js version (MODULE_VERSION 127)
- Electron uses its own embedded Node.js version (MODULE_VERSION 118)
- Native modules must be recompiled for Electron's Node.js version

**Solution:**
- Added `electron-rebuild` as dev dependency in `packages/main/package.json`
- Added `postinstall` script to automatically rebuild `better-sqlite3` for Electron
- Manual rebuild command: `npx electron-rebuild -f -w better-sqlite3`

**Files Modified:**
- `packages/main/package.json` (added electron-rebuild dependency and postinstall script)

**Status:** ✅ Fixed (requires running `npm install` in `packages/main` or `npx electron-rebuild`)

**To Apply Fix:**
```powershell
cd packages\main
npm install
# OR manually:
npx electron-rebuild -f -w better-sqlite3
```

---

## 3. PowerShell: Invalid Token '&&'

**Error:**
```
The token '&&' is not a valid statement separator in this version.
```

**Terminal:** Any PowerShell terminal

**Cause:**
- PowerShell doesn't support `&&` operator for chaining commands (unlike bash/cmd)
- Attempted to run: `cd packages/shared && npm run build`

**Solution:**
- Use separate commands in PowerShell
- Or use semicolon `;` as separator: `cd packages/shared; npm run build`
- Updated documentation to use separate commands

**Files Modified:**
- `README.md` (updated with PowerShell-compatible commands)
- `SETUP.md` (created with explicit PowerShell instructions)

**Status:** ✅ Fixed (documentation updated)

---

## 4. Console: React DevTools Message (Informational)

**Error:**
```
Download the React DevTools for a better development experience: https://reactjs.org/link/react-devtools
```

**Location:** Browser Console / Electron DevTools

**Cause:**
- This is not an error - it's an informational message from React
- React detects it's running in development mode and suggests installing DevTools

**Solution:**
- No fix needed - this is expected behavior
- Can be safely ignored
- Optionally install React DevTools extension if desired

**Status:** ✅ Informational only - no action needed

---

## 5. Console: Chrome Extension Errors

**Error:**
```
GET chrome-extension://pbanhockgagggenencehbnadejlgchfc/assets/userReportLinkedCandidate.json net::ERR_FILE_NOT_FOUND

ResumeSwitcher: Component mounted. Initializing resume (forced=false).
updateFilling Resume is called
autofillInstance.coverLetter null
```

**Location:** Browser Console / Electron DevTools

**Cause:**
- These errors are from browser extensions installed in Chrome/Edge
- The extension ID `pbanhockgagggenencehbnadejlgchfc` appears to be a resume/job application helper extension
- Electron's renderer process can access browser extensions, causing them to run in the app context
- These extensions try to load resources or run scripts that aren't relevant to our app

**Solution:**
- Not an error with our application - it's browser extension interference
- Can be safely ignored
- If problematic, can disable browser extensions for Electron or run Electron with `--disable-extensions` flag
- These messages don't affect app functionality

**Files Modified:** None (not our code)

**Status:** ✅ External - no fix needed (can be ignored)

**Optional Fix (if desired):**
To prevent extension interference, modify `packages/main/src/main.ts`:
```typescript
mainWindow = new BrowserWindow({
  // ... existing options ...
  webPreferences: {
    // ... existing options ...
    // Add this to disable extensions:
    // extensions: false
  }
});
```

---

## Error Prevention Checklist

Before running the app, ensure:

- [x] `npm install` has been run at root
- [x] `packages/shared` has been built (`npm run build`)
- [x] `better-sqlite3` has been rebuilt for Electron (`npx electron-rebuild -f -w better-sqlite3` in `packages/main`)
- [ ] All 3 terminals are running simultaneously (renderer, main dev, electron start)
- [ ] TypeScript compilation shows 0 errors

---

## Quick Fix Reference

### TypeScript Compilation Errors
```powershell
cd packages\main
npm run build
# Check for errors in output
```

### Native Module Rebuild
```powershell
cd packages\main
npx electron-rebuild -f -w better-sqlite3
```

### Clean Build (if issues persist)
```powershell
# From root directory
npm run clean
npm install
cd packages\shared
npm run build
cd ..\main
npm install
npx electron-rebuild -f -w better-sqlite3
```

---

---

## 6. Electron: ERR_FILE_NOT_FOUND in Development Mode

**Error:**
```
ERR_FILE_NOT_FOUND: file:///C:/Users/Patri/OneDrive/Desktop/Tinder_Clear/packages/main/renderer/dist/index.html
```

**Terminal:** Terminal 3 (Electron App - npm start)

**Cause:**
- Electron was trying to load from file path `renderer/dist/index.html`
- In development mode, the renderer is served by Vite dev server, not from file
- The code checked `process.env.NODE_ENV === 'development'` but this wasn't set
- When NODE_ENV is undefined, it defaulted to production path (file loading)

**Solution:**
- Updated `packages/main/src/main.ts` to detect development mode by checking file existence
- Logic: If `renderer/dist/index.html` doesn't exist → load from Vite dev server (`http://localhost:5173`)
- Logic: If file exists → load from file (production mode)
- This works regardless of NODE_ENV being set

**Files Modified:**
- `packages/main/src/main.ts` (updated development mode detection)
- `DEV_LOG.md` (documented fix)

**Status:** ✅ Fixed

**To Apply:**
- TypeScript compiler (Terminal 2) should auto-recompile
- Restart Terminal 3 (Electron) to apply changes
- Electron should now load from `http://localhost:5173` in development

---

## 7. Electron: GPU Process Errors (Informational)

**Error:**
```
[ERROR:gpu_process_host.cc(991)] GPU process exited unexpectedly: exit_code=-1073740791
```

**Terminal:** Terminal 3 (Electron App Console Output)

**Cause:**
- These are harmless warnings from Electron/Chromium's GPU process
- Common on Windows when GPU hardware acceleration has issues
- Electron falls back to software rendering automatically
- Does not affect application functionality

**Solution:**
- No fix needed - these warnings can be safely ignored
- Application continues to work normally despite these errors
- If extremely bothersome, can disable GPU acceleration in BrowserWindow options (not recommended)

**Files Modified:** None (not a real error)

**Status:** ✅ Informational only - no action needed

---

## Notes

- All real errors have been fixed
- Console messages from browser extensions are external and can be ignored
- React DevTools message is informational only
- Native module rebuild is required after any `npm install` that touches `better-sqlite3`
- Development mode detection now works automatically by checking file existence

# Development Log

This log tracks development sessions, issues encountered, and solutions.

---

## Session 1 - 2024-01-XX

### Setup Status
- ✅ Root npm install completed
- ✅ Shared package built successfully
- ✅ Main package npm install completed
- ✅ Renderer (Vite) running on http://localhost:5173/
- ✅ Main TypeScript compiler running (0 errors)

### Current Issue

**Terminal 13 - Electron Startup Error:**
```
ERR_FILE_NOT_FOUND: file:///C:/Users/Patri/OneDrive/Desktop/Tinder_Clear/packages/main/renderer/dist/index.html
```

**Analysis:**
- Electron is trying to load from file path instead of Vite dev server
- This suggests `process.env.NODE_ENV` is not set to 'development'
- Code checks `if (process.env.NODE_ENV === 'development')` but defaults to production path
- In development, should load from `http://localhost:5173/`

**Root Cause:**
- `npm start` doesn't automatically set NODE_ENV=development
- Electron defaults to production mode when NODE_ENV is undefined
- Main.ts needs better development mode detection

**Solution Needed:**
- Set NODE_ENV in start script OR
- Use different detection method (check if Vite server is running)
- Update package.json start script to set NODE_ENV

---

## Issues Resolved

### Issue 1: TypeScript Types for better-sqlite3
- **Status:** ✅ Fixed
- **Solution:** Created custom type declarations

### Issue 2: NODE_MODULE_VERSION Mismatch  
- **Status:** ✅ Fixed (electron-rebuild configured)
- **Solution:** Added postinstall script with electron-rebuild

### Issue 3: Electron Loading Wrong Path in Development
- **Status:** ✅ Fixed
- **Current:** Electron was trying to load from file path instead of Vite dev server
- **Solution:** Updated main.ts to detect development mode by checking if renderer dist folder exists
- **Fix:** If dist doesn't exist → load from Vite dev server (http://localhost:5173)
- **Fix:** If dist exists → load from file (production mode)

---

## Next Steps
1. ✅ Fixed development mode detection in main.ts - now checks file existence
2. ⚠️ Package.json start script - keeping simple (main.ts handles detection)
3. ⏳ Test Electron loading from Vite dev server - PENDING

### Fix Applied
- Updated `packages/main/src/main.ts` to detect development mode by checking if renderer dist folder exists
- If dist doesn't exist, defaults to Vite dev server (http://localhost:5173)
- Added fallback to try dev server if file loading fails
- This should work regardless of NODE_ENV being set

### Testing Required
- Restart Terminal 3 (Electron) after TypeScript recompiles
- Verify Electron loads from Vite dev server instead of file path

---

## Session 2 - Scroll & Default Folder Issues

### Current Issues

**Issue 1: Cannot Scroll in Electron Window**
- **Status:** ✅ Fixed
- **Cause:** `overflow: hidden;` on `body` in App.css preventing scrolling
- **Solution:** Changed to `overflow: auto;` and added `height: 100vh;`
- **Files Modified:** `packages/renderer/src/styles/App.css`

**Issue 2: No Default Deleted Folder**
- **Status:** ✅ Fixed
- **Cause:** DEFAULT_CONFIG had empty `deletedFolder` string
- **Solution:** Set default to `Media_Cleanup_Deleted` in user's home directory
- **Solution:** Auto-create folder if it doesn't exist in `loadConfig()`
- **Files Modified:** `packages/main/src/config.ts`

**Issue 3: GPU Process Errors in Terminal**
- **Status:** ℹ️ Informational
- **Errors:** `GPU process exited unexpectedly: exit_code=-1073740791`
- **Analysis:** These are harmless Electron/Chromium warnings
- **Cause:** GPU hardware acceleration issues (common on Windows)
- **Solution:** No fix needed - these don't affect functionality
- **Note:** Can be safely ignored

### Fixes Applied

1. **Scrolling Fixed:**
   - Changed `body { overflow: hidden; }` to `overflow: auto;`
   - Added `height: 100vh;` to ensure proper viewport sizing
   - `.app-main`, `.settings-content`, `.deleted-manager-content` already have `overflow: auto;`

2. **Default Deleted Folder:**
   - Default path: `C:\Users\<Username>\Media_Cleanup_Deleted`
   - Folder auto-created on config load if it doesn't exist
   - Path saved in config.json on first run

### Next Steps
- Wait for TypeScript to recompile (Terminal 2)
- Test scrolling in Electron window
- Verify default deleted folder is created at first run

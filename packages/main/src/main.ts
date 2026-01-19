import { app, BrowserWindow, protocol } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { ConfigManager } from './config';
import { DatabaseManager } from './database';
import { FileOperations } from './fileOperations';
import { FileScanner } from './fileScanner';
import { IPCHandlers } from './ipcHandlers';

let mainWindow: BrowserWindow | null = null;
let db: DatabaseManager;
let config: ConfigManager;
let fileOps: FileOperations;
let scanner: FileScanner;
let ipcHandlers: IPCHandlers;

function createWindow(): void {
  const preloadPath = path.join(__dirname, 'preload.js');
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: fs.existsSync(preloadPath) ? preloadPath : path.join(__dirname, 'preload.ts'),
      nodeIntegration: false,
      contextIsolation: true
    },
    titleBarStyle: 'default',
    backgroundColor: '#1a1a1a',
    show: false
  });

  // Load the app - detect development vs production
  const rendererDistPath = path.join(__dirname, '../renderer/dist/index.html');
  const rendererDistExists = fs.existsSync(rendererDistPath);
  
  if (!rendererDistExists) {
    // Development mode - renderer dist doesn't exist, load from Vite dev server
    console.log('Development mode: Loading from Vite dev server at http://localhost:5173');
    mainWindow.loadURL('http://localhost:5173').catch((err) => {
      console.error('Could not load from Vite dev server. Make sure it is running on port 5173.', err);
    });
    mainWindow.webContents.openDevTools();
  } else {
    // Production mode - renderer dist exists, load from file
    console.log('Production mode: Loading from file:', rendererDistPath);
    mainWindow.loadFile(rendererDistPath);
  }

  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // Register custom protocol to serve local files
  // This allows loading local files with contextIsolation enabled
  protocol.registerFileProtocol('media', (request, callback) => {
    const filePath = request.url.replace('media://', '');
    const decodedPath = decodeURIComponent(filePath);
    
    // Security check: ensure the file exists
    if (fs.existsSync(decodedPath)) {
      callback({ path: decodedPath });
    } else {
      console.error('File not found:', decodedPath);
      callback({ error: -6 }); // FILE_NOT_FOUND
    }
  });

  // Initialize managers
  config = new ConfigManager();
  db = new DatabaseManager();
  fileOps = new FileOperations(db, config.getConfig());
  scanner = new FileScanner(db, config.getConfig());
  ipcHandlers = new IPCHandlers(db, fileOps, scanner, config);

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Close database on app exit
    if (db) {
      db.close();
    }
    app.quit();
  }
});

app.on('before-quit', () => {
  if (db) {
    db.close();
  }
});

import { ipcMain, dialog } from 'electron';
import { DatabaseManager } from './database';
import { FileOperations } from './fileOperations';
import { FileScanner } from './fileScanner';
import { ConfigManager } from './config';
import { AppConfig, IPCFile } from '@tinder-clear/shared';
import * as fs from 'fs';
import * as path from 'path';

export class IPCHandlers {
  private db: DatabaseManager;
  private fileOps: FileOperations;
  private scanner: FileScanner;
  private config: ConfigManager;
  private queue: Array<{ filepath: string; media_type: string; file_size: number }> = [];
  private queueIndex: number = 0;

  constructor(
    db: DatabaseManager,
    fileOps: FileOperations,
    scanner: FileScanner,
    config: ConfigManager
  ) {
    this.db = db;
    this.fileOps = fileOps;
    this.scanner = scanner;
    this.config = config;
    this.registerHandlers();
  }

  private registerHandlers(): void {
    // Get next file from queue
    ipcMain.handle('get-next-file', async (): Promise<IPCFile | null> => {
      try {
        console.log(`get-next-file: queueIndex=${this.queueIndex}, queue.length=${this.queue.length}`);
        
        // If queue is empty or exhausted, try to get more files
        if (this.queueIndex >= this.queue.length) {
          console.log('Queue exhausted, trying to get next pending file from DB...');
          const nextFile = await this.scanner.getNextPendingFile();
          if (!nextFile) {
            console.log('No pending files found in database');
            return null;
          }
          console.log('Found pending file in DB:', nextFile.filepath);
          this.queue = [nextFile];
          this.queueIndex = 0;
        }

        if (this.queueIndex < this.queue.length) {
          const file = this.queue[this.queueIndex];
          console.log(`Returning file from queue index ${this.queueIndex}:`, file.filepath);
          
          // Verify file still exists
          if (!fs.existsSync(file.filepath)) {
            console.log('File no longer exists:', file.filepath);
            this.db.updateFileStatus(file.filepath, 'missing');
            this.queueIndex++;
            return this.getNextFileRecursive();
          }

          const dbFile = this.db.getFile(file.filepath);
          
          return {
            filepath: file.filepath,
            media_type: file.media_type as 'image' | 'document' | 'video' | 'audio',
            file_size: file.file_size,
            status: dbFile?.status || 'pending'
          };
        }

        console.log('No more files in queue');
        return null;
      } catch (error: any) {
        console.error('Error getting next file:', error);
        return null;
      }
    });

    // Reject file (move to deleted folder)
    ipcMain.handle('reject-file', async (_, filepath: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const result = await this.fileOps.moveToDeletedFolder(filepath);
        
        if (result.success) {
          this.queueIndex++;
        }
        
        return {
          success: result.success,
          error: result.error
        };
      } catch (error: any) {
        console.error('Error rejecting file:', error);
        return {
          success: false,
          error: error.message || 'Unknown error'
        };
      }
    });

    // Keep file (mark as kept)
    ipcMain.handle('keep-file', async (_, filepath: string): Promise<{ success: boolean; error?: string }> => {
      try {
        this.db.updateFileStatus(filepath, 'kept');
        this.queueIndex++;
        
        return {
          success: true
        };
      } catch (error: any) {
        console.error('Error keeping file:', error);
        return {
          success: false,
          error: error.message || 'Unknown error'
        };
      }
    });

    // Get progress stats
    ipcMain.handle('get-stats', async () => {
      try {
        return this.db.getStats();
      } catch (error: any) {
        console.error('Error getting stats:', error);
        return { total: 0, pending: 0, kept: 0, rejected: 0 };
      }
    });

    // Initialize scanning
    ipcMain.handle('initialize-scan', async () => {
      try {
        const config = this.config.getConfig();
        console.log('Starting scan with paths:', config.scanPaths);
        console.log('Scan paths count:', config.scanPaths.length);
        
        this.queue = await this.scanner.buildQueue();
        this.queueIndex = 0;
        
        console.log('Scan complete. Files found:', this.queue.length);
        
        return {
          success: true,
          count: this.queue.length
        };
      } catch (error: any) {
        console.error('Error initializing scan:', error);
        return {
          success: false,
          error: error.message || 'Unknown error',
          count: 0
        };
      }
    });

    // Get configuration
    ipcMain.handle('get-config', async (): Promise<AppConfig> => {
      return this.config.getConfig();
    });

    // Update configuration
    ipcMain.handle('update-config', async (_, updates: Partial<AppConfig>) => {
      try {
        this.config.updateConfig(updates);
        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    });

    // Select directory dialog
    ipcMain.handle('select-directory', async () => {
      const result = await dialog.showOpenDialog({
        properties: ['openDirectory']
      });
      
      if (!result.canceled && result.filePaths.length > 0) {
        return result.filePaths[0];
      }
      
      return null;
    });

    // Get rejected files
    ipcMain.handle('get-rejected-files', async () => {
      try {
        return this.db.getRejectedFiles();
      } catch (error: any) {
        console.error('Error getting rejected files:', error);
        return [];
      }
    });

    // Restore file
    ipcMain.handle('restore-file', async (_, originalPath: string, deletedPath: string) => {
      try {
        return await this.fileOps.restoreFile(originalPath, deletedPath);
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Unknown error'
        };
      }
    });

    // Permanently delete file
    ipcMain.handle('permanently-delete', async (_, deletedPath: string) => {
      try {
        return await this.fileOps.permanentlyDelete(deletedPath);
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Unknown error'
        };
      }
    });

    // Read file content as text (for TXT files)
    ipcMain.handle('read-file-text', async (_, filepath: string): Promise<{ success: boolean; content?: string; error?: string }> => {
      try {
        if (!fs.existsSync(filepath)) {
          return { success: false, error: 'File not found' };
        }
        const content = fs.readFileSync(filepath, 'utf-8');
        return { success: true, content };
      } catch (error: any) {
        console.error('Error reading file text:', error);
        return {
          success: false,
          error: error.message || 'Unknown error'
        };
      }
    });

    // Read file content as array buffer (for binary files like DOCX)
    ipcMain.handle('read-file-binary', async (_, filepath: string): Promise<{ success: boolean; data?: number[]; error?: string }> => {
      try {
        if (!fs.existsSync(filepath)) {
          return { success: false, error: 'File not found' };
        }
        const buffer = fs.readFileSync(filepath);
        // Convert Buffer to array of numbers (Uint8Array-like)
        const data = Array.from(buffer);
        return { success: true, data };
      } catch (error: any) {
        console.error('Error reading file binary:', error);
        return {
          success: false,
          error: error.message || 'Unknown error'
        };
      }
    });
  }

  private async getNextFileRecursive(): Promise<IPCFile | null> {
    if (this.queueIndex >= this.queue.length) {
      const nextFile = await this.scanner.getNextPendingFile();
      if (!nextFile) {
        return null;
      }
      this.queue = [nextFile];
      this.queueIndex = 0;
    }

    if (this.queueIndex < this.queue.length) {
      const file = this.queue[this.queueIndex];
      
      if (!fs.existsSync(file.filepath)) {
        this.db.updateFileStatus(file.filepath, 'missing');
        this.queueIndex++;
        return this.getNextFileRecursive();
      }

      const dbFile = this.db.getFile(file.filepath);
      
      return {
        filepath: file.filepath,
        media_type: file.media_type as 'image' | 'document' | 'video' | 'audio',
        file_size: file.file_size,
        status: dbFile?.status || 'pending'
      };
    }

    return null;
  }
}

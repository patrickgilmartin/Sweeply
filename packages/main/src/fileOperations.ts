import * as fs from 'fs';
import * as path from 'path';
import { DatabaseManager } from './database';
import { AppConfig } from '@tinder-clear/shared';

export interface MoveResult {
  success: boolean;
  error?: string;
  deletedPath?: string;
}

export class FileOperations {
  private db: DatabaseManager;
  private config: AppConfig;

  constructor(db: DatabaseManager, config: AppConfig) {
    this.db = db;
    this.config = config;
  }

  public async moveToDeletedFolder(filepath: string): Promise<MoveResult> {
    try {
      // Validate file exists
      if (!fs.existsSync(filepath)) {
        return {
          success: false,
          error: 'File does not exist'
        };
      }

      // Ensure deleted folder exists
      const deletedFolder = this.config.deletedFolder;
      if (!deletedFolder) {
        return {
          success: false,
          error: 'Deleted folder not configured'
        };
      }

      if (!fs.existsSync(deletedFolder)) {
        fs.mkdirSync(deletedFolder, { recursive: true });
      }

      // Generate target path with collision handling
      const basename = path.basename(filepath);
      let targetPath = path.join(deletedFolder, basename);
      
      // Handle filename collisions
      if (fs.existsSync(targetPath)) {
        const ext = path.extname(basename);
        const nameWithoutExt = path.basename(basename, ext);
        const timestamp = new Date().toISOString()
          .replace(/:/g, '-')
          .replace(/\..+/, '')
          .replace('T', '_');
        targetPath = path.join(deletedFolder, `${nameWithoutExt}_${timestamp}${ext}`);
      }

      // Move file (atomic operation on same volume)
      fs.renameSync(filepath, targetPath);

      // Record in database
      this.db.addRejectedFile(filepath, targetPath);
      this.db.updateFileStatus(filepath, 'rejected');

      return {
        success: true,
        deletedPath: targetPath
      };
    } catch (error: any) {
      let errorMessage = 'Unknown error';
      
      if (error.code === 'EACCES') {
        errorMessage = 'Permission denied. File may be in use or locked.';
      } else if (error.code === 'ENOENT') {
        errorMessage = 'File or directory not found.';
      } else if (error.code === 'ENOSPC') {
        errorMessage = 'Insufficient disk space.';
      } else if (error.code === 'EBUSY') {
        errorMessage = 'File is currently in use by another process.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  public async restoreFile(originalPath: string, deletedPath: string): Promise<MoveResult> {
    try {
      // Validate deleted file exists
      if (!fs.existsSync(deletedPath)) {
        return {
          success: false,
          error: 'File not found in deleted folder'
        };
      }

      // Ensure target directory exists
      const targetDir = path.dirname(originalPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // Check if original location is occupied
      if (fs.existsSync(originalPath)) {
        const ext = path.extname(originalPath);
        const nameWithoutExt = path.basename(originalPath, ext);
        const timestamp = new Date().toISOString()
          .replace(/:/g, '-')
          .replace(/\..+/, '')
          .replace('T', '_');
        const newPath = path.join(targetDir, `${nameWithoutExt}_restored_${timestamp}${ext}`);
        
        fs.renameSync(deletedPath, newPath);
        
        return {
          success: true,
          deletedPath: newPath
        };
      }

      // Move file back to original location
      fs.renameSync(deletedPath, originalPath);

      // Update database
      this.db.updateFileStatus(originalPath, 'pending');

      return {
        success: true,
        deletedPath: originalPath
      };
    } catch (error: any) {
      let errorMessage = 'Unknown error';
      
      if (error.code === 'EACCES') {
        errorMessage = 'Permission denied.';
      } else if (error.code === 'ENOENT') {
        errorMessage = 'File or directory not found.';
      } else if (error.code === 'ENOSPC') {
        errorMessage = 'Insufficient disk space.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  public async permanentlyDelete(deletedPath: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!fs.existsSync(deletedPath)) {
        return {
          success: false,
          error: 'File does not exist'
        };
      }

      fs.unlinkSync(deletedPath);
      
      return {
        success: true
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to delete file'
      };
    }
  }
}

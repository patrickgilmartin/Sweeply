/**
 * File Operations for Web
 * Handles file operations using File System Access API
 */

import { DatabaseManager, databaseManager } from '../db/indexedDB';
import { moveFile, createDirectory } from '../utils/fileSystemAccess';

export interface MoveResult {
  success: boolean;
  error?: string;
  deletedPath?: string;
}

export class FileOperations {
  private deletedFolderName: string = 'Media_Cleanup_Deleted';
  private dbManager: DatabaseManager;

  constructor(dbManager?: DatabaseManager) {
    // Allow injecting a database manager instance for testing
    this.dbManager = dbManager || databaseManager;
  }

  /**
   * Move file to deleted folder using File System Access API
   */
  async moveToDeletedFolder(
    fileHandle: FileSystemFileHandle,
    parentDirHandle: FileSystemDirectoryHandle,
    filepath: string
  ): Promise<MoveResult> {
    try {
      // Get or create deleted folder
      let deletedDirHandle: FileSystemDirectoryHandle;
      try {
        deletedDirHandle = await parentDirHandle.getDirectoryHandle(this.deletedFolderName, { create: true });
      } catch (error: any) {
        // If getDirectoryHandle fails, try creating it
        deletedDirHandle = await createDirectory(parentDirHandle, this.deletedFolderName);
      }

      // Generate target filename
      const fileName = fileHandle.name;
      let targetFileName = fileName;

      // Check for filename collisions
      try {
        await deletedDirHandle.getFileHandle(targetFileName);
        // File exists, append timestamp
        const ext = fileName.substring(fileName.lastIndexOf('.'));
        const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
        const timestamp = new Date().toISOString()
          .replace(/:/g, '-')
          .replace(/\..+/, '')
          .replace('T', '_');
        targetFileName = `${nameWithoutExt}_${timestamp}${ext}`;
      } catch (error) {
        // File doesn't exist, use original name
      }

      // Move file to deleted folder
      const moved = await moveFile(fileHandle, deletedDirHandle, targetFileName);

      if (moved) {
        const deletedPath = `${this.deletedFolderName}/${targetFileName}`;

        // Record in database
        await this.dbManager.addRejectedFile(filepath, deletedPath);
        await this.dbManager.updateFileStatus(filepath, 'rejected');

        return {
          success: true,
          deletedPath,
        };
      } else {
        return {
          success: false,
          error: 'Failed to move file',
        };
      }
    } catch (error: any) {
      console.error('Error moving file to deleted folder:', error);
      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    }
  }

  /**
   * Export rejected files list (for browsers without File System Access API)
   */
  async exportRejectedFiles(): Promise<void> {
    try {
      const rejectedFiles = await this.dbManager.getRejectedFiles();

      const content = rejectedFiles
        .map((file) => `${file.original_path} -> ${file.deleted_path}`)
        .join('\n');

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'rejected_files.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Error exporting rejected files:', error);
      throw error;
    }
  }

  /**
   * Keep file (mark as kept in database)
   */
  async keepFile(filepath: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.dbManager.updateFileStatus(filepath, 'kept');
      return { success: true };
    } catch (error: any) {
      console.error('Error keeping file:', error);
      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    }
  }

  /**
   * Restore file (move back from deleted folder)
   * Note: This is limited in web context - requires access to deleted folder
   */
  async restoreFile(
    originalPath: string,
    deletedPath: string,
    deletedDirHandle: FileSystemDirectoryHandle,
    originalDirHandle: FileSystemDirectoryHandle
  ): Promise<MoveResult> {
    try {
      const fileName = deletedPath.split('/').pop() || deletedPath;
      const deletedFileHandle = await deletedDirHandle.getFileHandle(fileName);

      // Move file back to original location
      const originalFileName = originalPath.split('/').pop() || originalPath;
      const moved = await moveFile(deletedFileHandle, originalDirHandle, originalFileName);

      if (moved) {
        // Update database
        await this.dbManager.updateFileStatus(originalPath, 'pending');

        return {
          success: true,
          deletedPath: originalPath,
        };
      } else {
        return {
          success: false,
          error: 'Failed to restore file',
        };
      }
    } catch (error: any) {
      console.error('Error restoring file:', error);
      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    }
  }
}

/**
 * File Scanner for Web
 * Scans directories using File System Access API
 */

import { getAllExtensions, getMediaTypeFromExtension, DEFAULT_CONFIG } from '@tinder-clear/shared';
import { DatabaseManager, databaseManager } from '../db/indexedDB';
import { getAllDirectoryFiles, scanDirectory } from '../utils/fileSystemAccess';

export interface ScannedFile {
  filepath: string;
  media_type: 'image' | 'document' | 'video' | 'audio';
  file_size: number;
  fileObject: File;
  fileHandle?: FileSystemFileHandle;
}

export class FileScanner {
  private extensions: string[];
  private dbManager: DatabaseManager;

  constructor(dbManager?: DatabaseManager) {
    // Allow injecting a database manager instance for testing
    this.dbManager = dbManager || databaseManager;
    this.extensions = getAllExtensions();
  }

  /**
   * Scan a directory using File System Access API
   */
  async scanDirectory(
    dirHandle: FileSystemDirectoryHandle,
    options: {
      excludeHidden?: boolean;
      maxDepth?: number;
    } = {}
  ): Promise<ScannedFile[]> {
    const { excludeHidden = true, maxDepth = Infinity } = options;

    const scannedFiles: ScannedFile[] = [];

    try {
      for await (const entry of scanDirectory(dirHandle, {
        maxDepth,
        extensions: this.extensions,
        excludeHidden,
      })) {
        const { file, path, handle } = entry;

        // Get media type from extension
        const ext = this.getExtensionFromFileName(path);
        const mediaType = getMediaTypeFromExtension(ext);

        if (!mediaType) {
          continue;
        }

        // Apply file size filters (from DEFAULT_CONFIG)
        const minSize = DEFAULT_CONFIG.filters.minSize || 0;
        const maxSize = DEFAULT_CONFIG.filters.maxSize;

        if (file.size < minSize) {
          continue;
        }

        if (maxSize && file.size > maxSize) {
          continue;
        }

        scannedFiles.push({
          filepath: path,
          media_type: mediaType,
          file_size: file.size,
          fileObject: file,
          fileHandle: handle,
        });
      }
    } catch (error) {
      console.error('Error scanning directory:', error);
      throw error;
    }

    return scannedFiles;
  }

  /**
   * Filter out already-reviewed files and build queue
   */
  async buildQueue(scannedFiles: ScannedFile[]): Promise<ScannedFile[]> {
    // Filter out already-reviewed files
    const pending: ScannedFile[] = [];

    for (const file of scannedFiles) {
      const isReviewed = await this.dbManager.isFileReviewed(file.filepath);
      if (!isReviewed) {
        pending.push(file);
      }
    }

    // Add new files to database
    const filesToAdd = pending.map((file) => ({
      filepath: file.filepath,
      media_type: file.media_type,
      status: 'pending' as const,
      file_size: file.file_size,
    }));

    if (filesToAdd.length > 0) {
      await this.dbManager.addFiles(filesToAdd);
    }

    // Shuffle the queue for variety
    return this.shuffle(pending);
  }

  /**
   * Get next pending file from database
   */
  async getNextPendingFile(): Promise<ScannedFile | null> {
    const pendingFiles = await this.dbManager.getPendingFiles();

    if (pendingFiles.length === 0) {
      return null;
    }

    // Return first pending file
    // Note: In web context, we need to get the File object from the directory handle
    // This is a simplified version - in practice, you'd need to track the directory handle
    // and retrieve the file object when needed
    const file = pendingFiles[0];
    return {
      filepath: file.filepath,
      media_type: file.media_type,
      file_size: file.file_size || 0,
      fileObject: null as any, // Will need to be loaded from directory handle
    };
  }

  /**
   * Get extension from file name
   */
  private getExtensionFromFileName(fileName: string): string {
    const lastDot = fileName.lastIndexOf('.');
    if (lastDot === -1) return '';
    return fileName.substring(lastDot).toLowerCase();
  }

  /**
   * Shuffle array
   */
  private shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

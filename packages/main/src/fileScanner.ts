import fg from 'fast-glob';
import * as fs from 'fs';
import * as path from 'path';
import { AppConfig } from '@tinder-clear/shared';
import { getMediaTypeFromExtension, getAllExtensions } from '@tinder-clear/shared';
import { DatabaseManager } from './database';

export class FileScanner {
  private db: DatabaseManager;
  private config: AppConfig;

  constructor(db: DatabaseManager, config: AppConfig) {
    this.db = db;
    this.config = config;
  }

  public async scanPaths(): Promise<string[]> {
    const allFiles: string[] = [];
    const extensions = getAllExtensions();

    console.log('FileScanner: Starting scan...');
    console.log('Scan paths:', this.config.scanPaths);
    console.log('Extensions to scan:', extensions.slice(0, 10), '...');

    for (const scanPath of this.config.scanPaths) {
      if (!fs.existsSync(scanPath)) {
        console.warn(`Path does not exist: ${scanPath}`);
        continue;
      }

      try {
        console.log(`Scanning path: ${scanPath}`);
        // Build glob pattern for all extensions
        const patterns = extensions.map(ext => `**/*${ext}`);
        
        const files = await fg(patterns, {
          cwd: scanPath,
          absolute: true,
          onlyFiles: true,
          ignore: this.config.filters.excludeHidden 
            ? ['**/.*/**', '**/node_modules/**'] 
            : ['**/node_modules/**']
        });

        console.log(`Found ${files.length} files in ${scanPath}`);
        allFiles.push(...files);
      } catch (error) {
        console.error(`Error scanning path ${scanPath}:`, error);
      }
    }

    console.log(`Total files found: ${allFiles.length}`);
    return allFiles;
  }

  public filterFiles(files: string[]): Array<{ filepath: string; media_type: string; file_size: number }> {
    const filtered: Array<{ filepath: string; media_type: string; file_size: number }> = [];

    for (const filepath of files) {
      try {
        // Check if file exists
        if (!fs.existsSync(filepath)) {
          continue;
        }

        // Get file stats
        const stats = fs.statSync(filepath);
        
        // Check if it's a file (not directory)
        if (!stats.isFile()) {
          continue;
        }

        // Check file size filters
        if (this.config.filters.minSize && stats.size < this.config.filters.minSize) {
          continue;
        }

        if (this.config.filters.maxSize && stats.size > this.config.filters.maxSize) {
          continue;
        }

        // Check if file is hidden or system file
        if (this.config.filters.excludeHidden || this.config.filters.excludeSystem) {
          const basename = path.basename(filepath);
          if (this.config.filters.excludeHidden && basename.startsWith('.')) {
            continue;
          }
          // Additional system file checks could go here
        }

        // Get media type from extension
        const ext = path.extname(filepath).toLowerCase();
        const mediaType = getMediaTypeFromExtension(ext);

        if (!mediaType) {
          continue;
        }

        // Check if file type is enabled
        const enabledExtensions = [
          ...this.config.fileTypes.images,
          ...this.config.fileTypes.documents,
          ...this.config.fileTypes.videos,
          ...this.config.fileTypes.audio
        ];

        if (!enabledExtensions.includes(ext)) {
          continue;
        }

        filtered.push({
          filepath: path.normalize(filepath),
          media_type: mediaType,
          file_size: stats.size
        });
      } catch (error) {
        console.error(`Error processing file ${filepath}:`, error);
        continue;
      }
    }

    return filtered;
  }

  public async buildQueue(): Promise<Array<{ filepath: string; media_type: string; file_size: number }>> {
    // Scan all paths
    const allFiles = await this.scanPaths();
    console.log(`buildQueue: Found ${allFiles.length} total files after scanning`);

    // Filter files by extension, size, etc.
    const filtered = this.filterFiles(allFiles);
    console.log(`buildQueue: ${filtered.length} files after filtering`);

    // Filter out already-reviewed files
    const pending = filtered.filter(file => !this.db.isFileReviewed(file.filepath));
    console.log(`buildQueue: ${pending.length} pending files (not yet reviewed)`);

    // Add new files to database
    const filesToAdd = pending.map(file => ({
      filepath: file.filepath,
      media_type: file.media_type as 'image' | 'document' | 'video' | 'audio',
      status: 'pending' as const,
      file_size: file.file_size
    }));

    if (filesToAdd.length > 0) {
      console.log(`buildQueue: Adding ${filesToAdd.length} new files to database`);
      this.db.addFiles(filesToAdd);
    } else {
      console.log('buildQueue: No new files to add to database');
    }

    // Shuffle the queue for variety
    const shuffled = this.shuffle(pending);
    console.log(`buildQueue: Returning ${shuffled.length} shuffled files`);
    return shuffled;
  }

  private shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  public async getNextPendingFile(): Promise<{ filepath: string; media_type: string; file_size: number } | null> {
    const pendingFiles = this.db.getPendingFiles();
    
    if (pendingFiles.length === 0) {
      return null;
    }

    // Return first pending file
    const file = pendingFiles[0];
    return {
      filepath: file.filepath,
      media_type: file.media_type,
      file_size: file.file_size || 0
    };
  }
}

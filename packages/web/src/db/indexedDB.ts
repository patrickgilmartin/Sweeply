import { db, FileRecord, RejectedFileRecord, createTestDB, MediaCleanupDB } from './schema';
import { MediaFile, RejectedFile, FileStatus, MediaType } from '@tinder-clear/shared';

export class DatabaseManager {
  private dbInstance: MediaCleanupDB;

  constructor(dbInstance?: MediaCleanupDB) {
    // Allow injecting a test database instance
    this.dbInstance = dbInstance || db;
  }
  /**
   * Add a single file to the database
   */
  async addFile(file: Omit<MediaFile, 'id' | 'created_at'>): Promise<number> {
    try {
      // Check if file already exists
      const existing = await this.dbInstance.files.where('filepath').equals(file.filepath).first();
      if (existing) {
        return existing.id || 0;
      }

      const id = await this.dbInstance.files.add({
        filepath: file.filepath,
        media_type: file.media_type,
        status: file.status || 'pending',
        file_size: file.file_size,
        file_hash: file.file_hash,
        reviewed_at: file.reviewed_at ? new Date(file.reviewed_at) : undefined,
        created_at: new Date(),
      } as FileRecord);

      return id as number;
    } catch (error) {
      console.error('Error adding file:', error);
      throw error;
    }
  }

  /**
   * Add multiple files to the database in a transaction
   */
  async addFiles(files: Array<Omit<MediaFile, 'id' | 'created_at'>>): Promise<void> {
    try {
      await this.dbInstance.transaction('rw', this.dbInstance.files, async () => {
        for (const file of files) {
          const existing = await this.dbInstance.files.where('filepath').equals(file.filepath).first();
          if (!existing) {
            await this.dbInstance.files.add({
              filepath: file.filepath,
              media_type: file.media_type,
              status: file.status || 'pending',
              file_size: file.file_size,
              file_hash: file.file_hash,
              reviewed_at: file.reviewed_at ? new Date(file.reviewed_at) : undefined,
              created_at: new Date(),
            } as FileRecord);
          }
        }
      });
    } catch (error) {
      console.error('Error adding files:', error);
      throw error;
    }
  }

  /**
   * Get a file by filepath
   */
  async getFile(filepath: string): Promise<MediaFile | undefined> {
    try {
      const record = await this.dbInstance.files.where('filepath').equals(filepath).first();
      if (!record) return undefined;

      return {
        id: record.id,
        filepath: record.filepath,
        media_type: record.media_type,
        status: record.status,
        reviewed_at: record.reviewed_at?.toISOString(),
        file_size: record.file_size,
        file_hash: record.file_hash,
        created_at: record.created_at?.toISOString(),
      };
    } catch (error) {
      console.error('Error getting file:', error);
      return undefined;
    }
  }

  /**
   * Update file status
   */
  async updateFileStatus(filepath: string, status: FileStatus): Promise<void> {
    try {
      await this.dbInstance.files.where('filepath').equals(filepath).modify({
        status,
        reviewed_at: new Date(),
      });
    } catch (error) {
      console.error('Error updating file status:', error);
      throw error;
    }
  }

  /**
   * Get all pending files
   */
  async getPendingFiles(): Promise<MediaFile[]> {
    try {
      const records = await this.dbInstance.files
        .where('status')
        .equals('pending')
        .sortBy('created_at');

      return records.map((record) => ({
        id: record.id,
        filepath: record.filepath,
        media_type: record.media_type,
        status: record.status,
        reviewed_at: record.reviewed_at?.toISOString(),
        file_size: record.file_size,
        file_hash: record.file_hash,
        created_at: record.created_at?.toISOString(),
      }));
    } catch (error) {
      console.error('Error getting pending files:', error);
      return [];
    }
  }

  /**
   * Check if a file has been reviewed
   */
  async isFileReviewed(filepath: string): Promise<boolean> {
    try {
      const file = await this.dbInstance.files.where('filepath').equals(filepath).first();
      return file !== undefined && file.status !== 'pending';
    } catch (error) {
      console.error('Error checking file review status:', error);
      return false;
    }
  }

  /**
   * Add a rejected file record
   */
  async addRejectedFile(originalPath: string, deletedPath: string): Promise<number> {
    try {
      const id = await this.dbInstance.rejectedFiles.add({
        original_path: originalPath,
        deleted_path: deletedPath,
        rejected_at: new Date(),
      } as RejectedFileRecord);

      return id as number;
    } catch (error) {
      console.error('Error adding rejected file:', error);
      throw error;
    }
  }

  /**
   * Get all rejected files
   */
  async getRejectedFiles(): Promise<RejectedFile[]> {
    try {
      const records = await this.dbInstance.rejectedFiles.orderBy('rejected_at').reverse().toArray();

      return records.map((record) => ({
        id: record.id,
        original_path: record.original_path,
        deleted_path: record.deleted_path,
        rejected_at: record.rejected_at?.toISOString(),
      }));
    } catch (error) {
      console.error('Error getting rejected files:', error);
      return [];
    }
  }

  /**
   * Remove a rejected file record
   */
  async removeRejectedFile(id: number): Promise<void> {
    try {
      await this.dbInstance.rejectedFiles.delete(id);
    } catch (error) {
      console.error('Error removing rejected file:', error);
      throw error;
    }
  }

  /**
   * Get statistics about files
   */
  async getStats(): Promise<{ total: number; pending: number; kept: number; rejected: number }> {
    try {
      const allFiles = await this.dbInstance.files.toArray();
      const total = allFiles.length;
      const pending = allFiles.filter((f) => f.status === 'pending').length;
      const kept = allFiles.filter((f) => f.status === 'kept').length;
      const rejected = allFiles.filter((f) => f.status === 'rejected').length;

      return { total, pending, kept, rejected };
    } catch (error) {
      console.error('Error getting stats:', error);
      return { total: 0, pending: 0, kept: 0, rejected: 0 };
    }
  }

  /**
   * Save queue state
   */
  async saveQueueState(currentIndex: number): Promise<void> {
    try {
      await this.dbInstance.queueState.put({
        id: 1, // Single queue state record
        currentIndex,
        lastUpdated: new Date(),
      });
    } catch (error) {
      console.error('Error saving queue state:', error);
      throw error;
    }
  }

  /**
   * Get queue state
   */
  async getQueueState(): Promise<number> {
    try {
      const state = await this.dbInstance.queueState.get(1);
      return state?.currentIndex || 0;
    } catch (error) {
      console.error('Error getting queue state:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const databaseManager = new DatabaseManager();

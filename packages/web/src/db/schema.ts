import Dexie, { Table } from 'dexie';
import { MediaFile, RejectedFile, FileStatus, MediaType } from '@tinder-clear/shared';

export interface FileRecord {
  id?: number;
  filepath: string;
  media_type: MediaType;
  status: FileStatus;
  reviewed_at?: Date;
  file_size?: number;
  file_hash?: string;
  created_at?: Date;
  synced_at?: Date; // For cloud sync
}

export interface RejectedFileRecord {
  id?: number;
  original_path: string;
  deleted_path: string;
  rejected_at?: Date;
  synced_at?: Date; // For cloud sync
}

export interface UserPreferences {
  id?: number;
  key: string;
  value: string;
  updated_at?: Date;
}

class MediaCleanupDB extends Dexie {
  files!: Table<FileRecord>;
  rejectedFiles!: Table<RejectedFileRecord>;
  preferences!: Table<UserPreferences>;
  queueState!: Table<{ id: number; currentIndex: number; lastUpdated: Date }>;

  constructor(name: string = 'MediaCleanupDB') {
    super(name);
    
    this.version(1).stores({
      files: '++id, filepath, media_type, status, reviewed_at, created_at, synced_at',
      rejectedFiles: '++id, original_path, deleted_path, rejected_at, synced_at',
      preferences: '++id, key, updated_at',
      queueState: 'id, currentIndex, lastUpdated'
    });
  }
}

// Export singleton instance for production use
export const db = new MediaCleanupDB();

// Export factory function for testing
export function createTestDB(name: string = 'MediaCleanupDB'): MediaCleanupDB {
  return new MediaCleanupDB(name);
}

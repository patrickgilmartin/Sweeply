/**
 * Sync service
 * Handles synchronization of file metadata with cloud database
 */

import { databaseManager } from '../db/indexedDB';
import { getAuthHeaders } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface SyncResult {
  success: boolean;
  synced: number;
  conflicts?: number;
  error?: string;
}

export interface FileMetadata {
  id?: number;
  filepath: string;
  media_type: 'image' | 'document' | 'video' | 'audio';
  status: 'pending' | 'kept' | 'rejected';
  file_size?: number;
  reviewed_at?: string;
  created_at?: string;
  synced_at?: string;
}

/**
 * Upload file metadata to cloud
 */
export async function uploadFileMetadata(files: FileMetadata[]): Promise<SyncResult> {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    };

    const response = await fetch(`${API_BASE_URL}/sync/upload`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ files }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Sync failed' }));
      throw new Error(error.message || 'Sync failed');
    }

    const result = await response.json();
    return {
      success: true,
      synced: result.synced || files.length,
      conflicts: result.conflicts || 0,
    };
  } catch (error: any) {
    console.error('Error uploading file metadata:', error);
    return {
      success: false,
      synced: 0,
      error: error.message || 'Sync failed',
    };
  }
}

/**
 * Download file metadata from cloud
 */
export async function downloadFileMetadata(lastSync?: string): Promise<FileMetadata[]> {
  try {
    const headers = {
      ...getAuthHeaders(),
    };

    const url = new URL(`${API_BASE_URL}/sync/download`);
    if (lastSync) {
      url.searchParams.append('lastSync', lastSync);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Download failed' }));
      throw new Error(error.message || 'Download failed');
    }

    const result = await response.json();
    return result.files || [];
  } catch (error: any) {
    console.error('Error downloading file metadata:', error);
    return [];
  }
}

/**
 * Sync all files with cloud
 */
export async function syncAll(): Promise<SyncResult> {
  try {
    // Get all files from IndexedDB
    const allFiles = await databaseManager.getPendingFiles();
    const keptFiles = await databaseManager.getStats();
    
    // Get all files (need to implement getAllFiles method or query by status)
    // For now, we'll sync pending files
    const filesToSync: FileMetadata[] = allFiles.map((file) => ({
      filepath: file.filepath,
      media_type: file.media_type,
      status: file.status,
      file_size: file.file_size,
      reviewed_at: file.reviewed_at,
      created_at: file.created_at,
    }));

    // Upload to cloud
    const uploadResult = await uploadFileMetadata(filesToSync);

    if (uploadResult.success) {
      // Mark files as synced
      // This would be done in the database layer
      // await databaseManager.markAsSynced(filepath);
    }

    return uploadResult;
  } catch (error: any) {
    console.error('Error syncing all files:', error);
    return {
      success: false,
      synced: 0,
      error: error.message || 'Sync failed',
    };
  }
}

/**
 * Sync new or updated files
 */
export async function syncIncremental(): Promise<SyncResult> {
  try {
    // Get last sync timestamp
    const lastSync = localStorage.getItem('lastSync');
    
    // Download updates from cloud
    const cloudFiles = await downloadFileMetadata(lastSync || undefined);

    // Merge with local files (conflict resolution)
    let conflicts = 0;
    for (const cloudFile of cloudFiles) {
      const localFile = await databaseManager.getFile(cloudFile.filepath);
      
      if (localFile) {
        // Check for conflicts
        const localUpdated = localFile.reviewed_at ? new Date(localFile.reviewed_at).getTime() : 0;
        const cloudUpdated = cloudFile.reviewed_at ? new Date(cloudFile.reviewed_at).getTime() : 0;
        
        if (localUpdated > cloudUpdated) {
          // Local is newer, keep local
          conflicts++;
        } else if (cloudUpdated > localUpdated) {
          // Cloud is newer, update local
          await databaseManager.updateFileStatus(cloudFile.filepath, cloudFile.status);
        }
      } else {
        // New file from cloud, add to local
        await databaseManager.addFile({
          filepath: cloudFile.filepath,
          media_type: cloudFile.media_type,
          status: cloudFile.status,
          file_size: cloudFile.file_size,
          reviewed_at: cloudFile.reviewed_at,
        });
      }
    }

    // Update last sync timestamp
    localStorage.setItem('lastSync', new Date().toISOString());

    // Upload local changes
    const uploadResult = await syncAll();

    return {
      success: uploadResult.success,
      synced: uploadResult.synced,
      conflicts,
    };
  } catch (error: any) {
    console.error('Error syncing incrementally:', error);
    return {
      success: false,
      synced: 0,
      error: error.message || 'Sync failed',
    };
  }
}

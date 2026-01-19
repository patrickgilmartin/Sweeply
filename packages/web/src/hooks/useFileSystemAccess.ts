import { useState, useCallback, useEffect } from 'react';
import {
  requestDirectoryAccess,
  isFileSystemAccessSupported,
  storeDirectoryHandle,
  getStoredDirectoryHandle,
  checkPermission,
  requestPermission,
  type DirectoryHandle,
} from '../utils/fileSystemAccess';
import { detectBrowser } from '../utils/browserDetection';

export interface UseFileSystemAccessResult {
  directoryHandle: FileSystemDirectoryHandle | null;
  isSupported: boolean;
  browserInfo: ReturnType<typeof detectBrowser>;
  isRequesting: boolean;
  error: Error | null;
  requestAccess: () => Promise<boolean>;
  clearAccess: () => Promise<void>;
  hasWritePermission: boolean;
  checkWritePermission: () => Promise<void>;
}

const STORAGE_KEY = 'media-cleanup-directory-handle';

export function useFileSystemAccess(): UseFileSystemAccessResult {
  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasWritePermission, setHasWritePermission] = useState(false);
  const isSupported = isFileSystemAccessSupported();
  const browserInfo = detectBrowser();

  // Load stored handle on mount
  useEffect(() => {
    if (isSupported) {
      getStoredDirectoryHandle(STORAGE_KEY).then((handle) => {
        if (handle) {
          setDirectoryHandle(handle);
          checkPermission(handle, 'readwrite').then(setHasWritePermission);
        }
      });
    }
  }, [isSupported]);

  const requestAccess = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError(new Error('File System Access API is not supported in this browser'));
      return false;
    }

    setIsRequesting(true);
    setError(null);

    try {
      const handle = await requestDirectoryAccess();
      if (handle) {
        setDirectoryHandle(handle);

        // Check write permission
        const hasPermission = await checkPermission(handle, 'readwrite');
        setHasWritePermission(hasPermission);

        if (!hasPermission) {
          // Request write permission
          const granted = await requestPermission(handle, 'readwrite');
          setHasWritePermission(granted);
        }

        // Store handle for persistence
        await storeDirectoryHandle(handle, STORAGE_KEY);

        return true;
      }
      return false;
    } catch (err: any) {
      setError(err);
      return false;
    } finally {
      setIsRequesting(false);
    }
  }, [isSupported]);

  const clearAccess = useCallback(async (): Promise<void> => {
    setDirectoryHandle(null);
    setHasWritePermission(false);
    setError(null);

    // Remove from storage
    try {
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open('FileSystemHandles', 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = () => {
          // Handle upgrade if needed
        };
      });

      const tx = db.transaction('handles', 'readwrite');
      await tx.store.delete(STORAGE_KEY);
      await tx.done;
    } catch (err) {
      console.error('Error clearing stored handle:', err);
    }
  }, []);

  const checkWritePermission = useCallback(async (): Promise<void> => {
    if (directoryHandle) {
      const hasPermission = await checkPermission(directoryHandle, 'readwrite');
      setHasWritePermission(hasPermission);
    }
  }, [directoryHandle]);

  return {
    directoryHandle,
    isSupported,
    browserInfo,
    isRequesting,
    error,
    requestAccess,
    clearAccess,
    hasWritePermission,
    checkWritePermission,
  };
}

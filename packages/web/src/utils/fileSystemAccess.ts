/**
 * File System Access API utilities
 * Provides browser-native file system access for Chrome/Edge
 * with fallback support for other browsers
 */

export interface DirectoryHandle extends FileSystemDirectoryHandle {
  values(): AsyncIterableIterator<FileSystemHandle>;
  keys(): AsyncIterableIterator<string>;
  entries(): AsyncIterableIterator<[string, FileSystemHandle]>;
  getDirectoryHandle(name: string, options?: FileSystemGetDirectoryOptions): Promise<FileSystemDirectoryHandle>;
  getFileHandle(name: string, options?: FileSystemGetFileOptions): Promise<FileSystemFileHandle>;
  removeEntry(name: string, options?: FileSystemRemoveOptions): Promise<void>;
  resolve(possibleDescendant: FileSystemHandle): Promise<string[] | null>;
}

/**
 * Check if File System Access API is supported
 */
export function isFileSystemAccessSupported(): boolean {
  return 'showDirectoryPicker' in window && 'showOpenFilePicker' in window;
}

/**
 * Request directory access from user
 * Returns a DirectoryHandle if permission is granted
 */
export async function requestDirectoryAccess(): Promise<FileSystemDirectoryHandle | null> {
  if (!isFileSystemAccessSupported()) {
    console.warn('File System Access API is not supported in this browser');
    return null;
  }

  try {
    const handle = await (window as any).showDirectoryPicker({
      mode: 'readwrite',
    });
    return handle;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log('User cancelled directory selection');
      return null;
    }
    console.error('Error requesting directory access:', error);
    throw error;
  }
}

/**
 * Request file access from user (for fallback browsers)
 * Returns File objects
 */
export async function requestFileAccess(
  options: {
    multiple?: boolean;
    accept?: string;
    directory?: boolean;
  } = {}
): Promise<File[] | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = options.multiple || false;
    if (options.accept) {
      input.accept = options.accept;
    }
    if (options.directory && 'webkitdirectory' in input) {
      (input as any).webkitdirectory = true;
    }

    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        resolve(Array.from(target.files));
      } else {
        resolve(null);
      }
    };

    input.oncancel = () => {
      resolve(null);
    };

    input.click();
  });
}

/**
 * Recursively scan a directory using File System Access API
 */
export async function* scanDirectory(
  dirHandle: FileSystemDirectoryHandle,
  options: {
    maxDepth?: number;
    currentDepth?: number;
    extensions?: string[];
    excludeHidden?: boolean;
  } = {}
): AsyncGenerator<{ file: File; path: string; handle: FileSystemFileHandle }> {
  const {
    maxDepth = Infinity,
    currentDepth = 0,
    extensions = [],
    excludeHidden = true,
  } = options;

  if (currentDepth >= maxDepth) {
    return;
  }

  try {
    for await (const [name, handle] of dirHandle.entries()) {
      // Skip hidden files/folders if option is enabled
      if (excludeHidden && name.startsWith('.')) {
        continue;
      }

      if (handle.kind === 'file') {
        const file = await handle.getFile();
        const extension = name.substring(name.lastIndexOf('.')).toLowerCase();

        // Filter by extensions if specified
        if (extensions.length > 0 && !extensions.includes(extension)) {
          continue;
        }

        yield {
          file,
          path: name,
          handle: handle as FileSystemFileHandle,
        };
      } else if (handle.kind === 'directory') {
        // Recursively scan subdirectories
        yield* scanDirectory(handle as FileSystemDirectoryHandle, {
          maxDepth,
          currentDepth: currentDepth + 1,
          extensions,
          excludeHidden,
        });
      }
    }
  } catch (error) {
    console.error('Error scanning directory:', error);
  }
}

/**
 * Get all files from a directory (non-recursive by default)
 */
export async function getDirectoryFiles(
  dirHandle: FileSystemDirectoryHandle,
  options: {
    extensions?: string[];
    excludeHidden?: boolean;
  } = {}
): Promise<{ file: File; path: string; handle: FileSystemFileHandle }[]> {
  const files: { file: File; path: string; handle: FileSystemFileHandle }[] = [];

  for await (const entry of scanDirectory(dirHandle, {
    maxDepth: 0, // Only current directory
    ...options,
  })) {
    files.push(entry);
  }

  return files;
}

/**
 * Get all files recursively from a directory
 */
export async function getAllDirectoryFiles(
  dirHandle: FileSystemDirectoryHandle,
  options: {
    extensions?: string[];
    excludeHidden?: boolean;
    maxDepth?: number;
  } = {}
): Promise<{ file: File; path: string; handle: FileSystemFileHandle }[]> {
  const files: { file: File; path: string; handle: FileSystemFileHandle }[] = [];

  for await (const entry of scanDirectory(dirHandle, options)) {
    files.push(entry);
  }

  return files;
}

/**
 * Move a file within the same directory handle
 * Note: This only works if the file and destination are within the same directory handle
 */
export async function moveFile(
  sourceHandle: FileSystemFileHandle,
  destinationDirHandle: FileSystemDirectoryHandle,
  newName: string
): Promise<boolean> {
  try {
    if ('move' in sourceHandle) {
      // Use the move API if available (Chrome 102+)
      await (sourceHandle as any).move(destinationDirHandle, newName);
      return true;
    } else {
      // Fallback: copy and remove
      const file = await sourceHandle.getFile();
      const newHandle = await destinationDirHandle.getFileHandle(newName, { create: true });
      const writable = await newHandle.createWritable();
      await writable.write(file);
      await writable.close();

      // Try to remove source (may require same directory)
      try {
        const parentDir = await getParentDirectory(sourceHandle);
        if (parentDir) {
          await parentDir.removeEntry(await sourceHandle.name);
        }
      } catch (error) {
        console.warn('Could not remove source file:', error);
      }

      return true;
    }
  } catch (error) {
    console.error('Error moving file:', error);
    return false;
  }
}

/**
 * Get the parent directory of a file handle
 * Note: This is a best-effort approach and may not work in all cases
 */
async function getParentDirectory(
  handle: FileSystemFileHandle
): Promise<FileSystemDirectoryHandle | null> {
  // This is a limitation of the File System Access API
  // We need to track parent directories manually
  // For now, return null - this will need to be handled by tracking directory structure
  return null;
}

/**
 * Create a directory within a directory handle
 */
export async function createDirectory(
  dirHandle: FileSystemDirectoryHandle,
  name: string
): Promise<FileSystemDirectoryHandle> {
  return await dirHandle.getDirectoryHandle(name, { create: true });
}

/**
 * Check if a directory handle has permission to write
 */
export async function checkPermission(
  handle: FileSystemDirectoryHandle | FileSystemFileHandle,
  mode: 'read' | 'readwrite' = 'readwrite'
): Promise<boolean> {
  if (!('queryPermission' in handle)) {
    // Permission query not supported
    return true;
  }

  const permissionStatus = await (handle as any).queryPermission({ mode });
  return permissionStatus === 'granted';
}

/**
 * Request permission for a handle
 */
export async function requestPermission(
  handle: FileSystemDirectoryHandle | FileSystemFileHandle,
  mode: 'read' | 'readwrite' = 'readwrite'
): Promise<boolean> {
  if (!('requestPermission' in handle)) {
    // Permission request not supported
    return true;
  }

  try {
    const permissionStatus = await (handle as any).requestPermission({ mode });
    return permissionStatus === 'granted';
  } catch (error) {
    console.error('Error requesting permission:', error);
    return false;
  }
}

/**
 * Store directory handle in IndexedDB for persistence
 */
export async function storeDirectoryHandle(
  handle: FileSystemDirectoryHandle,
  key: string
): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction('handles', 'readwrite');
    await tx.store.put(handle, key);
    await tx.done;
  } catch (error) {
    console.error('Error storing directory handle:', error);
  }
}

/**
 * Retrieve directory handle from IndexedDB
 */
export async function getStoredDirectoryHandle(key: string): Promise<FileSystemDirectoryHandle | null> {
  try {
    const db = await openDB();
    const tx = db.transaction('handles', 'readonly');
    const handle = await tx.store.get(key);
    await tx.done;
    return handle || null;
  } catch (error) {
    console.error('Error retrieving directory handle:', error);
    return null;
  }
}

/**
 * Open IndexedDB for storing handles
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('FileSystemHandles', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('handles')) {
        db.createObjectStore('handles');
      }
    };
  });
}

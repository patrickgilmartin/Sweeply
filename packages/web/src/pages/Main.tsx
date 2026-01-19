import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MediaViewer from '../components/MediaViewer';
import ActionButtons from '../components/ActionButtons';
import { IPCFile } from '@tinder-clear/shared';
import { databaseManager } from '../db/indexedDB';
import { FileScanner, ScannedFile } from '../services/fileScanner';
import { FileOperations } from '../services/fileOperations';
import { useFileSystemAccess } from '../hooks/useFileSystemAccess';
import { isAuthenticated } from '../services/authService';

const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentFile, setCurrentFile] = useState<IPCFile | null>(null);
  const [currentFileObject, setCurrentFileObject] = useState<File | null>(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, kept: 0, rejected: 0 });
  const [scanning, setScanning] = useState(false);
  const [fileMap, setFileMap] = useState<Map<string, ScannedFile>>(new Map());
  const [queueIndex, setQueueIndex] = useState(0);
  const [fileQueue, setFileQueue] = useState<ScannedFile[]>([]);

  const { directoryHandle, requestAccess, isSupported } = useFileSystemAccess();
  const fileScanner = new FileScanner(databaseManager);
  const fileOperations = new FileOperations(databaseManager);

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { replace: true });
      return;
    }

    // Request directory access if not already granted
    if (isSupported && !directoryHandle) {
      requestAccess();
    } else if (directoryHandle) {
      autoStart();
    }
  }, [directoryHandle, isSupported, navigate]);

  // Auto-start scan when directory handle is available
  const autoStart = async () => {
    if (!directoryHandle) return;

    setScanning(true);
    try {
      // Scan directory
      const scannedFiles = await fileScanner.scanDirectory(directoryHandle, {
        excludeHidden: true,
        maxDepth: Infinity,
      });

      // Build queue (filter reviewed files and add to database)
      const queue = await fileScanner.buildQueue(scannedFiles);

      // Store file map for quick lookup
      const map = new Map<string, ScannedFile>();
      for (const file of scannedFiles) {
        map.set(file.filepath, file);
      }
      setFileMap(map);
      setFileQueue(queue);
      setQueueIndex(0);

      // Load stats and first file
      await loadStats();
      loadNextFile();
    } catch (error) {
      console.error('Error auto-starting scan:', error);
    } finally {
      setScanning(false);
    }
  };

  const loadStats = async () => {
    const statsData = await databaseManager.getStats();
    setStats(statsData);
  };

  const loadNextFile = async () => {
    // Try to get file from queue first
    if (queueIndex < fileQueue.length) {
      const scannedFile = fileQueue[queueIndex];
      setCurrentFile({
        filepath: scannedFile.filepath,
        media_type: scannedFile.media_type,
        file_size: scannedFile.file_size,
        status: 'pending',
      });
      setCurrentFileObject(scannedFile.fileObject);
      return;
    }

    // Queue exhausted, try to get from database
    const pendingFiles = await databaseManager.getPendingFiles();
    if (pendingFiles.length === 0) {
      setCurrentFile(null);
      return;
    }

    // Get file object from directory handle
    const dbFile = pendingFiles[0];
    const scannedFile = fileMap.get(dbFile.filepath);

    if (scannedFile) {
      setCurrentFile({
        filepath: scannedFile.filepath,
        media_type: scannedFile.media_type,
        file_size: scannedFile.file_size,
        status: 'pending',
      });
      setCurrentFileObject(scannedFile.fileObject);
    } else {
      // File not in map, try to load from directory handle
      // This is a simplified version - in practice, you'd need to track directory structure
      console.warn('File not found in map:', dbFile.filepath);
      setCurrentFile({
        filepath: dbFile.filepath,
        media_type: dbFile.media_type,
        file_size: dbFile.file_size || 0,
        status: 'pending',
      });
      setCurrentFileObject(null);
    }
  };

  const handleKeep = async () => {
    if (!currentFile) return;

    try {
      const result = await fileOperations.keepFile(currentFile.filepath);
      if (result.success) {
        const nextIndex = queueIndex + 1;
        setQueueIndex(nextIndex);
        await databaseManager.saveQueueState(nextIndex);
        await loadStats();
        loadNextFile();
      }
    } catch (error) {
      console.error('Error keeping file:', error);
    }
  };

  const handleReject = async () => {
    if (!currentFile || !directoryHandle) return;

    try {
      // Find file handle in directory
      const scannedFile = fileMap.get(currentFile.filepath);
      if (!scannedFile || !scannedFile.fileHandle) {
        console.error('File handle not found for:', currentFile.filepath);
        return;
      }

      // Get parent directory handle (simplified - in practice, track parent handles)
      // For now, we'll use the directory handle as parent
      const result = await fileOperations.moveToDeletedFolder(
        scannedFile.fileHandle,
        directoryHandle,
        currentFile.filepath
      );

      if (result.success) {
        const nextIndex = queueIndex + 1;
        setQueueIndex(nextIndex);
        await databaseManager.saveQueueState(nextIndex);
        await loadStats();
        loadNextFile();
      }
    } catch (error) {
      console.error('Error rejecting file:', error);
    }
  };

  if (!isSupported) {
    return (
      <div className="app-container">
        <div className="empty-screen">
          <h1>Browser Not Supported</h1>
          <p>Please use Chrome or Edge for full functionality.</p>
          <p style={{ fontSize: '14px', marginTop: '20px', color: '#888' }}>
            File System Access API is required for this application.
          </p>
        </div>
      </div>
    );
  }

  if (!directoryHandle) {
    return (
      <div className="app-container">
        <div className="empty-screen">
          <h1>Select Directory</h1>
          <p>Please select a directory to scan for media files.</p>
          <button
            onClick={requestAccess}
            style={{
              marginTop: '30px',
              padding: '15px 30px',
              fontSize: '18px',
              fontWeight: '600',
              backgroundColor: '#00ff88',
              color: '#000',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
            }}
          >
            Select Directory
          </button>
        </div>
      </div>
    );
  }

  if (scanning) {
    return (
      <div className="app-container">
        <div className="scanning-screen">
          <h2>Discovering your media...</h2>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!currentFile) {
    return (
      <div className="app-container">
        <div className="empty-screen">
          <h1>All done!</h1>
          <p>No more files to review</p>
          {stats.total > 0 && (
            <div className="stats-summary">
              <p>Kept: {stats.kept} | Rejected: {stats.rejected}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {stats.pending > 0 && (
        <div className="progress-indicator">
          {stats.total - stats.pending} / {stats.total}
        </div>
      )}
      <div className="card-container">
        <MediaViewer file={currentFile} fileObject={currentFileObject} />
      </div>
      <ActionButtons onKeep={handleKeep} onReject={handleReject} />
    </div>
  );
};

export default MainPage;

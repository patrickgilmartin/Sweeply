import React, { useState, useEffect } from 'react';
import MediaViewer from './components/MediaViewer';
import ActionButtons from './components/ActionButtons';
import { IPCFile } from '@tinder-clear/shared';

const App: React.FC = () => {
  const [currentFile, setCurrentFile] = useState<IPCFile | null>(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, kept: 0, rejected: 0 });
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    autoStart();
  }, []);

  const autoStart = async () => {
    if (!window.electronAPI) {
      console.log('electronAPI not available yet');
      setTimeout(autoStart, 500);
      return;
    }
    
    setScanning(true);
    try {
      console.log('Starting auto-scan...');
      
      // Check config first
      const config = await window.electronAPI.getConfig();
      console.log('Current config scan paths:', config.scanPaths);
      
      const result = await window.electronAPI.initializeScan();
      console.log('Scan result:', result);
      if (result.success) {
        console.log(`Scan found ${result.count} files`);
        if (result.count === 0) {
          console.warn('No files found! Check scan paths:', config.scanPaths);
          alert(`No media files found in scan paths:\n${config.scanPaths.join('\n')}\n\nCheck if these folders contain media files.`);
        }
        loadStats();
        loadNextFile();
      } else {
        console.error('Scan failed:', result.error);
        alert(`Scan failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error auto-starting scan:', error);
      alert(`Error: ${error}`);
    } finally {
      setScanning(false);
    }
  };

  const loadStats = async () => {
    if (window.electronAPI) {
      const statsData = await window.electronAPI.getStats();
      setStats(statsData);
    }
  };

  const loadNextFile = async () => {
    if (!window.electronAPI) return;
    try {
      const file = await window.electronAPI.getNextFile();
      console.log('Next file:', file);
      if (file) {
        setCurrentFile(file);
      } else {
        console.log('No more files available');
        // Check stats to see if we have pending files
        const stats = await window.electronAPI.getStats();
        console.log('Current stats:', stats);
      }
      await loadStats();
    } catch (error) {
      console.error('Error loading next file:', error);
    }
  };

  const handleKeep = async () => {
    if (!currentFile || !window.electronAPI) return;
    try {
      const result = await window.electronAPI.keepFile(currentFile.filepath);
      if (result.success) await loadNextFile();
    } catch (error) {
      console.error('Error keeping file:', error);
    }
  };

  const handleReject = async () => {
    if (!currentFile || !window.electronAPI) return;
    try {
      const result = await window.electronAPI.rejectFile(currentFile.filepath);
      if (result.success) await loadNextFile();
    } catch (error) {
      console.error('Error rejecting file:', error);
    }
  };

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
        <MediaViewer file={currentFile} />
      </div>
      <ActionButtons onKeep={handleKeep} onReject={handleReject} />
    </div>
  );
};

export default App;

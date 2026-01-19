import React, { useState, useEffect } from 'react';
import { AppConfig } from '@tinder-clear/shared';

interface SettingsProps {
  config: AppConfig | null;
  onClose: () => void;
  onConfigUpdate: () => void;
  onScan: () => void;
}

const Settings: React.FC<SettingsProps> = ({ config, onClose, onConfigUpdate, onScan }) => {
  const [localConfig, setLocalConfig] = useState<AppConfig | null>(config);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleAddScanPath = async () => {
    if (!window.electronAPI) return;
    
    const path = await window.electronAPI.selectDirectory();
    if (path && localConfig) {
      const updatedPaths = [...localConfig.scanPaths, path];
      setLocalConfig({ ...localConfig, scanPaths: updatedPaths });
    }
  };

  const handleRemoveScanPath = (index: number) => {
    if (!localConfig) return;
    const updatedPaths = localConfig.scanPaths.filter((_, i) => i !== index);
    setLocalConfig({ ...localConfig, scanPaths: updatedPaths });
  };

  const handleSelectDeletedFolder = async () => {
    if (!window.electronAPI) return;
    
    const path = await window.electronAPI.selectDirectory();
    if (path && localConfig) {
      setLocalConfig({ ...localConfig, deletedFolder: path });
    }
  };

  const handleSave = async () => {
    if (!localConfig || !window.electronAPI) return;

    setSaving(true);
    try {
      const result = await window.electronAPI.updateConfig(localConfig);
      if (result.success) {
        onConfigUpdate();
        alert('Settings saved successfully!');
        onClose();
      } else {
        alert(`Error saving settings: ${result.error}`);
      }
    } catch (error: any) {
      alert(`Error saving settings: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const toggleExtension = (category: keyof AppConfig['fileTypes'], ext: string) => {
    if (!localConfig) return;
    
    const extensions = [...localConfig.fileTypes[category]];
    const index = extensions.indexOf(ext);
    
    if (index > -1) {
      extensions.splice(index, 1);
    } else {
      extensions.push(ext);
    }
    
    setLocalConfig({
      ...localConfig,
      fileTypes: {
        ...localConfig.fileTypes,
        [category]: extensions
      }
    });
  };

  if (!localConfig) {
    return <div className="settings-loading">Loading settings...</div>;
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2>Settings</h2>
        <button onClick={onClose} className="btn-close">✕</button>
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <h3>Scan Paths</h3>
          <p className="settings-description">Directories to scan for media files</p>
          <div className="path-list">
            {localConfig.scanPaths.map((path, index) => (
              <div key={index} className="path-item">
                <span className="path-text">{path}</span>
                <button
                  onClick={() => handleRemoveScanPath(index)}
                  className="btn-remove"
                >
                  ✕
                </button>
              </div>
            ))}
            <button onClick={handleAddScanPath} className="btn-add">
              + Add Path
            </button>
          </div>
        </div>

        <div className="settings-section">
          <h3>Deleted Folder</h3>
          <p className="settings-description">Where rejected files will be moved</p>
          <div className="path-item">
            <span className="path-text">{localConfig.deletedFolder || 'Not set'}</span>
            <button onClick={handleSelectDeletedFolder} className="btn-select">
              Select Folder
            </button>
          </div>
        </div>

        <div className="settings-section">
          <h3>File Types</h3>
          <p className="settings-description">Select which file types to scan</p>
          
          <div className="file-types-group">
            <h4>Images</h4>
            <div className="extension-list">
              {['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'].map(ext => (
                <label key={ext} className="extension-item">
                  <input
                    type="checkbox"
                    checked={localConfig.fileTypes.images.includes(ext)}
                    onChange={() => toggleExtension('images', ext)}
                  />
                  {ext}
                </label>
              ))}
            </div>
          </div>

          <div className="file-types-group">
            <h4>Documents</h4>
            <div className="extension-list">
              {['.pdf', '.doc', '.docx', '.txt', '.rtf', '.xls', '.xlsx'].map(ext => (
                <label key={ext} className="extension-item">
                  <input
                    type="checkbox"
                    checked={localConfig.fileTypes.documents.includes(ext)}
                    onChange={() => toggleExtension('documents', ext)}
                  />
                  {ext}
                </label>
              ))}
            </div>
          </div>

          <div className="file-types-group">
            <h4>Videos</h4>
            <div className="extension-list">
              {['.mp4', '.avi', '.mov', '.wmv', '.mkv', '.flv', '.webm'].map(ext => (
                <label key={ext} className="extension-item">
                  <input
                    type="checkbox"
                    checked={localConfig.fileTypes.videos.includes(ext)}
                    onChange={() => toggleExtension('videos', ext)}
                  />
                  {ext}
                </label>
              ))}
            </div>
          </div>

          <div className="file-types-group">
            <h4>Audio</h4>
            <div className="extension-list">
              {['.mp3', '.wav', '.flac', '.aac', '.ogg', '.wma'].map(ext => (
                <label key={ext} className="extension-item">
                  <input
                    type="checkbox"
                    checked={localConfig.fileTypes.audio.includes(ext)}
                    onChange={() => toggleExtension('audio', ext)}
                  />
                  {ext}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="settings-actions">
          <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          {localConfig.scanPaths.length > 0 && localConfig.deletedFolder && (
            <button onClick={onScan} className="btn btn-primary">
              Start Scan
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;

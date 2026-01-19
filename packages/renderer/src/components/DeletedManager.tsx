import React, { useState, useEffect } from 'react';

interface RejectedFile {
  id?: number;
  original_path: string;
  deleted_path: string;
  rejected_at?: string;
}

interface DeletedManagerProps {
  onClose: () => void;
  onRestore: () => void;
}

const DeletedManager: React.FC<DeletedManagerProps> = ({ onClose, onRestore }) => {
  const [rejectedFiles, setRejectedFiles] = useState<RejectedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    loadRejectedFiles();
  }, []);

  const loadRejectedFiles = async () => {
    if (!window.electronAPI) return;

    setLoading(true);
    try {
      const files = await window.electronAPI.getRejectedFiles();
      setRejectedFiles(files);
    } catch (error) {
      console.error('Error loading rejected files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (file: RejectedFile) => {
    if (!window.electronAPI) return;

    setRestoring(file.id || 0);
    try {
      const result = await window.electronAPI.restoreFile(file.original_path, file.deleted_path);
      if (result.success) {
        await loadRejectedFiles();
        onRestore();
        alert('File restored successfully!');
      } else {
        alert(`Error restoring file: ${result.error}`);
      }
    } catch (error: any) {
      alert(`Error restoring file: ${error.message}`);
    } finally {
      setRestoring(null);
    }
  };

  const handlePermanentDelete = async (file: RejectedFile) => {
    if (!window.electronAPI) return;

    const confirm = window.confirm(
      `Are you sure you want to permanently delete this file?\n\n${file.deleted_path}\n\nThis action cannot be undone.`
    );

    if (!confirm) return;

    setDeleting(file.id || 0);
    try {
      const result = await window.electronAPI.permanentlyDelete(file.deleted_path);
      if (result.success) {
        await loadRejectedFiles();
        alert('File permanently deleted.');
      } else {
        alert(`Error deleting file: ${result.error}`);
      }
    } catch (error: any) {
      alert(`Error deleting file: ${error.message}`);
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="deleted-manager-container">
      <div className="deleted-manager-header">
        <h2>Deleted Files</h2>
        <button onClick={onClose} className="btn-close">✕</button>
      </div>

      <div className="deleted-manager-content">
        {loading ? (
          <div className="loading">Loading deleted files...</div>
        ) : rejectedFiles.length === 0 ? (
          <div className="empty-state">
            <p>No deleted files</p>
          </div>
        ) : (
          <div className="deleted-files-list">
            {rejectedFiles.map((file) => (
              <div key={file.id} className="deleted-file-item">
                <div className="deleted-file-info">
                  <div className="deleted-file-name">
                    {file.deleted_path.split(/[/\\]/).pop()}
                  </div>
                  <div className="deleted-file-path" title={file.original_path}>
                    Original: {file.original_path.length > 60 ? `...${file.original_path.slice(-60)}` : file.original_path}
                  </div>
                  <div className="deleted-file-date">
                    Deleted: {formatDate(file.rejected_at)}
                  </div>
                </div>
                <div className="deleted-file-actions">
                  <button
                    onClick={() => handleRestore(file)}
                    className="btn btn-restore"
                    disabled={restoring === file.id}
                  >
                    {restoring === file.id ? 'Restoring...' : 'Restore'}
                  </button>
                  <button
                    onClick={() => handlePermanentDelete(file)}
                    className="btn btn-delete"
                    disabled={deleting === file.id}
                  >
                    {deleting === file.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeletedManager;

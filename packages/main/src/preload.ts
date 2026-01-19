import { contextBridge, ipcRenderer } from 'electron';
import { IPCFile, AppConfig } from '@tinder-clear/shared';

export interface ElectronAPI {
  getNextFile: () => Promise<IPCFile | null>;
  rejectFile: (filepath: string) => Promise<{ success: boolean; error?: string }>;
  keepFile: (filepath: string) => Promise<{ success: boolean; error?: string }>;
  getStats: () => Promise<{ total: number; pending: number; kept: number; rejected: number }>;
  initializeScan: () => Promise<{ success: boolean; error?: string; count: number }>;
  getConfig: () => Promise<AppConfig>;
  updateConfig: (updates: Partial<AppConfig>) => Promise<{ success: boolean; error?: string }>;
  selectDirectory: () => Promise<string | null>;
  getRejectedFiles: () => Promise<Array<{ id?: number; original_path: string; deleted_path: string; rejected_at?: string }>>;
  restoreFile: (originalPath: string, deletedPath: string) => Promise<{ success: boolean; error?: string; deletedPath?: string }>;
  permanentlyDelete: (deletedPath: string) => Promise<{ success: boolean; error?: string }>;
  readFileText: (filepath: string) => Promise<{ success: boolean; content?: string; error?: string }>;
  readFileBinary: (filepath: string) => Promise<{ success: boolean; data?: number[]; error?: string }>;
}

const electronAPI: ElectronAPI = {
  getNextFile: () => ipcRenderer.invoke('get-next-file'),
  rejectFile: (filepath: string) => ipcRenderer.invoke('reject-file', filepath),
  keepFile: (filepath: string) => ipcRenderer.invoke('keep-file', filepath),
  getStats: () => ipcRenderer.invoke('get-stats'),
  initializeScan: () => ipcRenderer.invoke('initialize-scan'),
  getConfig: () => ipcRenderer.invoke('get-config'),
  updateConfig: (updates: Partial<AppConfig>) => ipcRenderer.invoke('update-config', updates),
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  getRejectedFiles: () => ipcRenderer.invoke('get-rejected-files'),
  restoreFile: (originalPath: string, deletedPath: string) => ipcRenderer.invoke('restore-file', originalPath, deletedPath),
  permanentlyDelete: (deletedPath: string) => ipcRenderer.invoke('permanently-delete', deletedPath),
  readFileText: (filepath: string) => ipcRenderer.invoke('read-file-text', filepath),
  readFileBinary: (filepath: string) => ipcRenderer.invoke('read-file-binary', filepath)
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

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

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

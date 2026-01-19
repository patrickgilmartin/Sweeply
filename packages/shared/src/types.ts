export type MediaType = 'image' | 'document' | 'video' | 'audio';

export type FileStatus = 'pending' | 'kept' | 'rejected' | 'missing';

export interface MediaFile {
  id?: number;
  filepath: string;
  media_type: MediaType;
  status: FileStatus;
  reviewed_at?: string;
  file_size?: number;
  file_hash?: string;
  created_at?: string;
}

export interface RejectedFile {
  id?: number;
  original_path: string;
  deleted_path: string;
  rejected_at?: string;
}

export interface AppConfig {
  scanPaths: string[];
  deletedFolder: string;
  fileTypes: {
    images: string[];
    documents: string[];
    videos: string[];
    audio: string[];
  };
  filters: {
    minSize: number;
    maxSize: number | null;
    excludeHidden: boolean;
    excludeSystem: boolean;
  };
  ui: {
    theme: 'light' | 'dark';
    showMetadata: boolean;
  };
}

export interface IPCFile {
  filepath: string;
  media_type: MediaType;
  file_size: number;
  status: FileStatus;
}

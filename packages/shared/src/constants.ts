import { AppConfig } from './types';

export const DEFAULT_MEDIA_EXTENSIONS = {
  images: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.ico', '.tiff', '.tif'],
  documents: ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.xls', '.xlsx', '.ppt', '.pptx', '.odt', '.ods'],
  videos: ['.mp4', '.avi', '.mov', '.wmv', '.mkv', '.flv', '.webm', '.m4v', '.mpg', '.mpeg'],
  audio: ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.wma', '.m4a', '.opus']
};

export const DEFAULT_CONFIG: AppConfig = {
  scanPaths: [],
  deletedFolder: '',
  fileTypes: DEFAULT_MEDIA_EXTENSIONS,
  filters: {
    minSize: 0,
    maxSize: null,
    excludeHidden: true,
    excludeSystem: true
  },
  ui: {
    theme: 'dark',
    showMetadata: true
  }
};

export const APP_DATA_DIR = 'data';
export const CONFIG_FILE = `${APP_DATA_DIR}/config.json`;
export const DATABASE_FILE = `${APP_DATA_DIR}/state.db`;

export function getAllExtensions(): string[] {
  return [
    ...DEFAULT_MEDIA_EXTENSIONS.images,
    ...DEFAULT_MEDIA_EXTENSIONS.documents,
    ...DEFAULT_MEDIA_EXTENSIONS.videos,
    ...DEFAULT_MEDIA_EXTENSIONS.audio
  ];
}

export function getMediaTypeFromExtension(ext: string): 'image' | 'document' | 'video' | 'audio' | null {
  const lowerExt = ext.toLowerCase();
  if (DEFAULT_MEDIA_EXTENSIONS.images.includes(lowerExt)) return 'image';
  if (DEFAULT_MEDIA_EXTENSIONS.documents.includes(lowerExt)) return 'document';
  if (DEFAULT_MEDIA_EXTENSIONS.videos.includes(lowerExt)) return 'video';
  if (DEFAULT_MEDIA_EXTENSIONS.audio.includes(lowerExt)) return 'audio';
  return null;
}

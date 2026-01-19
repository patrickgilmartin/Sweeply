/**
 * Browser detection utilities
 */

export interface BrowserInfo {
  name: 'chrome' | 'edge' | 'firefox' | 'safari' | 'other';
  version: string;
  supportsFileSystemAccess: boolean;
  supportsWebkitDirectory: boolean;
}

/**
 * Detect browser and capabilities
 */
export function detectBrowser(): BrowserInfo {
  const userAgent = navigator.userAgent.toLowerCase();
  let name: BrowserInfo['name'] = 'other';
  let version = '0';

  // Detect browser
  if (userAgent.includes('edg/')) {
    name = 'edge';
    const match = userAgent.match(/edg\/(\d+)/);
    version = match ? match[1] : '0';
  } else if (userAgent.includes('chrome/') && !userAgent.includes('edg/')) {
    name = 'chrome';
    const match = userAgent.match(/chrome\/(\d+)/);
    version = match ? match[1] : '0';
  } else if (userAgent.includes('firefox/')) {
    name = 'firefox';
    const match = userAgent.match(/firefox\/(\d+)/);
    version = match ? match[1] : '0';
  } else if (userAgent.includes('safari/') && !userAgent.includes('chrome/')) {
    name = 'safari';
    const match = userAgent.match(/version\/(\d+)/);
    version = match ? match[1] : '0';
  }

  // Check capabilities
  const supportsFileSystemAccess = 'showDirectoryPicker' in window && 'showOpenFilePicker' in window;
  const supportsWebkitDirectory = 'webkitdirectory' in document.createElement('input');

  return {
    name,
    version,
    supportsFileSystemAccess,
    supportsWebkitDirectory,
  };
}

/**
 * Get browser-specific messaging
 */
export function getBrowserCapabilityMessage(): string {
  const browser = detectBrowser();

  if (browser.supportsFileSystemAccess) {
    return 'Your browser supports full file system access. You can select directories and move files directly.';
  } else if (browser.supportsWebkitDirectory) {
    return 'Your browser supports directory selection but may have limited file operations. You can select folders to review files.';
  } else {
    return 'Your browser has limited file system access. You can select individual files to review.';
  }
}

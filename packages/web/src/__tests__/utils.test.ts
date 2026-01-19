/**
 * Utility Functions Tests
 * Tests for utility functions
 */

import { describe, it, expect } from 'vitest';
import { detectBrowser } from '../utils/browserDetection';
import { isFileSystemAccessSupported } from '../utils/fileSystemAccess';
import { getAllExtensions, getMediaTypeFromExtension } from '@tinder-clear/shared';

describe('Browser Detection', () => {
  describe('detectBrowser', () => {
    it('should detect browser information', () => {
      const browserInfo = detectBrowser();
      expect(browserInfo).toBeDefined();
      expect(browserInfo.name).toBeDefined();
      expect(browserInfo.version).toBeDefined();
      expect(typeof browserInfo.supportsFileSystemAccess).toBe('boolean');
      expect(typeof browserInfo.supportsWebkitDirectory).toBe('boolean');
    });
  });

  describe('isFileSystemAccessSupported', () => {
    it('should check File System Access API support', () => {
      const supported = isFileSystemAccessSupported();
      expect(typeof supported).toBe('boolean');
    });
  });
});

describe('Media Type Detection', () => {
  it('should correctly identify image types', () => {
    expect(getMediaTypeFromExtension('.jpg')).toBe('image');
    expect(getMediaTypeFromExtension('.png')).toBe('image');
    expect(getMediaTypeFromExtension('.gif')).toBe('image');
  });

  it('should correctly identify document types', () => {
    expect(getMediaTypeFromExtension('.pdf')).toBe('document');
    expect(getMediaTypeFromExtension('.docx')).toBe('document');
    expect(getMediaTypeFromExtension('.txt')).toBe('document');
  });

  it('should correctly identify video types', () => {
    expect(getMediaTypeFromExtension('.mp4')).toBe('video');
    expect(getMediaTypeFromExtension('.avi')).toBe('video');
  });

  it('should correctly identify audio types', () => {
    expect(getMediaTypeFromExtension('.mp3')).toBe('audio');
    expect(getMediaTypeFromExtension('.wav')).toBe('audio');
  });

  it('should handle case insensitivity', () => {
    expect(getMediaTypeFromExtension('.JPG')).toBe('image');
    expect(getMediaTypeFromExtension('.PDF')).toBe('document');
  });
});

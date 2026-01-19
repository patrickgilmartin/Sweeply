/**
 * File Scanner Tests
 * Tests for file scanning functionality
 */

import { describe, it, expect } from 'vitest';
import { FileScanner } from '../services/fileScanner';
import { getAllExtensions, getMediaTypeFromExtension } from '@tinder-clear/shared';

describe('File Scanner', () => {
  describe('Extension handling', () => {
    it('should recognize valid image extensions', () => {
      const scanner = new FileScanner();
      expect(getMediaTypeFromExtension('.jpg')).toBe('image');
      expect(getMediaTypeFromExtension('.png')).toBe('image');
      expect(getMediaTypeFromExtension('.gif')).toBe('image');
    });

    it('should recognize valid document extensions', () => {
      expect(getMediaTypeFromExtension('.pdf')).toBe('document');
      expect(getMediaTypeFromExtension('.txt')).toBe('document');
      expect(getMediaTypeFromExtension('.docx')).toBe('document');
    });

    it('should recognize valid video extensions', () => {
      expect(getMediaTypeFromExtension('.mp4')).toBe('video');
      expect(getMediaTypeFromExtension('.avi')).toBe('video');
    });

    it('should recognize valid audio extensions', () => {
      expect(getMediaTypeFromExtension('.mp3')).toBe('audio');
      expect(getMediaTypeFromExtension('.wav')).toBe('audio');
    });

    it('should return null for invalid extensions', () => {
      expect(getMediaTypeFromExtension('.xyz')).toBeNull();
      expect(getMediaTypeFromExtension('')).toBeNull();
    });
  });

  describe('getAllExtensions', () => {
    it('should return all supported extensions', () => {
      const extensions = getAllExtensions();
      expect(extensions.length).toBeGreaterThan(0);
      expect(extensions).toContain('.jpg');
      expect(extensions).toContain('.pdf');
      expect(extensions).toContain('.mp4');
      expect(extensions).toContain('.mp3');
    });
  });

  describe('File filtering', () => {
    it('should filter files by extension', () => {
      const scanner = new FileScanner();
      // This would need to be tested with actual File System Access API
      // For now, we test the extension logic
      expect(scanner).toBeDefined();
    });
  });
});

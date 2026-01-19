/**
 * Error Handling Tests
 * Tests for error scenarios and edge cases
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDB } from '../db/schema';
import { DatabaseManager } from '../db/indexedDB';
import { getMediaTypeFromExtension } from '@tinder-clear/shared';

describe('Error Handling', () => {
  let dbManager: DatabaseManager;
  let testDb: ReturnType<typeof createTestDB>;

  beforeEach(async () => {
    // Create a fresh database instance for each test
    const dbName = `test_error_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    testDb = createTestDB(dbName);
    dbManager = new DatabaseManager(testDb);
    
    // Clear all stores before each test
    await testDb.files.clear();
    await testDb.rejectedFiles.clear();
    await testDb.queueState.clear();
  });

  describe('Database errors', () => {
    it('should handle missing file gracefully', async () => {
      const file = await dbManager.getFile('non/existent/file.jpg');
      expect(file).toBeUndefined();
    });

    it('should handle invalid file path', async () => {
      const result = await dbManager.isFileReviewed('');
      expect(result).toBe(false);
    });
  });

  describe('Media type detection errors', () => {
    it('should handle empty extension', () => {
      const type = getMediaTypeFromExtension('');
      expect(type).toBeNull();
    });

    it('should handle extension without dot', () => {
      const type = getMediaTypeFromExtension('jpg');
      expect(type).toBeNull();
    });

    it('should handle unknown extension', () => {
      const type = getMediaTypeFromExtension('.xyz');
      expect(type).toBeNull();
    });

    it('should handle extension with multiple dots', () => {
      const type = getMediaTypeFromExtension('.tar.gz');
      expect(type).toBeNull();
    });
  });

  describe('Edge cases', () => {
    it('should handle very long file paths', async () => {
      const longPath = 'a'.repeat(1000) + '.jpg';
      const id = await dbManager.addFile({
        filepath: longPath,
        media_type: 'image',
        status: 'pending',
      });
      expect(id).toBeGreaterThan(0);
    });

    it('should handle special characters in file paths', async () => {
      const specialPath = 'test/file with spaces & symbols!@#$.jpg';
      const id = await dbManager.addFile({
        filepath: specialPath,
        media_type: 'image',
        status: 'pending',
      });
      expect(id).toBeGreaterThan(0);
    });

    it('should handle unicode characters in file paths', async () => {
      const unicodePath = 'test/文件/图片.jpg';
      const id = await dbManager.addFile({
        filepath: unicodePath,
        media_type: 'image',
        status: 'pending',
      });
      expect(id).toBeGreaterThan(0);
    });
  });
});

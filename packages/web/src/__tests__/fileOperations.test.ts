/**
 * File Operations Tests
 * Tests for file operations functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDB } from '../db/schema';
import { DatabaseManager } from '../db/indexedDB';
import { FileOperations } from '../services/fileOperations';

describe('File Operations', () => {
  let dbManager: DatabaseManager;
  let testDb: ReturnType<typeof createTestDB>;
  let fileOps: FileOperations;

  beforeEach(async () => {
    // Create a fresh database instance for each test
    const dbName = `test_fileops_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    testDb = createTestDB(dbName);
    dbManager = new DatabaseManager(testDb);
    fileOps = new FileOperations(dbManager);
    
    // Clear all stores before each test
    await testDb.files.clear();
    await testDb.rejectedFiles.clear();
    await testDb.queueState.clear();
  });

  describe('moveToDeletedFolder', () => {
    it('should handle file operations class initialization', () => {
      expect(fileOps).toBeDefined();
      // Actual testing requires File System Access API handles
      // This would be tested in integration tests
    });
  });

  describe('keepFile', () => {
    it('should validate file operations class', () => {
      expect(fileOps.keepFile).toBeDefined();
      expect(fileOps.exportRejectedFiles).toBeDefined();
    });

    it('should keep a file successfully', async () => {
      await dbManager.addFile({
        filepath: 'test/image.jpg',
        media_type: 'image',
        status: 'pending',
      });

      const result = await fileOps.keepFile('test/image.jpg');
      expect(result.success).toBe(true);

      const file = await dbManager.getFile('test/image.jpg');
      expect(file?.status).toBe('kept');
    });
  });
});

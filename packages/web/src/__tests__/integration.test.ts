/**
 * Integration Tests
 * Tests for complete workflows
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDB } from '../db/schema';
import { DatabaseManager } from '../db/indexedDB';
import { FileScanner, ScannedFile } from '../services/fileScanner';
import { FileOperations } from '../services/fileOperations';

describe('Integration Tests', () => {
  let dbManager: DatabaseManager;
  let testDb: ReturnType<typeof createTestDB>;
  let fileScanner: FileScanner;

  beforeEach(async () => {
    // Create a fresh database instance for each test
    const dbName = `test_integration_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    testDb = createTestDB(dbName);
    dbManager = new DatabaseManager(testDb);
    fileScanner = new FileScanner(dbManager);
    
    // Clear all stores before each test
    await testDb.files.clear();
    await testDb.rejectedFiles.clear();
    await testDb.queueState.clear();
  });

  describe('Complete workflow', () => {
    it('should handle complete file review workflow', async () => {
      // 1. Add files to database
      const file1 = {
        filepath: 'test/image1.jpg',
        media_type: 'image' as const,
        status: 'pending' as const,
        file_size: 1024,
      };

      const file2 = {
        filepath: 'test/image2.jpg',
        media_type: 'image' as const,
        status: 'pending' as const,
        file_size: 2048,
      };

      await dbManager.addFile(file1);
      await dbManager.addFile(file2);

      // 2. Get pending files
      const pending = await dbManager.getPendingFiles();
      expect(pending.length).toBeGreaterThanOrEqual(2);

      // 3. Keep a file
      await dbManager.updateFileStatus(file1.filepath, 'kept');
      const keptFile = await dbManager.getFile(file1.filepath);
      expect(keptFile?.status).toBe('kept');

      // 4. Reject a file
      await dbManager.updateFileStatus(file2.filepath, 'rejected');
      await dbManager.addRejectedFile(file2.filepath, 'deleted/' + file2.filepath);
      const rejectedFile = await dbManager.getFile(file2.filepath);
      expect(rejectedFile?.status).toBe('rejected');

      // 5. Check stats
      const stats = await dbManager.getStats();
      expect(stats.kept).toBeGreaterThanOrEqual(1);
      expect(stats.rejected).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Queue management', () => {
    it('should manage queue state correctly', async () => {
      // Save queue state
      await dbManager.saveQueueState(5);
      let state = await dbManager.getQueueState();
      expect(state).toBe(5);

      // Update queue state
      await dbManager.saveQueueState(10);
      state = await dbManager.getQueueState();
      expect(state).toBe(10);
    });
  });

  describe('File operations', () => {
    it('should handle file operations workflow', async () => {
      // Add a file first
      await dbManager.addFile({
        filepath: 'test/image.jpg',
        media_type: 'image',
        status: 'pending',
      });

      const fileOps = new FileOperations(dbManager);
      
      // Test that file operations are available
      expect(fileOps.keepFile).toBeDefined();
      expect(fileOps.exportRejectedFiles).toBeDefined();

      // Keep file
      const result = await fileOps.keepFile('test/image.jpg');
      expect(result.success).toBe(true);
      
      // Verify the file status was updated
      const file = await dbManager.getFile('test/image.jpg');
      expect(file?.status).toBe('kept');
    });
  });
});

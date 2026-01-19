/**
 * Scenario-based Tests
 * Tests for real-world usage scenarios
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDB } from '../db/schema';
import { DatabaseManager } from '../db/indexedDB';
import { FileOperations } from '../services/fileOperations';

describe('Real-world Scenarios', () => {
  let dbManager: DatabaseManager;
  let testDb: ReturnType<typeof createTestDB>;

  beforeEach(async () => {
    // Create a fresh database instance for each test
    const dbName = `test_scenario_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    testDb = createTestDB(dbName);
    dbManager = new DatabaseManager(testDb);
    
    // Clear all stores before each test
    await testDb.files.clear();
    await testDb.rejectedFiles.clear();
    await testDb.queueState.clear();
  });

  describe('Scenario 1: First-time user setup', () => {
    it('should handle initial directory selection', async () => {
      // User selects directory for the first time
      // Database should be empty initially
      const stats = await dbManager.getStats();
      expect(stats.total).toBe(0);
    });

    it('should scan and add files on first run', async () => {
      // After directory selection, files should be scanned and added
      const file = {
        filepath: 'test/image1.jpg',
        media_type: 'image' as const,
        status: 'pending' as const,
        file_size: 1024,
      };

      await dbManager.addFile(file);
      const stats = await dbManager.getStats();
      expect(stats.total).toBe(1);
      expect(stats.pending).toBe(1);
    });
  });

  describe('Scenario 2: Reviewing files', () => {
    it('should allow user to keep files', async () => {
      const file = {
        filepath: 'test/image1.jpg',
        media_type: 'image' as const,
        status: 'pending' as const,
      };

      await dbManager.addFile(file);
      await dbManager.updateFileStatus(file.filepath, 'kept');

      const stats = await dbManager.getStats();
      expect(stats.kept).toBe(1);
      expect(stats.pending).toBe(0);
    });

    it('should allow user to reject files', async () => {
      const file = {
        filepath: 'test/image2.jpg',
        media_type: 'image' as const,
        status: 'pending' as const,
      };

      await dbManager.addFile(file);
      await dbManager.updateFileStatus(file.filepath, 'rejected');
      await dbManager.addRejectedFile(file.filepath, 'deleted/' + file.filepath);

      const stats = await dbManager.getStats();
      expect(stats.rejected).toBe(1);
      expect(stats.pending).toBe(0);

      const rejectedFiles = await dbManager.getRejectedFiles();
      expect(rejectedFiles.length).toBe(1);
    });
  });

  describe('Scenario 3: Resuming session', () => {
    it('should resume from last queue position', async () => {
      // Save queue state
      await dbManager.saveQueueState(5);
      
      // On next session, should resume from position 5
      const state = await dbManager.getQueueState();
      expect(state).toBe(5);
    });

    it('should skip already-reviewed files', async () => {
      const file1 = {
        filepath: 'test/image1.jpg',
        media_type: 'image' as const,
        status: 'kept' as const,
      };

      const file2 = {
        filepath: 'test/image2.jpg',
        media_type: 'image' as const,
        status: 'pending' as const,
      };

      await dbManager.addFile(file1);
      await dbManager.addFile(file2);

      const pending = await dbManager.getPendingFiles();
      expect(pending.length).toBe(1);
      expect(pending[0].filepath).toBe(file2.filepath);
    });
  });

  describe('Scenario 4: Large batch processing', () => {
    it('should handle processing many files', async () => {
      // Add 100 files
      const files = Array.from({ length: 100 }, (_, i) => ({
        filepath: `test/image${i}.jpg`,
        media_type: 'image' as const,
        status: 'pending' as const,
        file_size: 1024 * (i + 1),
      }));

      await dbManager.addFiles(files);
      const stats = await dbManager.getStats();
      expect(stats.total).toBe(100);
      expect(stats.pending).toBe(100);
    });

    it('should efficiently query large datasets', async () => {
      // Add files and test query performance
      const files = Array.from({ length: 50 }, (_, i) => ({
        filepath: `test/image${i}.jpg`,
        media_type: 'image' as const,
        status: i % 2 === 0 ? 'pending' : 'kept',
        file_size: 1024,
      }));

      await dbManager.addFiles(files);
      const pending = await dbManager.getPendingFiles();
      expect(pending.length).toBe(25);
    });
  });

  describe('Scenario 5: Error recovery', () => {
    it('should handle file not found gracefully', async () => {
      const file = await dbManager.getFile('non/existent/file.jpg');
      expect(file).toBeUndefined();
    });

    it('should handle invalid operations', async () => {
      const fileOps = new FileOperations(dbManager);
      const result = await fileOps.keepFile('invalid/path.jpg');
      // Should complete without error (file may not exist but operation should not crash)
      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
    });
  });
});

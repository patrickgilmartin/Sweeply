/**
 * Database Layer Tests
 * Tests for IndexedDB database operations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDB } from '../db/schema';
import { DatabaseManager } from '../db/indexedDB';

describe('Database Manager', () => {
  let dbManager: DatabaseManager;
  let testDb: ReturnType<typeof createTestDB>;

  beforeEach(async () => {
    // Create a fresh database instance for each test
    const dbName = `test_db_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    testDb = createTestDB(dbName);
    dbManager = new DatabaseManager(testDb);
    
    // Clear all stores before each test
    await testDb.files.clear();
    await testDb.rejectedFiles.clear();
    await testDb.queueState.clear();
  });

  describe('addFile', () => {
    it('should add a file to the database', async () => {
      const file = {
        filepath: 'test/path/image.jpg',
        media_type: 'image' as const,
        status: 'pending' as const,
        file_size: 1024,
      };

      const id = await dbManager.addFile(file);
      expect(id).toBeGreaterThan(0);

      const retrieved = await dbManager.getFile(file.filepath);
      expect(retrieved).toBeDefined();
      expect(retrieved?.filepath).toBe(file.filepath);
      expect(retrieved?.media_type).toBe(file.media_type);
      expect(retrieved?.status).toBe(file.status);
    });

    it('should not add duplicate files', async () => {
      const file = {
        filepath: 'test/path/image.jpg',
        media_type: 'image' as const,
        status: 'pending' as const,
      };

      const id1 = await dbManager.addFile(file);
      const id2 = await dbManager.addFile(file);

      // Should return existing ID or new ID, but file should only exist once
      const files = await dbManager.getPendingFiles();
      const matching = files.filter(f => f.filepath === file.filepath);
      expect(matching.length).toBe(1);
    });
  });

  describe('updateFileStatus', () => {
    it('should update file status', async () => {
      const file = {
        filepath: 'test/path/image.jpg',
        media_type: 'image' as const,
        status: 'pending' as const,
      };

      await dbManager.addFile(file);
      await dbManager.updateFileStatus(file.filepath, 'kept');

      const retrieved = await dbManager.getFile(file.filepath);
      expect(retrieved?.status).toBe('kept');
    });

    it('should update reviewed_at timestamp', async () => {
      const file = {
        filepath: 'test/path/image.jpg',
        media_type: 'image' as const,
        status: 'pending' as const,
      };

      await dbManager.addFile(file);
      await dbManager.updateFileStatus(file.filepath, 'rejected');

      const retrieved = await dbManager.getFile(file.filepath);
      expect(retrieved?.reviewed_at).toBeDefined();
    });
  });

  describe('getPendingFiles', () => {
    it('should return only pending files', async () => {
      await dbManager.addFile({
        filepath: 'test/path/image1.jpg',
        media_type: 'image',
        status: 'pending',
      });

      await dbManager.addFile({
        filepath: 'test/path/image2.jpg',
        media_type: 'image',
        status: 'kept',
      });

      await dbManager.addFile({
        filepath: 'test/path/image3.jpg',
        media_type: 'image',
        status: 'pending',
      });

      const pending = await dbManager.getPendingFiles();
      expect(pending.length).toBe(2);
      expect(pending.every(f => f.status === 'pending')).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', async () => {
      await dbManager.addFile({
        filepath: 'test/path/image1.jpg',
        media_type: 'image',
        status: 'pending',
      });

      await dbManager.addFile({
        filepath: 'test/path/image2.jpg',
        media_type: 'image',
        status: 'kept',
      });

      await dbManager.addFile({
        filepath: 'test/path/image3.jpg',
        media_type: 'image',
        status: 'rejected',
      });

      const stats = await dbManager.getStats();
      expect(stats.total).toBe(3);
      expect(stats.pending).toBe(1);
      expect(stats.kept).toBe(1);
      expect(stats.rejected).toBe(1);
    });
  });

  describe('queueState', () => {
    it('should save and retrieve queue state', async () => {
      await dbManager.saveQueueState(5);
      const state = await dbManager.getQueueState();
      expect(state).toBe(5);
    });

    it('should update queue state', async () => {
      await dbManager.saveQueueState(3);
      await dbManager.saveQueueState(7);
      const state = await dbManager.getQueueState();
      expect(state).toBe(7);
    });
  });
});

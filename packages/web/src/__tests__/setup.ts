/**
 * Test setup file
 * Configures test environment for IndexedDB testing
 * This MUST run before any imports that use Dexie
 * 
 * IMPORTANT: This file is loaded by Vitest BEFORE test files are imported.
 * This ensures fake-indexeddb is set up before Dexie tries to access indexedDB.
 */

import { beforeAll, afterAll } from 'vitest';
// Import everything from fake-indexeddb to polyfill the global indexedDB
import 'fake-indexeddb/auto';
import '@testing-library/jest-dom';

// After importing 'fake-indexeddb/auto', the global indexedDB should be set up
// But we'll verify it's there
beforeAll(() => {
  // Verify fake-indexeddb is available
  if (!global.indexedDB) {
    throw new Error('fake-indexeddb was not set up correctly. Check your vitest config.');
  }
  
  // Ensure it's actually the fake one (should have the methods we need)
  if (typeof global.indexedDB.open !== 'function') {
    throw new Error('indexedDB is not properly polyfilled by fake-indexeddb');
  }
});

afterAll(() => {
  // Cleanup is handled by fake-indexeddb automatically
  // Individual tests clean up their own databases in beforeEach hooks
});

// Note: Database cleanup is handled in individual test beforeEach hooks
// This allows each test to have its own isolated database instance

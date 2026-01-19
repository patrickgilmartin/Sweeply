import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';
import { app } from 'electron';
import { MediaFile, RejectedFile, FileStatus, MediaType } from '@tinder-clear/shared';
import { APP_DATA_DIR, DATABASE_FILE } from '@tinder-clear/shared';

export class DatabaseManager {
  private db: Database;
  private dbPath: string;

  constructor() {
    const userDataPath = app.getPath('userData');
    const dataDir = path.join(userDataPath, APP_DATA_DIR);
    
    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    this.dbPath = path.join(userDataPath, DATABASE_FILE);
    this.db = new Database(this.dbPath);
    this.initializeSchema();
  }

  private initializeSchema(): void {
    // Create files table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filepath TEXT UNIQUE NOT NULL,
        media_type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        reviewed_at DATETIME,
        file_size INTEGER,
        file_hash TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS rejected_files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        original_path TEXT NOT NULL,
        deleted_path TEXT NOT NULL,
        rejected_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_filepath ON files(filepath);
      CREATE INDEX IF NOT EXISTS idx_status ON files(status);
      CREATE INDEX IF NOT EXISTS idx_media_type ON files(media_type);
    `);
  }

  public addFile(file: Omit<MediaFile, 'id' | 'created_at'>): number {
    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO files (filepath, media_type, status, file_size, file_hash)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      file.filepath,
      file.media_type,
      file.status || 'pending',
      file.file_size || null,
      file.file_hash || null
    );
    
    return result.lastInsertRowid as number;
  }

  public addFiles(files: Array<Omit<MediaFile, 'id' | 'created_at'>>): void {
    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO files (filepath, media_type, status, file_size, file_hash)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const insertMany = this.db.transaction((files: Array<Omit<MediaFile, 'id' | 'created_at'>>) => {
      for (const file of files) {
        stmt.run(
          file.filepath,
          file.media_type,
          file.status || 'pending',
          file.file_size || null,
          file.file_hash || null
        );
      }
    });
    
    insertMany(files);
  }

  public getFile(filepath: string): MediaFile | undefined {
    const stmt = this.db.prepare('SELECT * FROM files WHERE filepath = ?');
    return stmt.get(filepath) as MediaFile | undefined;
  }

  public updateFileStatus(filepath: string, status: FileStatus): void {
    const stmt = this.db.prepare(`
      UPDATE files 
      SET status = ?, reviewed_at = CURRENT_TIMESTAMP 
      WHERE filepath = ?
    `);
    stmt.run(status, filepath);
  }

  public getPendingFiles(): MediaFile[] {
    const stmt = this.db.prepare('SELECT * FROM files WHERE status = ? ORDER BY created_at');
    return stmt.all('pending') as MediaFile[];
  }

  public isFileReviewed(filepath: string): boolean {
    const stmt = this.db.prepare('SELECT status FROM files WHERE filepath = ?');
    const result = stmt.get(filepath) as { status: FileStatus } | undefined;
    return result !== undefined && result.status !== 'pending';
  }

  public addRejectedFile(originalPath: string, deletedPath: string): number {
    const stmt = this.db.prepare(`
      INSERT INTO rejected_files (original_path, deleted_path)
      VALUES (?, ?)
    `);
    const result = stmt.run(originalPath, deletedPath);
    return result.lastInsertRowid as number;
  }

  public getRejectedFiles(): RejectedFile[] {
    const stmt = this.db.prepare('SELECT * FROM rejected_files ORDER BY rejected_at DESC');
    return stmt.all() as RejectedFile[];
  }

  public removeRejectedFile(id: number): void {
    const stmt = this.db.prepare('DELETE FROM rejected_files WHERE id = ?');
    stmt.run(id);
  }

  public getStats(): { total: number; pending: number; kept: number; rejected: number } {
    const total = this.db.prepare('SELECT COUNT(*) as count FROM files').get() as { count: number };
    const pending = this.db.prepare("SELECT COUNT(*) as count FROM files WHERE status = 'pending'").get() as { count: number };
    const kept = this.db.prepare("SELECT COUNT(*) as count FROM files WHERE status = 'kept'").get() as { count: number };
    const rejected = this.db.prepare("SELECT COUNT(*) as count FROM files WHERE status = 'rejected'").get() as { count: number };
    
    return {
      total: total.count,
      pending: pending.count,
      kept: kept.count,
      rejected: rejected.count
    };
  }

  public close(): void {
    this.db.close();
  }
}

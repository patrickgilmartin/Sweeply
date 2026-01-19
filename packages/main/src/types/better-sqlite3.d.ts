declare module 'better-sqlite3' {
  class DatabaseClass {
    constructor(filename: string, options?: any);
    exec(sql: string): void;
    prepare(sql: string): Statement;
    transaction<T extends (...args: any[]) => any>(fn: T): T;
    close(): void;
  }

  export class Statement {
    run(...params: any[]): RunResult;
    get(...params: any[]): any;
    all(...params: any[]): any[];
  }

  export interface RunResult {
    lastInsertRowid: number | bigint;
    changes: number;
  }

  export = DatabaseClass;
  export default DatabaseClass;
}

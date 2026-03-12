import { Pool } from 'pg';
import Database from 'better-sqlite3';
import { config } from './index';
import * as path from 'path';
import * as fs from 'fs';

// PostgreSQL pool
let pgPool: Pool | null = null;

// SQLite instance
let sqliteDb: Database.Database | null = null;

// Initialize database based on config
const initDatabase = () => {
  if (config.database.type === 'postgres') {
    pgPool = new Pool({
      host: config.database.host,
      port: config.database.port,
      database: config.database.name,
      user: config.database.user,
      password: config.database.password,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
    console.log('🐘 PostgreSQL database initialized');
  } else {
    // SQLite mode
    const sqlitePath = path.resolve(process.cwd(), config.database.sqlitePath);
    const dataDir = path.dirname(sqlitePath);
    
    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    sqliteDb = new Database(sqlitePath);
    sqliteDb.pragma('journal_mode = WAL');
    console.log(`🗄️  SQLite database initialized at ${sqlitePath}`);
  }
};

export const connectDatabase = async () => {
  try {
    if (config.database.type === 'postgres') {
      if (!pgPool) initDatabase();
      const client = await pgPool!.connect();
      await client.query('SELECT NOW()');
      client.release();
      console.log('PostgreSQL connected successfully');
    } else {
      if (!sqliteDb) initDatabase();
      // Test SQLite connection
      sqliteDb!.prepare('SELECT 1').get();
      console.log('SQLite connected successfully');
    }
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    if (config.database.type === 'postgres') {
      if (!pgPool) initDatabase();
      const result = await pgPool!.query(text, params);
      const duration = Date.now() - start;
      console.log('Executed query', { text, duration, rows: result.rowCount });
      return result;
    } else {
      if (!sqliteDb) initDatabase();
      // Convert PostgreSQL parameter style ($1, $2) to SQLite (?)
      const sqliteText = text.replace(/\$\d+/g, '?');
      
      // Determine query type
      const upperText = text.trim().toUpperCase();
      let result: any;
      
      if (upperText.startsWith('INSERT') || upperText.startsWith('UPDATE') || upperText.startsWith('DELETE') || upperText.startsWith('CREATE') || upperText.startsWith('DROP') || upperText.startsWith('ALTER')) {
        const stmt = sqliteDb!.prepare(sqliteText);
        const info = params ? stmt.run(params) : stmt.run();
        result = { rowCount: info.changes, lastInsertRowid: info.lastInsertRowid };
      } else {
        // SELECT and other queries
        const stmt = sqliteDb!.prepare(sqliteText);
        const rows = params ? stmt.all(params) : stmt.all();
        result = { rows, rowCount: rows.length };
      }
      
      const duration = Date.now() - start;
      console.log('Executed query', { text, duration, rows: result.rowCount });
      return result;
    }
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};

// Helper to get SQLite database instance directly (for transactions, etc.)
export const getSqliteDb = (): any => {
  if (config.database.type !== 'sqlite') {
    throw new Error('SQLite database is not configured');
  }
  if (!sqliteDb) initDatabase();
  return sqliteDb!;
};

// Graceful shutdown
export const closeDatabase = async () => {
  if (pgPool) {
    await pgPool.end();
    console.log('PostgreSQL connection closed');
  }
  if (sqliteDb) {
    sqliteDb.close();
    console.log('SQLite connection closed');
  }
};

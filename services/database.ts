import * as SQLite from 'expo-sqlite';

const DB_NAME = 'poupapobre.db';

export const initDatabase = async () => {
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  console.log('Database initialized');
};

export const getDatabase = async () => {
  return await SQLite.openDatabaseAsync(DB_NAME);
};

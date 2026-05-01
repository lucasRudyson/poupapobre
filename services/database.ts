import * as SQLite from 'expo-sqlite';

const DB_NAME = 'poupapobre.db';
let dbInstance: SQLite.SQLiteDatabase | null = null;

export const getDatabase = async () => {
  if (dbInstance) return dbInstance;
  dbInstance = await SQLite.openDatabaseAsync(DB_NAME);
  return dbInstance;
};

export const initDatabase = async () => {
  try {
    const db = await getDatabase();
    
    // Configurações básicas
    await db.execAsync('PRAGMA journal_mode = WAL;');
    await db.execAsync('PRAGMA foreign_keys = ON;');
    
    // Tabela de Usuários
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de Receitas Fixas
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS fixed_incomes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        value REAL NOT NULL,
        type TEXT DEFAULT 'Mensal',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );
    `);

    // Tabela de Despesas Fixas
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS fixed_expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        value REAL NOT NULL,
        category TEXT DEFAULT 'Geral',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );
    `);
    
    console.log('✅ Banco de dados Singleton inicializado com todas as tabelas');
  } catch (error) {
    console.error('❌ Erro crítico na inicialização do banco:', error);
    throw error;
  }
};

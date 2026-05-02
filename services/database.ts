import * as SQLite from 'expo-sqlite';

const DB_NAME = 'poupapobre.db';
let dbInstance: SQLite.SQLiteDatabase | null = null;
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export const getDatabase = async () => {
  if (dbInstance) return dbInstance;
  
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DB_NAME).then(db => {
      dbInstance = db;
      return db;
    });
  }
  
  return dbPromise;
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
        biometry_enabled INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de Transações (Receitas e Despesas Pontuais)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL, -- 'income' ou 'expense'
        description TEXT NOT NULL,
        value REAL NOT NULL,
        category TEXT NOT NULL,
        date TEXT NOT NULL,
        is_recurrent INTEGER DEFAULT 0,
        fixed_id INTEGER, -- Link para ID de receita/despesa fixa
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );
    `);

    // Tabela de Receitas Fixas
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS fixed_incomes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        value REAL NOT NULL,
        category TEXT DEFAULT 'Geral',
        frequency TEXT DEFAULT 'Mensal',
        due_day INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );
    `);

    // Tabela de Despesas Fixas (Atualizada com Frequência e Dia)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS fixed_expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        value REAL NOT NULL,
        category TEXT DEFAULT 'Geral',
        frequency TEXT DEFAULT 'Mensal',
        due_day INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );
    `);

    // Tabela de Metas
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        target_value REAL NOT NULL,
        current_value REAL DEFAULT 0,
        deadline TEXT,
        frequency TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de Histórico de Metas
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS goal_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        goal_id INTEGER NOT NULL,
        value REAL NOT NULL,
        date TEXT NOT NULL,
        description TEXT,
        FOREIGN KEY (goal_id) REFERENCES goals (id) ON DELETE CASCADE
      );
    `);

    // Tentar adicionar colunas caso a tabela já exista (Migração simples)
    try {
      await db.execAsync('ALTER TABLE fixed_expenses ADD COLUMN frequency TEXT DEFAULT "Mensal";');
    } catch (e) { }
    try {
      await db.execAsync('ALTER TABLE fixed_expenses ADD COLUMN due_day INTEGER;');
    } catch (e) { }

    // Migrações para fixed_incomes
    try {
      await db.execAsync('ALTER TABLE fixed_incomes ADD COLUMN category TEXT DEFAULT "Geral";');
    } catch (e) { }
    try {
      await db.execAsync('ALTER TABLE fixed_incomes ADD COLUMN frequency TEXT DEFAULT "Mensal";');
    } catch (e) { }
    try {
      await db.execAsync('ALTER TABLE fixed_incomes ADD COLUMN due_day INTEGER;');
    } catch (e) { }

    // Migração para transactions (fixed_id)
    // Migração para transactions (fixed_id)
    try {
      await db.execAsync('ALTER TABLE transactions ADD COLUMN fixed_id INTEGER;');
    } catch (e) { }

    // Migração para users (biometry_enabled)
    try {
      await db.execAsync('ALTER TABLE users ADD COLUMN biometry_enabled INTEGER DEFAULT 0;');
    } catch (e) { }

    // Migração para users (onboarding_completed)
    try {
      await db.execAsync('ALTER TABLE users ADD COLUMN onboarding_completed INTEGER DEFAULT 0;');
    } catch (e) { }

    console.log('✅ Banco de dados inicializado com novas colunas');
  } catch (error) {
    console.error('❌ Erro crítico na inicialização do banco:', error);
    throw error;
  }
};




import initSqlJs from 'sql.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '..', '..', 'data', 'gbngo.db');
const dataDir = join(__dirname, '..', '..', 'data');

let db = null;
let SQL = null;
let autoSaveInterval = null;
let isDirty = false;

// Ensure data directory exists
function ensureDataDir() {
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }
}

// Save database to disk
export function saveDatabase() {
  if (db && isDirty) {
    ensureDataDir();
    const data = db.export();
    const buffer = Buffer.from(data);
    writeFileSync(dbPath, buffer);
    isDirty = false;
    console.log('Database saved to disk');
  }
}

// Start auto-save interval
function startAutoSave() {
  if (!autoSaveInterval) {
    autoSaveInterval = setInterval(() => {
      saveDatabase();
    }, 5000); // Save every 5 seconds
  }
}

// Stop auto-save interval
function stopAutoSave() {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
    autoSaveInterval = null;
  }
}

// Get the database instance (async)
export async function getDatabase() {
  if (!db) {
    if (!SQL) {
      SQL = await initSqlJs();
    }

    ensureDataDir();

    // Try to load existing database from disk
    if (existsSync(dbPath)) {
      const fileBuffer = readFileSync(dbPath);
      db = new SQL.Database(fileBuffer);
    } else {
      db = new SQL.Database();
    }

    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON');

    startAutoSave();
  }
  return db;
}

// Close the database
export function closeDatabase() {
  if (db) {
    saveDatabase(); // Save before closing
    stopAutoSave();
    db.close();
    db = null;
    console.log('Database closed');
  }
}

// Helper function to run a query with parameters
export function runQuery(sql, params = []) {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  db.run(sql, params);
  isDirty = true;
}

// Helper function to get a single row
export function getOne(sql, params = []) {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  const stmt = db.prepare(sql);
  stmt.bind(params);

  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }

  stmt.free();
  return null;
}

// Helper function to get all rows
export function getAll(sql, params = []) {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  const stmt = db.prepare(sql);
  stmt.bind(params);

  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }

  stmt.free();
  return results;
}

// Helper function to get last insert row id
export function getLastInsertRowId() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  const result = db.exec('SELECT last_insert_rowid() as id');
  if (result.length > 0 && result[0].values.length > 0) {
    return result[0].values[0][0];
  }
  return null;
}

export async function initDatabase() {
  const db = await getDatabase();

  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      initials TEXT NOT NULL,
      pin_code TEXT,
      personal_qr_code TEXT UNIQUE,
      face_image_path TEXT,
      tickets_count INTEGER DEFAULT 0,
      tickets_expires_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      last_active_at TEXT DEFAULT CURRENT_TIMESTAMP,
      is_returning_guest INTEGER DEFAULT 0,
      UNIQUE(initials, pin_code)
    )
  `);

  // Games table
  db.run(`
    CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      max_players INTEGER DEFAULT 1,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Highscores table
  db.run(`
    CREATE TABLE IF NOT EXISTS highscores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      game_id INTEGER NOT NULL,
      score INTEGER NOT NULL,
      achieved_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
    )
  `);

  // Used receipts table
  db.run(`
    CREATE TABLE IF NOT EXISTS used_receipts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      receipt_identifier TEXT UNIQUE NOT NULL,
      used_at TEXT DEFAULT CURRENT_TIMESTAMP,
      user_id INTEGER,
      tickets_granted INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // Categories table
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Products table
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category_id INTEGER,
      tags TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    )
  `);

  // Idea responses table
  db.run(`
    CREATE TABLE IF NOT EXISTS idea_responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      is_active INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Advertisements table
  db.run(`
    CREATE TABLE IF NOT EXISTS advertisements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      image_path TEXT,
      message TEXT,
      price TEXT,
      is_active INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Settings table
  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  // Game sessions table
  db.run(`
    CREATE TABLE IF NOT EXISTS game_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      game_id INTEGER NOT NULL,
      started_at TEXT DEFAULT CURRENT_TIMESTAMP,
      ended_at TEXT,
      score INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
    )
  `);

  // Tournaments table
  db.run(`
    CREATE TABLE IF NOT EXISTS tournaments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'pending',
      current_round INTEGER DEFAULT 1,
      game_id INTEGER,
      winner_id INTEGER,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE SET NULL,
      FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // Tournament players table
  db.run(`
    CREATE TABLE IF NOT EXISTS tournament_players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tournament_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      position INTEGER,
      eliminated_at TEXT,
      FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  
  // Tournament matches table
  db.run(`
    CREATE TABLE IF NOT EXISTS tournament_matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tournament_id INTEGER NOT NULL,
      round INTEGER NOT NULL,
      match_order INTEGER NOT NULL,
      player1_id INTEGER,
      player2_id INTEGER,
      player1_score INTEGER,
      player2_score INTEGER,
      winner_id INTEGER,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
      FOREIGN KEY (player1_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (player2_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // Insert default settings if not exist
  const defaultSettings = [
    ['ticket_price_kronor', '20'],
    ['ticket_validity_hours', '30'],
    ['max_tickets_per_account', '50'],
    ['receipt_validity_minutes', '15'],
    ['session_timeout_minutes', '5'],
    ['game_time_limit_minutes', '5'],
    ['sound_enabled', 'true'],
    ['sound_volume', '70'],
    ['theme', 'default'],
    ['language', 'sv'],
    ['idle_view_cube_enabled', 'true'],
    ['idle_view_demos_enabled', 'true'],
    ['idle_view_ideas_enabled', 'true'],
    ['idle_view_ads_enabled', 'true'],
    ['idle_view_cube_percent', '25'],
    ['idle_view_demos_percent', '25'],
    ['idle_view_ideas_percent', '25'],
    ['idle_view_ads_percent', '25']
  ];

  for (const [key, value] of defaultSettings) {
    db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`, [key, value]);
  }

  // Insert default games if not exist
  const defaultGames = [
    ['Future Snake', 'future-snake', 'Classic Snake game with a futuristic twist', 2],
    ['Tic-Tac-Toe', 'tic-tac-toe', 'Classic three in a row game', 2],
    ['Pong', 'pong', 'Classic Pong game', 2]
  ];

  for (const [name, slug, description, maxPlayers] of defaultGames) {
    db.run(`INSERT OR IGNORE INTO games (name, slug, description, max_players) VALUES (?, ?, ?, ?)`, [name, slug, description, maxPlayers]);
  }

  // Insert default categories if not exist
  const defaultCategories = [
    ['Drycker', 1],
    ['Snacks', 2],
    ['Godis', 3],
    ['Mat', 4],
    ['Ovrigt', 5]
  ];

  for (const [name, sortOrder] of defaultCategories) {
    db.run(`INSERT OR IGNORE INTO categories (name, sort_order) VALUES (?, ?)`, [name, sortOrder]);
  }

  isDirty = true;
  saveDatabase(); // Save initial state

  console.log('Database initialized successfully');
  return db;
}

// Run init if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  initDatabase().catch(console.error);
}

const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "..", "waf.sqlite");
const db = new Database(dbPath);

function initDb() {
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS threat_logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT,
      method TEXT,
      path TEXT,
      ip TEXT,
      verdict TEXT,
      category TEXT,
      severity TEXT,
      rule_name TEXT,
      matched_in TEXT,
      payload TEXT,
      country TEXT,
      user_agent TEXT
    );

    CREATE TABLE IF NOT EXISTS rules (
      id TEXT PRIMARY KEY,
      name TEXT,
      description TEXT,
      severity TEXT,
      category TEXT,
      pattern TEXT,
      targets TEXT,
      enabled INTEGER DEFAULT 1,
      hit_count INTEGER DEFAULT 0,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS rate_limits (
      ip TEXT PRIMARY KEY,
      count INTEGER,
      window_start TEXT
    );
  `);
}

module.exports = { db, initDb };

import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.resolve(__dirname, '../agri_data.sqlite');

export const db = new DatabaseSync(DB_PATH);

// Initialize relational schema
export function initDatabase() {
  // 1. Farmers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS farmers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'Farmer',
      location TEXT NOT NULL DEFAULT 'Hyderabad, India',
      phone TEXT,
      email TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // 2. Crops table
  db.exec(`
    CREATE TABLE IF NOT EXISTS crops (
      id TEXT PRIMARY KEY,
      farmer_id TEXT NOT NULL DEFAULT 'farmer_1',
      name TEXT NOT NULL,
      field_name TEXT NOT NULL,
      area REAL NOT NULL,
      planting_date TEXT NOT NULL,
      growth_stage TEXT NOT NULL,
      irrigation_method TEXT NOT NULL,
      soil_type TEXT NOT NULL,
      health INTEGER NOT NULL DEFAULT 90,
      status TEXT NOT NULL DEFAULT 'Healthy',
      created_at TEXT NOT NULL,
      FOREIGN KEY (farmer_id) REFERENCES farmers(id)
    );
  `);

  // 3. Diagnoses history table
  db.exec(`
    CREATE TABLE IF NOT EXISTS diagnoses (
      id TEXT PRIMARY KEY,
      farmer_id TEXT NOT NULL DEFAULT 'farmer_1',
      crop_id TEXT,
      crop_name TEXT NOT NULL,
      field_name TEXT,
      disease TEXT NOT NULL,
      possible_diagnosis TEXT,
      confidence INTEGER NOT NULL,
      severity TEXT DEFAULT 'Moderate',
      symptoms TEXT NOT NULL,
      recommended_treatment TEXT,
      recommended_actions TEXT,
      chemical_treatment TEXT,
      fertilizer_recommendation TEXT,
      organic_alternative TEXT,
      prevention TEXT,
      weather_consideration TEXT,
      follow_up TEXT,
      full_data TEXT,
      image_url TEXT,
      date TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (farmer_id) REFERENCES farmers(id)
    );
  `);

  // Safe migration for existing SQLite database file
  try {
    const columns = db.prepare('PRAGMA table_info(diagnoses)').all().map(c => c.name);
    const newColumns = [
      { name: 'crop_id', type: 'TEXT' },
      { name: 'field_name', type: 'TEXT' },
      { name: 'possible_diagnosis', type: 'TEXT' },
      { name: 'severity', type: 'TEXT DEFAULT "Moderate"' },
      { name: 'recommended_actions', type: 'TEXT' },
      { name: 'chemical_treatment', type: 'TEXT' },
      { name: 'prevention', type: 'TEXT' },
      { name: 'weather_consideration', type: 'TEXT' },
      { name: 'follow_up', type: 'TEXT' },
      { name: 'full_data', type: 'TEXT' },
      { name: 'preferred_language', type: 'TEXT DEFAULT "en"' },
      { name: 'diagnosis_source', type: 'TEXT DEFAULT "gemini_vision"' }
    ];

    for (const col of newColumns) {
      if (!columns.includes(col.name)) {
        db.exec(`ALTER TABLE diagnoses ADD COLUMN ${col.name} ${col.type};`);
      }
    }
  } catch (migErr) {
    console.warn('Diagnoses table migration notice:', migErr.message);
  }

  // Seed default farmer profile if not present
  const checkFarmer = db.prepare('SELECT COUNT(*) as count FROM farmers').get();
  if (checkFarmer.count === 0) {
    const insertFarmer = db.prepare(`
      INSERT INTO farmers (id, name, role, location, phone, email, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertFarmer.run(
      'farmer_1',
      'Charan Teja',
      'Farmer',
      'Hyderabad, India',
      '+91 98765 43210',
      'charan.farmer@agriai.org',
      new Date().toISOString()
    );
    console.log('🌱 Seeded default farmer profile: Charan Teja');
  }

  console.log(`✅ SQLite Database connected and initialized at: ${DB_PATH}`);
}

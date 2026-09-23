import { Router } from 'express';
import { db } from '../db.js';

export const farmerRouter = Router();

// GET farmer profile
farmerRouter.get('/', (req, res) => {
  try {
    const farmer = db.prepare('SELECT * FROM farmers WHERE id = ?').get('farmer_1');
    if (!farmer) {
      return res.status(404).json({ error: 'Farmer profile not found' });
    }
    res.json(farmer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update farmer profile
farmerRouter.put('/', (req, res) => {
  try {
    const { name, location, phone, email } = req.body;
    const stmt = db.prepare(`
      UPDATE farmers
      SET name = COALESCE(?, name),
          location = COALESCE(?, location),
          phone = COALESCE(?, phone),
          email = COALESCE(?, email)
      WHERE id = 'farmer_1'
    `);
    stmt.run(name, location, phone, email);

    const updated = db.prepare('SELECT * FROM farmers WHERE id = ?').get('farmer_1');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

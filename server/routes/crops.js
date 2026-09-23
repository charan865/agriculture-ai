import { Router } from 'express';
import { db } from '../db.js';

export const cropsRouter = Router();

// GET all crops for current farmer
cropsRouter.get('/', (req, res) => {
  try {
    const crops = db.prepare('SELECT * FROM crops ORDER BY created_at DESC').all();
    // Normalize field names to match frontend types
    const mapped = crops.map(c => ({
      id: c.id,
      name: c.name,
      fieldName: c.field_name,
      area: c.area,
      plantingDate: c.planting_date,
      growthStage: c.growth_stage,
      irrigationMethod: c.irrigation_method,
      soilType: c.soil_type,
      health: c.health,
      status: c.status
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add a new crop
cropsRouter.post('/', (req, res) => {
  try {
    const {
      name,
      fieldName,
      area,
      plantingDate,
      growthStage,
      irrigationMethod,
      soilType,
      health = 90,
      status = 'Healthy'
    } = req.body;

    const id = `crop_${Date.now()}`;
    const createdAt = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO crops (
        id, farmer_id, name, field_name, area, planting_date,
        growth_stage, irrigation_method, soil_type, health, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      'farmer_1',
      name,
      fieldName || 'Main Plot',
      Number(area) || 1,
      plantingDate || '2026-08-15',
      growthStage || 'Vegetative',
      irrigationMethod || 'Drip',
      soilType || 'Red Soil',
      Number(health) || 90,
      status,
      createdAt
    );

    const newCrop = {
      id,
      name,
      fieldName: fieldName || 'Main Plot',
      area: Number(area) || 1,
      plantingDate,
      growthStage,
      irrigationMethod,
      soilType,
      health: Number(health) || 90,
      status
    };

    res.status(201).json(newCrop);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE single crop
cropsRouter.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM crops WHERE id = ?').run(id);
    res.json({ success: true, deletedId: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST seed demo crops (Tomato, Rice, Cotton, Chilli)
cropsRouter.post('/demo', (req, res) => {
  try {
    db.prepare('DELETE FROM crops').run();

    const sampleCrops = [
      { id: 'crop_1', name: 'Tomato', field_name: 'North Plot A', area: 2.5, planting_date: '2026-08-10', growth_stage: 'Fruiting', irrigation_method: 'Drip', soil_type: 'Red Soil', health: 92, status: 'Healthy' },
      { id: 'crop_2', name: 'Rice', field_name: 'Paddy Valley', area: 3.0, planting_date: '2026-07-25', growth_stage: 'Vegetative', irrigation_method: 'Flood', soil_type: 'Alluvial', health: 88, status: 'Healthy' },
      { id: 'crop_3', name: 'Cotton', field_name: 'East Ridge', area: 1.8, planting_date: '2026-08-01', growth_stage: 'Flowering', irrigation_method: 'Sprinkler', soil_type: 'Black Soil', health: 64, status: 'At Risk' },
      { id: 'crop_4', name: 'Chilli', field_name: 'South Garden', area: 1.2, planting_date: '2026-08-15', growth_stage: 'Vegetative', irrigation_method: 'Drip', soil_type: 'Sandy Loam', health: 95, status: 'Healthy' }
    ];

    const stmt = db.prepare(`
      INSERT INTO crops (
        id, farmer_id, name, field_name, area, planting_date,
        growth_stage, irrigation_method, soil_type, health, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();
    for (const c of sampleCrops) {
      stmt.run(c.id, 'farmer_1', c.name, c.field_name, c.area, c.planting_date, c.growth_stage, c.irrigation_method, c.soil_type, c.health, c.status, now);
    }

    res.json({ success: true, count: sampleCrops.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE clear all crops (for testing empty state)
cropsRouter.delete('/', (req, res) => {
  try {
    db.prepare('DELETE FROM crops').run();
    res.json({ success: true, message: 'All crops cleared from SQLite database.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

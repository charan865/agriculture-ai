import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './db.js';
import { cropsRouter } from './routes/crops.js';
import { farmerRouter } from './routes/farmer.js';
import { diagnosesRouter } from './routes/diagnoses.js';
import { aiRouter } from './routes/ai.js';
import { weatherRouter } from './routes/weather.js';

import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '15mb' })); // Support base64 image uploads
app.use('/uploads', express.static(path.resolve(__dirname, '../public/uploads')));

// Initialize SQLite Database schema
initDatabase();

// API Routes
app.use('/api/crops', cropsRouter);
app.use('/api/farmer', farmerRouter);
app.use('/api/diagnoses', diagnosesRouter);
app.use('/api/ai', aiRouter);
app.use('/api/weather', weatherRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'AgriAI SQLite Backend',
    database: 'SQLite (node:sqlite)',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 AgriAI Backend running on http://localhost:${PORT}`);
  console.log(`📡 API Endpoints available at http://localhost:${PORT}/api/`);
});

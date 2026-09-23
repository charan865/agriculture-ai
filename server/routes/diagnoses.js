import { Router } from 'express';
import { db } from '../db.js';
import { geminiService } from '../services/geminiService.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.resolve(__dirname, '../../public/uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  try {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  } catch (err) {
    console.warn('Could not create uploads directory:', err.message);
  }
}

export const diagnosesRouter = Router();

// Helper to save base64 image to public/uploads
function saveBase64Image(dataUrl, id) {
  if (!dataUrl || !dataUrl.startsWith('data:image/')) return dataUrl || '';
  try {
    const parts = dataUrl.split(';base64,');
    const mimeMatch = parts[0].match(/data:image\/(\w+)/);
    const ext = mimeMatch ? (mimeMatch[1] === 'jpeg' ? 'jpg' : mimeMatch[1]) : 'jpg';
    const filename = `leaf_${id}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, filename);
    const buffer = Buffer.from(parts[1], 'base64');
    fs.writeFileSync(filePath, buffer);
    return `/uploads/${filename}`;
  } catch (err) {
    console.warn('Failed to save image to disk:', err.message);
    return '';
  }
}

// GET diagnosis history
diagnosesRouter.get('/', (req, res) => {
  try {
    const list = db.prepare('SELECT * FROM diagnoses ORDER BY created_at DESC').all();
    const mapped = list.map(d => {
      let symptoms = [];
      try { symptoms = JSON.parse(d.symptoms || '[]'); } catch { symptoms = []; }
      
      let recommendedActions = [];
      try { recommendedActions = JSON.parse(d.recommended_actions || '[]'); } catch { recommendedActions = []; }

      let chemicalTreatment = { needed: false, recommendation: '', application_notes: '' };
      try {
        if (d.chemical_treatment) {
          chemicalTreatment = JSON.parse(d.chemical_treatment);
        }
      } catch {
        chemicalTreatment = { needed: false, recommendation: d.recommended_treatment || '', application_notes: '' };
      }

      let prevention = [];
      try { prevention = JSON.parse(d.prevention || '[]'); } catch { prevention = []; }

      const possibleDiagnosis = d.possible_diagnosis || d.disease || 'Unknown Plant Condition';

      const finalConfidence = typeof d.confidence === 'number' && d.confidence > 0 ? d.confidence : null;

      return {
        id: d.id,
        cropId: d.crop_id || undefined,
        cropName: d.crop_name,
        fieldName: d.field_name || 'Main Plot',
        possible_diagnosis: possibleDiagnosis,
        disease: possibleDiagnosis,
        confidence: finalConfidence,
        severity: d.severity || 'Moderate',
        symptoms,
        recommended_actions: recommendedActions.length > 0 ? recommendedActions : (d.recommended_treatment ? [d.recommended_treatment] : []),
        recommendedTreatment: d.recommended_treatment || chemicalTreatment.recommendation || '',
        chemical_treatment: chemicalTreatment,
        fertilizerRecommendation: d.fertilizer_recommendation || '',
        organic_alternative: d.organic_alternative || '',
        organicAlternative: d.organic_alternative || '',
        prevention,
        weather_consideration: d.weather_consideration || 'Weather data unavailable. Recommendations are based on crop and image analysis.',
        follow_up: d.follow_up || '',
        imageUrl: d.image_url || '',
        date: d.date,
        createdAt: d.created_at,
        preferredLanguage: d.preferred_language || 'en',
        diagnosisSource: d.diagnosis_source || 'gemini_vision',
        aiModel: d.diagnosis_source === 'curated_fallback' ? 'Curated Agronomy Engine (Fallback)' : 'AgriAI Vision'
      };
    });
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST save a diagnosis
diagnosesRouter.post('/', (req, res) => {
  try {
    const {
      id: customId,
      cropId,
      cropName,
      fieldName,
      possible_diagnosis,
      disease,
      confidence,
      severity,
      symptoms,
      recommended_actions,
      recommendedTreatment,
      chemical_treatment,
      fertilizerRecommendation,
      organic_alternative,
      organicAlternative,
      prevention,
      weather_consideration,
      follow_up,
      imageUrl,
      date,
      preferredLanguage,
      diagnosisSource
    } = req.body;

    const id = customId || `diag_${Date.now()}`;
    const createdAt = new Date().toISOString();
    const finalDisease = possible_diagnosis || disease || 'Plant Condition';
    const finalOrganic = organic_alternative || organicAlternative || '';
    const finalTreatment = (chemical_treatment && chemical_treatment.recommendation) || recommendedTreatment || (recommended_actions && recommended_actions[0]) || '';
    const finalLang = preferredLanguage || 'en';
    const finalSource = diagnosisSource || 'gemini_vision';
    const dbConfidence = typeof confidence === 'number' && confidence > 0 ? confidence : 0;
    
    // Save image to disk if base64 to prevent SQLite database bloat
    let storedImageUrl = imageUrl || '';
    if (storedImageUrl && storedImageUrl.startsWith('data:image/')) {
      storedImageUrl = saveBase64Image(storedImageUrl, id);
    }

    const stmt = db.prepare(`
      INSERT INTO diagnoses (
        id, farmer_id, crop_id, crop_name, field_name, disease, possible_diagnosis,
        confidence, severity, symptoms, recommended_treatment, recommended_actions,
        chemical_treatment, fertilizer_recommendation, organic_alternative,
        prevention, weather_consideration, follow_up, image_url, date, created_at,
        preferred_language, diagnosis_source
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      'farmer_1',
      cropId || null,
      cropName || 'Crop',
      fieldName || 'Main Plot',
      finalDisease,
      finalDisease,
      dbConfidence,
      severity || 'Moderate',
      JSON.stringify(symptoms || []),
      finalTreatment,
      JSON.stringify(recommended_actions || []),
      JSON.stringify(chemical_treatment || { needed: false, recommendation: '', application_notes: '' }),
      fertilizerRecommendation || '',
      finalOrganic,
      JSON.stringify(prevention || []),
      weather_consideration || 'Weather data unavailable. Recommendations are based on crop and image analysis.',
      follow_up || '',
      storedImageUrl,
      date || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      createdAt,
      finalLang,
      finalSource
    );

    res.status(201).json({
      id,
      cropName,
      fieldName,
      possible_diagnosis: finalDisease,
      disease: finalDisease,
      confidence: typeof confidence === 'number' ? confidence : null,
      severity: severity || 'Moderate',
      imageUrl: storedImageUrl,
      preferredLanguage: finalLang,
      diagnosisSource: finalSource,
      success: true
    });
  } catch (err) {
    console.error('Error saving diagnosis:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE diagnosis
diagnosesRouter.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM diagnoses WHERE id = ?').run(id);
    res.json({ success: true, deletedId: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST analyze leaf photo using Gemini vision
diagnosesRouter.post('/analyze', async (req, res) => {
  try {
    const { image, crop, cropName, weather, preferredLanguage = 'en' } = req.body;
    
    // 1. Check presence
    if (!image || typeof image !== 'string' || !image.trim()) {
      return res.status(400).json({ error: 'Please upload a photo of the affected crop leaf.' });
    }

    // 2. Validate data URL format and MIME type
    if (!image.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Unsupported file format. Please upload a JPG, PNG, or WEBP photo.' });
    }

    const mimeMatch = image.match(/^data:(image\/[a-zA-Z0-9.-]+);base64,/);
    if (!mimeMatch) {
      return res.status(400).json({ error: 'Invalid or corrupt image data. Please upload a clear photo.' });
    }

    const mimeType = mimeMatch[1].toLowerCase();
    const validMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validMimes.includes(mimeType)) {
      return res.status(400).json({ error: 'Unsupported file format. Please upload a JPG, PNG, or WEBP photo.' });
    }

    // 3. Approximate decoded file size
    const base64Part = image.split(';base64,')[1] || '';
    const approxBytes = Math.round((base64Part.length * 3) / 4);

    // Reject extremely small or empty images (< 500 bytes)
    if (approxBytes < 500) {
      return res.status(400).json({ error: 'The uploaded image appears empty or corrupt. Please select a valid photo.' });
    }

    // Reject oversized images (> 10MB)
    const MAX_BYTES = 10 * 1024 * 1024;
    if (approxBytes > MAX_BYTES) {
      return res.status(400).json({ error: 'Photo exceeds 10MB limit. Please upload a smaller image.' });
    }

    const cropContext = crop || { cropName: cropName || 'Tomato' };
    const diagnosis = await geminiService.diagnoseCropLeaf(image, cropContext, weather, preferredLanguage);
    res.json(diagnosis);
  } catch (err) {
    console.error('Diagnosis analyze error:', err.message);
    res.status(500).json({ error: 'Unable to analyze the image right now. Please try again.' });
  }
});

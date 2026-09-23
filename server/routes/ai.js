import { Router } from 'express';
import { geminiService } from '../services/geminiService.js';

export const aiRouter = Router();

// GET AI status (checks if GEMINI_API_KEY is active)
aiRouter.get('/status', (req, res) => {
  res.json({
    geminiConfigured: geminiService.isConfigured(),
    model: 'gemini-3.6-flash',
    mode: geminiService.isConfigured() ? 'live_gemini_api' : 'curated_agronomy_fallback'
  });
});

// POST chat with AgriAI
aiRouter.post('/chat', async (req, res) => {
  try {
    const query = req.body.query || req.body.message;
    const { crops = [], weather = null, preferredLanguage = 'en' } = req.body;
    if (!query || !query.trim()) {
      return res.status(400).json({ error: 'Query or message is required' });
    }

    const result = await geminiService.chatWithAgriAI(query, crops, weather, preferredLanguage);
    if (typeof result === 'string') {
      res.json({ reply: result, model: 'AgriAI', isLiveGemini: true });
    } else {
      res.json(result);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST dynamic AI recommendations based on crops and live weather
aiRouter.post('/recommendations', async (req, res) => {
  try {
    const { crops = [], weather = null, preferredLanguage = 'en' } = req.body;
    const recommendations = await geminiService.generateRecommendations(crops, weather, preferredLanguage);
    res.json(recommendations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


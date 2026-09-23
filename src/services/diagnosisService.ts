import { DiagnosisResult, CropDiagnosisContext, WeatherData } from '../types';

const STORAGE_KEY = 'agri_ai_diagnosis_history_v2';

export const diagnosisService = {
  // Load real diagnosis history from SQLite API with local backup
  async getDiagnosisHistory(): Promise<DiagnosisResult[]> {
    try {
      const res = await fetch('/api/diagnoses');
      if (res.ok) {
        const data = await res.json();
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch {
          // Ignore storage quota
        }
        return data;
      }
    } catch {
      // Offline fallback
    }

    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) return JSON.parse(cached);
    } catch {
      // Ignore
    }

    // No fake/demo history! Return clean empty list if user has no saved history
    return [];
  },

  async saveDiagnosis(result: DiagnosisResult): Promise<DiagnosisResult[]> {
    try {
      const res = await fetch('/api/diagnoses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result)
      });
      if (res.ok) {
        return this.getDiagnosisHistory();
      }
    } catch {
      // Fallback
    }

    const current = await this.getDiagnosisHistory();
    const updated = [result, ...current.filter((d) => d.id !== result.id)];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
    return updated;
  },

  async deleteDiagnosis(id: string): Promise<DiagnosisResult[]> {
    try {
      await fetch(`/api/diagnoses/${id}`, { method: 'DELETE' });
      return this.getDiagnosisHistory();
    } catch {
      // Fallback
    }

    const current = await this.getDiagnosisHistory();
    const updated = current.filter((d) => d.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
    return updated;
  },

  // Calls backend Gemini multimodal vision API with crop context and live weather
  async analyzeCropImage(
    cropInput: CropDiagnosisContext | string,
    imageDataUrl: string,
    weather?: WeatherData | null,
    preferredLanguage: string = 'en'
  ): Promise<DiagnosisResult> {
    const cropContext: CropDiagnosisContext = typeof cropInput === 'string'
      ? { cropName: cropInput }
      : cropInput;

    const res = await fetch('/api/diagnoses/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: imageDataUrl,
        crop: cropContext,
        cropName: cropContext.cropName,
        preferredLanguage,
        weather: weather ? {
          temp: weather.temp,
          condition: weather.condition,
          humidity: weather.humidity,
          windSpeed: weather.windSpeed,
          rainChance: weather.rainChance,
          location: weather.location
        } : null
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Server error occurred during analysis');
    }

    const aiResult = await res.json();
    const possibleDiagnosis = aiResult.possible_diagnosis || aiResult.disease || `Possible condition on ${cropContext.cropName}`;
    const organicAlternative = aiResult.organic_alternative || aiResult.organicAlternative || '';
    const chemicalTreatment = aiResult.chemical_treatment || {
      needed: false,
      recommendation: aiResult.recommendedTreatment || '',
      application_notes: ''
    };

    return {
      id: `diag_${Date.now()}`,
      cropId: cropContext.cropId,
      cropName: cropContext.cropName || aiResult.cropName || 'Crop',
      fieldName: cropContext.fieldName || aiResult.fieldName || 'Main Plot',
      possible_diagnosis: possibleDiagnosis,
      confidence: typeof aiResult.confidence === 'number' && aiResult.confidence > 0 ? aiResult.confidence : null,
      severity: aiResult.severity || 'Moderate',
      symptoms: Array.isArray(aiResult.symptoms) ? aiResult.symptoms : [],
      recommended_actions: Array.isArray(aiResult.recommended_actions) && aiResult.recommended_actions.length > 0
        ? aiResult.recommended_actions
        : (aiResult.recommendedTreatment ? [aiResult.recommendedTreatment] : ['Monitor crop condition']),
      recommendedTreatment: chemicalTreatment.recommendation || aiResult.recommendedTreatment || '',
      chemical_treatment: chemicalTreatment,
      fertilizerRecommendation: aiResult.fertilizerRecommendation || '',
      organic_alternative: organicAlternative,
      organicAlternative: organicAlternative,
      prevention: Array.isArray(aiResult.prevention) ? aiResult.prevention : [],
      weather_consideration: aiResult.weather_consideration || 'Weather data unavailable. Recommendations are based on crop and image analysis.',
      follow_up: aiResult.follow_up || 'Inspect foliage in 4-5 days to observe response.',
      imageUrl: aiResult.imageUrl || imageDataUrl,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      createdAt: new Date().toISOString(),
      aiModel: aiResult.aiModel || 'AgriAI Vision',
      diagnosisSource: aiResult.diagnosisSource || (aiResult.isFallback ? 'curated_fallback' : 'gemini_vision'),
      isFallback: !!aiResult.isFallback,
      preferredLanguage
    };
  }
};

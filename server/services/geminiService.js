import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
let aiClient = null;

if (apiKey && apiKey !== 'your_gemini_api_key_here' && apiKey.trim().length > 0) {
  try {
    aiClient = new GoogleGenAI({ apiKey: apiKey.trim() });
    console.log('🤖 Google Gemini API initialized successfully!');
  } catch (err) {
    console.warn('⚠️ Could not initialize GoogleGenAI client:', err.message);
  }
} else {
  console.log('ℹ️ No GEMINI_API_KEY found in .env. Running in smart agronomy fallback mode.');
}

const CANDIDATE_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-3-flash-preview',
  'gemini-flash-latest'
];

function withTimeout(promise, ms = 10000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('AI candidate timeout')), ms))
  ]);
}

function safeParseJSON(text) {
  if (!text) return null;
  const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {}
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch {}
  }
  return null;
}

export const geminiService = {
  isConfigured() {
    return !!aiClient;
  },

  // 1. Multimodal AI Leaf & Crop Diagnosis with Farm & Weather Context
  async diagnoseCropLeaf(base64Image, cropInput = 'Tomato', weather = null, preferredLanguage = 'en') {
    const crop = typeof cropInput === 'string' ? { cropName: cropInput } : (cropInput || {});
    const cropName = crop.cropName || crop.name || 'Crop';
    const fieldName = crop.fieldName || 'Main Plot';
    const isTelugu = preferredLanguage === 'te' || preferredLanguage === 'telugu';

    let weatherContextStr = isTelugu
      ? 'వాతావరణ సమాచారం అందుబాటులో లేదు. సిఫార్సులు పంట మరియు చిత్ర విశ్లేషణపై ఆధారపడి ఉంటాయి.'
      : 'Weather data unavailable. Recommendations are based on crop and image analysis.';
    if (weather && (weather.temp != null || weather.condition)) {
      weatherContextStr = `Current Farm Weather: ${weather.temp != null ? `${weather.temp}°C` : ''} (${weather.condition || 'Clear'}), Humidity: ${weather.humidity ?? 'N/A'}%, Wind Speed: ${weather.windSpeed ?? 'N/A'} km/h, Rain Probability: ${weather.rainChance ?? 0}%, Farm Location: ${weather.location || crop.location || 'Local Farm'}.`;
    }

    if (aiClient) {
      const languageInstruction = isTelugu
        ? `CRITICAL LANGUAGE REQUIREMENT:
The farmer's selected language is TELUGU (తెలుగు).
You MUST write all explanations, symptoms, recommended_actions, chemical_treatment, organic_alternative, prevention, and weather_consideration in natural, conversational, farmer-friendly Telugu.
- For "possible_diagnosis", write the scientific/English name followed by the Telugu name in brackets, e.g. "Early Blight (ఎర్లీ బ్లైట్)" or "Aphid Infestation (పేనుబంక తెగులు)".
- All symptoms, actions, prevention, and notes MUST be in clear, easy-to-understand Telugu. Keep technical chemical names in English with Telugu dosage instructions.`
        : `CRITICAL LANGUAGE REQUIREMENT:
Respond in clear, practical, professional English.`;

      const prompt = `You are an expert plant pathologist and agronomist for AgriAI.
Analyze this uploaded photo carefully with the following farm and environmental context:

CROP CONTEXT:
- Crop: ${cropName}
- Field / Plot: ${fieldName}
- Growth Stage: ${crop.growthStage || 'Vegetative / Active'}
- Planting Date: ${crop.plantingDate || 'Not specified'}
- Soil Type: ${crop.soilType || 'Not specified'}
- Irrigation Method: ${crop.irrigationMethod || 'Not specified'}
- Farm Location: ${crop.location || 'Regional Farm'}

WEATHER CONTEXT:
${weatherContextStr}

${languageInstruction}

VISUAL INSPECTION GUIDELINES:
1. IMAGE RELEVANCE & CLARITY CHECK:
   - First, inspect whether this photo actually depicts a crop leaf, stem, fruit, or plant.
   - If the image is completely unrelated (e.g., a person, vehicle, building, furniture, animal, document) or is too blurry, dark, or corrupted to identify botanical features:
     * Do NOT invent or hallucinate a crop disease!
     * Set "possible_diagnosis" to: ${isTelugu ? '"అస్పష్టమైన / పంట సంబంధం లేని చిత్రం (Unclear / Non-Plant Image)"' : '"Unclear / Non-Plant Image"'}
     * Set "confidence" to 0
     * Set "severity" to "None"
     * In "symptoms", state clearly that the uploaded image does not contain identifiable crop leaves or plant symptoms.
     * In "recommended_actions", instruct the farmer to take a clear, well-lit photo focusing directly on the affected leaf.
     * Under "chemical_treatment", set needed to false and state that no treatment should be applied without visual evidence.

2. HEALTHY PLANT RECOGNITION:
   - If the leaf or plant appears green, robust, and healthy with no lesions, spotting, wilting, curling, or pests:
     * Do NOT invent a disease!
     * Set "possible_diagnosis" to: ${isTelugu ? '"స్పష్టమైన తెగులు లక్షణాలు లేవు (No Obvious Disease Symptoms Detected)"' : '"No Obvious Disease Symptoms Detected"'}
     * Set "confidence" to 92
     * Set "severity" to "None"
     * In "symptoms", confirm that foliage exhibits healthy coloration, normal turgor, and no visible fungal or pest damage.
     * In "recommended_actions", encourage continuing current routine irrigation and nutrient management.
     * Under "chemical_treatment", set needed to false.

3. DISEASED / PEST-AFFECTED PLANT ASSESSMENT:
   - If visible symptoms (spots, chlorosis, blights, powdery mildew, insect bites, aphids, wilting) are detected:
     * State the assessment as a "Possible [Condition Name]" (e.g. "Possible Early Blight", "Possible Aphid Infestation"). NEVER state laboratory-level absolute confirmation.
     * State "confidence" as a realistic integer (typically 70-90) based on symptom clarity.
     * Assign "severity" ("Mild", "Moderate", or "Severe").
     * Provide specific "symptoms" observed on the leaf surface.
     * Under "chemical_treatment", provide practical active ingredients only if needed. ALWAYS include a safety caution reminding the farmer to read product labels and consult local agricultural extension officers before application.
     * Under "organic_alternative", provide practical bio-control, neem formulations, microbial inoculants, or cultural practices.
     * Under "weather_consideration", evaluate how current farm weather impacts spray timing or disease proliferation.

Respond ONLY with a valid JSON object matching this exact schema:
{
  "possible_diagnosis": "...",
  "confidence": 85,
  "severity": "Mild",
  "symptoms": ["..."],
  "recommended_actions": ["..."],
  "chemical_treatment": {
    "needed": false,
    "recommendation": "...",
    "application_notes": "..."
  },
  "organic_alternative": "...",
  "prevention": ["..."],
  "weather_consideration": "...",
  "follow_up": "..."
}`;

      // Extract base64 and mime type
      let mimeType = 'image/jpeg';
      let rawBase64 = base64Image;

      if (base64Image.includes('data:') && base64Image.includes(';base64,')) {
        const parts = base64Image.split(';base64,');
        mimeType = parts[0].replace('data:', '');
        rawBase64 = parts[1];
      }

      for (const modelName of CANDIDATE_MODELS) {
        try {
          const response = await withTimeout(aiClient.models.generateContent({
            model: modelName,
            contents: [
              {
                role: 'user',
                parts: [
                  { text: prompt },
                  {
                    inlineData: {
                      mimeType: mimeType,
                      data: rawBase64
                    }
                  }
                ]
              }
            ]
          }), 12000);

          const text = response.text ? response.text.trim() : '';
          const parsed = safeParseJSON(text);

          if (parsed && parsed.possible_diagnosis) {
            console.log(`✅ Diagnosis succeeded with model: ${modelName}`);
            return {
              ...parsed,
              cropName,
              fieldName,
              disease: parsed.possible_diagnosis,
              confidence: typeof parsed.confidence === 'number' && parsed.confidence > 0 ? parsed.confidence : null,
              severity: parsed.severity || 'Moderate',
              symptoms: Array.isArray(parsed.symptoms) ? parsed.symptoms : [],
              recommended_actions: Array.isArray(parsed.recommended_actions) ? parsed.recommended_actions : [],
              recommendedTreatment: parsed.chemical_treatment?.recommendation || parsed.recommended_actions?.[0] || 'See recommended actions',
              fertilizerRecommendation: parsed.recommended_actions?.[1] || 'Maintain balanced crop nutrition',
              organicAlternative: parsed.organic_alternative || '',
              diagnosisSource: 'gemini_vision',
              aiModel: `AgriAI Vision (${modelName})`
            };
          }
        } catch (err) {
          console.warn(`Gemini diagnosis attempt with ${modelName} failed (${err.message}). Trying next candidate...`);
          await new Promise((r) => setTimeout(r, 600));
        }
      }
    }

    // Transparent Curated Agronomy Fallback when Gemini API is unavailable or rate-limited
    // Does NOT pretend to visually diagnose the image.
    console.log('🌾 Visual AI unavailable. Generating curated agronomy guidance for', cropName);
    const weatherNotice = isTelugu
      ? (weather && weather.rainChance > 40
          ? `వాతావరణ సూచన ప్రకారం ${weather.rainChance}% వర్షం పడే అవకాశం ఉంది. పిచికారీని వాయిదా వేయండి.`
          : weather
            ? `ప్రస్తుత ఉష్ణోగ్రత ${weather.temp}°C మరియు ${weather.humidity}% తేమ ఉన్నాయి.`
            : 'వాతావరణ సమాచారం అందుబాటులో లేదు. మీ పంట సమాచారం ఆధారంగా సలహాలు అందించబడుతున్నాయి.')
      : (weather && weather.rainChance > 40
          ? `Forecast indicates a ${weather.rainChance}% rain chance in ${weather.location || 'your area'}. Postpone foliar treatments until foliage dries.`
          : weather
            ? `Current conditions: ${weather.temp}°C, ${weather.humidity}% humidity in ${weather.location || 'your area'}.`
            : 'Weather data unavailable. Recommendations are based on crop profile.');

    return isTelugu ? {
      possible_diagnosis: `సాధారణ పంట సలహా: ${cropName} (General Advisory)`,
      confidence: null,
      severity: 'Moderate',
      diagnosisSource: 'curated_fallback',
      aiModel: 'Curated Agronomy Engine (Fallback)',
      isFallback: true,
      symptoms: [
        'గమనిక: దృశ్య AI విశ్లేషణ తాత్కాలికంగా అందుబాటులో లేదు.',
        `నమోదిత ${cropName} (${crop.growthStage || 'పెరుగుదల దశ'}, ${crop.irrigationMethod || 'నీటిపారుదల'}) ఆధారంగా సాధారణ సలహా అందించబడుతోంది.`
      ],
      recommended_actions: [
        `పొలంలో ${cropName} మొక్కలను క్రమం తప్పకుండా పరిశీలించి ఆకుల అడుగు భాగాన్ని తనిఖీ చేయండి.`,
        'నీటిపారుదల మరియు ఎరువుల నిర్వహణను ప్రస్తుత వాతావరణ పరిస్థితులకు అనుగుణంగా చేపట్టండి.'
      ],
      chemical_treatment: {
        needed: false,
        recommendation: 'దృశ్య నిర్ధారణ లేకుండా ఎటువంటి రసాయన మందులను పిచికారీ చేయవద్దు.',
        application_notes: 'తీవ్రమైన సమస్యలు ఉంటే స్థానిక వ్యవసాయ అధికారి లేదా విశ్వవిద్యాలయ విస్తరణ కేంద్రాన్ని సంప్రదించండి.'
      },
      organic_alternative: 'నివారణ చర్యగా వేప నూనె (5 మి.లీ/లీ నీటికి) లేదా జీవామృతం ఉపయోగించవచ్చు.',
      prevention: [
        'పొలంలో నీరు నిలవకుండా మురుగు కాలువలను సరిగ్గా ఉంచండి.',
        'సమతుల్య ఎరువులను ఉపయోగించి పంట రోగనిరోధక శక్తిని పెంచండి.'
      ],
      weather_consideration: weatherNotice,
      follow_up: 'నెట్‌వర్క్ మరియు AI సేవలు అందుబాటులోకి వచ్చిన తర్వాత స్పష్టమైన ఆకు ఫోటోతో మళ్లీ ప్రయత్నించండి.',
      cropName,
      fieldName,
      disease: `సాధారణ పంట సలహా: ${cropName}`,
      recommendedTreatment: 'లక్షణాలు కనిపిస్తే స్థానిక వ్యవసాయ నిపుణుడిని సంప్రదించండి',
      fertilizerRecommendation: 'సమతుల్య ఎరువులను ఉపయోగించండి',
      organicAlternative: 'వేప నూనె (5 మి.లీ/లీ)',
    } : {
      possible_diagnosis: `General Crop Advisory: ${cropName}`,
      confidence: null,
      severity: 'Moderate',
      diagnosisSource: 'curated_fallback',
      aiModel: 'Curated Agronomy Engine (Fallback)',
      isFallback: true,
      symptoms: [
        'Note: Visual AI analysis was temporarily unavailable.',
        `General agronomy guidance is provided based on registered ${cropName} profile (${crop.growthStage || 'active stage'}, ${crop.irrigationMethod || 'irrigation'}).`
      ],
      recommended_actions: [
        `Routinely scout your ${cropName} plot, inspecting the undersides of terminal leaves.`,
        'Ensure irrigation cycles and fertilizer applications match the current local weather forecast.'
      ],
      chemical_treatment: {
        needed: false,
        recommendation: 'Avoid applying chemical pesticides without confirmed visual diagnosis.',
        application_notes: 'Consult your local agricultural extension officer for field verification before spraying.'
      },
      organic_alternative: 'Consider preventative neem oil formulations (3-5 ml/L) or beneficial bio-inoculants.',
      prevention: [
        'Maintain proper field drainage to prevent root diseases.',
        'Keep field borders weed-free to eliminate alternate insect hosts.'
      ],
      weather_consideration: weatherNotice,
      follow_up: 'Capture a clear, well-lit photo of the affected leaf and try AI diagnosis again.',
      cropName,
      fieldName,
      disease: `General Crop Advisory: ${cropName}`,
      recommendedTreatment: 'Consult extension officer if physical symptoms persist',
      fertilizerRecommendation: 'Maintain balanced N-P-K nutrient application',
      organicAlternative: 'Preventative neem oil spray (3-5 ml/L)',
    };
  },

  // 2. Context-Aware AI Agronomy Assistant
  async chatWithAgriAI(userQuery, crops = [], weather = null, preferredLanguage = 'en') {
    const isTelugu = preferredLanguage === 'te' || preferredLanguage === 'telugu' || preferredLanguage === 'Telugu';

    if (aiClient) {
      try {
        const cropsSummary = crops.length > 0 
          ? crops.map(c => `- ${c.name}: ${c.area} acres in ${c.fieldName}, stage: ${c.growthStage}, irrigation: ${c.irrigationMethod}, soil: ${c.soilType}, health: ${c.health}%`).join('\n')
          : 'No crops registered yet.';

        const weatherSummary = weather 
          ? `Location: ${weather.location}, Temperature: ${weather.temp}°C, Condition: ${weather.condition}, Humidity: ${weather.humidity}%, Wind: ${weather.windSpeed} km/h, Rain Probability: ${weather.rainChance}%`
          : 'Weather data not provided.';

        const languageInstructions = isTelugu
          ? `CRITICAL LANGUAGE REQUIREMENT:
The farmer's selected language is TELUGU (తెలుగు).
- Respond COMPLETELY in natural, conversational, farmer-friendly Telugu.
- Keep sentences simple, clear, and direct. Avoid overly formal or archaic literary Telugu.
- Explain agricultural terms clearly. If mentioning a technical disease name or chemical, preserve the English term in brackets, e.g. "Early Blight (ఎర్లీ బ్లైట్)" or "Acetamiprid 20% SP".
- Use bullet points (•) for steps and recommendations.
- Keep numerical values, dosages, and weather numbers natural and unchanged.
- Never fabricate agricultural facts.`
          : `CRITICAL LANGUAGE REQUIREMENT:
Respond in clear, practical, professional English.`;

        const systemInstruction = `You are AgriAI, a wise, friendly, highly specialized agricultural intelligence assistant helping farmer Charan Teja.
Farmer's Active Crops:
${cropsSummary}

Current Real-time Weather:
${weatherSummary}

${languageInstructions}

Guidelines:
1. Always give practical, farmer-friendly, precise agronomic guidance.
2. If the farmer asks about irrigation, refer directly to their registered crop stages and current rain chance.
3. If they ask about pests/diseases, recommend both scientifically approved targeted remedies and organic/IPM solutions.
4. Keep answers concise, formatted with clear bullet points where helpful.`;

        for (const modelName of CANDIDATE_MODELS) {
          try {
            console.log(`🤖 Requesting Google Gemini with model: ${modelName} (Language: ${preferredLanguage})...`);
            const response = await withTimeout(aiClient.models.generateContent({
              model: modelName,
              contents: [
                {
                  role: 'user',
                  parts: [
                    { text: `${systemInstruction}\n\nFarmer Query: ${userQuery}` }
                  ]
                }
              ]
            }), 35000);

            if (response.text && response.text.trim().length > 0) {
              console.log(`✅ Live response received via ${modelName}!`);
              return {
                reply: response.text.trim(),
                model: 'AgriAI',
                isLiveGemini: true
              };
            }
          } catch (err) {
            console.warn(`AI model attempt with ${modelName} failed (${err.message}). Trying next candidate...`);
            await new Promise((r) => setTimeout(r, 600));
          }
        }
      } catch (err) {
        console.error('AI chat outer failure:', err.message);
      }
    }

    // Agronomy fallback
    const lower = userQuery.toLowerCase();
    const matchedCrop = crops.find(c => lower.includes(c.name.toLowerCase()));

    let fallbackText = '';
    if (lower.includes('water') || lower.includes('irrigation') || lower.includes('నీరు') || lower.includes('నీటి')) {
      const weatherInfo = weather ? `${weather.temp}°C, ${weather.rainChance}% rain chance in ${weather.location}` : 'moderate conditions';
      if (isTelugu) {
        if (matchedCrop) {
          fallbackText = `మీ **${matchedCrop.name}** పంట (${matchedCrop.area} ఎకరాలు, ${matchedCrop.growthStage} దశ, ${matchedCrop.irrigationMethod} పద్ధతి) గురించి:\nప్రస్తుత వాతావరణం (${weather ? `${weather.temp}°C, ${weather.rainChance}% వర్ష సూచన` : 'సాధారణం'}) ప్రకారం, ఉదయం 6:30 గంటలకు తేలికపాటి నీటిపారుదల ఇవ్వండి. పగటిపూట ఆవిరి నష్టాన్ని నివారించండి మరియు వర్షం అవకాశం 50% మించితే నీరు పెట్టడం వాయిదా వేయండి.`;
        } else {
          fallbackText = `మీ పొలాల కోసం: ప్రస్తుత వాతావరణ పరిస్థితులలో మట్టి తేమను 2 అంగుళాల లోతులో పరిశీలించిన తర్వాత మాత్రమే నీటిపారుదల ప్రారంభించండి.`;
        }
      } else {
        if (matchedCrop) {
          fallbackText = `Regarding your **${matchedCrop.name}** (${matchedCrop.area} acres, ${matchedCrop.growthStage} stage, ${matchedCrop.irrigationMethod} irrigation):\nGiven that current weather is ${weatherInfo}, topsoil moisture is likely stable. Run a light early-morning irrigation cycle (around 6:30 AM) to prevent daytime evaporation loss, and pause if rain probability exceeds 50%.`;
        } else {
          fallbackText = `For your current plots: With current weather at ${weatherInfo}, hold off heavy irrigation until you inspect soil moisture 2 inches below the surface.`;
        }
      }
    } else {
      if (isTelugu) {
        fallbackText = `నమస్కారం చరణ్! నేను మీ AgriAI వ్యవసాయ సహాయకుడిని. ${weather ? weather.location : 'మీ ప్రాంతం'} వాతావరణం మరియు మీ పంటలను పర్యవేక్షిస్తున్నాను. ఎరువుల మోతాదు, పిచికారీ సమయం, తెగుళ్ళ నివారణ లేదా సాగు విధానాల గురించి నన్ను అడగండి!`;
      } else {
        fallbackText = `Hello Charan! I am AgriAI. I am monitoring your registered crops and local weather in ${weather ? weather.location : 'Hyderabad'}. Ask me about pesticide formulas, spray timing, soil nutrition, or disease management!`;
      }
    }

    return {
      reply: fallbackText,
      model: 'AgriAI',
      isLiveGemini: false
    };
  },

  // 3. AI Crop & Weather-Aware Recommendations
  async generateRecommendations(crops = [], weather = null, preferredLanguage = 'en') {
    const isTelugu = preferredLanguage === 'te' || preferredLanguage === 'telugu' || preferredLanguage === 'Telugu';

    if (crops.length === 0) {
      return [
        {
          id: 'rec-init-1',
          title: isTelugu ? 'మీ పంటలను నమోదు చేయండి' : 'Register Your Active Crops',
          description: isTelugu
            ? 'వ్యక్తిగతీకరించిన తెగుళ్ల హెచ్చరికలు, నీటిపారుదల సూచనలు మరియు ఎరువుల ప్రణాళికను పొందడానికి మీ పంటలను జోడించండి.'
            : 'Add your fields to unlock personalized pest warnings, irrigation guidance, and fertilizer schedules.',
          severity: 'info',
          cropName: isTelugu ? 'అన్ని పొలాలు' : 'All Plots',
          fieldName: isTelugu ? 'ప్రధాన పొలం' : 'Main Farm',
          dateStr: isTelugu ? 'చర్య అవసరం' : 'Action needed'
        }
      ];
    }

    if (aiClient) {
      const cropsStr = crops.map(c => `${c.name} (${c.growthStage} stage, ${c.area} acres, soil: ${c.soilType})`).join(', ');
      const weatherStr = weather 
        ? `${weather.location}: ${weather.temp}°C, ${weather.condition}, ${weather.rainChance}% rain chance, ${weather.windSpeed} km/h wind`
        : '28°C, normal weather';

      const langInstruction = isTelugu
        ? `Respond strictly in TELUGU (తెలుగు) for title, description, cropName, fieldName, and dateStr.
Use natural farmer-friendly Telugu. Keep titles concise (max 6 words).`
        : `Respond in English.`;

      const prompt = `You are an expert agronomist advisor.
Given the farmer's registered crops: [${cropsStr}]
And current weather: ${weatherStr}

${langInstruction}

Generate 2 to 3 concise, high-priority farm advisories.
Respond ONLY with a valid JSON array matching this format (no markdown blocks, just raw JSON array):
[
  {
    "id": "rec-1",
    "title": "Short Alert Title (max 6 words)",
    "description": "Clear 1-2 sentence agronomic action to take now",
    "severity": "info" or "warning" or "alert",
    "cropName": "Name of relevant crop",
    "fieldName": "Field Name or Plot",
    "dateStr": "Today"
  }
]`;

      for (const modelName of CANDIDATE_MODELS) {
        try {
          const response = await withTimeout(aiClient.models.generateContent({
            model: modelName,
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
          }), 8000);

          const text = response.text ? response.text.trim() : '';
          const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleaned);
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.log(`✅ Recommendations generated with model ${modelName} in language ${preferredLanguage}`);
            return parsed;
          }
        } catch (err) {
          console.warn(`Gemini recommendations with ${modelName} failed (${err.message}). Trying next...`);
        }
      }
    }

    // Agronomy Rule-based Fallback
    const recs = [];
    const hasCotton = crops.some(c => c.name.toLowerCase().includes('cotton') || c.name.includes('పత్తి'));
    const hasTomato = crops.some(c => c.name.toLowerCase().includes('tomato') || c.name.includes('టమాటా'));
    const rainHigh = weather && weather.rainChance > 50;

    if (rainHigh) {
      recs.push({
        id: 'rec-rain',
        title: isTelugu ? 'వర్ష సూచన: పిచికారీ వాయిదా వేయండి' : 'Rain Advisory: Postpone Spraying',
        description: isTelugu
          ? `${weather.rainChance}% వర్షం పడే అవకాశం ఉంది (${weather.location}). మందులు కొట్టుకుపోకుండా పిచికారీని వాయిదా వేయండి మరియు మురుగు నీరు నిలవకుండా చూసుకోండి.`
          : `${weather.rainChance}% rain chance detected in ${weather.location}. Hold foliar spray to prevent runoff and ensure proper drainage in low plots.`,
        severity: 'warning',
        cropName: isTelugu ? 'అన్ని పొలాలు' : 'All Plots',
        fieldName: isTelugu ? 'వ్యవసాయ క్షేత్రం' : 'Farm-wide',
        dateStr: isTelugu ? 'ఈరోజు' : 'Today'
      });
    }

    if (hasCotton) {
      recs.push({
        id: 'rec-cotton',
        title: isTelugu ? 'తెగుళ్ల పరిశీలన: పేనుబంక & తామర పురుగులు' : 'Pest Scouting: Aphids & Thrips',
        description: isTelugu
          ? 'పత్తి పైరులో రసం పీల్చే పురుగుల ఉధృతిని గమనించడానికి ఆకుల అడుగు భాగాన్ని క్రమం తప్పకుండా పరిశీలించండి.'
          : 'Cotton in vegetative/flowering phase requires routine underside leaf inspection for sap-sucking nymphs.',
        severity: 'info',
        cropName: isTelugu ? 'పత్తి' : 'Cotton',
        fieldName: isTelugu ? 'పత్తి చేను' : 'Cotton Field',
        dateStr: isTelugu ? 'చురుకుగా ఉంది' : 'Active'
      });
    }

    if (hasTomato) {
      recs.push({
        id: 'rec-tomato',
        title: isTelugu ? 'కాల్షియం & తేమ సమతుల్యత' : 'Foliar Calcium & Moisture',
        description: isTelugu
          ? 'టమాటా పంటలో కాయ చివర కుళ్ళు తెగులు నివారణకు డ్రిప్ ద్వారా స్థిరమైన తేమను మరియు కాల్షియంను అందించండి.'
          : 'Maintain steady drip moisture in tomato plots to prevent blossom end rot and leaf blights.',
        severity: 'info',
        cropName: isTelugu ? 'టమాటా' : 'Tomato',
        fieldName: isTelugu ? 'టమాటా మడి' : 'Tomato Plot',
        dateStr: isTelugu ? 'రాబోయే 2 రోజులు' : 'Next 2 days'
      });
    }

    return recs;
  }
};


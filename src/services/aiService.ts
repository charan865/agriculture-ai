import { Crop, SmartRecommendation, WeatherData, QuickTip } from '../types';

export interface AIChatResponse {
  reply: string;
  model: string;
  isLiveGemini: boolean;
}

export const quickTipsData: QuickTip[] = [
  {
    id: 'tip-1',
    title: 'Check soil moisture before irrigation',
    description: 'Avoid overwatering. Check soil moisture 2-3 inches below the surface before running pumps.',
    imageUrl: '/soil_seedling.jpg',
    linkText: 'Learn More →'
  },
  {
    id: 'tip-2',
    title: 'Scout under leaves for early aphids',
    description: 'Nymphs and whiteflies colonize the underside of tender leaves. Inspect early morning.',
    imageUrl: '/soil_seedling.jpg',
    linkText: 'Learn More →'
  },
  {
    id: 'tip-3',
    title: 'Optimal timing for foliar spraying',
    description: 'Apply organic nutrients or bio-fungicides during dawn or late evening when stomata are open.',
    imageUrl: '/soil_seedling.jpg',
    linkText: 'Learn More →'
  }
];

export const quickTipsDataTe: QuickTip[] = [
  {
    id: 'tip-1',
    title: 'నీరు పెట్టే ముందు నేల తేమను పరిశీలించండి',
    description: 'అధిక నీటిపారుదల నివారించండి. మోటార్లు ఆన్ చేసే ముందు 2-3 అంగుళాల లోతులో నేల తేమను తనిఖీ చేయండి.',
    imageUrl: '/soil_seedling.jpg',
    linkText: 'మరింత తెలుసుకోండి →'
  },
  {
    id: 'tip-2',
    title: 'ఆకుల అడుగుభాగంలో పేనుబంకను గమనించండి',
    description: 'లేత ఆకుల అడుగున రసం పీల్చే పురుగులు చేరుతాయి. ఉదయాన్నే పంటను పరిశీలించండి.',
    imageUrl: '/soil_seedling.jpg',
    linkText: 'మరింత తెలుసుకోండి →'
  },
  {
    id: 'tip-3',
    title: 'పిచికారీకి అనువైన సమయాన్ని ఎంచుకోండి',
    description: 'ఆకుల రంధ్రాలు తెరిచి ఉండే ఉదయం లేదా సాయంత్రం వేళల్లో మాత్రమే జీవ ఎరువులు లేదా రసాయనాలను పిచికారీ చేయండి.',
    imageUrl: '/soil_seedling.jpg',
    linkText: 'మరింత తెలుసుకోండి →'
  }
];

export const aiService = {
  async getQuickTips(lang: string = 'en'): Promise<QuickTip[]> {
    return lang === 'te' ? quickTipsDataTe : quickTipsData;
  },

  async getAIStatus(): Promise<{ geminiConfigured: boolean; model: string; mode: string }> {
    try {
      const res = await fetch('/api/ai/status');
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Offline
    }
    return {
      geminiConfigured: false,
      model: 'gemini-2.5-flash',
      mode: 'curated_agronomy_fallback'
    };
  },

  async getSmartRecommendations(crops: Crop[] = [], weather?: WeatherData, preferredLanguage: string = 'en'): Promise<SmartRecommendation[]> {
    try {
      const res = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crops, weather, preferredLanguage })
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.map((r, i) => ({
            ...r,
            iconType: r.severity === 'warning' || r.severity === 'alert' ? 'pest' : (i % 2 === 0 ? 'water' : 'soil')
          }));
        }
      }
    } catch {
      // Offline fallback
    }

    const isTelugu = preferredLanguage === 'te';

    if (crops.length === 0) {
      return [
        {
          id: 'rec-general-1',
          title: isTelugu ? 'వ్యక్తిగతీకరించిన హెచ్చరికల కోసం పంటలను జోడించండి' : 'Add your crops for personalized alerts',
          description: isTelugu
            ? 'అనుకూలమైన తెగుళ్ల హెచ్చరికలు, నీటిపారుదల సమయాలు మరియు ఎరువుల సలహాలను పొందడానికి మీ పంటలను నమోదు చేయండి.'
            : 'Register your active plots to get tailored pest alerts, irrigation windows, and fertilizer advice.',
          severity: 'info',
          iconType: 'soil',
          dateStr: isTelugu ? 'చర్య అవసరం' : 'Action needed'
        }
      ];
    }

    const recs: SmartRecommendation[] = [];
    const hasCotton = crops.some((c) => c.name.toLowerCase().includes('cotton') || c.name.includes('పత్తి'));
    const hasTomato = crops.some((c) => c.name.toLowerCase().includes('tomato') || c.name.includes('టమాటా'));
    const hasRice = crops.some((c) => c.name.toLowerCase().includes('rice') || c.name.includes('వరి'));

    if (hasCotton) {
      recs.push({
        id: 'rec-cotton',
        title: isTelugu ? 'తెగుళ్ల హెచ్చరిక: రసం పీల్చే పురుగులు' : 'Pest Alert: Sucking Insects',
        description: isTelugu
          ? 'పూత దశలో ఉన్న పత్తి పైరులో పేనుబంక ఉధృతి ఉండే అవకాశం ఉంది. ఆకుల అడుగు భాగాన్ని పరిశీలించండి.'
          : 'Cotton field in flowering stage is susceptible to aphid activity. Inspect lower canopy.',
        severity: 'warning',
        iconType: 'pest',
        cropName: isTelugu ? 'పత్తి' : 'Cotton',
        fieldName: isTelugu ? 'పత్తి చేను' : 'Cotton Field',
        dateStr: isTelugu ? 'ఈరోజే గుర్తించబడింది' : 'Detected today'
      });
    }

    if (hasTomato) {
      recs.push({
        id: 'rec-tomato',
        title: isTelugu ? 'కాల్షియం & తేమ సమతుల్యత' : 'Calcium & Moisture Balance',
        description: isTelugu
          ? 'కాయ దశలో ఉన్న టమాటా పంటలో కాయ చివర కుళ్ళు రాకుండా నిరంతర తేమను అందించండి.'
          : 'Tomato crop in fruiting stage requires consistent moisture to prevent blossom end rot.',
        severity: 'info',
        iconType: 'water',
        cropName: isTelugu ? 'టమాటా' : 'Tomato',
        fieldName: isTelugu ? 'టమాటా మడి' : 'Tomato Plot',
        dateStr: isTelugu ? '2 రోజుల్లో' : 'In 2 days'
      });
    }

    if (hasRice) {
      recs.push({
        id: 'rec-rice',
        title: isTelugu ? 'నత్రజని ఎరువులు వేయు సమయం' : 'Nitrogen Top-Dressing',
        description: isTelugu
          ? 'పిలకల దశలో ఉన్న వరి పైరుకు సమతుల్య నత్రజని మోతాదును అందించండి.'
          : 'Paddy field entering active tillering. Balanced nitrogen split dose recommended.',
        severity: 'info',
        iconType: 'nitrogen',
        cropName: isTelugu ? 'వరి' : 'Rice',
        fieldName: isTelugu ? 'వరి పొలం' : 'Paddy Valley',
        dateStr: isTelugu ? '3 రోజుల్లో' : 'In 3 days'
      });
    }

    return recs;
  },

  // Calls backend Gemini chat API with user crops and weather context
  async askAgriAI(query: string, userCrops: Crop[] = [], weather?: WeatherData, preferredLanguage: string = 'en'): Promise<AIChatResponse> {
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          crops: userCrops,
          weather,
          preferredLanguage
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reply) {
          return {
            reply: data.reply,
            model: data.model || 'AgriAI',
            isLiveGemini: data.isLiveGemini !== false
          };
        }
      }
    } catch (err) {
      console.warn('Backend AI chat API unreachable, using agronomy fallback:', err);
    }

    // Local agronomy reasoning fallback
    await new Promise((resolve) => setTimeout(resolve, 400));
    const lower = query.toLowerCase();
    const matchedCrop = userCrops.find((c) => lower.includes(c.name.toLowerCase()));
    const isTelugu = preferredLanguage === 'te';

    let fallbackText = '';
    if (lower.includes('water') || lower.includes('irrigate') || lower.includes('irrigation') || lower.includes('నీరు') || lower.includes('నీటి')) {
      const weatherInfo = weather ? `${weather.temp}°C, ${weather.rainChance}% rain chance` : 'moderate';
      if (isTelugu) {
        if (matchedCrop) {
          fallbackText = `మీ **${matchedCrop.name}** (${matchedCrop.area} ఎకరాలు, ${matchedCrop.growthStage} దశ) గురించి:\nప్రస్తుత వాతావరణ పరిస్థితుల ప్రకారం నేల తేమ నిలకడగా ఉంటుంది. ఉదయం 6:30 ప్రాంతంలో తేలికపాటి నీరు ఇవ్వండి. నేల పైభాగాన్ని పరిశీలించిన తర్వాతే మోటార్ ఆన్ చేయండి.`;
        } else {
          fallbackText = `మీ ప్రస్తుత పొలాల కోసం: నేల పైభాగాన్ని పరిశీలించిన తర్వాతే భారీ నీటిపారుదల చేపట్టండి.`;
        }
      } else {
        if (matchedCrop) {
          fallbackText = `Regarding your **${matchedCrop.name}** (${matchedCrop.area} acres, ${matchedCrop.growthStage} stage, ${matchedCrop.irrigationMethod} irrigation):\nGiven that the ${weatherInfo}, soil moisture should be adequate. If using ${matchedCrop.irrigationMethod} irrigation, run a light cycle in early morning (around 6:30 AM) to minimize evaporation. Always check the top 2 inches of soil before turning on pumps.`;
        } else {
          fallbackText = `For your current fields: Since the ${weatherInfo}, holding off heavy irrigation until checking topsoil moisture is recommended. If rain chance increases, allow natural precipitation to save water.`;
        }
      }
    } else if (lower.includes('pest') || lower.includes('aphid') || lower.includes('disease') || lower.includes('cotton') || lower.includes('పురుగు') || lower.includes('తెగులు')) {
      if (isTelugu) {
        fallbackText = `రసం పీల్చే పురుగులు & తెగుళ్ల నిర్వహణ కోసం:\n1. **5% వేప గింజల కషాయం (NSKE)** లేదా కోల్డ్ ప్రెస్డ్ వేప నూనె (5 మి.లీ/లీ నీటికి + కొద్దిగా సబ్బు పొడి) పిచికారీ చేయండి.\n2. పత్తిలో తీవ్రత ఎక్కువగా ఉంటే అసిటామైప్రిడ్ 20% SP @ 0.2 గ్రా/లీటర్ సాయంత్రం వేళల్లో ఆకుల అడుగు భాగం తడిచేలా పిచికారీ చేయండి.`;
      } else {
        fallbackText = `For aphid and pest management:\n1. Spray **5% Neem Seed Kernel Extract (NSKE)** or cold-pressed Neem Oil (5ml/L water + mild soap).\n2. For severe infestations in cotton, Acetamiprid 20% SP @ 0.2g/L provides quick knockdown. Ensure you spray the undersides of leaves during calm evening hours.`;
      }
    } else {
      if (isTelugu) {
        const cropSummary = userCrops.length > 0 
          ? `మీరు నమోదు చేసిన **${userCrops.length} పంటలు** (${userCrops.map((c) => c.name).join(', ')}) గమనిస్తున్నాను.`
          : `మీరు డ్యాష్‌బోర్డ్‌లో **"+ మీ మొదటి పంటను జోడించండి"** పై క్లిక్ చేసి పంటలను నమోదు చేసుకోవచ్చు!`;
        fallbackText = `నమస్కారం చరణ్! నేను మీ **AgriAI** వ్యవసాయ సహాయకుడిని. ${cropSummary}\n\nఈరోజు మీ వ్యవసాయంలో నేను మీకు ఎలా సహాయపడగలను?`;
      } else {
        const cropSummary = userCrops.length > 0 
          ? `I see you have **${userCrops.length} registered crops** (${userCrops.map((c) => c.name).join(', ')}).`
          : `You can click **"+ Add Your First Crop"** on your dashboard to register plots!`;
        fallbackText = `Hello Charan! I am **AgriAI**, your dedicated farming companion. ${cropSummary}\n\nHow can I assist your crop management today?`;
      }
    }

    return {
      reply: fallbackText,
      model: 'Agronomy Knowledge Base (Offline)',
      isLiveGemini: false
    };
  }
};

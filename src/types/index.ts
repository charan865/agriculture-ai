export interface Crop {
  id: string;
  name: string;
  fieldName: string;
  area: number; // in acres
  plantingDate: string;
  growthStage: 'Seedling' | 'Vegetative' | 'Flowering' | 'Fruiting' | 'Harvesting';
  irrigationMethod: 'Drip' | 'Sprinkler' | 'Flood' | 'Rainfed';
  soilType: 'Alluvial' | 'Black Soil' | 'Red Soil' | 'Sandy Loam' | 'Clay';
  health: number; // percentage
  status: 'Healthy' | 'At Risk' | 'Critical';
}

export interface Field {
  id: string;
  name: string;
  area: number;
  health: number;
  status: 'Healthy' | 'At Risk' | 'Critical';
  cropType: string;
}

export interface WeatherData {
  temp: number;
  condition: string;
  weatherCode: number;
  humidity: number;
  windSpeed: number;
  windDirection?: number;
  windGusts?: number;
  apparentTemp?: number;
  precipitation?: number;
  rain?: number;
  rainChance: number;
  cloudCover?: number;
  location: string;
  latitude?: number;
  longitude?: number;
  dateStr?: string;
  updatedAt?: number; // timestamp in ms
  alertTitle?: string;
  alertSubtitle?: string;
  alertSeverity?: 'info' | 'warning' | 'critical';
}

export interface DailyForecast {
  day: string;
  date: string;
  tempMax: number;
  tempMin: number;
  condition: string;
  weatherCode: number;
  rainChance: number;
  precipitation: number;
  windSpeed: number;
  humidity: number;
  advisory: string;
}

export interface LocationInfo {
  latitude: number;
  longitude: number;
  displayName: string;
  city?: string;
  region?: string;
  country?: string;
  source: 'gps' | 'manual' | 'cached';
}

export interface WeatherAlert {
  id: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  date: string;
}

export interface SmartRecommendation {
  id: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  iconType: 'nitrogen' | 'pest' | 'water' | 'soil';
  fieldName?: string;
  cropName?: string;
  dateStr: string;
}

export interface ActivityLog {
  id: string;
  title: string;
  timeAgo: string;
  type: 'scan' | 'weather' | 'recommendation' | 'pest' | 'system';
  status: 'success' | 'info' | 'warning' | 'error';
}

export interface ChemicalTreatment {
  needed: boolean;
  recommendation: string;
  application_notes: string;
}

export interface CropDiagnosisContext {
  cropName: string;
  fieldName?: string;
  plantingDate?: string;
  growthStage?: string;
  soilType?: string;
  irrigationMethod?: string;
  location?: string;
  cropId?: string;
}

export interface DiagnosisResult {
  id: string;
  cropId?: string;
  cropName: string;
  fieldName?: string;
  possible_diagnosis: string;
  confidence: number | null;
  severity: 'Mild' | 'Moderate' | 'Severe' | 'None' | string;
  symptoms: string[];
  recommended_actions: string[];
  recommendedTreatment?: string;
  chemical_treatment: ChemicalTreatment;
  fertilizerRecommendation?: string;
  organic_alternative: string;
  organicAlternative?: string;
  prevention: string[];
  weather_consideration: string;
  follow_up?: string;
  imageUrl?: string;
  date: string;
  createdAt?: string;
  aiModel?: string;
  diagnosisSource?: 'gemini_vision' | 'curated_fallback' | string;
  isFallback?: boolean;
  preferredLanguage?: string;
}

export interface QuickTip {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  linkText: string;
}

export interface MarketRate {
  id: string;
  cropName: string;
  price: number;
  unit: string;
  change: number;
}


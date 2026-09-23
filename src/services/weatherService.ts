import { WeatherData, DailyForecast, WeatherAlert } from '../types';
import { locationService } from './locationService';

export type ExtendedForecast = DailyForecast;


const WEATHER_CACHE_KEY_PREFIX = 'agri_weather_cache_';
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes


export interface WmoCodeInfo {
  description: string;
  category: 'clear' | 'partly-cloudy' | 'cloudy' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'storm';
  iconType: string;
}

// Convert Open-Meteo WMO weather codes to human-readable descriptions and icons
export function decodeWeatherCode(code: number): WmoCodeInfo {
  switch (code) {
    case 0:
      return { description: 'Clear Sky', category: 'clear', iconType: 'sun' };
    case 1:
      return { description: 'Mainly Clear', category: 'clear', iconType: 'sun' };
    case 2:
      return { description: 'Partly Cloudy', category: 'partly-cloudy', iconType: 'cloud-sun' };
    case 3:
      return { description: 'Overcast', category: 'cloudy', iconType: 'cloud' };
    case 45:
    case 48:
      return { description: 'Foggy Conditions', category: 'fog', iconType: 'cloud-fog' };
    case 51:
      return { description: 'Light Drizzle', category: 'drizzle', iconType: 'cloud-drizzle' };
    case 53:
      return { description: 'Moderate Drizzle', category: 'drizzle', iconType: 'cloud-drizzle' };
    case 55:
      return { description: 'Dense Drizzle', category: 'drizzle', iconType: 'cloud-drizzle' };
    case 56:
    case 57:
      return { description: 'Freezing Drizzle', category: 'drizzle', iconType: 'cloud-snow' };
    case 61:
      return { description: 'Slight Rain', category: 'rain', iconType: 'cloud-rain' };
    case 63:
      return { description: 'Moderate Rain', category: 'rain', iconType: 'cloud-rain' };
    case 65:
      return { description: 'Heavy Rain', category: 'rain', iconType: 'cloud-rain' };
    case 66:
    case 67:
      return { description: 'Freezing Rain', category: 'rain', iconType: 'cloud-snow' };
    case 71:
    case 73:
    case 75:
      return { description: 'Snowfall', category: 'snow', iconType: 'cloud-snow' };
    case 77:
      return { description: 'Snow Grains', category: 'snow', iconType: 'cloud-snow' };
    case 80:
      return { description: 'Slight Rain Showers', category: 'rain', iconType: 'cloud-rain' };
    case 81:
      return { description: 'Moderate Rain Showers', category: 'rain', iconType: 'cloud-rain' };
    case 82:
      return { description: 'Violent Rain Showers', category: 'rain', iconType: 'cloud-rain' };
    case 85:
    case 86:
      return { description: 'Snow Showers', category: 'snow', iconType: 'cloud-snow' };
    case 95:
      return { description: 'Thunderstorm', category: 'storm', iconType: 'cloud-lightning' };
    case 96:
    case 99:
      return { description: 'Thunderstorm with Hail', category: 'storm', iconType: 'cloud-lightning' };
    default:
      return { description: 'Partly Cloudy', category: 'partly-cloudy', iconType: 'cloud-sun' };
  }
}

// Weather Alert Evaluation Layer (clearly distinguished from AI recommendations)
export function evaluateWeatherAlerts(
  current: {
    temp: number;
    apparentTemp?: number;
    windSpeed: number;
    windGusts?: number;
    humidity: number;
    weatherCode: number;
    precipitation?: number;
    rainChance: number;
  },
  forecast: DailyForecast[] = []
): { alertTitle: string; alertSubtitle: string; alertSeverity: 'info' | 'warning' | 'critical'; alertsList: WeatherAlert[] } {
  const alertsList: WeatherAlert[] = [];
  let alertTitle = 'No major weather alerts';
  let alertSubtitle = 'Conditions look good for field activities today.';
  let alertSeverity: 'info' | 'warning' | 'critical' = 'info';

  const tomorrow = forecast[1];
  const nextDays = forecast.slice(0, 3);
  const maxUpcomingRainChance = Math.max(...nextDays.map((d) => d.rainChance || 0), current.rainChance);
  const maxUpcomingPrecip = Math.max(...nextDays.map((d) => d.precipitation || 0), current.precipitation || 0);
  const maxUpcomingTemp = Math.max(...nextDays.map((d) => d.tempMax || 0), current.temp);
  const maxUpcomingWind = Math.max(...nextDays.map((d) => d.windSpeed || 0), current.windSpeed);

  // 1. Extreme Weather / Thunderstorm
  if (current.weatherCode >= 95 || (tomorrow && tomorrow.weatherCode >= 95)) {
    alertTitle = '⚡ Thunderstorm Warning';
    alertSubtitle = 'Lightning and squalls expected. Suspend outdoor field operations.';
    alertSeverity = 'critical';
    alertsList.push({
      id: 'alert-storm',
      title: 'Thunderstorm Activity Detected',
      description: 'Severe convective storms in the forecast. Move equipment and workers to safe shelter.',
      severity: 'critical',
      date: 'Immediate'
    });
  }
  // 2. Heavy Rain Expected
  else if (maxUpcomingRainChance >= 70 || maxUpcomingPrecip >= 15) {
    alertTitle = '🌧️ Rain expected in forecast';
    alertSubtitle = 'Consider delaying irrigation and inspecting field drainage channels.';
    alertSeverity = 'warning';
    alertsList.push({
      id: 'alert-rain',
      title: 'High Precipitation Likelihood',
      description: `${maxUpcomingRainChance}% rain probability expected. Postpone chemical foliar spraying to prevent runoff wash-off.`,
      severity: 'warning',
      date: 'Next 24-48 Hours'
    });
  }
  // 3. Very High Temperature
  else if (maxUpcomingTemp >= 37 || (current.apparentTemp && current.apparentTemp >= 39)) {
    alertTitle = '🌡️ High temperature expected';
    alertSubtitle = 'Monitor crop water requirements and prioritize early morning irrigation.';
    alertSeverity = 'warning';
    alertsList.push({
      id: 'alert-heat',
      title: 'Extreme Heat & Evaporation Advisory',
      description: `Temperatures reaching ${maxUpcomingTemp}°C. Ensure drip lines are active before peak sun to avoid heat stress.`,
      severity: 'warning',
      date: 'Today / Tomorrow'
    });
  }
  // 4. Strong Wind
  else if (maxUpcomingWind >= 24 || (current.windGusts && current.windGusts >= 35)) {
    alertTitle = '💨 Strong winds expected';
    alertSubtitle = 'Check vulnerable plants/supports and avoid high-pressure spraying.';
    alertSeverity = 'warning';
    alertsList.push({
      id: 'alert-wind',
      title: 'Elevated Wind Speeds',
      description: `Winds up to ${maxUpcomingWind} km/h may cause foliar spray drift and stress tall crops.`,
      severity: 'warning',
      date: 'Today'
    });
  }
  // 5. Optimal Spray Window
  else if (current.windSpeed <= 12 && current.rainChance <= 20 && current.temp >= 16 && current.temp <= 30) {
    alertTitle = '🌿 Favorable spray window';
    alertSubtitle = 'Calm winds and dry foliage provide suitable conditions for planned crop care.';
    alertSeverity = 'info';
    alertsList.push({
      id: 'alert-spray',
      title: 'Optimal Spraying Conditions',
      description: 'Wind speeds below 12 km/h and dry canopy offer an effective absorption window for crop nutrients.',
      severity: 'info',
      date: 'Current Window'
    });
  }
  // 6. High Humidity Watch
  else if (current.humidity >= 85) {
    alertTitle = '💧 High relative humidity';
    alertSubtitle = 'Maintain canopy airflow and monitor susceptible plots for fungal symptoms.';
    alertSeverity = 'info';
    alertsList.push({
      id: 'alert-humidity',
      title: 'Elevated Humidity Watch',
      description: `${current.humidity}% humidity promotes spore germination. Inspect lower leaves during routine rounds.`,
      severity: 'info',
      date: 'Active Observation'
    });
  }

  return { alertTitle, alertSubtitle, alertSeverity, alertsList };
}

// In-memory cache map
const memoryCache = new Map<string, { data: any; timestamp: number }>();

export const weatherService = {
  // Fetch real current weather using user's coordinates
  async getCurrentWeather(latitude: number, longitude: number, locationName?: string): Promise<WeatherData> {
    const cacheKey = `${WEATHER_CACHE_KEY_PREFIX}curr_${latitude.toFixed(3)}_${longitude.toFixed(3)}`;
    const now = Date.now();

    // Check memory cache
    const memEntry = memoryCache.get(cacheKey);
    if (memEntry && now - memEntry.timestamp < CACHE_TTL_MS) {
      return memEntry.data;
    }

    // Check localStorage cache
    try {
      const stored = localStorage.getItem(cacheKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (now - parsed.timestamp < CACHE_TTL_MS) {
          memoryCache.set(cacheKey, parsed);
          return parsed.data;
        }
      }
    } catch {
      // Ignore storage errors
    }

    const currentParams = [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'precipitation',
      'rain',
      'weather_code',
      'cloud_cover',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m'
    ].join(',');

    const dailyParams = [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_probability_max',
      'precipitation_sum',
      'wind_speed_10m_max'
    ].join(',');

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=${currentParams}&daily=${dailyParams}&temperature_unit=celsius&wind_speed_unit=kmh&timezone=auto`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Open-Meteo HTTP error ${res.status}`);
      }

      const json = await res.json();
      const curr = json.current;
      const daily = json.daily;

      const wmo = decodeWeatherCode(curr.weather_code);
      const rainChance = (daily?.precipitation_probability_max?.[0] != null) ? Math.round(daily.precipitation_probability_max[0]) : Math.round(curr.precipitation > 0 ? 80 : 15);

      // Parse 7-day forecast for evaluation layer
      const forecastItems = this.parseForecast(daily);

      // Evaluate weather alerts
      const evaluated = evaluateWeatherAlerts(
        {
          temp: curr.temperature_2m,
          apparentTemp: curr.apparent_temperature,
          windSpeed: Math.round(curr.wind_speed_10m),
          windGusts: Math.round(curr.wind_gusts_10m || curr.wind_speed_10m),
          humidity: Math.round(curr.relative_humidity_2m),
          weatherCode: curr.weather_code,
          precipitation: curr.precipitation,
          rainChance
        },
        forecastItems
      );

      const weatherData: WeatherData = {
        temp: Math.round(curr.temperature_2m),
        condition: wmo.description,
        weatherCode: curr.weather_code,
        humidity: Math.round(curr.relative_humidity_2m),
        windSpeed: Math.round(curr.wind_speed_10m),
        windDirection: curr.wind_direction_10m,
        windGusts: Math.round(curr.wind_gusts_10m || 0),
        apparentTemp: Math.round(curr.apparent_temperature),
        precipitation: Number((curr.precipitation || 0).toFixed(1)),
        rain: Number((curr.rain || 0).toFixed(1)),
        rainChance,
        cloudCover: Math.round(curr.cloud_cover || 0),
        location: locationName || `Lat ${latitude.toFixed(2)}°, Lon ${longitude.toFixed(2)}°`,
        latitude,
        longitude,
        dateStr: new Date().toLocaleDateString('en-GB', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }),
        updatedAt: now,
        alertTitle: evaluated.alertTitle,
        alertSubtitle: evaluated.alertSubtitle,
        alertSeverity: evaluated.alertSeverity
      };

      // Save to cache
      const cachePayload = { data: weatherData, timestamp: now };
      memoryCache.set(cacheKey, cachePayload);
      try {
        localStorage.setItem(cacheKey, JSON.stringify(cachePayload));
      } catch {
        // Ignore storage overflow
      }

      return weatherData;
    } catch (err) {
      console.warn('Open-Meteo current weather fetch failed:', err);

      // Attempt to return stale cache if available
      const stale = memoryCache.get(cacheKey);
      if (stale) {
        return stale.data;
      }

      throw err;
    }
  },

  // Fetch at least 7 days of forecast data
  async getForecast(latitude: number, longitude: number): Promise<DailyForecast[]> {
    const cacheKey = `${WEATHER_CACHE_KEY_PREFIX}fc_${latitude.toFixed(3)}_${longitude.toFixed(3)}`;
    const now = Date.now();

    const memEntry = memoryCache.get(cacheKey);
    if (memEntry && now - memEntry.timestamp < CACHE_TTL_MS) {
      return memEntry.data;
    }

    const dailyParams = [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_probability_max',
      'precipitation_sum',
      'wind_speed_10m_max'
    ].join(',');

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=${dailyParams}&temperature_unit=celsius&wind_speed_unit=kmh&timezone=auto`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Open-Meteo forecast error ${res.status}`);
      }

      const json = await res.json();
      const forecast = this.parseForecast(json.daily);

      const cachePayload = { data: forecast, timestamp: now };
      memoryCache.set(cacheKey, cachePayload);
      try {
        localStorage.setItem(cacheKey, JSON.stringify(cachePayload));
      } catch {
        // Ignore
      }

      return forecast;
    } catch (err) {
      console.warn('Open-Meteo forecast fetch failed:', err);
      const stale = memoryCache.get(cacheKey);
      if (stale) return stale.data;
      throw err;
    }
  },

  // Helper to parse daily forecast structure from Open-Meteo
  parseForecast(daily: any): DailyForecast[] {
    if (!daily || !daily.time || !Array.isArray(daily.time)) {
      return [];
    }

    const result: DailyForecast[] = [];
    for (let i = 0; i < daily.time.length; i++) {
      const dateObj = new Date(daily.time[i] + 'T00:00:00');
      const isToday = i === 0;
      const isTomorrow = i === 1;
      const dayLabel = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : dateObj.toLocaleDateString('en-GB', { weekday: 'short' });
      const dateStr = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      const code = daily.weather_code?.[i] ?? 0;
      const wmo = decodeWeatherCode(code);
      const rainChance = Math.round(daily.precipitation_probability_max?.[i] ?? 0);
      const precip = Number((daily.precipitation_sum?.[i] ?? 0).toFixed(1));
      const windSpeed = Math.round(daily.wind_speed_10m_max?.[i] ?? 10);
      const tMax = Math.round(daily.temperature_2m_max?.[i] ?? 28);
      const tMin = Math.round(daily.temperature_2m_min?.[i] ?? 20);

      let advisory = 'Suitable conditions for routine farm operations.';
      if (rainChance >= 60 || precip >= 10) {
        advisory = 'High rain probability. Postpone foliar spraying; check drainage.';
      } else if (tMax >= 36) {
        advisory = 'High temperature. Water crops during early morning hours.';
      } else if (windSpeed >= 20) {
        advisory = 'Breezy winds. Avoid high-drift pesticide spraying.';
      } else if (windSpeed <= 12 && rainChance <= 20) {
        advisory = 'Calm winds and dry canopy: optimal spray window.';
      }

      result.push({
        day: dayLabel,
        date: dateStr,
        tempMax: tMax,
        tempMin: tMin,
        condition: wmo.description,
        weatherCode: code,
        rainChance,
        precipitation: precip,
        windSpeed,
        humidity: 60,
        advisory
      });
    }

    return result;
  },

  // Active alerts for UI
  async getActiveAlerts(current: WeatherData, forecast: DailyForecast[] = []): Promise<WeatherAlert[]> {
    const evaluated = evaluateWeatherAlerts(
      {
        temp: current.temp,
        apparentTemp: current.apparentTemp,
        windSpeed: current.windSpeed,
        windGusts: current.windGusts,
        humidity: current.humidity,
        weatherCode: current.weatherCode,
        precipitation: current.precipitation,
        rainChance: current.rainChance
      },
      forecast
    );
    return evaluated.alertsList;
  },

  // Backward-compatible method
  async getSevenDayForecast(latitude?: number, longitude?: number): Promise<DailyForecast[]> {
    if (latitude != null && longitude != null) {
      return this.getForecast(latitude, longitude);
    }
    // Fallback coordinates (Hyderabad default if unprovided)
    return this.getForecast(17.385, 78.4867);
  },

  // List of previously used locations
  getAvailableLocations(): string[] {
    return locationService.getRecentLocations().map((r) => r.displayName);
  },

  // Lookup weather by city name / location string
  async getWeatherData(locationName: string): Promise<WeatherData> {
    const recent = locationService.getRecentLocations();
    const matched = recent.find(
      (r) => r.displayName.toLowerCase() === locationName.toLowerCase() ||
             (r.city && locationName.toLowerCase().includes(r.city.toLowerCase()))
    );

    if (matched) {
      return this.getCurrentWeather(matched.latitude, matched.longitude, matched.displayName);
    }

    // Default to search
    try {
      const encoded = encodeURIComponent(locationName.trim());
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encoded}&count=1&language=en&format=json`);
      if (res.ok) {
        const json = await res.json();
        if (json.results && json.results.length > 0) {
          const item = json.results[0];
          const name = [item.name, item.admin1, item.country].filter(Boolean).join(', ');
          const locInfo = {
            displayName: name,
            city: item.name,
            region: item.admin1,
            country: item.country,
            latitude: item.latitude,
            longitude: item.longitude,
            source: 'manual' as const
          };
          locationService.saveLocation(locInfo);
          return this.getCurrentWeather(item.latitude, item.longitude, name);
        }
      }
    } catch {
      // Fallback
    }

    // If all else fails and there's at least one recent location, use that
    if (recent.length > 0) {
      return this.getCurrentWeather(recent[0].latitude, recent[0].longitude, recent[0].displayName);
    }

    throw new Error(`Location '${locationName}' could not be resolved.`);
  }
};



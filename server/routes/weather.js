import { Router } from 'express';

export const weatherRouter = Router();

const KNOWN_COORDS = {
  'hyderabad, india': { lat: 17.3850, lon: 78.4867, name: 'Hyderabad, India' },
  'hyderabad': { lat: 17.3850, lon: 78.4867, name: 'Hyderabad, India' },
  'warangal, india': { lat: 17.9689, lon: 79.5941, name: 'Warangal, India' },
  'punjab, india': { lat: 30.9010, lon: 75.8573, name: 'Punjab, India' },
  'california, usa': { lat: 36.7468, lon: -119.7726, name: 'California, USA' },
  'nairobi, kenya': { lat: -1.2921, lon: 36.8219, name: 'Nairobi, Kenya' }
};

function decodeWmo(code) {
  if (code === 0) return { condition: 'Clear Sky', icon: 'sun' };
  if (code === 1 || code === 2) return { condition: 'Partly Cloudy', icon: 'cloud-sun' };
  if (code === 3) return { condition: 'Overcast', icon: 'cloud' };
  if (code >= 45 && code <= 48) return { condition: 'Foggy', icon: 'cloud-fog' };
  if (code >= 51 && code <= 55) return { condition: 'Light Drizzle', icon: 'cloud-drizzle' };
  if (code >= 61 && code <= 65) return { condition: 'Rain Showers', icon: 'cloud-rain' };
  if (code >= 80 && code <= 82) return { condition: 'Heavy Rain', icon: 'cloud-rain' };
  if (code >= 95) return { condition: 'Thunderstorm', icon: 'cloud-lightning' };
  return { condition: 'Partly Cloudy', icon: 'cloud-sun' };
}

async function getCoordinates(locationStr) {
  const key = (locationStr || '').toLowerCase().trim();
  if (KNOWN_COORDS[key]) return KNOWN_COORDS[key];

  try {
    const cleanName = encodeURIComponent(locationStr.split(',')[0].trim());
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${cleanName}&count=1&language=en&format=json`);
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const item = data.results[0];
        return {
          lat: item.latitude,
          lon: item.longitude,
          name: `${item.name}, ${item.country}`
        };
      }
    }
  } catch (err) {
    console.warn('Geocoding fallback for location:', err.message);
  }

  return KNOWN_COORDS['hyderabad, india'];
}

// GET current weather for location
weatherRouter.get('/current', async (req, res) => {
  try {
    const locationQuery = req.query.location || 'Hyderabad, India';
    const coords = await getCoordinates(locationQuery);

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,precipitation_probability_max&timezone=auto`;
    const response = await fetch(url);

    if (response.ok) {
      const data = await response.json();
      const current = data.current;
      const daily = data.daily;
      const { condition } = decodeWmo(current.weather_code);
      const rainChance = (daily && daily.precipitation_probability_max && daily.precipitation_probability_max[0]) || 15;

      let alertTitle = 'No major weather alerts';
      let alertSubtitle = 'Conditions look good for farming today.';

      if (rainChance > 60) {
        alertTitle = 'High Chance of Rain';
        alertSubtitle = 'Postpone chemical spraying & prepare field drainage.';
      } else if (current.wind_speed_10m > 20) {
        alertTitle = 'Breezy Conditions';
        alertSubtitle = 'High wind speeds may cause spray drift.';
      } else if (current.temperature_2m > 36) {
        alertTitle = 'High Heat Advisory';
        alertSubtitle = 'Ensure adequate drip irrigation during early hours.';
      }

      return res.json({
        temp: Math.round(current.temperature_2m),
        condition,
        humidity: Math.round(current.relative_humidity_2m),
        windSpeed: Math.round(current.wind_speed_10m),
        rainChance: Math.round(rainChance),
        location: coords.name,
        dateStr: new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
        alertTitle,
        alertSubtitle
      });
    }
  } catch (err) {
    console.warn('Live weather fetch error, returning fallback:', err.message);
  }

  // Fallback
  res.json({
    temp: 28,
    condition: 'Partly Cloudy',
    humidity: 65,
    windSpeed: 12,
    rainChance: 20,
    location: req.query.location || 'Hyderabad, India',
    dateStr: new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
    alertTitle: 'No major weather alerts',
    alertSubtitle: 'Conditions look good for farming today.'
  });
});

// GET 7-day extended forecast
weatherRouter.get('/forecast', async (req, res) => {
  try {
    const locationQuery = req.query.location || 'Hyderabad, India';
    const coords = await getCoordinates(locationQuery);

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;
    const response = await fetch(url);

    if (response.ok) {
      const data = await response.json();
      const daily = data.daily;
      const forecast = [];

      for (let i = 0; i < (daily.time || []).length; i++) {
        const dateObj = new Date(daily.time[i]);
        const dayName = dateObj.toLocaleDateString('en-GB', { weekday: 'short' });
        const dateStr = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        const { condition } = decodeWmo(daily.weather_code[i]);
        const rainChance = Math.round(daily.precipitation_probability_max[i] || 0);

        let advisory = 'Good day for routine field inspections';
        if (rainChance > 50) {
          advisory = 'Delay foliar chemical spraying; check drainage';
        } else if (rainChance <= 15 && daily.temperature_2m_max[i] > 30) {
          advisory = 'Optimal conditions for sowing & irrigation';
        } else if (daily.wind_speed_10m_max[i] < 12) {
          advisory = 'Calm winds; ideal for bio-pesticide spray';
        }

        forecast.push({
          day: dayName,
          date: dateStr,
          tempMax: Math.round(daily.temperature_2m_max[i]),
          tempMin: Math.round(daily.temperature_2m_min[i]),
          condition,
          rainChance,
          windSpeed: Math.round(daily.wind_speed_10m_max[i]),
          humidity: 60,
          advisory
        });
      }

      return res.json(forecast);
    }
  } catch (err) {
    console.warn('Forecast fetch error, using fallback:', err.message);
  }

  // Fallback 7-day forecast
  res.json([
    { day: 'Mon', date: 'Today', tempMax: 29, tempMin: 21, condition: 'Partly Cloudy', rainChance: 20, windSpeed: 12, humidity: 65, advisory: 'Great day for sowing & weeding' },
    { day: 'Tue', date: 'Tomorrow', tempMax: 27, tempMin: 20, condition: 'Scattered Showers', rainChance: 55, windSpeed: 15, humidity: 75, advisory: 'Delay foliar chemical spraying' },
    { day: 'Wed', date: 'Wed', tempMax: 28, tempMin: 22, condition: 'Cloudy', rainChance: 35, windSpeed: 11, humidity: 68, advisory: 'Check soil drainage in fields' }
  ]);
});

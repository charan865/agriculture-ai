import React, { useState, useEffect } from 'react';
import {
  CloudSun,
  Droplets,
  Wind,
  CloudRain,
  ShieldCheck,
  ArrowRight,
  MapPin,
  MapPinOff,
  Loader2,
  AlertTriangle,
  Sun,
  Cloud,
  CloudLightning,
  CloudDrizzle
} from 'lucide-react';
import { WeatherData } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface WeatherCardProps {
  weather: WeatherData | null;
  loading?: boolean;
  error?: string | null;
  permissionDenied?: boolean;
  onRequestLocation?: () => void;
  onSelectManualLocation?: () => void;
  onViewWeatherDetails?: () => void;
}

function formatMinutesAgo(timestamp?: number, isTelugu?: boolean): string {
  if (!timestamp) return '';
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return isTelugu ? 'ఇప్పుడే నవీకరించబడింది' : 'Updated just now';
  const mins = Math.floor(diffSec / 60);
  if (mins === 1) return isTelugu ? '1 నిమిషం క్రితం' : 'Updated 1 min ago';
  if (mins < 60) return isTelugu ? `${mins} నిమిషాల క్రితం` : `Updated ${mins} mins ago`;
  const hours = Math.floor(mins / 60);
  return isTelugu ? `${hours} గంటల క్రితం` : `Updated ${hours} hr${hours > 1 ? 's' : ''} ago`;
}

const WEATHER_CONDITIONS_TE: Record<string, string> = {
  'Clear Sky': 'నిర్మలమైన ఆకాశం',
  'Clear': 'నిర్మలమైన ఆకాశం',
  'Mainly Clear': 'చాలా వరకు నిర్మలం',
  'Partly Cloudy': 'పాక్షికంగా మేఘావృతం',
  'Overcast': 'పూర్తిగా మేఘావృతం',
  'Cloudy': 'మేఘావృతం',
  'Foggy Conditions': 'పొగమంచు',
  'Light Drizzle': 'చిరుజల్లులు',
  'Moderate Drizzle': 'మధ్యస్థ జల్లులు',
  'Dense Drizzle': 'దట్టమైన జల్లులు',
  'Slight Rain': 'తేలికపాటి వర్షం',
  'Moderate Rain': 'మధ్యస్థ వర్షం',
  'Heavy Rain': 'భారీ వర్షం',
  'Rain': 'వర్షం',
  'Slight Rain Showers': 'తేలికపాటి జల్లులు',
  'Moderate Rain Showers': 'మధ్యస్థ వర్షపు జల్లులు',
  'Violent Rain Showers': 'భారీ వర్షపు జల్లులు',
  'Thunderstorm': 'ఉరుములతో కూడిన వర్షం',
  'Thunderstorm with Hail': 'వడగండ్ల వాన'
};

function translateConditionText(cond: string, isTe: boolean): string {
  if (!isTe) return cond;
  return WEATHER_CONDITIONS_TE[cond] || cond;
}

function translateAlertTitle(title: string | undefined, isTe: boolean, fallback: string): string {
  if (!title) return fallback;
  if (!isTe) return title;
  if (title.includes('Thunderstorm')) return '⚡ ఉరుములతో కూడిన వర్ష హెచ్చరిక';
  if (title.includes('Rain expected') || title.includes('High Precipitation') || title.includes('Heavy Rain')) return '🌧️ వర్ష సూచన హెచ్చరిక';
  if (title.includes('High temperature') || title.includes('Extreme Heat')) return '🌡️ అధిక ఉష్ణోగ్రత హెచ్చరిక';
  if (title.includes('Strong winds') || title.includes('Elevated Wind')) return '💨 బలమైన ఈదురు గాలుల సూచన';
  if (title.includes('Favorable spray') || title.includes('Optimal Spraying')) return '🌿 పిచికారీకి అనుకూల వాతావరణం';
  if (title.includes('No major weather alerts')) return 'ప్రస్తుతం ఎలాంటి ప్రతికూల వాతావరణ హెచ్చరికలు లేవు';
  return title;
}

function translateAlertSubtitle(subtitle: string | undefined, isTe: boolean, fallback: string): string {
  if (!subtitle) return fallback;
  if (!isTe) return subtitle;
  if (subtitle.includes('Lightning and squalls')) return 'ఉరుములు, మెరుపులు వచ్చే అవకాశం ఉంది. పొలం పనులను తాత్కాలికంగా నిలిపివేయండి.';
  if (subtitle.includes('Delay irrigation') || subtitle.includes('delaying irrigation') || subtitle.includes('drainage')) return 'నీటిపారుదలను వాయిదా వేయండి మరియు పొలంలో నీరు నిలవకుండా కాలువలను తనిఖీ చేయండి.';
  if (subtitle.includes('water requirements') || subtitle.includes('early morning')) return 'పంట నీటి అవసరాలను గమనించండి మరియు ఉదయాన్నే నీటిపారుదల ఇవ్వడానికి ప్రాధాన్యత ఇవ్వండి.';
  if (subtitle.includes('Check vulnerable plants') || subtitle.includes('avoid high-pressure') || subtitle.includes('spraying')) return 'పంట ఊతాలను తనిఖీ చేయండి మరియు బలమైన గాలుల వల్ల పిచికారీ చేయవద్దు.';
  if (subtitle.includes('Calm winds') || subtitle.includes('suitable conditions')) return 'తక్కువ గాలి వేగం మరియు అనుకూల వాతావరణం పంట సంరక్షణ పనులకు అనుకూలంగా ఉన్నాయి.';
  if (subtitle.includes('Conditions look good')) return 'ఈరోజు వ్యవసాయ పనులకు వాతావరణం అనుకూలంగా ఉంది.';
  return subtitle;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({
  weather,
  loading = false,
  error = null,
  permissionDenied = false,
  onRequestLocation,
  onSelectManualLocation,
  onViewWeatherDetails
}) => {
  const { t, language } = useLanguage();
  const isTelugu = language === 'te';
  const [, setTick] = useState(0);

  // Re-calculate minutes ago every minute
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  // 1. Permission Denied or Location Needed State (when no weather is available)
  if ((permissionDenied || !weather) && !loading) {
    return (
      <div
        className="agri-card"
        style={{
          padding: '24px 26px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
          minHeight: '270px',
          backgroundColor: '#ffffff'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309', marginBottom: '8px' }}>
            <MapPinOff size={20} />
            <span style={{ fontSize: '0.86rem', fontWeight: 700 }}>{t('weather.locationAccessNeeded')}</span>
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
            {t('weather.locationAccessNeeded')}
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.45' }}>
            {isTelugu
              ? 'మీ వ్యవసాయ క్షేత్రం కోసం ప్రత్యక్ష వాతావరణం, పిచికారీ సమయాలు మరియు వర్ష సంభావ్యతను పొందడానికి లొకేషన్ అనుమతించండి.'
              : 'Enable browser location to get live localized agrometeorology, spray timing, and rain probability for your farm.'}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
          {onRequestLocation && (
            <button
              onClick={onRequestLocation}
              className="btn-primary-pill"
              style={{ justifyContent: 'center', padding: '10px 16px', fontSize: '0.88rem' }}
            >
              <MapPin size={16} />
              <span>{t('weather.enableLocation')}</span>
            </button>
          )}

          {onSelectManualLocation && (
            <button
              onClick={onSelectManualLocation}
              style={{
                background: '#f8faf8',
                border: '1.5px solid var(--border-subtle)',
                borderRadius: 'var(--radius-pill)',
                padding: '9px 16px',
                fontSize: '0.84rem',
                fontWeight: 600,
                color: 'var(--text-main)',
                cursor: 'pointer'
              }}
            >
              {t('weather.selectCityManually')}
            </button>
          )}
        </div>
      </div>
    );
  }

  // 2. Loading State (fetching coordinates or weather)
  if (loading && !weather) {
    return (
      <div
        className="agri-card"
        style={{
          padding: '24px 26px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          minHeight: '270px',
          gap: '12px'
        }}
      >
        <Loader2 size={32} className="animate-spin" color="#155e32" />
        <p style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', margin: 0, textAlign: 'center' }}>
          Detecting farm location...
        </p>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, textAlign: 'center' }}>
          Please allow location access when prompted by your browser
        </p>
      </div>
    );
  }


  // 3. Error State (if API fails and no fallback weather)
  if (error && !weather) {
    return (
      <div
        className="agri-card"
        style={{
          padding: '24px 26px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
          minHeight: '270px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626', marginBottom: '8px' }}>
            <AlertTriangle size={20} />
            <span style={{ fontSize: '0.86rem', fontWeight: 700 }}>Weather Service Notice</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '6px' }}>{error}</p>
        </div>

        {onRequestLocation && (
          <button
            onClick={onRequestLocation}
            className="btn-primary-pill"
            style={{ justifyContent: 'center', padding: '10px 16px', fontSize: '0.86rem' }}
          >
            Retry Connection
          </button>
        )}
      </div>
    );
  }

  if (!weather) return null;

  // Render dynamic weather icon based on code
  const renderWeatherIcon = () => {
    const code = weather.weatherCode ?? 2;
    if (code === 0 || code === 1) {
      return (
        <div style={{ width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #fbc02d 0%, #f57f17 100%)',
              boxShadow: '0 0 16px rgba(251, 192, 45, 0.55)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Sun size={24} color="#ffffff" />
          </div>
        </div>
      );
    }

    if (code >= 95) {
      return (
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: '#f3e8ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#7e22ce'
          }}
        >
          <CloudLightning size={28} />
        </div>
      );
    }

    if (code >= 61 && code <= 82) {
      return (
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: '#e0f2fe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0284c7'
          }}
        >
          <CloudRain size={28} />
        </div>
      );
    }

    if (code >= 51 && code <= 57) {
      return (
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: '#f0f9ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0369a1'
          }}
        >
          <CloudDrizzle size={28} />
        </div>
      );
    }

    if (code === 3) {
      return (
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#475569'
          }}
        >
          <Cloud size={28} />
        </div>
      );
    }

    // Default partly cloudy
    return (
      <div
        style={{
          position: 'relative',
          width: '64px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '4px',
            left: '6px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #fbc02d 0%, #f57f17 100%)',
            boxShadow: '0 0 16px rgba(251, 192, 45, 0.5)'
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            right: '4px',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '6px 10px',
            boxShadow: '0 3px 8px rgba(0, 0, 0, 0.08)',
            display: 'flex',
            alignItems: 'center',
            border: '1px solid #eef2ed'
          }}
        >
          <CloudSun size={26} color="#455a64" />
        </div>
      </div>
    );
  };

  const updatedText = formatMinutesAgo(weather.updatedAt, isTelugu);

  return (
    <div
      className="agri-card dashboard-weather-card"
      style={{
        padding: '24px 26px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        minHeight: '270px'
      }}
    >
      <div>
        {/* Header: Location & Date / Updated Time */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div>
            <button
              onClick={onViewWeatherDetails}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                color: '#155e32',
                fontSize: '0.96rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <span>{weather.location}</span>
              <ArrowRight size={14} color="#155e32" />
            </button>
            <p style={{ fontSize: '0.76rem', color: '#7a8e80', marginTop: '2px', fontWeight: 500 }}>
              {weather.dateStr || t('weather.today')}
              {updatedText && <span style={{ marginLeft: '6px', color: '#94a3b8' }}>• {updatedText}</span>}
            </p>
          </div>

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#15803d' }}>
              <Loader2 size={12} className="animate-spin" />
              <span>{t('weather.updating')}</span>
            </div>
          )}
        </div>

        {/* Temperature & Condition with Illustration */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          {renderWeatherIcon()}

          {/* Temperature & Condition */}
          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontSize: '2.5rem',
                fontWeight: 800,
                color: '#14281d',
                lineHeight: 1,
                letterSpacing: '-0.03em'
              }}
            >
              {weather.temp}°C
            </div>
            <p style={{ fontSize: '0.86rem', color: '#567061', fontWeight: 600, marginTop: '4px' }}>
              {translateConditionText(weather.condition, isTelugu)}
            </p>
          </div>
        </div>

        {/* 3 Metrics in a row: Humidity, Wind, Rain Chance */}
        <div
          className="weather-metrics-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            padding: '10px 0',
            borderTop: '1px solid var(--border-light)',
            borderBottom: '1px solid var(--border-light)',
            marginBottom: '16px'
          }}
        >
          {/* Humidity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Droplets size={16} color="#0284c7" />
            <div>
              <p style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.1 }}>
                {weather.humidity}%
              </p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t('weather.humidity')}</p>
            </div>
          </div>

          {/* Wind */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Wind size={16} color="#0d9488" />
            <div>
              <p style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.1 }}>
                {weather.windSpeed} km/h
              </p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t('weather.wind')}</p>
            </div>
          </div>

          {/* Rain Chance */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CloudRain size={16} color="#3b82f6" />
            <div>
              <p style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.1 }}>
                {weather.rainChance}%
              </p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t('weather.rainChance')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Farming Specific Weather Alert Pill Box */}
      <div
        style={{
          borderRadius: '16px',
          backgroundColor: weather.alertSeverity === 'warning' ? '#fff7ed' : weather.alertSeverity === 'critical' ? '#fef2f2' : '#edf7ed',
          border: `1px solid ${weather.alertSeverity === 'warning' ? '#fed7aa' : weather.alertSeverity === 'critical' ? '#fecaca' : '#d5ebd8'}`,
          padding: '11px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: weather.alertSeverity === 'warning' ? '#ffedd5' : weather.alertSeverity === 'critical' ? '#fee2e2' : '#d8eadc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: weather.alertSeverity === 'warning' ? '#c2410c' : weather.alertSeverity === 'critical' ? '#dc2626' : '#155e32',
            flexShrink: 0
          }}
        >
          <ShieldCheck size={18} />
        </div>
        <div>
          <h4
            style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: weather.alertSeverity === 'warning' ? '#9a3412' : weather.alertSeverity === 'critical' ? '#991b1b' : '#155e32',
              lineHeight: 1.2
            }}
          >
            {translateAlertTitle(weather.alertTitle, isTelugu, t('weather.noAlerts'))}
          </h4>
          <p
            style={{
              fontSize: '0.74rem',
              color: weather.alertSeverity === 'warning' ? '#7c2d12' : weather.alertSeverity === 'critical' ? '#7f1d1d' : '#4a6b55',
              lineHeight: 1.3
            }}
          >
            {translateAlertSubtitle(weather.alertSubtitle, isTelugu, t('weather.goodConditions'))}
          </p>
        </div>
      </div>
    </div>
  );
};

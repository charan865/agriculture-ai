import React, { useState, useEffect } from 'react';
import { CloudSun, Droplets, Wind, CloudRain, Sun, Calendar, ShieldCheck, Thermometer } from 'lucide-react';
import { WeatherData, DailyForecast } from '../../types';
import { weatherService } from '../../services/weatherService';
import { useLanguage } from '../../context/LanguageContext';

interface WeatherAlertsViewProps {
  currentWeather: WeatherData;
}

const DAY_MAP_TE: Record<string, string> = {
  Mon: 'సోమ',
  Tue: 'మంగళ',
  Wed: 'బుధ',
  Thu: 'గురు',
  Fri: 'శుక్ర',
  Sat: 'శని',
  Sun: 'ఆది',
  Today: 'ఈరోజు'
};

const translateCondition = (cond: string, isTe: boolean) => {
  if (!isTe) return cond;
  if (cond.includes('Clear')) return 'నిర్మల ఆకాశం';
  if (cond.includes('Partly Cloudy')) return 'పాక్షిక మేఘావృతం';
  if (cond.includes('Overcast')) return 'దట్టమైన మేఘాలు';
  if (cond.includes('Rain') || cond.includes('Showers')) return 'వర్షం';
  if (cond.includes('Drizzle')) return 'చిరుజల్లులు';
  if (cond.includes('Thunderstorm')) return 'ఉరుములతో కూడిన వర్షం';
  if (cond.includes('Sunny')) return 'ఎండ';
  return cond;
};

export const WeatherAlertsView: React.FC<WeatherAlertsViewProps> = ({ currentWeather }) => {
  const { t, language } = useLanguage();
  const isTelugu = language === 'te';
  const [forecast, setForecast] = useState<DailyForecast[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    weatherService
      .getSevenDayForecast(currentWeather.latitude, currentWeather.longitude)
      .then(setForecast)
      .catch((err) => console.error('Failed to load forecast:', err))
      .finally(() => setLoading(false));
  }, [currentWeather.latitude, currentWeather.longitude]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#e8f5ec',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#155e32'
            }}
          >
            <CloudSun size={20} />
          </div>
          <h2 style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {t('weather.forecastHeaderTitle')}
          </h2>
        </div>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
          {t('weather.forecastHeaderSubtitle', { location: currentWeather.location })}
        </p>
      </div>

      {/* Current Conditions Card */}
      <div
        className="agri-card"
        style={{
          padding: '24px 30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          background: 'linear-gradient(110deg, #ffffff 0%, #f6faf7 100%)'
        }}
      >
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#155e32' }}>{t('weather.currentObservation')}</span>
          <h3 style={{ fontSize: '2.8rem', fontWeight: 800, color: '#14281d', lineHeight: 1.1 }}>
            {currentWeather.temp}°C
          </h3>
          <p style={{ fontSize: '1rem', fontWeight: 600, color: '#456150' }}>
            {translateCondition(currentWeather.condition, isTelugu)}
          </p>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {currentWeather.location} • {currentWeather.dateStr}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center', padding: '10px 14px', borderRadius: '14px', backgroundColor: '#ffffff', border: '1px solid var(--border-light)' }}>
            <Droplets size={20} color="#0284c7" style={{ margin: '0 auto 4px' }} />
            <p style={{ fontSize: '1rem', fontWeight: 700 }}>{currentWeather.humidity}%</p>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t('weather.humidity')}</span>
          </div>

          <div style={{ textAlign: 'center', padding: '10px 14px', borderRadius: '14px', backgroundColor: '#ffffff', border: '1px solid var(--border-light)' }}>
            <Wind size={20} color="#0d9488" style={{ margin: '0 auto 4px' }} />
            <p style={{ fontSize: '1rem', fontWeight: 700 }}>{currentWeather.windSpeed} km/h</p>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t('weather.windSpeed')}</span>
          </div>

          <div style={{ textAlign: 'center', padding: '10px 14px', borderRadius: '14px', backgroundColor: '#ffffff', border: '1px solid var(--border-light)' }}>
            <CloudRain size={20} color="#3b82f6" style={{ margin: '0 auto 4px' }} />
            <p style={{ fontSize: '1rem', fontWeight: 700 }}>{currentWeather.rainChance}%</p>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t('weather.rainChance')}</span>
          </div>

          {currentWeather.apparentTemp != null && (
            <div style={{ textAlign: 'center', padding: '10px 14px', borderRadius: '14px', backgroundColor: '#ffffff', border: '1px solid var(--border-light)' }}>
              <Thermometer size={20} color="#ea580c" style={{ margin: '0 auto 4px' }} />
              <p style={{ fontSize: '1rem', fontWeight: 700 }}>{currentWeather.apparentTemp}°C</p>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t('weather.feelsLike')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Farming Advisories & Spraying Window */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        <div className="agri-card" style={{ padding: '22px' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} color="#155e32" />
            <span>{t('weather.operationsAdvisory')}</span>
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Primary Evaluated Alert */}
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '12px',
                backgroundColor: currentWeather.alertSeverity === 'warning' ? '#fff7ed' : currentWeather.alertSeverity === 'critical' ? '#fef2f2' : '#edf7ed',
                border: `1px solid ${currentWeather.alertSeverity === 'warning' ? '#fed7aa' : currentWeather.alertSeverity === 'critical' ? '#fecaca' : '#d5ebd8'}`
              }}
            >
              <strong
                style={{
                  fontSize: '0.84rem',
                  color: currentWeather.alertSeverity === 'warning' ? '#9a3412' : currentWeather.alertSeverity === 'critical' ? '#991b1b' : '#14532d',
                  display: 'block',
                  marginBottom: '2px'
                }}
              >
                {currentWeather.alertTitle
                  ? (isTelugu && currentWeather.alertTitle.includes('Thunderstorm')
                      ? '⚡ ఉరుములతో కూడిన వర్ష హెచ్చరిక'
                      : isTelugu && (currentWeather.alertTitle.includes('Rain') || currentWeather.alertTitle.includes('Precipitation'))
                        ? '🌧️ వర్ష సూచన హెచ్చరిక'
                        : isTelugu && (currentWeather.alertTitle.includes('temperature') || currentWeather.alertTitle.includes('Heat'))
                          ? '🌡️ అధిక ఉష్ణోగ్రత హెచ్చరిక'
                          : isTelugu && currentWeather.alertTitle.includes('Wind')
                            ? '💨 బలమైన గాలుల సూచన'
                            : isTelugu && currentWeather.alertTitle.includes('spray')
                              ? '🌿 పిచికారీకి అనుకూల వాతావరణం'
                              : currentWeather.alertTitle)
                  : t('weather.conditionsFavorable')}
              </strong>
              <p
                style={{
                  fontSize: '0.78rem',
                  color: currentWeather.alertSeverity === 'warning' ? '#7c2d12' : currentWeather.alertSeverity === 'critical' ? '#7f1d1d' : '#4a6b55'
                }}
              >
                {currentWeather.alertSubtitle
                  ? (isTelugu && (currentWeather.alertSubtitle.includes('irrigation') || currentWeather.alertSubtitle.includes('drainage'))
                      ? 'నీటిపారుదల సమయాన్ని వాయిదా వేయడాన్ని మరియు పొలంలో నీరు నిలవకుండా కాలువలను తనిఖీ చేయండి.'
                      : isTelugu && currentWeather.alertSubtitle.includes('spraying')
                        ? 'బలమైన గాలుల వల్ల పిచికారీ చేయడంపై ప్రభావం ఉండవచ్చు.'
                        : isTelugu && currentWeather.alertSubtitle.includes('water requirements')
                          ? 'పంట నీటి అవసరాలను గమనించండి మరియు ఉదయాన్నే నీటిపారుదల ఇవ్వడానికి ప్రాధాన్యత ఇవ్వండి.'
                          : isTelugu && currentWeather.alertSubtitle.includes('squalls')
                            ? 'ఉరుములు, మెరుపులు వచ్చే అవకాశం ఉంది. పొలం పనులను తాత్కాలికంగా నిలిపివేయండి.'
                            : currentWeather.alertSubtitle)
                  : t('weather.conditionsFavorableDesc')}
              </p>
            </div>

            {/* Spraying Window Recommendation */}
            <div style={{ padding: '12px 14px', borderRadius: '12px', backgroundColor: '#f0f9ff', border: '1px solid #e0f2fe' }}>
              <strong style={{ fontSize: '0.84rem', color: '#0369a1', display: 'block', marginBottom: '2px' }}>
                {t('weather.sprayingGuidance')}
              </strong>
              <p style={{ fontSize: '0.78rem', color: '#0c4a6e' }}>
                {currentWeather.windSpeed <= 12 && currentWeather.rainChance <= 20
                  ? t('weather.sprayingFavorable', { wind: currentWeather.windSpeed })
                  : t('weather.sprayingDelay', { wind: currentWeather.windSpeed, rain: currentWeather.rainChance })}
              </p>
            </div>
          </div>
        </div>

        {/* Sun & Daylight */}
        <div className="agri-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sun size={18} color="#eab308" />
            <span>{t('weather.solarIndex')}</span>
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', paddingBottom: '6px', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ color: 'var(--text-muted)' }}>{t('weather.cloudCover')}:</span>
              <strong style={{ color: 'var(--text-main)' }}>{currentWeather.cloudCover ?? 25}%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', paddingBottom: '6px', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ color: 'var(--text-muted)' }}>{t('weather.precipitation')}:</span>
              <strong style={{ color: 'var(--text-main)' }}>{currentWeather.precipitation ?? 0} mm</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', paddingBottom: '6px', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ color: 'var(--text-muted)' }}>{t('weather.windGusts')}:</span>
              <strong style={{ color: '#d97706' }}>{currentWeather.windGusts ?? currentWeather.windSpeed} km/h</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>{t('weather.dataSource')}:</span>
              <strong style={{ color: '#155e32' }}>Open-Meteo Forecast API</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Extended Forecast */}
      <div className="agri-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Calendar size={18} color="#155e32" />
            <span>{t('weather.sevenDayTitle')}</span>
          </h4>
          {loading && <span style={{ fontSize: '0.78rem', color: '#155e32' }}>{t('weather.loadingForecast')}</span>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
          {forecast.map((day, idx) => (
            <div
              key={idx}
              style={{
                padding: '14px 10px',
                borderRadius: '14px',
                backgroundColor: idx === 0 ? '#e8f5ec' : '#f9fbf8',
                border: '1px solid',
                borderColor: idx === 0 ? '#bfe2c9' : 'var(--border-light)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '190px'
              }}
            >
              <div>
                <p style={{ fontSize: '0.84rem', fontWeight: 700, color: idx === 0 ? '#155e32' : 'var(--text-main)' }}>
                  {isTelugu && DAY_MAP_TE[day.day] ? DAY_MAP_TE[day.day] : day.day}
                </p>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{day.date}</p>
                <p style={{ fontSize: '0.74rem', color: '#456150', fontWeight: 600, minHeight: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {translateCondition(day.condition, isTelugu)}
                </p>
              </div>

              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '2px' }}>
                  {day.tempMax}°
                  <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '4px' }}>
                    / {day.tempMin}°
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      padding: '2px 6px',
                      borderRadius: '10px',
                      backgroundColor: day.rainChance > 40 ? '#dbeafe' : '#f1f5f9',
                      color: day.rainChance > 40 ? '#1d4ed8' : '#475569'
                    }}
                  >
                    💧 {day.rainChance}% ({day.precipitation}mm)
                  </span>
                  <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>
                    💨 {day.windSpeed} km/h
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


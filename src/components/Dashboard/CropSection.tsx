import React, { useEffect, useState } from 'react';
import { Plus, Sparkles, ArrowRight, ShieldAlert, Droplets } from 'lucide-react';
import { Crop, WeatherData, SmartRecommendation } from '../../types';
import { EmptyCropState } from './EmptyCropState';
import { CropCard } from './CropCard';
import { aiService } from '../../services/aiService';
import { useLanguage } from '../../context/LanguageContext';

interface CropSectionProps {
  crops: Crop[];
  weather?: WeatherData;
  onAddCrop: () => void;
  onDeleteCrop?: (id: string) => void;
  onConsultAI?: (prompt: string) => void;
}

export const CropSection: React.FC<CropSectionProps> = ({
  crops,
  weather,
  onAddCrop,
  onDeleteCrop,
  onConsultAI
}) => {
  const { t, language } = useLanguage();
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([]);

  useEffect(() => {
    if (crops.length > 0) {
      aiService
        .getSmartRecommendations(crops, weather, language)
        .then((recs) => setRecommendations(recs))
        .catch(() => setRecommendations([]));
    }
  }, [crops, weather, language]);

  if (crops.length === 0) {
    return <EmptyCropState onAddCrop={onAddCrop} />;
  }

  const totalAcres = crops.reduce((sum, c) => sum + c.area, 0).toFixed(1);

  return (
    <div
      className="agri-card"
      style={{
        padding: '24px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '22px'
      }}
    >
      {/* Header: Title, Stats & Add Crop Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {t('myCrops.title')}
            </h3>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#155e32',
                backgroundColor: '#e8f5ec',
                padding: '3px 9px',
                borderRadius: '12px'
              }}
            >
              {crops.length} {crops.length === 1 ? t('cropDiagnosis.crop') : t('myCrops.title')}
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {t('myCrops.managingAcres', { total: totalAcres })}
          </p>
        </div>

        <button
          onClick={onAddCrop}
          className="btn-primary-pill"
          style={{ padding: '8px 18px', fontSize: '0.86rem' }}
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>{t('myCrops.addCrop')}</span>
        </button>
      </div>

      {/* Grid of Crop Cards */}
      <div
        className="crop-cards-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(240px, 100%), 1fr))',
          gap: '16px'
        }}
      >
        {crops.map((crop) => (
          <CropCard key={crop.id} crop={crop} onDelete={onDeleteCrop} />
        ))}
      </div>

      {/* AI Recommendations Section */}
      {recommendations.length > 0 && (
        <div
          style={{
            marginTop: '8px',
            paddingTop: '18px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '7px',
                  backgroundColor: '#e8f5ec',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#155e32'
                }}
              >
                <Sparkles size={14} />
              </div>
              <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {t('dashboard.aiAgronomicAdvisories')}
              </h4>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))', gap: '12px' }}>
            {recommendations.slice(0, 2).map((rec) => {
              const isAlert = rec.severity === 'critical' || rec.severity === 'warning';
              return (
                <div
                  key={rec.id}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '14px',
                    backgroundColor: isAlert ? '#fff9f0' : '#f8fbf9',
                    border: `1.5px solid ${isAlert ? '#fed7aa' : '#dcfce7'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '10px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {isAlert ? (
                          <ShieldAlert size={15} color="#d97706" />
                        ) : (
                          <Droplets size={15} color="#15803d" />
                        )}
                        <span style={{ fontSize: '0.84rem', fontWeight: 700, color: isAlert ? '#9a3412' : '#14532d' }}>
                          {rec.title}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '8px',
                          backgroundColor: isAlert ? '#ffedd5' : '#dcfce7',
                          color: isAlert ? '#c2410c' : '#15803d',
                          textTransform: 'uppercase'
                        }}
                      >
                        {rec.severity}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.79rem', color: '#475569', lineHeight: '1.45' }}>
                      {rec.description}
                    </p>
                  </div>

                  {onConsultAI && (
                    <button
                      onClick={() => onConsultAI(`Tell me more about: ${rec.title}. What specific steps should I take?`)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        border: 'none',
                        background: 'none',
                        padding: 0,
                        color: '#15803d',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <span>{t('dashboard.consultAgriAI')}</span>
                      <ArrowRight size={12} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};


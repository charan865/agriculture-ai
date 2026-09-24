import React from 'react';
import { Plus, Sprout, BarChart3, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface EmptyCropStateProps {
  onAddCrop: () => void;
}

export const EmptyCropState: React.FC<EmptyCropStateProps> = ({ onAddCrop }) => {
  const { t } = useLanguage();

  return (
    <div
      className="agri-card"
      style={{
        padding: '40px 32px 32px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {/* Central Seedling & Soil Illustration */}
      <div
        style={{
          position: 'relative',
          width: '130px',
          height: '110px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '18px'
        }}
      >
        {/* Soft Background Cloud & Sunlight Rays SVG */}
        <svg
          viewBox="0 0 140 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', height: '100%' }}
        >
          {/* Subtle halo glow */}
          <ellipse cx="70" cy="65" rx="55" ry="42" fill="#eaf6ed" />
          <ellipse cx="70" cy="65" rx="42" ry="32" fill="#ddf1e2" />

          {/* Sunlight rays */}
          <path d="M70 15 L70 25" stroke="#f6c244" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
          <path d="M40 28 L47 35" stroke="#f6c244" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
          <path d="M100 28 L93 35" stroke="#f6c244" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />

          {/* Soil Mound */}
          <path
            d="M32 95 Q52 72 70 72 Q88 72 108 95 Q70 102 32 95 Z"
            fill="#563829"
          />
          <path
            d="M40 93 Q55 76 70 76 Q85 76 100 93 Q70 98 40 93 Z"
            fill="#3e271c"
          />

          {/* Sprout Stem */}
          <path
            d="M70 80 Q69 55 69 46"
            stroke="#2e7d32"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Left Leaf */}
          <path
            d="M69 52 C52 50 48 35 69 46 C71 52 70 52 69 52 Z"
            fill="#4caf50"
          />
          <path
            d="M68 50 C56 46 54 39 67 47"
            stroke="#2e7d32"
            strokeWidth="1"
            fill="none"
          />

          {/* Right Leaf */}
          <path
            d="M70 50 C88 46 92 32 70 44 C68 49 69 50 70 50 Z"
            fill="#66bb6a"
          />
          <path
            d="M71 48 C82 44 85 37 71 45"
            stroke="#388e3c"
            strokeWidth="1"
            fill="none"
          />
        </svg>
      </div>

      {/* Main Headline */}
      <h3
        style={{
          fontSize: '1.65rem',
          fontWeight: 800,
          color: '#14281d',
          marginBottom: '8px',
          letterSpacing: '-0.02em'
        }}
      >
        {t('myCrops.addFirstCrop')}
      </h3>

      {/* Subtitle */}
      <p
        style={{
          fontSize: '0.88rem',
          color: '#5c7365',
          lineHeight: 1.5,
          maxWidth: '460px',
          marginBottom: '22px'
        }}
      >
        {t('myCrops.emptySubtitle')}
      </p>

      {/* Large CTA Button */}
      <button
        onClick={onAddCrop}
        className="btn-primary-pill"
        style={{
          padding: '13px 28px',
          fontSize: '0.94rem',
          marginBottom: '32px'
        }}
      >
        <Plus size={18} strokeWidth={2.5} />
        <span>{t('myCrops.addYourFirstCrop')}</span>
      </button>

      {/* Section Divider Question */}
      <p
        style={{
          fontSize: '0.78rem',
          fontWeight: 700,
          color: '#829c8e',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '20px'
        }}
      >
        {t('myCrops.whyAddCrops')}
      </p>

      {/* 3 Benefit Columns matching reference */}
      <div
        className="empty-benefits-grid"
        style={{
          width: '100%',
          maxWidth: '680px',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          paddingTop: '6px'
        }}
      >
        {/* Benefit 1 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '0 10px',
            borderRight: '1px solid var(--border-light)'
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: '#eaf5ed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#155e32',
              marginBottom: '10px'
            }}
          >
            <Sprout size={19} />
          </div>
          <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '3px' }}>
            {t('myCrops.personalizedAdvice')}
          </h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {t('myCrops.forYourSpecificCrops')}
          </p>
        </div>

        {/* Benefit 2 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '0 10px',
            borderRight: '1px solid var(--border-light)'
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: '#eaf5ed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#155e32',
              marginBottom: '10px'
            }}
          >
            <BarChart3 size={19} />
          </div>
          <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '3px' }}>
            {t('myCrops.betterDecisions')}
          </h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {t('myCrops.withRealTimeInsights')}
          </p>
        </div>

        {/* Benefit 3 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '0 10px'
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: '#eaf5ed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#155e32',
              marginBottom: '10px'
            }}
          >
            <ShieldCheck size={19} />
          </div>
          <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '3px' }}>
            {t('myCrops.healthierYields')}
          </h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {t('myCrops.forABrighterTomorrow')}
          </p>
        </div>
      </div>
    </div>
  );
};

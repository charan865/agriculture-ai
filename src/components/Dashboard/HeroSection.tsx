import React from 'react';
import { MessageSquare, Camera } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useUser } from '../../context/UserContext';

interface HeroSectionProps {
  onAskAI: () => void;
  onDiagnose: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onAskAI, onDiagnose }) => {
  const { t } = useLanguage();
  const { userName } = useUser();

  return (
    <div
      className="agri-card hero-card"
      style={{
        position: 'relative',
        minHeight: '270px',
        overflow: 'hidden',
        padding: '32px 36px',
        background: `
          linear-gradient(90deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.88) 44%, rgba(255, 255, 255, 0.35) 64%, rgba(255, 255, 255, 0) 82%),
          url('/hero-bg.jpg') center/cover no-repeat
        `,
        border: '1px solid #d8e8dc',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      {/* Left Text & CTA Buttons */}
      <div style={{ maxWidth: '620px', zIndex: 2 }}>
        {/* Farmer Greeting */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.96rem', fontWeight: 700, color: '#155e32' }}>
            {t('dashboard.greeting', { name: userName })}
          </span>
          <span style={{ fontSize: '1.15rem' }}>👋</span>
        </div>

        {/* Main Headline */}
        <h2
          className="hero-title"
          style={{
            fontSize: '2.4rem',
            fontWeight: 800,
            color: '#0a2e18',
            lineHeight: 1.15,
            letterSpacing: '-0.025em',
            marginBottom: '12px'
          }}
        >
          {t('dashboard.heroTitle')}
        </h2>

        {/* Supporting description with enhanced contrast & legibility */}
        <p
          className="hero-subtitle"
          style={{
            fontSize: '0.95rem',
            color: '#133622',
            lineHeight: 1.6,
            marginBottom: '26px',
            maxWidth: '520px',
            fontWeight: 600,
            textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
          }}
        >
          {t('dashboard.heroSubtitle')}
        </p>

        {/* Action Buttons */}
        <div className="hero-btn-group" style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <button
            onClick={onAskAI}
            className="btn-primary-pill"
            style={{ padding: '12px 24px', fontSize: '0.92rem' }}
          >
            <MessageSquare size={17} />
            <span>{t('dashboard.askAgriAI')}</span>
          </button>

          <button
            onClick={onDiagnose}
            className="btn-secondary-pill"
            style={{ padding: '11px 22px', fontSize: '0.92rem' }}
          >
            <Camera size={17} color="#274633" />
            <span>{t('dashboard.diagnoseCrop')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
